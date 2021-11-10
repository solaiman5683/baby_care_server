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
		const db = client.db('house_plant');
		// Selecting Collections
		const products = db.collection('products');
		const users = db.collection('user');

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

		// Set User on Database
		app.post('/users', async (req, res) => {
			const user = req.body;
			const result = await users.insertOne(user);
			res.send(result.acknowledged);
		});
		app.get('/users', async (req, res) => {
			const result = await products.find({}).toArray();
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
