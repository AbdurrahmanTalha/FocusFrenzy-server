const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require("express")
const cors = require("cors");
require("dotenv").config()

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pt2xjyk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    await client.connect()
    try {
        const serviceCollection = client.db("FocusFrenzy").collection("services")
        const ordersCollection = client.db("FocusFrenzy").collection("orders")
        const usersCollection = client.db("FocusFrenzy").collection("users")

        app.get("/services", async (req, res) => {
            const service = await serviceCollection.find({}).toArray();
            res.send(service);
        })

        app.post('/register/:email', async (req, res) => {
            console.log(req.params)
            const user = { email: req.params.email, role: "user" }
            const result = await usersCollection.insertOne(user);
            console.log(result)
            res.send(result);
        })

        app.get("/isAdmin/:email", async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            if (user == null) {
                res.send("Not Found")
            }
            else if (user.role == "admin") {
                res.send({ isAdmin: true })
            } else if (user.role == "user") {
                res.send({ isAdmin: false })
            }
        })

        app.put('/makeAdmin/:email', async (req, res) => {
            const id = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: "admin"
                }
            };
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.post("/service", async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result)
        })

        app.post("/order/:email", async (req, res) => {
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            res.send(result);
        })

        app.get("/orders/:email", async (req, res) => {
            const orders = await ordersCollection.find({ email: req.params.email }).toArray();
            res.send(orders);
        })

        app.get("/allOrders", async (req, res) => {
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders)
        })

        app.put("/order/:orderId", async (req, res) => {
            const id = req.params.orderId;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    status: "Complete"
                }
            };
            const result = await ordersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.get("/service/:id", async (req, res) => {
            const id = req.params.id;
            const service = await serviceCollection.findOne({ _id: ObjectId(id) });
            res.send(service);
        })

    } finally {

    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send("Running FocusFrenzy Server")
})

app.listen(port, () => {
    console.log(`Listening to ${port}`)
})
