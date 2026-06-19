# Getting Started

Welcome to your new CAP project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`srv/` | your service models and code go here
`readme.md` | this getting started guide

## Next Steps

- Open a new terminal and run `cds watch`
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)
- Start with your domain model, in a CDS file in `db/`

## Learn More

Learn more at <https://cap.cloud.sap>.

## DEBUG deployed app
https://community.sap.com/t5/technology-blog-posts-by-sap/set-up-remote-debugging-to-diagnose-cap-applications-node-js-stack-at/ba-p/13515376

cf login --sso
cf ssh-enabled template-app-srv
    se non lo è -> cf enable-ssh template-app-srv  
cf restart template-app-srv  
cf ssh template-app-srv  

viene aperta la shell del container linux e poi fare
ps aux
kill -usr1 253

nel log dell'app ci sarà scritto debug listening to -> aprire nuovo terminale
cf ssh -N -L 9229:127.0.0.1:9229 template-app-srv

configurazione del debugger da aggiungere per attaccarsi
{
    "configurations": [{
        "name": "Attach to a Cloud Foundry Instance on Port 9229",
        "port": 9229,
        "request": "attach",
        "type": "node",
        "localRoot": "${workspaceFolder}",
        "remoteRoot": "/home/vcap/app"
    }]
}
