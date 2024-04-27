const  Page = async ({  }) => {
  const products = await getProducts()
  if (products.error) {
    return <div>An error occured: {products.error.message}</div>;
  }
  return (
    <ul>
      {products.data.map(restaurant => (
        <li key={restaurant.id}>{restaurant.attributes.Name}</li>
      ))}
    </ul>
  );
};

const getProducts = async () => {
  try {
    const res = await fetch('http://localhost:1337/api/products', { headers: { Authorization: "Bearer " + process.env.API_KEY}});
    if (!res.ok) {
      throw new Error(JSON.stringify(res.headers));
    }
    const products = await res.json(); // Attendere la risoluzione della Promise JSON
    return products;
  } catch (error) {
    return { error: error }; // Gestisci gli errori
  }
};


export default Page;