var http = require('http'),
    httpProxy = require('http-proxy');

var users = {};
var bots = {};
var targetUrl = 'http://138.197.2.5';
var captchaAnswer = "4";
var proxy = httpProxy.createProxyServer({});
var captchaHtml = '<!DOCTYPE html><head><meta charset="UTF-8"></head><body><h3>Enter captcha:</h3><form action="" method="post"><label for="captcha">2+2 = </label><input type="text" name="captcha"><input type="submit" value="Submit"></form></body></html>';

proxy.on('error', function(e) {
    console.log(`Proxy error: ${e}`);
});

let server = http.createServer(function(req,res) {
    const ip = req.socket.remoteAddress;

    //proxy.web(req, res, { target: targetUrl });
    //proxy.web(req, res, {target: 'http://138.197.2.5:80' });

    if ( users[ip] ) {
				console.log(`Redirection to Checkbox ${ip} is not a bot`);
        proxy.web(req, res, {target: targetUrl });
    } else if ( bots[ip] ) {
				console.log(`Bot detected: ${ip}`);
    }

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
                console.log("Captcha was correct");
                //res.end();
								users[ip] = 1;
                proxy.web(req, res, {target: targetUrl });
                console.log("After redirect");
                res.end();
            } else {
								bots[ip] = 1;
                res.end(captchaHtml);
            }
        });
        console.log("Post was completed");
    }

    console.log(`Request IP: ${ip}`);

}).listen(8080);

console.log("Starting server on 8080");
