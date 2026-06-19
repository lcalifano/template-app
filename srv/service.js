const cds = require('@sap/cds')
const cdsLog = cds.log('template-app-log', { label: 'Template App' });
const { afterReadProduct, beforeProduct, eventImpl } = require('./serviceImpl') ;

module.exports = class ProductService extends cds.ApplicationService {  async init() {

  const { Product } = this.entities;

  // per SAP Event Mesh stessa cosa ma collegandosi al servizio Event Mesh su SAP BTP (configurazione in package.json e default-env.json)
  const messaging = await cds.connect.to('messaging'); 

  //const service = await cds.connect.to('<NomeServizio>'); // per collegarsi ad un altro servizio CDS o esterno (configurazione in package.json e default-env.json)
  
  // implementazione altrnativa senza usare funzioni esterne
  // this.before (['CREATE', 'UPDATE'], Product, async (req) => {
  //   console.log('Before CREATE/UPDATE Product', req.data)
    
  // })
  // this.after ('READ', Product, async (product, req) => {
  //   console.log('After READ Product', product)
  // })

  

  this.before(['CREATE', 'UPDATE'], Product, beforeProduct(Product));

  this.after(['READ'], Product, afterReadProduct(Product))

  messaging.on('someEvent', eventImpl());


  return super.init()
}}
