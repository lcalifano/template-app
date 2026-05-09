/**
 * ============================================================
 *  server-standard.js
 *  SAP CAP — Server standard con Basic Auth built-in
 * ============================================================
 *
 *  Questa è la versione "zero-code" di CAP: il framework
 *  gestisce tutto internamente. La configurazione della
 *  basic auth avviene nel package.json (vedi sotto).
 *
 *  ► package.json — aggiungi questa sezione:
 *
 *  {
 *    "cds": {
 *      "requires": {
 *        "auth": {
 *          "kind": "basic",
 *          "users": {
 *            "admin": {
 *              "password": "admin123",
 *              "roles": ["admin", "viewer"]
 *            },
 *            "viewer": {
 *              "password": "viewer123",
 *              "roles": ["viewer"]
 *            },
 *            "public": {
 *              "password": "public123",
 *              "roles": []
 *            }
 *          }
 *        }
 *      }
 *    }
 *  }
 *
 *  ► .cdsrc.json (alternativa al package.json):
 *
 *  {
 *    "requires": {
 *      "auth": {
 *        "kind": "basic",
 *        "users": {
 *          "admin":  { "password": "admin123", "roles": ["admin"] },
 *          "viewer": { "password": "viewer123", "roles": ["viewer"] }
 *        }
 *      }
 *    }
 *  }
 *
 *  ► Nel tuo modello CDS puoi proteggere le entity così:
 *
 *  service CatalogService {
 *    @requires: 'admin'
 *    entity Products as projection on db.Products;
 *
 *    @requires: 'viewer'
 *    entity Categories as projection on db.Categories;
 *
 *    // Nessuna annotation = accessibile a tutti gli autenticati
 *    entity PublicInfo as projection on db.PublicInfo;
 *  }
 */

// -----------------------------------------------------------
//  Questo è tutto ciò che serve!
//  CAP fa il bootstrap di Express, registra i servizi OData,
//  e applica la basic auth dal package.json automaticamente.
// -----------------------------------------------------------

const cds = require('@sap/cds');

cds.on('bootstrap', (app) => {
    // ── 1. HEALTH CHECK (prima di tutto, no auth) ──────────
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString()
    });
  });

   app.use((req, res, next) => {

    console.log(`[MIDDLEWARE ATTIVO] ${req.method} ${req.path}`);
    next();
   });
   
});

module.exports = cds.server;