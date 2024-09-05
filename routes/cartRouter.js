const express = require('express');
const router = express.Router();
const cartManager = require('../managers/cartManager');

router.get('/:cid', async (req, res) => {
    const cid = req.params.cid;
    const cart = await cartManager.getCartById(cid);
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const cart = await cartManager.addProductToCart(cid, pid, parseInt(quantity));
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).send('Carrito o producto no encontrado');
    }
});

router.delete('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const cart = await cartManager.removeProductFromCart(cid, pid);
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).send('Carrito o producto no encontrado');
    }
});

router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    const cart = await cartManager.clearCart(cid);
    if (cart) {
        res.json(cart);
    } else {
        res.status(404).send('Carrito no encontrado');
    }
});

module.exports = router;
