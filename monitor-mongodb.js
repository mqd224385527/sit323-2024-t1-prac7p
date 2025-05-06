const { MongoClient } = require('mongodb');
const fs = require('fs');

const mongoUri = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/admin?authSource=admin';
const outputDir = './monitoring-logs';
const interval = 60000; // 1分钟检查一次

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function checkMongoDBStatus() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    
    const timestamp = new Date().toISOString();
    const logFile = `${outputDir}/mongodb-status-${new Date().toISOString().split('T')[0]}.log`;
    
    const adminDb = client.db('admin');
    
    const serverStatus = await adminDb.command({ serverStatus: 1 });
    const dbStats = await client.db('sit323db').stats();
    
    const memoryUsage = serverStatus.mem;
    const connections = serverStatus.connections;
    const networkStats = serverStatus.network;
    const opCounters = serverStatus.opcounters;
    
    const logEntry = {
      timestamp,
      memoryUsage: {
        resident: Math.round(memoryUsage.resident / 1024) + ' MB',
        virtual: Math.round(memoryUsage.virtual / 1024) + ' MB'
      },
      connections: {
        current: connections.current,
        available: connections.available
      },
      network: {
        bytesIn: networkStats.bytesIn,
        bytesOut: networkStats.bytesOut
      },
      operations: {
        insert: opCounters.insert,
        query: opCounters.query,
        update: opCounters.update,
        delete: opCounters.delete
      },
      dbStats: {
        collections: dbStats.collections,
        objects: dbStats.objects,
        dataSize: Math.round(dbStats.dataSize / 1024 / 1024 * 100) / 100 + ' MB',
        storageSize: Math.round(dbStats.storageSize / 1024 / 1024 * 100) / 100 + ' MB'
      }
    };
    
    fs.appendFileSync(logFile, JSON.stringify(logEntry, null, 2) + ',\n');
    
    console.log(`MongoDB Status - ${timestamp}`);
    console.log(`Memory Usage: ${logEntry.memoryUsage.resident} resident, ${logEntry.memoryUsage.virtual} virtual`);
    console.log(`Connections: ${logEntry.connections.current} current, ${logEntry.connections.available} available`);
    console.log(`Network: ${logEntry.network.bytesIn} bytes in, ${logEntry.network.bytesOut} bytes out`);
    console.log(`Database Stats: ${logEntry.dbStats.objects} objects, ${logEntry.dbStats.dataSize} data size`);
    console.log('------------------------');
    
  } catch (err) {
    console.error(`Error monitoring MongoDB: ${err.message}`);
    fs.appendFileSync(`${outputDir}/mongodb-errors.log`, 
      `${new Date().toISOString()} - Error: ${err.message}\n`);
  } finally {
    await client.close();
  }
}

function startMonitoring() {
  console.log(`Starting MongoDB monitoring - logs will be saved to ${outputDir}`);
  
  checkMongoDBStatus();
  
  setInterval(checkMongoDBStatus, interval);
}

startMonitoring(); 