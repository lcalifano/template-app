const cds = require('@sap/cds')
const cdsLog = cds.log('template-app-log', { label: 'Template App' });
const { SELECT } = require('@sap/cds/lib/ql/cds-ql');

module.exports = class ProductService extends cds.ApplicationService { init() {

  const { Product } = cds.entities('ProductService')
//const service = await cds.connect.to('ZINSERT_SPESE');
  
  this.before (['CREATE', 'UPDATE'], Product, async (req) => {
    console.log('Before CREATE/UPDATE Product', req.data)
    
  })
  this.after ('READ', Product, async (product, req) => {
    console.log('After READ Product', product)
  })


  return super.init()
}}
