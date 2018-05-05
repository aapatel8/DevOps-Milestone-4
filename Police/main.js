var http = require('http'),
    httpProxy = require('http-proxy');

var users = {};
var bots = {};
var targetUrl = 'http://138.197.2.5';
var captchaAnswer = "4";
var maxFailures = 3;
var proxy = httpProxy.createProxyServer({});
var captchaHtml = '<!DOCTYPE html><head><meta charset="UTF-8"></head><body><h3>Enter captcha:</h3><form action="" method="post"><label for="captcha">2+2 = </label><input type="text" name="captcha"><input type="submit" value="Submit"></form></body></html>';

let server = http.createServer(function(req,res) {
    var ip = req.socket.remoteAddress;

    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7)
    }

    if ( users[ip] ) {
    console.log(`Redirection to Checkbox, ${ip} is not a bot`);
        proxy.web(req, res, {target: targetUrl });
    } else if ( bots[ip] >= maxFailures ) {
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
            console.log(`PostData: ${value}`);

            if ( value === captchaAnswer ) {
            users[ip] = 1;
            bots[ip] = 0;

            res.writeHead(302, {'Location': targetUrl + req.url});
            res.end();
            } else {
            if ( bots[ip] ) { bots[ip] += 1; }
            else { bots[ip] = 1; }
            users[ip] = 0;
            res.end(captchaHtml);
            }
        });
        }
    }
    console.log(`Request IP: ${ip}`);

}).listen(8080);

console.log("Starting server on 8080");