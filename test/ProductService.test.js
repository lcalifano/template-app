const cds = require('@sap/cds')

const { GET, POST, expect, axios } = cds.test (__dirname+'/..')
axios.defaults.auth = { username: 'alice', password: '' }

describe('ProductService OData APIs', () => {

  it('serves ProductService.Product', async () => {
    const { data } = await GET `/odata/v4/api/Product ${{ params: { $select: 'ID,name' } }}`
    expect(data.value).to.containSubset([
      {"ID":"71064963-43ac-4458-a540-1c795419da02","name":"name-710649"},
    ])
  })

})
