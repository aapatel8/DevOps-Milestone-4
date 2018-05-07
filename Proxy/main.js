var http = require('http'),
  httpProxy = require('http-proxy');
var url = require("url");
var proxy = httpProxy.createProxyServer({});

var ip;
var isBot = 0;
var expirationTimer = 0;
var maxRequestCount = 2;
var ipCount = {};

function determineIfBot() {
  if (!ipCount[ip]) {
    ipCount[ip] = 1;
    console.log(ipCount[ip]);
  } else {
    ipCount[ip] += 1;
  }

  console.log("IP address: " + ip + "\tRequest ipCount: " + ipCount[ip]);
  if (ipCount[ip] > maxRequestCount) {
    isBot = 1;
  }
}

var server = http.createServer(function(req, res) {

  setInterval(function() {
    expirationTimer++;
    //Reset ipCount every 15 seconds
    if (expirationTimer == 15)
      expirationTimer = 0;
  }, 1000);

  if (expirationTimer == 0) {
    ipCount = {};
  }

  ip = req.connection.remoteAddress;

  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7)
  }

  determineIfBot();

  if (isBot == 0) {
    console.log("Redirected to the main Checkbox.io droplet")
    targetUrl = 'http://138.197.73.154';
  } else {
    console.log("Redirected to the Police monkey droplet")
    targetUrl = 'http://159.65.174.84:8080';
  }

  proxy.web(req, res, {
    target: targetUrl
  });
  isBot = 0;
});

console.log("Proxy server listening on port 8080");

server.listen(8080);
