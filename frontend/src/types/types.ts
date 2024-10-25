import { ProductProductDetails } from "./components";
import { APIResponse, APIResponseData } from "./strapi-types";

type SafeRequest<T> = {
    error?: Error;
    request?: T;
};

export type CategoryInfo = {
    sku: string
    name: string
    description: string
}

export type Vector = [number, number, number]
export type Vector2 = [number, number]
export type Transform = { Position?: Vector, Rotation?: Vector, Scale?: Vector }

export type VariantType = (APIResponseData<"api::product.product">["attributes"]["ProductDetails"]) extends (infer U)[] | undefined | null ? U : never

export type CartLiteType = {
    productId: number,
    quantity: number,
    variantIndex: number
}

export type CartType = {
    id: number,
    name: string,
    urlPath: string,
    shortDescription: string,
    quantity: number
    variant: VariantType,
    variantIndex: number
    size: [number, number],
    textureURL: string,
    charity?: Extract<NonNullable<APIResponse<"api::product.product">["data"]["attributes"]["Description"]>[number], { __component: "product.charity-link" }>
}

export type CartContextType = CartType[] | null
export type UserType = {
    id: string,
}

export type FavoriteType = {
    id: number,
    name: string,
    urlPath: string,
    shortDescription: string,
    variant: VariantType,
    variantIndex: number,
    charity?: Extract<NonNullable<APIResponse<"api::product.product">["data"]["attributes"]["Description"]>[number], { __component: "product.charity-link" }>}

export type CardDescriptionType = {
    title: string,
    description: string
}

export type OrderType = {
    orderId?: string,
    note?: string,
    paymentId: string,
    shippingId: string,
    createdDate: number,
    price: number,
    items: CartLiteType[]
}

export type AccountInformationType = {
    addresses: {id: string, key: string, details?: string}[],
    paymentId: string
}

export interface AddressDetails {
    key: string,
    id: string;
    street: string;
    houseNumber: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    fullAddress: string;
    details?: string;
  }