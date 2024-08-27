import type { Schema, Attribute } from '@strapi/strapi';

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

export interface ProductSingleItem3D extends Schema.Component {
  collectionName: 'components_product_single_item3_ds';
  info: {
    displayName: 'SingleItem3D';
    description: '';
  };
  attributes: {
    Model3D: Attribute.Media<'files'>;
    Transforms: Attribute.JSON;
    InitialCameraRotation: Attribute.JSON;
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
    Images: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    Platings: Attribute.Relation<
      'product.product-details',
      'oneToMany',
      'api::plating.plating'
    >;
    Materials3D: Attribute.JSON;
    Photos: Attribute.Media<'images', true>;
    CartVisualizzation: Attribute.Component<'product.cart-visualizzation'> &
      Attribute.Required;
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

export interface ProductItem3D extends Schema.Component {
  collectionName: 'components_product_item3_ds';
  info: {
    displayName: 'MultipleItem3D';
    description: '';
  };
  attributes: {
    Name: Attribute.String & Attribute.Private;
    Thumbnail: Attribute.Media<'images'>;
    Model3D: Attribute.Media<'files'>;
    RelativeProduct: Attribute.Relation<
      'product.item3-d',
      'oneToOne',
      'api::product.product'
    >;
    MainTransform: Attribute.Component<'product.transforms'>;
  };
}

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

export interface ProductCartVisualizzation extends Schema.Component {
  collectionName: 'components_product_cart_visualizzations';
  info: {
    displayName: 'CartVisualizzation';
    description: '';
  };
  attributes: {
    Size: Attribute.JSON;
    Texture: Attribute.Media<'images'>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'product.transforms': ProductTransforms;
      'product.single-item3-d': ProductSingleItem3D;
      'product.product-details': ProductProductDetails;
      'product.multiple-item3-d-link': ProductMultipleItem3DLink;
      'product.item3-d': ProductItem3D;
      'product.description': ProductDescription;
      'product.cart-visualizzation': ProductCartVisualizzation;
    }
  }
}