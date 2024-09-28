import { ProductProductDetails } from "./components";
import { APIResponseData } from "./strapi-types";

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

export type VariantType = (APIResponseData<"api::product.product">["attributes"]["ProductDetails"]) extends (infer U)[] | undefined | null ? U : never,

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
    variant: VariantType
    size: [number, number],
    textureURL: string,
    charity: boolean,
}

export type CartContextType = { cart: CartType[], cartQuantity: number }
export type UserType = {
    id: string
}