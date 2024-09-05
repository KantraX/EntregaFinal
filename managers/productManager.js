const Product = require('../models/Product');
let io;

async function getAllProducts(filters = {}, sort = {}, limit = 10, page = 1) {
    try {
        const products = await Product.find(filters)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);
        return products;
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
}

async function getProductById(pid) {
    try {
        const product = await Product.findById(pid);
        return product;
    } catch (error) {
        console.error('Error al obtener producto por ID:', error);
        return null;
    }
}

async function addProduct(productData) {
    try {
        const newProduct = new Product(productData);
        await newProduct.save();
        if (io) io.emit('updateProducts', await getAllProducts());
        return newProduct;
    } catch (error) {
        console.error('Error al agregar producto:', error);
        return null;
    }
}

async function deleteProduct(pid) {
    try {
        const product = await Product.findByIdAndDelete(pid);
        if (product && io) io.emit('updateProducts', await getAllProducts());
        return product;
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return null;
    }
}

function setIoInstance(socketIoInstance) {
    io = socketIoInstance;
}

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    deleteProduct,
    setIoInstance
};
