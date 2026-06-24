/* checksum : e4fb0ae3e3382931c303c91cdabaa5c0 */
@cds.external : true
@Org.OData.Display.V1.Description : 'This is a sample OData service with vocabularies'
service Northwind {
  @cds.external : true
  @cds.persistence.skip : true
  entity FeaturedProduct : Products {
    Advertisement : Association to one Advertisements {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  entity Customer : Persons {
    TotalExpense : Decimal not null;
  };

  @cds.external : true
  @cds.persistence.skip : true
  entity Employee : Persons {
    EmployeeID : Integer64 not null;
    @odata.Precision : 0
    @odata.Type : 'Edm.DateTimeOffset'
    HireDate : DateTime not null;
    @odata.Type : 'Edm.Single'
    Salary : Double not null;
  };

  @cds.external : true
  type Address {
    Street : String;
    City : String;
    State : String;
    ZipCode : String;
    Country : String;
  };

  @cds.external : true
  @cds.persistence.skip : true
  @open : true
  @Org.OData.Display.V1.Description : 'All Products available in the online store'
  entity Products {
    key ID : Integer not null;
    @Org.OData.Display.V1.DisplayName : 'Product Name'
    Name : String;
    Description : String;
    @odata.Precision : 0
    @odata.Type : 'Edm.DateTimeOffset'
    ReleaseDate : DateTime not null;
    @odata.Precision : 0
    @odata.Type : 'Edm.DateTimeOffset'
    DiscontinuedDate : DateTime;
    Rating : Integer not null;
    Price : Double not null;
    Categories : Association to many Categories {  };
    Supplier : Association to one Suppliers {  };
    ProductDetail : Association to one ProductDetails {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  entity ProductDetails {
    key ProductID : Integer not null;
    Details : String;
    Product : Association to one Products {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @open : true
  entity Categories {
    key ID : Integer not null;
    Name : String;
    Products : Association to many Products {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @Org.OData.Publication.V1.PublisherName : 'Microsoft Corp.'
  @Org.OData.Publication.V1.PublisherId : 'MSFT'
  @Org.OData.Publication.V1.Keywords : 'Inventory, Supplier, Advertisers, Sales, Finance'
  @Org.OData.Publication.V1.AttributionUrl : 'http://www.odata.org/'
  @Org.OData.Publication.V1.AttributionDescription : 'All rights reserved'
  @Org.OData.Publication.V1.![DocumentationUrl ] : 'http://www.odata.org/'
  @Org.OData.Publication.V1.TermsOfUseUrl : 'All rights reserved'
  @Org.OData.Publication.V1.PrivacyPolicyUrl : 'http://www.odata.org/'
  @Org.OData.Publication.V1.LastModified : '4/2/2013'
  @Org.OData.Publication.V1.![ImageUrl ] : 'http://www.odata.org/'
  entity Suppliers {
    key ID : Integer not null;
    Name : String;
    Address : Address;
    @odata.Type : 'Edm.GeographyPoint'
    Location : String;
    Concurrency : Integer not null;
    Products : Association to many Products {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  @open : true
  entity Persons {
    key ID : Integer not null;
    Name : String;
    PersonDetail : Association to one PersonDetails {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  entity PersonDetails {
    key PersonID : Integer not null;
    @odata.Type : 'Edm.Byte'
    Age : Integer not null;
    Gender : Boolean not null;
    Phone : String;
    Address : Address;
    @Core.MediaType : 'application/octet-stream'
    @odata.Type : 'Edm.Stream'
    Photo : LargeBinary not null;
    Person : Association to one Persons {  };
  };

  @cds.external : true
  @cds.persistence.skip : true
  entity Advertisements {
    key ID : UUID not null;
    Name : String;
    @odata.Precision : 0
    @odata.Type : 'Edm.DateTimeOffset'
    AirDate : DateTime not null;
    FeaturedProduct : Association to one FeaturedProduct {  };
    @Core.MediaType : 'application/octet-stream'
    blob : LargeBinary;
  };
};

