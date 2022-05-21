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

        //get api

        app.get('/partslist', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const collections = await cursor.toArray();
            res.send(collections);
        });
        console.log("database-connected");

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