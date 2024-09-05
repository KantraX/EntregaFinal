const Cart = require('../models/Cart');
const Product = require('../models/Product');
let io;

async function getCartById(cid) {
    try {
        let cart = await Cart.findById(cid).populate('products.product');
        if (!cart) {
            cart = new Cart({ _id: cid, products: [] });
            await cart.save();
        }
        return cart;
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        return null;
    }
}

async function addProductToCart(cid, pid, quantity) {
    try {
        const cart = await getCartById(cid);
        const product = await Product.findById(pid);
        if (!product) {
            console.error('Producto no encontrado');
            return null;
        }

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += quantity;
        } else {
            cart.products.push({ product: pid, quantity });
        }
        await cart.save();
        if (io) io.emit('updateCart', cart);
        return cart;
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        return null;
    }
}

async function removeProductFromCart(cid, pid) {
    try {
        const cart = await getCartById(cid);
        cart.products = cart.products.filter(item => item.product.toString() !== pid);
        await cart.save();
        if (io) io.emit('updateCart', cart);
        return cart;
    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        return null;
    }
}

async function clearCart(cid) {
    try {
        const cart = await getCartById(cid);
        cart.products = [];
        await cart.save();
        if (io) io.emit('updateCart', cart);
        return cart;
    } catch (error) {
        console.error(`Error al vaciar el carrito con ID ${cid}:`, error);
        return null;
    }
}

function setIoInstance(socketIoInstance) {
    io = socketIoInstance;
}

module.exports = {
    getCartById,
    addProductToCart,
    removeProductFromCart,
    clearCart,
    setIoInstance
};
