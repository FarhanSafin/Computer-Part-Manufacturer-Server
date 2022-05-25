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




function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send({message: 'UnAuthorized Access'});
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
        if(err){
            return res.status(403).send({message: 'Forbidden Access'})
        }
        req.decoded = decoded;
        next();
    })
}




//api
async function run () {
    try{
        //connection to database and collection
        await client.connect();
        const partsCollection = client.db('computerParts').collection('parts');
        const reviewsCollection = client.db('computerParts').collection('reviews');
        const orderCollection = client.db('computerParts').collection('orders');
        const userCollection = client.db('computerParts').collection('users');

        //get api

        app.get('/partslist', async (req, res) => {
            const query = {};
            const cursor = partsCollection.find(query);
            const collections = await cursor.toArray();
            res.send(collections);
        });


        app.get('/allorders', async (req, res) => {
            const query = {};
            const cursor = orderCollection.find(query);
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


        app.get('/myOrders',verifyJWT, async(req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if(email === decodedEmail){
                const query = {email: email};
                const myItems = await orderCollection.find(query).toArray();
                return res.send(myItems)
            }else{
                return res.status(403).send({message: 'Forbidden Access'})
            }

        })

        app.get('/users', verifyJWT, async(req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })


                //post api

                app.post('/addorder' ,async(req, res) => {
                    const newOrder = req.body;
                    const result = await orderCollection.insertOne(newOrder);
                    res.send(result);
                })

                //delete
                app.delete('/order/:id', async(req, res) => {
                    const id = req.params.id;
                    const query = {_id: ObjectId(id)};
                    const result = await orderCollection.deleteOne(query);
                    res.send(result);
                })


                app.delete('/part/:id', async(req, res) => {
                    const id = req.params.id;
                    const query = {_id: ObjectId(id)};
                    const result = await partsCollection.deleteOne(query);
                    res.send(result);
                })




                app.get('/admin/:email', async(req, res) => {
                    const email = req.params.email;
                    const user = await userCollection.findOne({email: email});
                    const isAdmin = user.role === 'admin';
                    res.send({admin: isAdmin})
                })

                

                app.get('/user/profile/:email', verifyJWT, async (req, res) => {
                    const email = req.params.email;
                    const collection = await userCollection.findOne({email: email});
                    res.send(collection);
                });









                //put api
                app.put('/user/admin/:email', verifyJWT, async(req, res) => {
                    const email = req.params.email;
                    const requester = req.decoded.email;
                    const requesterAccount = await userCollection.findOne({email: requester});
                    if(requesterAccount.role === 'admin'){
                        const filter = {email: email};
                        const updateDoc = {
                            $set: {role: 'admin'},
                        };
                        const result = await userCollection.updateOne(filter, updateDoc);
                        res.send({result})
                    }else{
                        res.status(403).send({message: 'Forbidden'})
                    }

                })


                app.put('/user/:email', async(req, res) => {
                    const email = req.params.email;
                    const user = req.body;
                    const filter = {email: email};
                    const options = {upsert: true};
                    const updateDoc = {
                        $set: user,
                    };
                    const result = await userCollection.updateOne(filter, updateDoc, options);
                    const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
                    res.send({result, token})
                })


                app.put('/adduserinfo/:email', async(req, res) => {
                    const email = req.params.email;
                    const userInfo = req.body;
                    const filter = {email: email};
                    const options = {upsert: true};
                    const updateDoc = {
                        $set: userInfo,
                    };
                    const result = await userCollection.updateOne(filter, updateDoc, options);
                    res.send(result)
                })



                app.post('/addreview' ,async(req, res) => {
                    const review = req.body;
                    const result = await reviewsCollection.insertOne(review);
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