const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jfl1bty.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
   try {
      const servicesCollection = client.db('cleanerDBUser').collection('services');
      const reviewsCollection = client.db('cleanerDBUser').collection('reviews');
      app.get('/services', async (req, res) => {
         const size = parseInt(req.query.size);
         const query = {};
         const cursor = servicesCollection.find(query);
         const services = await cursor.limit(size).toArray();
         const count = await servicesCollection.estimatedDocumentCount();
         console.log(count);
         res.send({ services, count });
      })

      app.get('/services/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) }
         const service = await servicesCollection.findOne(query);
         res.send(service);
         console.log(query);
      })

      app.post('/reviews', async (req, res) => {
         const review = req.body;
         const result = await reviewsCollection.insertOne(review);
         res.send(result);
         console.log(result);
      })

      app.get('/reviews', async (req, res) => {
         let query = {};
         if (req.query.email) {
            query = {
               email: req.query.email
            } 
         }
         const cursor = reviewsCollection.find(query);
         const review = await cursor.toArray();
         res.send(review);
      })

      app.delete('/reviews/:id', async (req, res) => {
         const id = req.params.id;

         const query = { _id: ObjectId(id) };
         const result = await reviewsCollection.deleteOne(query);
         console.log(result);
         res.send(result);
      })
   }
   finally {

   }
}

run().catch(err => console.error(err))

app.get('/', (req, res) => {
   res.send('cleaning man server is running');
})

app.get('/services', (req, res) => {
   res.send(services);
})

app.listen(port, () => {
   console.log(`cleaning man server on ${port}`);
})