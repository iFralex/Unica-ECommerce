const fetchStrapi = async (url, options = {}) => {
    const response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${process.env.API_KEY}`, ...options.headers }, cache: "no-store" })

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
        /*const product = await fetchStrapi(process.env.API_URL + `products?
            filters[SKU][$eq]=${productId}
            &populate[Category][populate]=*
            &populate[Tags][populate]=*
            &populate[MainImage]=MainImage
            &populate[ProductDetails][populate]=*
            &populate[Viewer][populate]=*
            `)*/
        const product = await fetchStrapi(process.env.API_URL + `products?filters[SKU][$eq]=${productId}&populate[0]=Category&populate[1]=Tags&populate[2]=MainImage&populate[3]=ProductDetails.Material&populate[4]=ProductDetails.Platings&populate[5]=ProductDetails.Images&populate[6]=ProductDetails.Photos&populate[7]=Viewer&populate[8]=Viewer.Model3D&populate[9]=Viewer.SelectedViewer&populate[10]=Viewer.SelectedViewer.Items3D&populate[11]=Viewer.SelectedViewer.Items3D.Model3D&populate[12]=Viewer.SelectedViewer.Items3D.RelativeProduct&populate[13]=Viewer.SelectedViewer.Items3D.MainTransform&populate[14]=Viewer.SelectedViewer.Transforms&populate[15]=Viewer.SelectedViewer.Items3D.Thumbnail`)

        if (!product.data.length)
            throw new Error("No product found");

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