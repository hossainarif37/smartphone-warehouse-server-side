const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

// warehouse
// RS8Bgp9SGIrWoJpC

const uri = `mongodb+srv://${process?.env?.DB_USER}:${process?.env?.DB_PASS}@cluster0.oudjo.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const smartPhoneCollection = client.db('smartphone').collection('phone');
        console.log('DB CONNECTED');
        app.post('/allproducts', async (req, res) => {
            const products = req.body;
            console.log(products);
            const result = await smartPhoneCollection.insertOne(products);
            res.send('inserted done')
        })
        app.get('/allproducts', async (req, res) => {
            const cursor = smartPhoneCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await smartPhoneCollection.findOne(query);
            res.send(result);
        })
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const quantity = req.body.quantity;
            const deliveryQuantity = req.body.delivery;
            const updateInput = req.body.updateInput;
            console.log(updateInput);
            const filter = { _id: ObjectId(id) };
            console.log(quantity);
            const options = { upsert: true };
            let updateDoc;
            if (deliveryQuantity === 'delivered') {
                updateDoc = {
                    $set: {
                        quantity: quantity - 1
                    },
                };
            }
            else {
                updateDoc = {
                    $set: {
                        quantity: quantity + updateInput
                    },
                };
            }
            const result = await smartPhoneCollection.updateOne(filter, updateDoc, options);
            console.log(result.acknowledged);
            res.send(result.acknowledged);
        })
        app.delete('/manage', async (req, res) => {
            const id = req.query.id;
            const query = { _id: ObjectId(id) }
            const result = await smartPhoneCollection.deleteOne(query);
            console.log(result);
            res.send(result.acknowledged);
        })



    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})