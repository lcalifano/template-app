using { tempate.app as  db } from '../db/db_entity';

service ProductService @(   requires: 'authenticated-user',
                            path: '/api') {
@(restrict: [
        {
            grant: ['*'],
            to   : 'Admin'
        }
    ])
    @odata.draft.enabled
    entity Product as projection on db.Products;

}