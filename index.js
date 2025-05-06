require('dotenv').config();
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const port = 3000;
app.use(express.json());

const mongoUri = process.env.MONGO_URI || 'mongodb://admin:admin123@mongo:27017/sit323db';
const client = new MongoClient(mongoUri);
let collection;

async function connectDB() {
  try {
    await client.connect();
    console.log('Successfully connected to MongoDB');
    const db = client.db("sit323db");
    collection = db.collection("items");
    
    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany([
        { name: 'Item 1', description: 'Description for Item 1' },
        { name: 'Item 2', description: 'Description for Item 2' }
      ]);
      console.log('Sample data inserted');
    }
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
}

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Node.js microservice running with MongoDB integration' });
});

app.get('/items', async (req, res) => {
  try {
    const items = await collection.find().toArray();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/items/:id', async (req, res) => {
  try {
    const item = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/items', async (req, res) => {
  try {
    const result = await collection.insertOne(req.body);
    res.status(201).json({ 
      message: 'Item created successfully',
      id: result.insertedId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/items/:id', async (req, res) => {
  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ 
      message: 'Item updated successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

connectDB().then(() => {
  app.listen(port, () => console.log(`App running on port ${port}`));
});
