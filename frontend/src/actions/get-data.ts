"use server"
import { ProductCartVisualizzation } from "@/types/components";
import type { APIResponse, APIResponseCollection, CartVisualizzation } from "@/types/strapi-types"
import { CartLiteType, CartType, CategoryInfo } from "@/types/types";
import { ResponseCookie, ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies } from "next/headers";

const fetchStrapi = async <T>(url: string, options: Object = {}) => {
    const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${process.env.API_KEY}`, ...options.headers }, cache: "no-store" })

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
        /*const product = await fetchStrapi(process.env.API_URL + `products?
            filters[SKU][$eq]=${productId}
            &populate[Category][populate]=*
            &populate[Tags][populate]=*
            &populate[MainImage]=MainImage
            &populate[ProductDetails][populate]=*
            &populate[Viewer][populate]=*
            `)*/
        const product: APIResponseCollection<"api::product.product"> = await fetchStrapi(process.env.API_URL + `products?filters[SKU][$eq]=${productSKU}&populate[0]=Category&populate[1]=Tags&populate[2]=MainImage&populate[3]=ProductDetails.Material&populate[4]=ProductDetails.Platings&populate[5]=ProductDetails.Images&populate[6]=ProductDetails.Photos&populate[7]=Viewer&populate[8]=Viewer.Model3D&populate[9]=Viewer.SelectedViewer&populate[10]=Viewer.SelectedViewer.Items3D&populate[11]=Viewer.SelectedViewer.Items3D.Model3D&populate[12]=Viewer.SelectedViewer.Items3D.RelativeProduct&populate[13]=Viewer.SelectedViewer.Items3D.MainTransform&populate[14]=Viewer.SelectedViewer.Transforms&populate[15]=Viewer.SelectedViewer.Items3D.Thumbnail`)

        if (!product.data.length)
            throw new Error("No product found");

        return product.data[0];
    } catch (error) {
        return error as Error
    }
};

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

export const getCartFromCartLight = async (cart: CartLiteType[]) => {
    try {
        const product: APIResponseCollection<"api::product.product"> = await fetchStrapi(process.env.API_URL + `products?${cart.map((item, i) => "filters[id][$in][" + i + "]=" + item.productId).join("&")}&fields[0]=Name&fields[1]=SKU&populate[ProductDetails][fields][0]=Price&populate[ProductDetails][fields][1]=CartVisualizzation&populate[ProductDetails][fields][2]=Material&populate[ProductDetails][fields][3]=Platings&populate[ProductDetails][fields][4]=Images&populate[ProductDetails][populate][CartVisualizzation][populate][Texture][fields][0]=formats&populate[ProductDetails][populate][Images][fields][0]=formats`)

        if (!product.data)
            throw new Error("No product found");
        const variantIds = cart.map(i => i.variantIndex)
        //const art = [].concat(...product.data.map(i => i.attributes.ProductDetails))
        return cart.map(c => {
            for (let p of product.data)
                if (p.id === c.productId)
                    return { id: c.productId, name: p.attributes.Name ?? "", sku: p.attributes.SKU ?? "", quantity: c.quantity ?? 0, variant: p.attributes.ProductDetails?.[c.variantIndex] } as CartType
            return null
        }).filter(c => c !== null)
    } catch (error) {
        return error as Error
    }
};

export const getTest = async (productId: string) => {
    try {
        const product = await fetchStrapi("http://localhost:1337/uploads/untitled_6e1ec15149.gltf")

        return product;
    } catch (error) {
        return { error: error.message };
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