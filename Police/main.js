var http = require('http'),
    httpProxy = require('http-proxy');

var users = {};
var bots = {};
var targetUrl = 'http://138.197.2.5';
var captchaAnswer = "4";
//var proxy = httpProxy.createProxyServer({ target : `${targetServerIp}` });
var proxy = httpProxy.createProxyServer({});
var captchaHtml = '<h3>Enter captcha:</h3><form action="" method="post"><label for="captcha">2+2 = </label><input type="text" name="captcha"><input type="submit" value="Submit"></form>';

let server = http.createServer(function(req,res) {
    const ip = req.socket.remoteAddress;

    proxy.web(req, res, { target: targetUrl });
    //proxy.web(req, res, {target: 'http://138.197.2.5:80' });

    if ( req.method == 'GET' ) {
        res.end(captchaHtml);
    }
    
    if ( req.method == 'POST' ) {
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
                res.end();
                proxy.web(req, res, {target: 'http://127.0.0.1:8080' });
                console.log("After redirect");
                //res.end();
            } else {
                res.end(captchaHtml);
            }
        });
        console.log("Post was completed");
    }

    console.log(`Request IP: ${ip}`);

}).listen(8080);

console.log("Starting server on 8080");
