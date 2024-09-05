const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const productManager = require('./managers/productManager');
const cartManager = require('./managers/cartManager');
const productRouter = require('./routes/productRouter');
const cartRouter = require('./routes/cartRouter');

const app = express();
const PORT = 8080;

mongoose.connect('mongodb://localhost:27017/tienda', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB', err));

app.engine('handlebars', handlebars.engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json());

app.use('/products', productRouter);
app.use('/carts', cartRouter);

app.get('/', (req, res) => {
    res.redirect('/products'); 
});

const server = app.listen(PORT, () => {
    console.log(`Servidor cargado en http://localhost:${PORT}`);
});

const io = new Server(server);
productManager.setIoInstance(io);
cartManager.setIoInstance(io);

io.on('connection', (socket) => {
    console.log('Conectado correctamente con ID:', socket.id);

    socket.on('newProduct', async (productData) => {
        const newProduct = await productManager.addProduct(productData);
        io.emit('updateProducts', await productManager.getAllProducts());
    });

    socket.on('deleteProduct', async (productId) => {
        await productManager.deleteProduct(productId);
        io.emit('updateProducts', await productManager.getAllProducts());
    });

    socket.on('addProductToCart', async ({ cartId, productId, quantity }) => {
        const updatedCart = await cartManager.addProductToCart(cartId, productId, quantity);
        io.emit('updateCart', updatedCart);
    });

    socket.on('removeProductFromCart', async ({ cartId, productId }) => {
        const updatedCart = await cartManager.removeProductFromCart(cartId, productId);
        io.emit('updateCart', updatedCart);
    });

    socket.on('clearCart', async ({ cartId }) => {
        const updatedCart = await cartManager.clearCart(cartId);
        io.emit('updateCart', updatedCart);
    });
});
