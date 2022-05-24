//required and initiating packages
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//mongodb connection parameters
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.trvop.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//api
async function run () {
    try{
        //connection to database and collection
        await client.connect();
        const partsCollection = client.db('computerParts').collection('parts');
        const reviewsCollection = client.db('computerParts').collection('reviews');
        const orderCollection = client.db('computerParts').collection('orders');

        //get api

        app.get('/partslist', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const collections = await cursor.toArray();
            res.send(collections);
        });

        app.get('/reviewslist', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const collections = await cursor.toArray();
            res.send(collections);
        });


        app.get('/part/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const collection = await partsCollection.findOne(query);
            res.send(collection);
        });


                //post api

                app.post('/addorder' ,async(req, res) => {
                    const newOrder = req.body;
                    const result = await orderCollection.insertOne(newOrder);
                    res.send(result);
                })

    }

    finally{

    }
}

run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server Running');
});

//listening to the server port
app.listen(port, () => {
    console.log("Listen", port);
})