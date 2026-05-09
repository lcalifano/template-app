const cds = require('@sap/cds')

const { GET, POST, expect, axios } = cds.test (__dirname+'/..')
axios.defaults.auth = { username: 'alice', password: 'alice' }

describe('ProductService OData APIs', () => {

  

})
