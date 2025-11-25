const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middleware
app.use(cors());
app.use(express.json());

//Mongo URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@pawmart.dijiqjd.mongodb.net/?appName=PawMart`;

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

    const listingCollection = client.db('PawMart').collection('listingCollection');
    const orderCollection = client.db('PawMart').collection('orderCollection');

    app.get('/listings', async (req, res) => {
      const cursor = listingCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/listings', async (req, res) => {
      const listing = req.body;

      if (!listing.email) {
        return res.status(400).json({ error: "Email are required" });
      }

      const existing = await listingCollection.findOne({
        email: listing.email,
        name: listing.name
      });

      console.log(existing)

      if (existing) {
        return res.status(409).json({ error: "You have already added this listing" });
      }

      const result = await listingCollection.insertOne(listing);

      res.status(201).json({
        message: "Listing added successfully",
        listingId: result.insertedId
      });

    });


    app.get("/listings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };

        const listing = await listingCollection.findOne(query);
        console.log(listing);

        if (!listing) {
          return res.status(404).json({ error: "Listing not found" });
        }

        res.send(listing);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
      }
    });


    app.post("/orders", async (req, res) => {
      try {
        const order = req.body;

        if (!order.buyerEmail || !order.listingId) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const existsQuery = {
          buyerEmail: order.buyerEmail,
          listingId: order.listingId,
        };

        const existingOrder = await orderCollection.findOne(existsQuery);

        if (existingOrder) {
          return res.status(400).json({
            error: "You already placed an order for this listing",
          });
        }

        // Insert new order
        const result = await orderCollection.insertOne(order);

        return res.status(200).json({
          success: true,
          message: "Order placed successfully",
          orderId: result.insertedId,
        });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
      }
    });


    app.get("/my-listings/:email", async (req, res) => {
      try {
        const email = req.params.email;
        const result = await listingCollection.find({ email }).toArray();
        res.send(result);

      } catch (error) {
        res.status(500).json({ error: "Server error" });
      }
    });


    app.delete("/listings/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const result = await listingCollection.deleteOne({
          _id: new ObjectId(id),
        });

        res.send(result);

      } catch (error) {
        res.status(500).json({ error: "Server error" });
      }
    });

  












    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send('user server is available');
})

app.listen(port, () => {
  console.log(`user server started on Port: ${port}`);
})