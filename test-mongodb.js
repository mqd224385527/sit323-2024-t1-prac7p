const { MongoClient, ObjectId } = require('mongodb');

const mongoUri = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/sit323db?authSource=admin';

async function testMongoDB() {
  const client = new MongoClient(mongoUri);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Successfully connected to MongoDB');
    
    const db = client.db('sit323db');
    const collection = db.collection('items');
    
    console.log('\nTest 1: Insert document');
    const insertResult = await collection.insertOne({
      name: 'Test Item',
      description: 'This is a test item',
      createdAt: new Date()
    });
    console.log('Insert result:', insertResult);
    const newItemId = insertResult.insertedId;
    
    console.log('\nTest 2: Query document');
    const findResult = await collection.findOne({ _id: newItemId });
    console.log('Query result:', findResult);
    
    console.log('\nTest 3: Update document');
    const updateResult = await collection.updateOne(
      { _id: newItemId },
      { $set: { description: 'This is an updated test item' } }
    );
    console.log('Update result:', updateResult);
    
    console.log('\nTest 4: Query all documents');
    const allItems = await collection.find().toArray();
    console.log(`Found ${allItems.length} documents:`);
    allItems.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}: ${item.description}`);
    });
    
    console.log('\nTest 5: Delete document');
    const deleteResult = await collection.deleteOne({ _id: newItemId });
    console.log('Delete result:', deleteResult);
    
    console.log('\nAll tests completed, MongoDB connection and CRUD operations are working properly!');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

testMongoDB().catch(console.error); 