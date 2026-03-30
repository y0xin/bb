import type { Schema, Struct } from '@strapi/strapi';

export interface ProductAttribute extends Struct.ComponentSchema {
  collectionName: 'components_product_attributes';
  info: {
    description: '';
    displayName: 'Attribute';
    icon: 'list-ul';
  };
  attributes: {
    key: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'product.attribute': ProductAttribute;
    }
  }
}
