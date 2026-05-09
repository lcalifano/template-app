/**
 * ============================================================
 *  server-custom.js
 *  SAP CAP — Server con Basic Auth custom + middleware
 * ============================================================
 *
 *  Questa versione ti dà pieno controllo:
 *  - Validazione credenziali custom (DB, env vars, file, API)
 *  - Logging degli accessi
 *  - Rate limiting
 *  - Rotte pubbliche (health check, metadata)
 *  - Gestione ruoli dinamica
 *
 *  ► package.json — disabilita l'auth built-in di CAP:
 *
 *  {
 *    "cds": {
 *      "requires": {
 *        "auth": {
 *          "kind": "dummy"
 *        }
 *      }
 *    }
 *  }
 *
 *  Usiamo "dummy" perché gestiamo noi l'auth via middleware.
 *  In alternativa puoi anche omettere la sezione auth.
 */

const cds = require('@sap/cds');

// -----------------------------------------------------------
//  CONFIGURAZIONE UTENTI
//  In produzione leggi da env vars, DB, o un secrets manager.
// -----------------------------------------------------------
const USERS = {
  admin: {
    password: process.env.ADMIN_PASSWORD || 'admin123',
    roles: ['admin', 'viewer'],
    tenant: 'default'
  },
  viewer: {
    password: process.env.VIEWER_PASSWORD || 'viewer123',
    roles: ['viewer'],
    tenant: 'default'
  },
  integration: {
    password: process.env.INTEGRATION_PASSWORD || 'integr@tion!',
    roles: ['admin', 'integration'],
    tenant: 'default'
  }
};

// -----------------------------------------------------------
//  ROTTE PUBBLICHE (no auth richiesta)
//  Aggiungi qui gli endpoint che devono restare aperti.
// -----------------------------------------------------------
const PUBLIC_PATHS = [
  '/health',
  '/ready',
  '/$metadata',
  '/index.html',
  '/'
];

// -----------------------------------------------------------
//  RATE LIMITING semplice (in-memory)
//  In produzione usa Redis o un rate-limiter dedicato.
// -----------------------------------------------------------
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minuti

function isRateLimited(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record) return false;

  // Pulisci i tentativi scaduti
  record.attempts = record.attempts.filter(ts => now - ts < WINDOW_MS);

  if (record.attempts.length >= MAX_ATTEMPTS) {
    return true;
  }

  return false;
}

function recordAttempt(ip) {
  const now = Date.now();
  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { attempts: [now] });
  } else {
    loginAttempts.get(ip).attempts.push(now);
  }
}

// Pulisci la mappa periodicamente per evitare memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of loginAttempts.entries()) {
    record.attempts = record.attempts.filter(ts => now - ts < WINDOW_MS);
    if (record.attempts.length === 0) loginAttempts.delete(ip);
  }
}, 5 * 60 * 1000); // ogni 5 minuti

// -----------------------------------------------------------
//  FUNZIONE DI VALIDAZIONE CREDENZIALI
//  Personalizza qui la logica (es. query al DB, chiamata API)
// -----------------------------------------------------------
async function validateCredentials(username, password) {
  // ── Opzione 1: Utenti statici (da config / env vars) ──
  const user = USERS[username];
  if (user && user.password === password) {
    return {
      id: username,
      roles: user.roles,
      tenant: user.tenant
    };
  }

  // ── Opzione 2: Validazione da database (esempio) ──
  // Decommenta se vuoi validare contro una tabella DB
  /*
  try {
    const db = await cds.connect.to('db');
    const { Users } = db.entities('my.namespace');
    const dbUser = await db.read(Users).where({
      username: username,
      active: true
    });

    if (dbUser.length > 0) {
      const bcrypt = require('bcrypt');
      const match = await bcrypt.compare(password, dbUser[0].passwordHash);
      if (match) {
        return {
          id: dbUser[0].username,
          roles: JSON.parse(dbUser[0].roles),
          tenant: dbUser[0].tenant || 'default'
        };
      }
    }
  } catch (err) {
    console.error('[AUTH] Errore validazione DB:', err.message);
  }
  */

  // ── Opzione 3: Validazione via API esterna ──
  /*
  try {
    const response = await fetch('https://my-auth-service.com/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (response.ok) {
      const data = await response.json();
      return { id: data.userId, roles: data.roles, tenant: data.tenant };
    }
  } catch (err) {
    console.error('[AUTH] Errore validazione API:', err.message);
  }
  */

  return null; // Credenziali non valide
}

