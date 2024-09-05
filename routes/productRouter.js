const express = require('express');
const router = express.Router();
const productManager = require('../managers/productManager');

router.get('/', async (req, res) => {
    const { limit = 10, page = 1, sort, query, category, available } = req.query;
    const filters = {};
    if (query) filters.$or = [{ name: new RegExp(query, 'i') }, { description: new RegExp(query, 'i') }];
    if (category) filters.category = category;
    if (available !== undefined) filters.available = available === 'true';

    const sortOption = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

    const products = await productManager.getAllProducts(filters, sortOption, parseInt(limit), parseInt(page));
    
    res.render('products', { products });
});

router.get('/:pid', async (req, res) => {
    const pid = req.params.pid;
    const product = await productManager.getProductById(pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

router.post('/', async (req, res) => {
    const newProduct = req.body;
    const product = await productManager.addProduct(newProduct);
    if (product) {
        res.status(201).json(product);
    } else {
        res.status(500).send('Error al agregar producto');
    }
});

router.delete('/:pid', async (req, res) => {
    const pid = req.params.pid;
    const product = await productManager.deleteProduct(pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).send('Producto no encontrado');
    }
});

module.exports = router;
