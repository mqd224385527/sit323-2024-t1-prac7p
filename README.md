first input npm init -y creaty necessary file    
input npm install express mongodb dotenv to add mongodb  
port-forward pod/mongo-686cd6cf7d-nvcx6 27017:27017 to open mobgodb in local and connect to mongodb compass   
as for convenient I have added js file to combine test code    
you can use node test-mongodb.js to test CURD   
or you can follow the next step    
mongosh "mongodb://admin:password@localhost:27017/test?authSource=admin"    
db.users.insertOne({ name: "test", age: 25 })    
db.users.find()  
db.users.findOne({ name: "test" })  
db.users.updateOne({ name: "test" }, { $set: { age: 26 } })  
db.users.deleteOne({ name: "test" })  
