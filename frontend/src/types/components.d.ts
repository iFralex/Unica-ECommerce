import type { Schema, Attribute } from '@strapi/strapi';

export interface PrTransforms extends Schema.Component {
  collectionName: 'components_pr_transforms';
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

export interface PrTestimonial extends Schema.Component {
  collectionName: 'components_pr_testimonials';
  info: {
    displayName: 'Testimonial';
    description: '';
  };
  attributes: {
    TestimonialLink: Attribute.Relation<
      'pr.testimonial',
      'oneToOne',
      'api::testimonial.testimonial'
    >;
  };
}

export interface PrSingleItem3D extends Schema.Component {
  collectionName: 'components_pr_single_item3_ds';
  info: {
    displayName: 'SingleItem3D';
    description: '';
  };
  attributes: {
    Model3D: Attribute.Media<'files'>;
    Transforms: Attribute.JSON;
    InitialCameraRotation: Attribute.JSON;
    HeroPreview: Attribute.Component<'pr.transforms'>;
  };
}

export interface PrSingleCard extends Schema.Component {
  collectionName: 'components_pr_single_cards';
  info: {
    displayName: 'SingleCard';
  };
  attributes: {
    Title: Attribute.String;
    Description: Attribute.Text;
  };
}

export interface PrReview extends Schema.Component {
  collectionName: 'components_pr_reviews';
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

export interface PrProductDetails extends Schema.Component {
  collectionName: 'components_pr_product_details';
  info: {
    displayName: 'ProductDetails';
    description: '';
  };
  attributes: {
    Material: Attribute.Relation<
      'pr.product-details',
      'oneToOne',
      'api::material.material'
    >;
    Price: Attribute.Decimal;
    Images: Attribute.Media<'images' | 'files' | 'videos' | 'audios', true>;
    Platings: Attribute.Relation<
      'pr.product-details',
      'oneToMany',
      'api::plating.plating'
    >;
    Materials3D: Attribute.JSON;
    Photos: Attribute.Media<'images', true>;
    CartVisualizzation: Attribute.Component<'pr.cart-visualizzation'> &
      Attribute.Required;
  };
}

export interface PrMultipleItem3DLink extends Schema.Component {
  collectionName: 'components_pr_multiple_item3_d_links';
  info: {
    displayName: 'MultipleItem3DLink';
    description: '';
  };
  attributes: {
    SelectedViewer: Attribute.Relation<
      'pr.multiple-item3-d-link',
      'oneToOne',
      'api::viewer3d.viewer3d'
    >;
  };
}

export interface PrItem3D extends Schema.Component {
  collectionName: 'components_pr_item3_ds';
  info: {
    displayName: 'MultipleItem3D';
    description: '';
  };
  attributes: {
    Name: Attribute.String & Attribute.Private;
    Thumbnail: Attribute.Media<'images'>;
    Model3D: Attribute.Media<'files'>;
    RelativeProduct: Attribute.Relation<
      'pr.item3-d',
      'oneToOne',
      'api::product.product'
    >;
    MainTransform: Attribute.Component<'pr.transforms'>;
    HeroPreview: Attribute.Component<'pr.transforms'>;
  };
}

export interface PrFaq extends Schema.Component {
  collectionName: 'components_pr_faqs';
  info: {
    displayName: 'FAQ';
  };
  attributes: {
    FAQs: Attribute.Relation<'pr.faq', 'oneToMany', 'api::faq.faq'>;
  };
}

export interface PrDescription extends Schema.Component {
  collectionName: 'components_pr_descriptions';
  info: {
    displayName: 'Description';
  };
  attributes: {
    Title: Attribute.String;
    Text: Attribute.Blocks;
  };
}

export interface PrCharityLink extends Schema.Component {
  collectionName: 'components_pr_charity_links';
  info: {
    displayName: 'CampaignLink';
    description: '';
  };
  attributes: {
    CharityCampaign: Attribute.Relation<
      'pr.charity-link',
      'oneToOne',
      'api::charity-campaign.charity-campaign'
    >;
    DonatedMoney: Attribute.Decimal &
      Attribute.Required &
      Attribute.DefaultTo<5>;
    PromoCampaign: Attribute.Relation<
      'pr.charity-link',
      'oneToOne',
      'api::promo-campaign.promo-campaign'
    >;
  };
}

export interface PrCartVisualizzation extends Schema.Component {
  collectionName: 'components_pr_cart_visualizzations';
  info: {
    displayName: 'CartVisualizzation';
    description: '';
  };
  attributes: {
    Size: Attribute.JSON;
    Texture: Attribute.Media<'images'>;
  };
}

export interface PrCards extends Schema.Component {
  collectionName: 'components_pr_cards';
  info: {
    displayName: 'Cards';
    description: '';
  };
  attributes: {
    Card: Attribute.Component<'pr.single-card', true>;
    Type: Attribute.Enumeration<['Dettagli', 'Come sei']>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'pr.transforms': PrTransforms;
      'pr.testimonial': PrTestimonial;
      'pr.single-item3-d': PrSingleItem3D;
      'pr.single-card': PrSingleCard;
      'pr.review': PrReview;
      'pr.product-details': PrProductDetails;
      'pr.multiple-item3-d-link': PrMultipleItem3DLink;
      'pr.item3-d': PrItem3D;
      'pr.faq': PrFaq;
      'pr.description': PrDescription;
      'pr.charity-link': PrCharityLink;
      'pr.cart-visualizzation': PrCartVisualizzation;
      'pr.cards': PrCards;
    }
  }
}
