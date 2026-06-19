const cds = require('@sap/cds')


module.exports = class ProductService extends cds.ApplicationService { async init() {

  const messaging = await cds.connect.to('messaging'); 

  cds.spawn({ every: 30 * 1000 }, async () => {
  await messaging.emit('someEvent', { ID: cds.utils.uuid(), testo: 'Hello from Event Service!' });
  });

  return super.init()
}}
