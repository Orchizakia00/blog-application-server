const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sdbndcb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        const blogCollection = client.db('blogDB').collection('blogs');
        const userCollection = client.db('blogDB').collection('users');

        // jwt api
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
        })

        // users api
        app.post('/users', async (req, res) => {
            const data = req.body;
            const result = await userCollection.insertOne(data);
            res.send(result);
        })

        // blogs api
        app.get('/blogs', async (req, res) => {
            const result = await blogCollection.find().toArray();
            res.send(result);
        })

        app.post('/blogs', async (req, res) => {
            const data = req.body;
            const result = await blogCollection.insertOne(data);
            res.send(result);
        })

        app.get('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await blogCollection.findOne(query);
            res.send(result);
        })

        app.patch('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateBlog = req.body;
            const updatedDoc = {
                $set: {
                    title: updateBlog.title,
                    month: updateBlog.month,
                    content: updateBlog.content,
                    name: updateBlog.name,
                }
            }
            const result = await blogCollection.updateOne(filter, updatedDoc);
            res.send(result);
        })

        app.delete('/blogs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await blogCollection.deleteOne(query);
            res.send(result);
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server is running');
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})