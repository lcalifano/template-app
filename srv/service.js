const cds = require('@sap/cds')
const cdsLog = cds.log('template-app-log', { label: 'Template App' });
const { afterReadProduct, beforeProduct } = require('./serviceImpl') ;

module.exports = class ProductService extends cds.ApplicationService { init() {

  const { Product } = this.entities;
//const service = await cds.connect.to('ZINSERT_SPESE');
  
  // this.before (['CREATE', 'UPDATE'], Product, async (req) => {
  //   console.log('Before CREATE/UPDATE Product', req.data)
    
  // })
  // this.after ('READ', Product, async (product, req) => {
  //   console.log('After READ Product', product)
  // })

  this.before(['CREATE', 'UPDATE'], Product, beforeProduct(Product));

  this.after(['READ'], Product, afterReadProduct(Product))


  return super.init()
}}
