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

const eventImpl = () =>{
    return async (msg) => {
        const { ID, testo } = msg.data
        console.log('someEvent received:', { ID, testo });
    }
}

module.exports = {
    beforeProduct,
    afterReadProduct,
    eventImpl
}