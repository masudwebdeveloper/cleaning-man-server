const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jfl1bty.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
   const authHeader = req.headers.authorization;
   if (!authHeader) {
      return res.status(401).send({ message: 'unauthorization access' })
   }
   const token = authHeader.split(' ')[1];
   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
      if (err) {
         return res.status(401).send({ message: 'unauthorization access' })
      }
      req.decoded = decoded
      next()
   })
}

async function run() {
   try {
      const servicesCollection = client.db('cleanerDBUser').collection('services');
      const reviewsCollection = client.db('cleanerDBUser').collection('reviews');

      app.post('/jwt', async (req, res) => {
         const user = req.body;
         const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
         res.send({ token })
      })

      app.get('/services', async (req, res) => {
         const size = parseInt(req.query.size);
         const query = {};
         const cursor = servicesCollection.find(query);
         const services = await cursor.limit(size).toArray();
         const count = await servicesCollection.estimatedDocumentCount();
         res.send({ services, count });
      })

      app.get('/services/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) }
         const service = await servicesCollection.findOne(query);
         res.send(service);
      })

      app.post('/reviews', async (req, res) => {
         const review = req.body;
         const result = await reviewsCollection.insertOne(review);
         res.send(result);
      })

      // this is all review collection api
      app.get('/allreviews', async (req, res) => {
         const query = {};
         const cursor = reviewsCollection.find(query);
         const reviews = await cursor.toArray();
         res.send(reviews)
      })

      app.get('/reviews', verifyJWT, async (req, res) => {
         const decoded = req.decoded;
         if (decoded.email !== req.query.email) {
            return res.status(403).send({ message: 'forbidden access' })
         }
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