// -----------------------------------------------------------
//  MIDDLEWARE DI BASIC AUTH
// -----------------------------------------------------------
function basicAuthMiddleware(req, res, next) {
  const requestPath = req.path;

  // Salta l'auth per le rotte pubbliche
  if (PUBLIC_PATHS.some(p => requestPath === p || requestPath.endsWith(p))) {
    return next();
  }

  // Salta per le richieste OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }

  const clientIp = req.ip || req.connection.remoteAddress;

  // Controlla rate limiting
  if (isRateLimited(clientIp)) {
    console.warn(`[AUTH] Rate limited: ${clientIp}`);
    return res.status(429).json({
      error: {
        code: '429',
        message: 'Troppi tentativi di login. Riprova più tardi.'
      }
    });
  }

  const authHeader = req.headers.authorization;

  // Nessun header Authorization
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="CAP OData Service"');
    return res.status(401).json({
      error: {
        code: '401',
        message: 'Autenticazione richiesta'
      }
    });
  }

  // Header presente ma non Basic
  if (!authHeader.startsWith('Basic ')) {
    return res.status(400).json({
      error: {
        code: '400',
        message: 'Schema di autenticazione non supportato. Usare Basic.'
      }
    });
  }

  // Decodifica le credenziali
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const separatorIndex = credentials.indexOf(':');

    if (separatorIndex === -1) {
      throw new Error('Formato credenziali non valido');
    }

    const username = credentials.substring(0, separatorIndex);
    const password = credentials.substring(separatorIndex + 1);

    // Validazione asincrona
    validateCredentials(username, password)
      .then(validUser => {
        if (validUser) {
          // ✅ Login riuscito — inietta l'utente nel contesto CAP
          req.user = new cds.User({
            id: validUser.id,
            roles: validUser.roles,
            tenant: validUser.tenant
          });

          // Aggiunge attributi custom accessibili nei service handler
          req.user.attr = {
            loginTime: new Date().toISOString(),
            ip: clientIp
          };

          console.log(`[AUTH] ✓ Login: ${validUser.id} | IP: ${clientIp} | ${req.method} ${requestPath}`);
          next();
        } else {
          // ❌ Credenziali non valide
          recordAttempt(clientIp);
          console.warn(`[AUTH] ✗ Login fallito: "${username}" | IP: ${clientIp}`);

          res.setHeader('WWW-Authenticate', 'Basic realm="CAP OData Service"');
          return res.status(401).json({
            error: {
              code: '401',
              message: 'Credenziali non valide'
            }
          });
        }
      })
      .catch(err => {
        console.error('[AUTH] Errore durante la validazione:', err);
        return res.status(500).json({
          error: {
            code: '500',
            message: 'Errore interno di autenticazione'
          }
        });
      });
  } catch (err) {
    console.error('[AUTH] Errore decodifica credenziali:', err.message);
    return res.status(400).json({
      error: {
        code: '400',
        message: 'Header Authorization malformato'
      }
    });
  }
}

// -----------------------------------------------------------
//  MIDDLEWARE CORS (opzionale, utile se chiami da frontend)
// -----------------------------------------------------------
function corsMiddleware(req, res, next) {
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['*'];

  const origin = req.headers.origin;

  if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
}

// -----------------------------------------------------------
//  BOOTSTRAP DEL SERVER CAP
// -----------------------------------------------------------
cds.on('bootstrap', (app) => {

  // 1. CORS
  app.use(corsMiddleware);

  // 2. Health check (prima dell'auth, è una rotta pubblica)
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      service: 'CAP OData Service'
    });
  });

  // 3. Basic Auth
  app.use(basicAuthMiddleware);

  console.log('[SERVER] Middleware Basic Auth registrato');
  console.log('[SERVER] Rotte pubbliche:', PUBLIC_PATHS.join(', '));
  console.log('[SERVER] Utenti configurati:', Object.keys(USERS).join(', '));
});

// -----------------------------------------------------------
//  HOOK POST-AVVIO (opzionale)
// -----------------------------------------------------------
cds.on('served', (services) => {
  const serviceNames = Object.keys(services).join(', ');
  console.log(`[SERVER] ✓ Servizi attivi: ${serviceNames}`);
  console.log(`[SERVER] ✓ Server avviato con Basic Auth custom`);
});

// -----------------------------------------------------------
//  EXPORT
// -----------------------------------------------------------
module.exports = cds.server;