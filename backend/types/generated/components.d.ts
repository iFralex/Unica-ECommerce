import type { Schema, Attribute } from '@strapi/strapi';

export interface ProductDescription extends Schema.Component {
  collectionName: 'components_product_descriptions';
  info: {
    displayName: 'Description';
  };
  attributes: {
    Title: Attribute.String;
    Text: Attribute.Blocks;
  };
}

export interface ProductItem3D extends Schema.Component {
  collectionName: 'components_product_item3_ds';
  info: {
    displayName: 'MultipleItem3D';
    description: '';
  };
  attributes: {
    Name: Attribute.String & Attribute.Private;
    Thumbnail: Attribute.Media;
    Model3D: Attribute.Media;
    RelativeProduct: Attribute.Relation<
      'product.item3-d',
      'oneToOne',
      'api::product.product'
    >;
    MainTransform: Attribute.Component<'product.transforms'>;
  };
}

export interface ProductMultipleItem3DLink extends Schema.Component {
  collectionName: 'components_product_multiple_item3_d_links';
  info: {
    displayName: 'MultipleItem3DLink';
    description: '';
  };
  attributes: {
    SelectedViewer: Attribute.Relation<
      'product.multiple-item3-d-link',
      'oneToOne',
      'api::viewer3d.viewer3d'
    >;
  };
}

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
    Photos: Attribute.Media;
  };
}

export interface ProductSingleItem3D extends Schema.Component {
  collectionName: 'components_product_single_item3_ds';
  info: {
    displayName: 'SingleItem3D';
    description: '';
  };
  attributes: {
    Model3D: Attribute.Media;
    Transforms: Attribute.JSON;
    InitialCameraRotation: Attribute.JSON;
  };
}

export interface ProductTransforms extends Schema.Component {
  collectionName: 'components_product_transforms';
  info: {
    displayName: 'Transform';
    description: '';
  };
  attributes: {
    Position: Attribute.JSON;
    Rotation: Attribute.JSON;
    Scale: Attribute.JSON;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'product.description': ProductDescription;
      'product.item3-d': ProductItem3D;
      'product.multiple-item3-d-link': ProductMultipleItem3DLink;
      'product.product-details': ProductProductDetails;
      'product.single-item3-d': ProductSingleItem3D;
      'product.transforms': ProductTransforms;
    }
  }
}
