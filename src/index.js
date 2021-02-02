const app = require('./app');
const port = process.env.PORT || 3000;

const localHttps = process.env.LOCAL_HTTPS || 0;
if (localHttps == 1) {
  const https = require('https');
  const fs = require('fs');
  const key = fs.readFileSync('./config/key.pem');
  const cert = fs.readFileSync('./config/cert.pem');
  const server = https.createServer({ key: key, cert: cert }, app);
  server.listen(port, () => {
    console.log('Server is up on port ' + port);
  });
} else {
  app.listen(port, () => {
    console.log('Server is up on port ' + port);
  });
}
