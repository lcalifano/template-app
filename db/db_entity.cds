namespace tempate.app;

using {
    cuid,
    managed
} from '@sap/cds/common';


entity Products : cuid, managed {
    name        : String(100) not null;
    description : String(500);
    price       : Decimal(10, 2);
    stock       : Integer default 0;
    active      : Boolean default true;

}
