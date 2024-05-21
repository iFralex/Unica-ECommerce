const fetchStrapi = async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${process.env.API_KEY}`, ...options.headers } })

    if (!response.ok)
        throw new Error(response.statusText);

    return response.json();
};

export const getProducts = async () => {
    try {
        return await fetchStrapi(process.env.API_URL + 'products?populate[0]=Category');
    }
    catch (error) {
        return { error: error.message };
    }
};

export const getProduct = async (productId) => {
    try {
        const product = await fetchStrapi(process.env.API_URL + `products?filters[SKU][$eq]=${productId}&populate[0]=Category&populate[1]=Tags&populate[2]=MainImage&populate[3]=ProductDetails.Material&populate[4]=ProductDetails.Platings&populate[5]=ProductDetails.Images&populate[6]=Model3D&populate[7]=ProductDetails.Photos`)

        if (!product.data.length)
            throw new Error("No product found");
        console.log(product.data[0].attributes.ProductDetails[0].Images.data[0].attributes.url)
        return product.data[0];
    } catch (error) {
        return { error: error.message };
    }
};

export const getTest = async (productId) => {
    try {
        const product = await fetchStrapi("http://localhost:1337/uploads/untitled_6e1ec15149.gltf")

        return product;
    } catch (error) {
        return { error: error.message };
    }
};

export const getCategories = async () => {
    try {
        return (await fetchStrapi(process.env.API_URL + `categories`)).data.map(d => ({ sku: d.attributes.SKU, name: d.attributes.Name, description: d.attributes.ShortDescription }))

    } catch (error) {
        return { error: error.message };
    }
};

export const getCategory = async (categoryId) => {
    try {
        const category = await fetchStrapi(process.env.API_URL + `categories?filters[SKU][$eq]=${categoryId}&populate[0]=Products`);

        if (!category.data.length)
            throw new Error("No product found");

        return category.data[0];
    } catch (error) {
        return { error: error.message };
    }
};

export default { getProducts, getProduct, getCategoryNames: getCategories };