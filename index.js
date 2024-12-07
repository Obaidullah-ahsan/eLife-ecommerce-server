const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zkk0rbw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client
      .db("eLife_ecommerce")
      .collection("products");
    const userCollection = client.db("eLife_ecommerce").collection("users");
    const cartCollection = client.db("eLife_ecommerce").collection("cart");

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ Message: "User already exist", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.get("/products", async (req, res) => {
      const search = req.query.search;
      const brand = req.query.brand;
      const category = req.query.category;

      let query = {};

      if (search) {
        query.product_name = { $regex: search, $options: "i" };
      }
      if (brand) {
        query.brand = brand;
      }
      if (category) {
        query.product_category = category;
      }

      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/products/:category", async (req, res) => {
      const category = req.params.category;
      const query = { product_category: category };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/cart", async (req, res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    });

    app.post("/cart", async (req, res) => {
      const cartData = req.body;
      const query = { productId: cartData.productId };
      const isExist = await cartCollection.findOne(query);
      if (isExist) {
        return res.send({ Message: "Product already exist", insertedId: null });
      }
      const result = await cartCollection.insertOne(cartData);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("eLife ecommerce server is running");
});

app.listen(port, () => {
  console.log(`eLife ecommerce server is running on port ${port}`);
});
