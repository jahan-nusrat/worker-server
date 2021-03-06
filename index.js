require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongodb = require('mongodb');
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.get('/', (req, res) => {
	res.send('<h2>Volunteer Server is running</h2>');
});

//database connection

/* const uri =
	'mongodb+srv://adminVolunteer:adgjmptw499@cluster0.oawso.mongodb.net/volunteer-network?retryWrites=true&w=majority'; */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oawso.mongodb.net/${process.DB_NAME}?retryWrites=true&w=majority`;

/*****************all categories*******************/
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
client.connect((err) => {
	const categoriesDB = client.db('volunteer-network').collection('categories');
	const volunteersDB = client.db('volunteer-network').collection('volunteers');

	//post categories
	app.post('/addCategories', (req, res) => {
		const category = req.body;
		categoriesDB.insertOne(category).then((result) => {
			res.send(result);
		});
	});

	//get categories
	app.get('/categories', (req, res) => {
		categoriesDB.find().toArray((err, documents) => {
			if (err) {
				console.log(err);
				res.status(500).send({
					message: err
				});
			} else {
				res.send(documents);
			}
		});
	});

	//get categories by ID
	app.get('/categories/:id', (req, res) => {
		categoriesDB.find({
			_id: ObjectId(req.params.id)
		}).toArray((err, documents) => {
			if (err) {
				console.log(err);
				res.status(500).send({
					message: err
				});
			} else {
				res.send(documents[0]);
			}
		});
	});

	//all Registered volunteers
	app.post('/register', (req, res) => {
		let register = req.body;
		volunteersDB.insertOne(register).then((result) => {
			res.send(result);
		});
	});

	//find events by email
	app.get('/my-events/:email', (req, res) => {
		volunteersDB.find({
			email: req.params.email
		}).toArray((err, documents) => {
			if (err) {
				console.log(err);
				res.status(500).send({
					message: err
				});
			} else {
				res.send(documents);
			}
		});
	});

	//delete an event by id
	app.delete('/delete/:id', (req, res) => {
		volunteersDB.deleteOne({
			_id: ObjectId(req.params.id)
		}).then((result) => {
			res.send(result.deletedCount > 0);
		});
	});

	//find all registered events
	app.get('/all-events', (req, res) => {
		volunteersDB.find().toArray((err, documents) => {
			if (err) {
				res.status(500).send({
					message: err
				});
			} else {
				res.send(documents);
			}
		});
	});
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, (req, res) => {
	console.log(`Server is running on PORT ${PORT}`);
});