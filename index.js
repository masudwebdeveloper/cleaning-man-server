const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

// middle wares
app.use(cors());
app.use(express.json());

const services = require('./services.json')

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jfl1bty.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
   try {
      const servicesCollection = client.db('cleanerDBUser').collection('services');
      app.get('/services', async (req, res) => {
         const size = parseInt(req.query.size);
         const query = {};
         const cursor = servicesCollection.find(query);
         const services = await cursor.limit(size).toArray();
         const count = await servicesCollection.estimatedDocumentCount();
         console.log(count);
      res.send({services, count});
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