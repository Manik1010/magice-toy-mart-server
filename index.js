const express = require('express')
const app = express()
const port = process.env.PORT || 5000
const cors = require('cors');
require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');



// middleware.....
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wfpjg4p.mongodb.net/?retryWrites=true&w=majority`;

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
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();

        const toyDatabase = client.db("toysMart").collection("toys")
        //Search
        // const indexKeys = { name: 1, sub_category: 1};
        // const indexOptions = { demo: "checkName"}

        // const result = await toyDatabase.createIndex(indexKeys, indexOptions);

        // app.get("toySearchByName/:text", async(req, res) =>{
        //     const searchText = req.params.text;
        //     const result = await toyDatabase.find(
        //         {name: {$regex: searchText, $options: "i"}}
        //         // $or: [
        //         //     {name: {$regex: searchText, $options: "i"}},
        //         //     {sub_category: {$regex: searchText, $options: "i" }},
        //         // ]
        //     ).toArray()
        //     res.send(result);
        // })
        app.get('/toySearchByName', async(res, req) =>{
            let query = {};
            console.log(req.query?.name);
            if(req.query?.name){
                console.log(req.query?.name);
                query ={name: {$regex: req.query.name, $options: "i" }}
            }
            const result = await toyDatabase.find(query).toArray();
            res.send(result);
        })

        app.get('/allToy', async (req, res) => {
            const cursor = toyDatabase.find().limit(20)
            const result = await cursor.toArray();
            res.send(result);
        })
        // app.get("/toy/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await toyCollection.findOne(query);
        //     res.send(result);
        //   })
        app.get('/allToy/:id', async (req, res) => {
            const id = req.params.id;
            const quary = {_id: new ObjectId(id)}
            // console.log(id);
            const selectedToy = await toyDatabase.findOne(quary);
            res.send(selectedToy);
        })
        // app.get("/myToy/:id", async (req, res) => {
        //     // console.log(req.params.email); 
        //     const result = await toyDatabase.find({ supplierEmail: req.params.id }).toArray();
        //     res.send(result);
        // })
        app.get("/myToy/:email", async (req, res) => {
            // console.log(req.params.email); 
            const result = await toyDatabase.find({ supplierEmail: req.params.email }).toArray();
            res.send(result);
        })
        app.get("/category/:sub_category", async (req, res) => {
            // console.log(req.params.sub_category); 
            const result = await toyDatabase.find({ sub_category: req.params.sub_category }).toArray();
            res.send(result);
        })
  
        app.get("/singalToy/:id", async (req, res) => {
            // const id = req.params.id;
            // const query = { _id: new ObjectId(id) }
            // const query = { _id: new ObjectId(id) }

            // const options = {
            //   projection: { category: 1, price: 1, details: 1, name: 1, qunatity: 1, url: 1, rating: 1, sub_category: 1, supplier: 1, supplierEmail: 1 }
            // }
      
            const result = await toyDatabase.findOne({_id: req.params.id}).toArray();
            res.send(result);
          })

        app.post("/postToy", async (req, res) => {
            const toyInfo = req.body;
            console.log("Toy info:", toyInfo);
            const result = await toyDatabase.insertOne(toyInfo);
            res.send(result);
        })

        app.put('/updateToy/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            console.log(id, data);

            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedToy = {
                $set: {
                    name: data.name,
                    price: data.price
                }
            }

            const result = await toyDatabase.updateOne(filter, updatedToy, options);
            res.send(result);

        })

        app.delete('/deleteToy/:id', async (req, res) => {
            const id = req.params.id;// /users/:id e khane je ta thakbe seta dite hobe...
            console.log("Plz delete from database: ", id);

            const query = { _id: new ObjectId(id) }
            const result = await toyDatabase.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello form Toys Mart')
})

app.listen(port, () => {
    console.log(`The website API is runing For toysMart Service: ${port}`)
})