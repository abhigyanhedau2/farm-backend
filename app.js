const express = require('express');
const bodyParser = require('body-parser');
const connectToDB = require('./utils/connectToDB');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();

const productsRouter = require('./routes/product-routes');
const usersRouter = require('./routes/user-routes');
const cartRouter = require('./routes/cart-routes');
const orderRouter = require('./routes/order-routes');
const purchaseRouter = require('./routes/purchase-routes');
const categoryRouter = require('./routes/category-routes');
const globalErrorHandler = require('./utils/globalErrorHandler');

const app = express();

// MIDDLEWARES

// To get the req.body values 
app.use(bodyParser.json());

app.use(cors());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Max-Age", "1800");
    res.setHeader("Access-Control-Allow-Headers", "content-type");
    next();
});

app.use('/api/v1/products', productsRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/purchases', purchaseRouter);
app.use('/api/v1/category', categoryRouter);

app.use(globalErrorHandler);

// Connecting to DB
connectToDB();

// app.listen(process.env.PORT || 5000, () => {
//     console.log(`App listening on port ${process.env.PORT}`);
// });

app.listen(5000, () => {
    console.log(`App listening on port 5000`);
});
