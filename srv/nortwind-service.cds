using { Northwind as external } from './external/Northwind';

service NortwindService @(   requires: 'authenticated-user',
                            path: '/api/external'){

    entity Products as projection on external.Products{
        key ID,
        Name,
        Description
    };
}