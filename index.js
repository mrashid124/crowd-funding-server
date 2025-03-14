const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());


// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASSWORD);


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.9ekrxrn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// const uri = mongodb:"//localhost:27017";

// console.log(uri);


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

    // const database = client.db("crowdFundingDB").collection("campaign");

    const campaignCollection = client
      .db("crowdFundingDB")
      .collection("campaignCollection");

      const donateCollection = client
      .db("crowdFundingDB")
      .collection("myDonation");

      // Read data for client side
      app.get('/campaigns', async(req,res)=>{
        const cursor = campaignCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })
      // creating api
    app.post('/campaigns', async(req, res)=>{
      const data = req.body;
      // console.log(data);
      const result = await campaignCollection.insertOne(data);
      res.send(result);
    })
        //  read for single data
        app.get("/details/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await campaignCollection.findOne(query);
          res.send(result);
        });
    // Donation api
    app.post("/myDonate", async (req, res) => {
      try {
        const donate = req.body;
        // console.log(donate);
        const result = await donateCollection.insertOne(donate);
        res.send(result);
      } catch (error) {
      
      }
    });
//  user donation by email
    app.get("/myDonate/:email", async (req, res) => {
      const query = donateCollection.find({ email: req.params.user_email });
      const result = await query.toArray();
      res.send(result);
    });


    app.get("/campaigns/:email", async (req, res) => {
      const email = req.params.email;
      const query = { user_email: email };
      const result = await campaignCollection.find(query).toArray();
      res.send(result);
    });

//  Delete campaign api
    app.delete("/campaigns/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await campaignCollection.deleteOne(query);
      res.send(result);
    });

    // Update campaign api
    app.patch("/updateCampaign/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          image: data.image,
          campaign_title: data.campaign_title,
          campaign_type: data.campaign_type,
          description: data.description,
          minimum_donation: data.minimum_donation,
          deadline: data.deadline,
          user_email: data.user_email,
          user_name: data.user_name,
        },
      };
      const result = await campaignCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=> {
    res.send('Crowd funding server is running')
})

app.listen(port, ()=> {
  console.log(`Crowd funding server is running on port: ${port}`);  
})

