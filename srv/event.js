const cds = require('@sap/cds')


module.exports = class ProductService extends cds.ApplicationService { async init() {

cds.spawn({ every: 30 * 1000 }, async () => {
await this.emit('someEvent', { ID: cds.utils.uuid(), testo: 'Hello from Event Service!' });
});

  return super.init()
}}
