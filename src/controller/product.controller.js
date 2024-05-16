import productService from "@/services/product.service";

const productController = {
    createProduct: async (req, res) => {
        const user = req.user;
        req.body.user = req.user.userId;
        new CREATED({
            message: 'add a new product success',
            metadata: await productService.createProduct(req.body)
        }).send(res);
    },
}

export default productController;