first input npm init -y creaty necessary file  
input npm install express mongodb dotenv to add mongodb
as for convenient I have added js file to combine test code  
you can use node test-mongodb.js to test CURD 
or you can follow the next step  
mongosh "mongodb://admin:password@localhost:27017/test?authSource=admin"  
db.users.insertOne({ name: "test", age: 25 })   
db.users.find()  
db.users.findOne({ name: "test" })  
db.users.updateOne({ name: "test" }, { $set: { age: 26 } })  
db.users.deleteOne({ name: "test" })  
