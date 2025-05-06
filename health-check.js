const http = require('http');
const fs = require('fs');
const { MongoClient } = require('mongodb');

const appUrl = process.env.APP_URL || 'http://localhost:3000';
const mongoUri = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/sit323db?authSource=admin';
const outputDir = './health-logs';
const checkInterval = 60000; 

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const logFile = `${outputDir}/health-checks.log`;
const alertFile = `${outputDir}/health-alerts.log`;

function logMessage(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  fs.appendFileSync(logFile, `[${timestamp}] ${message}\n`);
}

function logAlert(message) {
  const timestamp = new Date().toISOString();
  const alertMessage = `[ALERT - ${timestamp}] ${message}`;
  console.error(alertMessage);
  fs.appendFileSync(alertFile, `${alertMessage}\n`);
}

async function checkAppHealth() {
  return new Promise((resolve) => {
    http.get(appUrl, (res) => {
      const { statusCode } = res;
      
      if (statusCode !== 200) {
        logAlert(`App returned status code: ${statusCode}`);
        resolve(false);
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.status === 'ok') {
            resolve(true);
          } else {
            logAlert(`App health check failed: ${data}`);
            resolve(false);
          }
        } catch (e) {
          logAlert(`Error parsing app response: ${e.message}`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      logAlert(`App connection error: ${err.message}`);
      resolve(false);
    });
  });
}

async function checkDatabaseHealth() {
  const client = new MongoClient(mongoUri);
  
  try {
    await client.connect();
    
    const db = client.db('sit323db');
    const result = await db.command({ ping: 1 });
    
    if (result.ok === 1) {
      return true;
    } else {
      logAlert('Database ping command failed');
      return false;
    }
  } catch (err) {
    logAlert(`Database connection error: ${err.message}`);
    return false;
  } finally {
    await client.close();
  }
}

async function performHealthCheck() {
  const timestamp = new Date().toISOString();
  logMessage('Starting health check');
  
  const appHealth = await checkAppHealth();
  const dbHealth = await checkDatabaseHealth();
  
  if (appHealth && dbHealth) {
    logMessage('Health check passed: Application and database are healthy');
  } else {
    logAlert(`Health check failed - App: ${appHealth ? 'OK' : 'ERROR'}, Database: ${dbHealth ? 'OK' : 'ERROR'}`);
  }
  
  logMessage('Health check completed');
  logMessage('--------------------------');
}

function startHealthChecks() {
  logMessage('Starting health check monitoring');
  
  performHealthCheck();
  
  setInterval(performHealthCheck, checkInterval);
}

startHealthChecks(); 