var http = require('http'),
    httpProxy = require('http-proxy'),
    redis = require('redis');

var users = {};
var bots = {};

var client = redis.createClient(6379, '127.0.0.1', {});
var targetUrl = 'http://138.197.2.5';
var captchaAnswer = "4";
var maxFailures = 3;
var blockTime = 10;     // seconds
var proxy = httpProxy.createProxyServer({});
var captchaHtml = '<!DOCTYPE html><head><meta charset="UTF-8"></head><body><h3>Enter captcha:</h3><form action="" method="post"><label for="captcha">2+2 = </label><input type="text" name="captcha"><input type="submit" value="Submit"></form></body></html>';

let server = http.createServer(function(req,res) {
    var ip = req.socket.remoteAddress;

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
    }
    
    client.get(ip, function (err, reply) {
        if (err) { 
            console.log(`Redis error: ${err}`) ;
        } else {
            if ( reply == null ) {
                console.log('Reply is null');
                client.set(ip, -1);
                reply = -1;
            } else {
                reply = parseInt(reply);
            }
            console.log(`Redis reply: ${reply}`);
           
            if ( reply == 0 ) {
                console.log(`Redirection to Checkbox, ${ip} is not a bot`);
                proxy.web(req, res, {target: targetUrl });
            } else if ( reply >= maxFailures ) {
                console.log(`Bot detected: ${ip}`);
                res.end(captchaHtml);
            } else {
                if ( req.method == 'GET' ) {
                    res.end(captchaHtml);
                } else if ( req.method == 'POST' ) {
                    var postData = '';
                    req.on('data', function(data) {
                        postData += data;
                    });

                    req.on('end', function() {
                        var key = "captcha=";
                        var value = postData.slice(key.length, postData.length);
                        //console.log(`PostData: ${value}`);

                        if ( value === captchaAnswer ) {
                            client.set(ip, 0);

                            res.writeHead(302, {'Location': targetUrl + req.url});
                            res.end();
                        } else {
                            if ( reply < 1 ) { 
                                client.set(ip, 1);
                            } else if ( (reply + 1) == maxFailures ) {
                                console.log('Setting key/value to expire');
                                client.set(ip, maxFailures, 'EX', blockTime);
                            } else {
                                client.set(ip, reply + 1);
                            }
                            res.end(captchaHtml);
                        }
                    });
                }
            }
        }
    });
    console.log(`Request IP: ${ip}`);

}).listen(8080);

console.log("Starting server on 8080");
