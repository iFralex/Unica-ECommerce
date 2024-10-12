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

export interface ProductTestimonial extends Schema.Component {
  collectionName: 'components_product_testimonials';
  info: {
    displayName: 'Testimonial';
    description: '';
  };
  attributes: {
    TestimonialLink: Attribute.Relation<
      'product.testimonial',
      'oneToOne',
      'api::testimonial.testimonial'
    >;
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

export interface ProductSingleCard extends Schema.Component {
  collectionName: 'components_product_single_cards';
  info: {
    displayName: 'SingleCard';
  };
  attributes: {
    Title: Attribute.String;
    Description: Attribute.Text;
  };
}

export interface ProductReview extends Schema.Component {
  collectionName: 'components_product_reviews';
  info: {
    displayName: 'Review';
    description: '';
  };
  attributes: {
    UserName: Attribute.String & Attribute.Required;
    Text: Attribute.Text & Attribute.Required;
    InstagramURL: Attribute.String;
    TikTokURL: Attribute.String;
    AvatarURL: Attribute.String;
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

export interface ProductFaq extends Schema.Component {
  collectionName: 'components_product_faqs';
  info: {
    displayName: 'FAQ';
  };
  attributes: {
    FAQs: Attribute.Relation<'product.faq', 'oneToMany', 'api::faq.faq'>;
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

export interface ProductCharityLink extends Schema.Component {
  collectionName: 'components_product_charity_links';
  info: {
    displayName: 'CharityLink';
    description: '';
  };
  attributes: {
    CharityCampaign: Attribute.Relation<
      'product.charity-link',
      'oneToOne',
      'api::charity-campaign.charity-campaign'
    >;
    DonatedMoney: Attribute.Decimal &
      Attribute.Required &
      Attribute.DefaultTo<5>;
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

export interface ProductCards extends Schema.Component {
  collectionName: 'components_product_cards';
  info: {
    displayName: 'Cards';
    description: '';
  };
  attributes: {
    Card: Attribute.Component<'product.single-card', true>;
    Type: Attribute.Enumeration<['Dettagli', 'Come sei']>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'product.transforms': ProductTransforms;
      'product.testimonial': ProductTestimonial;
      'product.single-item3-d': ProductSingleItem3D;
      'product.single-card': ProductSingleCard;
      'product.review': ProductReview;
      'product.product-details': ProductProductDetails;
      'product.multiple-item3-d-link': ProductMultipleItem3DLink;
      'product.item3-d': ProductItem3D;
      'product.faq': ProductFaq;
      'product.description': ProductDescription;
      'product.charity-link': ProductCharityLink;
      'product.cart-visualizzation': ProductCartVisualizzation;
      'product.cards': ProductCards;
    }
  }
}
