import type { Schema, Attribute } from '@strapi/strapi';

export interface ProductProductDetails extends Schema.Component {
  collectionName: 'components_product_product_details';
  info: {
    displayName: 'ProductDetails';
    description: '';
  };
  attributes: {
    Material: Attribute.Relation<
      'product.product-details',
      'oneToOne',
      'api::material.material'
    >;
    Price: Attribute.Decimal;
    Images: Attribute.Media;
    Platings: Attribute.Relation<
      'product.product-details',
      'oneToMany',
      'api::plating.plating'
    >;
    Materials3D: Attribute.JSON;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'product.product-details': ProductProductDetails;
    }
  }
}
