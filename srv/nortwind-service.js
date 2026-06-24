const cds = require('@sap/cds')

module.exports = class NortwindService extends cds.ApplicationService {async init() {

  const { Products } = this.entities;
  const service = await cds.connect.to('Northwind');
  
  
  this.on('READ', Products, async (req) => {
    const products = await service.tx(req).run(req.query);
    return products;
  })
  
  return super.init()
}}
