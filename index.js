const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

// Initialize Port Number
const port = process.env.PORT || 5000;

// Initializing Application
const app = express();

// Application MiddleWare
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.p4naa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
const run = async () => {
	try {
		await client.connect(() => {
			console.log('Database connection established');
		});
		// DataBase
		const db = client.db('baby_center');
		// Selecting Collections
		const products = db.collection('products');
		const users = db.collection('user');
		const orders = db.collection('orders');

		app.get('/', (req, res) => {
			res.send('Welcome to my Application.🍃');
		});

		app.post('/products', async (req, res) => {
			const product = req.body;
			const result = await products.insertOne(product);
			res.send(result.acknowledged);
		});

		app.get('/products', async (req, res) => {
			const limit = req.query.limit;
			if (limit) {
				const cursor = products
					.find({})
					.sort({ _id: -1 })
					.limit(parseInt(limit));
				const result = await cursor.toArray();
				res.send(JSON.stringify(result));
			} else {
				const cursor = products.find({});
				const result = await cursor.toArray();
				res.send(JSON.stringify(result));
			}
		});
		app.delete('/products/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await products.deleteOne(query);
			res.send(JSON.stringify(result));
		});
		app.get('/products/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await products.findOne(query);
			res.send(JSON.stringify(result));
		});
		// Update Products
		app.put('/products/:id', async (req, res) => {
			const id = req.params.id;
			const updateProducts = {
				$set: req.body,
			};
			const query = { _id: ObjectId(id) };
			const result = await products.updateOne(query, updateProducts);
			res.send(JSON.stringify(result));
		});

		// Set User on Database
		app.get('/users', async (req, res) => {
			const result = await users.find({}).toArray();
			res.send(JSON.stringify(result));
		});
		app.get('/users/:email', async (req, res) => {
			const email = req.params.email;
			const filter = { email: email };
			const result = await users.findOne(filter);
			res.json(result);
		});
		app.put('/users', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const options = { upsert: true };
			const updateDoc = { $set: user };
			const result = await users.updateOne(filter, updateDoc, options);
			res.json(result);
		});
		app.put('/users/admin', async (req, res) => {
			const user = req.body;
			const filter = { email: user.email };
			const updateDoc = {
				$set: {
					role: 'admin',
				},
			};
			const result = await users.updateOne(filter, updateDoc);
			res.json(result);
		});
		app.delete('/users/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await users.deleteOne(query);
			res.send(JSON.stringify(result));
		});

		// Handle Orders
		app.post('/orders', async (req, res) => {
			const order = req.body;
			const result = await orders.insertOne(order);
			res.send(result.acknowledged);
		});
		app.get('/orders/:id', async (req, res) => {
			const id = req.params.id;
			const query = { user: id };
			const result = await orders.find(query).toArray();
			console.log(result);
			res.send(JSON.stringify(result));
		});
		app.delete('/orders/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await orders.deleteOne(query);
			res.send(JSON.stringify(result));
		});
	} finally {
		// await client.close().;
	}
};
run().catch(console.dir);

// Listening Server On Port
app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
