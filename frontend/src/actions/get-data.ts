"use server"
import { isCharity } from "@/lib/utils";
import { ProductCartVisualizzation } from "@/types/components";
import type { APIResponse, APIResponseCollection, CartVisualizzation } from "@/types/strapi-types"
import { CartLiteType, CartType, CategoryInfo, FavoriteType } from "@/types/types";
import { ResponseCookie, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

const fetchStrapi = async <T>(url: string, options: Object = {}) => {
    const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${process.env.API_KEY}`, ...options.headers } })

    if (!response.ok)
        throw new Error(response.statusText);
    return response.json() as T;
};

export const getProducts = async () => {
    try {
        const request: APIResponseCollection<"api::product.product"> = await fetchStrapi<APIResponseCollection<"api::product.product">>(
            `${process.env.API_URL}products?populate[0]=Category`
        );
        return request
    } catch (error) {
        return error as Error
    }
};

export const getProduct = async (productSKU: string) => {
    try {
        const product: APIResponseCollection<"api::product.product"> = await fetchStrapi(process.env.API_URL + `products?filters[SKU][$eq]=${productSKU}&populate[0]=Category&populate[1]=Tags&populate[2]=MainImage&populate[3]=ProductDetails.Material&populate[4]=ProductDetails.Platings&populate[5]=ProductDetails.Images&populate[6]=ProductDetails.Photos&populate[7]=Viewer&populate[8]=Viewer.Model3D&populate[9]=Viewer.SelectedViewer&populate[10]=Viewer.SelectedViewer.Items3D&populate[11]=Viewer.SelectedViewer.Items3D.Model3D&populate[12]=Viewer.SelectedViewer.Items3D.RelativeProduct&populate[13]=Viewer.SelectedViewer.Items3D.MainTransform&populate[14]=Viewer.SelectedViewer.Transforms&populate[15]=Viewer.SelectedViewer.Items3D.Thumbnail&populate[16]=Description.Card&populate[17]=Description.CharityLink&populate[18]=Description.CharityCampaign&populate[19]=Description.FAQs&populate[20]=Description.TestimonialLink&populate[21]=Description.TestimonialLink.Image.formats`)

        if (!product.data.length)
            throw new Error("No product found");

        return product.data[0];
    } catch (error) {
        return error as Error
    }
};

export const getProductsLightFromCartsLight = async (cart: CartLiteType[]) => {
    try {
        const product: APIResponseCollection<"api::product.product"> = await fetchStrapi(process.env.API_URL + `products?${Array.from(new Set(cart.map(i => i.productId))).map((item, i) => "filters[id][$in][" + i + "]=" + item).join("&")}&fields[0]=Name&fields[1]=SKU&populate[ProductDetails][populate][Material][fields][0]=Name&populate[ProductDetails][populate][Material][fields][1]=Color&populate[ProductDetails][populate][Platings][fields][1]=Color&populate[ProductDetails][populate][Images][fields][0]=formats&populate[Category][fields][0]=SKU`)
        if (!product.data)
            throw new Error("No product found");
        return cart.map(c => {
            for (let p of product.data)
                if (p.id === c.productId)
                    return { id: c.productId, name: p.attributes.Name ?? "", urlPath: (p.attributes.Category?.data.attributes.SKU ?? "") + "/" + (p.attributes.SKU ?? ""), image: p.attributes.ProductDetails?.[c.variantIndex].Images?.data[0].attributes.formats?.thumbnail, variantIndex: c.variantIndex, material: p.attributes.ProductDetails?.[c.variantIndex].Material?.data.attributes, platings: p.attributes.ProductDetails?.[c.variantIndex].Platings?.data }
            return null
        }).filter(c => c !== null)
    } catch (error) {
        console.log(`products?${Array.from(new Set(cart.map(i => i.productId))).map((item, i) => "filters[id][$in][" + i + "]=" + item.productId).join("&")}&fields[0]=Name&fields[1]=SKU&fields[2]=ShortDescription&populate[ProductDetails][fields][0]=Price&populate[ProductDetails][fields][1]=CartVisualizzation&populate[ProductDetails][populate][Material][fields][0]=Name&populate[ProductDetails][populate][Material][fields][1]=Color&populate[ProductDetails][populate][Platings][fields][1]=Color&populate[ProductDetails][fields][3]=Images&populate[ProductDetails][populate][CartVisualizzation][populate][Texture][fields][0]=formats&populate[ProductDetails][populate][Images][fields][0]=formats&populate[Category][fields][0]=SKU&populate[Description][on][product.charity-link][populate]=*`)
        return error as Error
    }
}

export const getCartVisualizzationData = async (productId: number) => {
    try {
        const product: APIResponse<"api::product.product"> = await fetchStrapi(process.env.API_URL + `products/${productId}?fields[0]=id&populate[ProductDetails][fields][0]=CartVisualizzation&populate[ProductDetails][populate][CartVisualizzation][populate][Texture][fields][0]=formats`)

        if (!product.data)
            throw new Error("No product found");

        return product.data.attributes.ProductDetails?.map(v => v.CartVisualizzation as CartVisualizzation) ?? [];
    } catch (error) {
        return error as Error
    }
};

export const getCartsFromCartsLight = async (cart: CartLiteType[]) => {
    try {
        const product: APIResponseCollection<"api::product.product"> = await fetchStrapi(process.env.API_URL + `products?${Array.from(new Set(cart.map(i => i.productId))).map((item, i) => "filters[id][$in][" + i + "]=" + item).join("&")}&fields[0]=Name&fields[1]=SKU&fields[2]=ShortDescription&populate[ProductDetails][fields][0]=Price&populate[ProductDetails][fields][1]=CartVisualizzation&populate[ProductDetails][populate][Material][fields][0]=Name&populate[ProductDetails][populate][Material][fields][1]=Color&populate[ProductDetails][populate][Platings][fields][1]=Color&populate[ProductDetails][fields][3]=Images&populate[ProductDetails][populate][CartVisualizzation][populate][Texture][fields][0]=formats&populate[ProductDetails][populate][Images][fields][0]=formats&populate[Category][fields][0]=SKU&populate[Description][on][product.charity-link][populate]=*`)
        if (!product.data)
            throw new Error("No product found");
        return cart.map(c => {
            for (let p of product.data)
                if (p.id === c.productId)
                    return { id: c.productId, name: p.attributes.Name ?? "", urlPath: (p.attributes.Category?.data.attributes.SKU ?? "") + "/" + (p.attributes.SKU ?? ""), shortDescription: p.attributes.ShortDescription ?? "", quantity: c.quantity ?? 0, variant: p.attributes.ProductDetails?.[c.variantIndex], variantIndex: c.variantIndex, size: p.attributes.ProductDetails?.[c.variantIndex].CartVisualizzation.Size, textureURL: p.attributes.ProductDetails?.[c.variantIndex].CartVisualizzation.Texture?.data.attributes.formats?.medium.url, charity: p.attributes.Description?.find(d => d.__component === "product.charity-link") } as CartType
            return null
        }).filter(c => c !== null)
    } catch (error) {
        console.log(`products?${Array.from(new Set(cart.map(i => i.productId))).map((item, i) => "filters[id][$in][" + i + "]=" + item.productId).join("&")}&fields[0]=Name&fields[1]=SKU&fields[2]=ShortDescription&populate[ProductDetails][fields][0]=Price&populate[ProductDetails][fields][1]=CartVisualizzation&populate[ProductDetails][populate][Material][fields][0]=Name&populate[ProductDetails][populate][Material][fields][1]=Color&populate[ProductDetails][populate][Platings][fields][1]=Color&populate[ProductDetails][fields][3]=Images&populate[ProductDetails][populate][CartVisualizzation][populate][Texture][fields][0]=formats&populate[ProductDetails][populate][Images][fields][0]=formats&populate[Category][fields][0]=SKU&populate[Description][on][product.charity-link][populate]=*`)
        return error as Error
    }
};

export const getCartFromCartLight = async (cart: CartLiteType) => {
    try {
        const product: APIResponse<"api::product.product"> = await fetchStrapi(process.env.API_URL + `products/${cart.productId}?fields[0]=Name&fields[1]=SKU&fields[2]=ShortDescription&populate[ProductDetails][fields][0]=Price&populate[ProductDetails][fields][1]=CartVisualizzation&populate[ProductDetails][populate][Material][fields][0]=Name&populate[ProductDetails][populate][Material][fields][1]=Color&populate[ProductDetails][populate][Platings][fields][1]=Color&populate[ProductDetails][fields][4]=Images&populate[ProductDetails][populate][CartVisualizzation][populate][Texture][fields][0]=formats&populate[ProductDetails][populate][Images][fields][0]=formats&populate[Category][fields][0]=SKU&populate[Description][on][product.charity-link][populate]=*`)
        if (!product.data)
            throw new Error("No product found");
        console.log(product.data.attributes.ProductDetails?.[cart.variantIndex])
        return ({ id: cart.productId, name: product.data.attributes.Name ?? "", urlPath: (product.data.attributes.Category?.data.attributes.SKU ?? "") + "/" + (product.data.attributes.SKU ?? ""), shortDescription: product.data.attributes.ShortDescription ?? "", quantity: cart.quantity ?? 0, variant: product.data.attributes.ProductDetails?.[cart.variantIndex], variantIndex: cart.variantIndex, size: product.data.attributes.ProductDetails?.[cart.variantIndex].CartVisualizzation.Size, textureURL: product.data.attributes.ProductDetails?.[cart.variantIndex].CartVisualizzation.Texture?.data.attributes.formats?.medium.url, charity: product.data.attributes.Description?.find(d => d.__component === "product.charity-link") } as CartType)
    } catch (error) {
        return (error as Error).message
    }
};

export const getPricesFromCartsLight = async (cart: CartLiteType[]) => {
    try {
        const product: APIResponseCollection<"api::product.product"> = await fetchStrapi(process.env.API_URL + `products?${Array.from(new Set(cart.map(i => i.productId))).map((item, i) => "filters[id][$in][" + i + "]=" + item).join("&")}&populate[ProductDetails][fields][0]=Price`)
        if (!product.data)
            throw new Error("No product found");
        return cart.map(c => {
            for (let p of product.data)
                if (p.id === c.productId)
                    return { quantity: c.quantity, price: p.attributes.ProductDetails?.[c.variantIndex].Price }
            throw new Error("Variante non trovata");
        }).filter(c => c !== undefined)
    } catch (error) {
        return (error as Error).message
    }
}

export const getFavoritesFromFavoritesLight = async (favorites: { vId: number, pId: number }[]) => {
    try {
        const product: APIResponseCollection<"api::product.product"> = await fetchStrapi(process.env.API_URL + `products?${favorites.map((item, i) => "filters[id][$in][" + i + "]=" + item.pId).join("&")}&fields[0]=Name&fields[1]=SKU&fields[2]=ShortDescription&populate[ProductDetails][fields][0]=Price&populate[ProductDetails][populate][Material][fields][0]=Name&populate[ProductDetails][populate][Material][fields][1]=Color&populate[ProductDetails][populate][Platings][fields][1]=Color&populate[ProductDetails][fields][3]=Images&populate[ProductDetails][populate][Images][fields][0]=formats&populate[Category][fields][0]=SKU&populate[Description][on][product.charity-link][populate]=*`)

        if (!product.data)
            throw new Error("No product found");

        return favorites.map(f => {
            for (let p of product.data)
                if (p.id === f.pId)
                    return { id: f.pId, name: p.attributes.Name ?? "", urlPath: (p.attributes.Category?.data.attributes.SKU ?? "") + "/" + (p.attributes.SKU ?? ""), shortDescription: p.attributes.ShortDescription ?? "", variant: p.attributes.ProductDetails?.find(v => v.id === f.vId), variantIndex: p.attributes.ProductDetails?.reduce((acc, curr, index) => { if (acc !== -1) return acc; return curr.id === f.vId ? index : -1 }, -1), charity: p.attributes.Description?.find(d => d.__component === "product.charity-link") } as FavoriteType
            return null
        }).filter(c => c !== null)
    } catch (error) {
        return error as Error
    }
};

export const getCategories = async () => {
    try {
        return (await fetchStrapi<APIResponseCollection<"api::category.category">>(process.env.API_URL + `categories`)).data.map((d): CategoryInfo => ({ sku: d.attributes.SKU ?? "", name: d.attributes.Name, description: d.attributes.ShortDescription ?? "" }))

    } catch (error) {
        return error as Error
    }
};

export const getCategory = async (categoryId: string) => {
    try {
        const category: APIResponseCollection<"api::category.category"> = await fetchStrapi(process.env.API_URL + `categories?filters[SKU][$eq]=${categoryId}&populate[0]=Products`);

        if (!category.data.length)
            throw new Error("No product found");

        return category.data[0];
    } catch (error) {
        return error as Error;
    }
};

export const setCookie = async (name: string, value: string, cookie?: Partial<ResponseCookie>) => { cookies().set(name, value, cookie) }
export const getCookie = async<T>(name: string) => cookies().get(name)?.value as T
export const deleteCookie = async (name: string) => cookies().delete(name)