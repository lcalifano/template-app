const cds = require('@sap/cds')
const cdsLog = cds.log('template-app-log', { label: 'Template App' });


const beforeProduct = (Product)=>{
    return async (req) =>{
        console.log('Before CREATE/UPDATE Product', req.data);
    }
}

const afterReadProduct = (Product)=>{
    return async (product, req) =>{
        console.log('After READ Product', product);
    }
}

module.exports = {
    beforeProduct,
    afterReadProduct
}