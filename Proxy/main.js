var http = require('http'),
    httpProxy = require('http-proxy');
var url = require( "url"); 
var proxy = httpProxy.createProxyServer({});
var redis = require('redis')

var ip;
var flag = 0;
var timer = 0;
var maxRequestCount = 2;
var blacklisted = {};
var count = {};

var server = http.createServer(function(req, res) {

 setInterval(function(){
 timer++;
 if(timer == 10)
   timer = 0;
}, 1*1000);

if( timer == 0)
{
 count = {};
}

ip = req.connection.remoteAddress;

if (ip.substr(0, 7) == "::ffff:") {
  ip = ip.substr(7)
}

calculate();

if (flag == 0) {
     console.log("Redirected to the main Checkbox.io server")
     targetUrl = 'http://138.197.2.5';
  }
  else {
     console.log("Redirected to our police server")
     targetUrl = 'http://104.236.242.30:8080';
  }
  
proxy.web(req, res, { target: targetUrl });
  flag = 0;
});

console.log("Proxy server listening on port 8080");

server.listen(8080);

function calculate()
{
 if(!count[ip] )
 {
    count[ip] = 1;
    console.log(count[ip]);
 }
  else{
      count[ip] += 1;
 }

 console.log("IP address: " + ip+ "\tRequest count: " + count[ip]);
  if(count[ip] > maxRequestCount || blacklisted[ip] == 1 )
  {
        blacklisted[ip] = 1;
        flag = 1;
  }
}
