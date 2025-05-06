db = db.getSiblingDB('sit323db');

db.createCollection('items');

db.items.insertMany([
  { name: 'Item 1', description: 'Description for Item 1' },
  { name: 'Item 2', description: 'Description for Item 2' }
]);

db.createUser({
  user: 'appuser',
  pwd: 'apppassword',
  roles: [
    { role: 'readWrite', db: 'sit323db' }
  ]
}); 