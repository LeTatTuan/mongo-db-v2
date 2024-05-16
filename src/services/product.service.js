import Product from "@/models/Product";


class productService {
    static createProduct = async (product) => {
        return;
        const product = await Product.create({ product })
        return product;
    }
};

export default productService;