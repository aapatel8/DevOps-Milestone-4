var http = require('http'),
    httpProxy = require('http-proxy'),
    redis = require('redis'),
    svgCaptcha = require('svg-captcha');

var client = redis.createClient(6379, '127.0.0.1', {});
var proxy = httpProxy.createProxyServer({});

var targetUrl = 'http://138.197.2.5';

var maxFailures = 3;
var blockTime = 10;     // seconds
var captchaExpTime = 5; // seconds

var htmlHeader = '<!DOCTYPE html><head><meta charset="UTF-8"></head><body>';
var htmlFooter = '</body></html>';

/* Sets up the captcha html page */
function getCaptchaHtml(ip) {
    var captchaKey = `${ip}_captcha`;
    var captcha = svgCaptcha.create();
    var htmlBody = '<h3>Enter captcha:</h3><form action="" method="post"><label for="captcha">' + captcha.data + '</label><br><input type="text" name="captcha"><input type="submit" value="Submit"></form>';
    
    //console.log(`Setting captcha key ${captchaKey} text to: ${captcha.text}`);
    client.set(captchaKey, captcha.text, 'EX', captchaExpTime);

    return htmlHeader + htmlBody + htmlFooter;
}

let server = http.createServer(function(req,res) {
    var ip = req.socket.remoteAddress;

    // Clean ip
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
    } else if (ip === "::1") {
        ip = "localhost";
    }
    //console.log(`ip: ${ip}`);

    // Check cache for key and perform police logic
    client.get(ip, function (err, ipCnt) {
        if (err) { 
            console.log(`Redis error: ${err}`) ;
        } else {

            if ( ipCnt == null ) {
                // clients first interaction with server
                client.set(ip, -1);
                ipCnt = -1;
            } else {
                // get previous client count
                ipCnt = parseInt(ipCnt);
            }
            
            //console.log(`Redis ipCnt: ${ipCnt}`);
           
            if ( ipCnt == 0 ) {
                // Ip has been verified to not be bot
                
                console.log(`Redirection to Checkbox, ${ip} is not a bot`);
                proxy.web(req, res, {target: targetUrl });

            } else if ( ipCnt >= maxFailures ) {
                // Ip has been identified as a bot
                
                console.log(`Bot detected: ${ip}`);
                res.end(getCaptchaHtml(ip));

            } else {
                if ( req.method == 'GET' ) {
                    // Send first captcha request form
                    res.end(getCaptchaHtml(ip));
                } else if ( req.method == 'POST' ) {
                    var postData = '';
                    req.on('data', function(data) {
                        // Getting user captcha form submission
                        postData += data;
                    });

                    req.on('end', function() {
                        var postCaptchaKey = "captcha=";
                        var userCaptchaValue = postData.slice(postCaptchaKey.length, postData.length);
                        
                        var captchaKey = `${ip}_captcha`;
                        client.get(captchaKey, function (err, captchaValue) {

                            //console.log(`captchaKey value: ${captchaValue}`);

                            if ( userCaptchaValue === captchaValue ) {
                                // Captcha was correct
                                //console.log('value was correct');
                                client.set(ip, 0);
                                res.writeHead(302, {'Location': targetUrl + req.url});
                                res.end();
                            } else {
                                // Captcha was incorrect
                                //console.log('value was incorrect');
                                if ( ipCnt < 1 ) { 
                                    client.set(ip, 1);
                                } else if ( (ipCnt + 1) == maxFailures ) {
                                    console.log(`ipCnt max failure hit for ip: ${ip}`);
                                    client.set(ip, maxFailures, 'EX', blockTime);
                                } else {
                                    client.set(ip, ipCnt + 1);
                                }
                                res.end(getCaptchaHtml(ip));
                            }
                        });
                    });
                }
            }
        }
    });
}).listen(8080);

console.log("Starting server on 8080");
