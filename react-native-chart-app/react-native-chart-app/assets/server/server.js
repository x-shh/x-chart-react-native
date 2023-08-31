var express  = require('express');
var app      = express();

var morgan = require('morgan');

var httpProxy = require('http-proxy');
var methodOverride = require('method-override');
var session = require('express-session');

var xinAuth = require('./xinAuth');

app.use(express.static('./dist'));
app.use(morgan('dev'));

app.use(methodOverride());

app.use(session({secret: 'keyboardcat', cookie: {maxAge: 60000000}, saveUninitialized: true, resave: true}));

var serverOne = 'https://dev.xinfinit.com';
var username = 'nae';
var password = 'xinfinitdev@123456789';

var _dirName = './dist/html/';

/*var serverOne = 'https://dev.xinfinit.com';
var username = 'itdev';
 var password = 'Xinfinit@itradedeveloper';*/

/*var serverOne = 'https://dev.xinfinit.com';
var username = 'itdev';
 var password = 'Xinfinit@itradedeveloper';*/

//add token
app.use(['/frontend/*', '/rest/*'], function (req, res, next) {
    xinAuth.getBearerToken(serverOne, username, password).then(function(bearerToken){
        req._token = "Bearer " + bearerToken;
        next();
    }).catch(function(error){
        console.error(error);
        next();
    });
});

//express.static.mime.define({'application/x-font-woff': ['woff']});
//express.static.mime.define({'application/x-font-ttf': ['ttf']});
//express.static.mime.define({'application/vnd.ms-fontobject': ['eot']});
//express.static.mime.define({'font/opentype': ['otf']});

var apiProxy = httpProxy.createProxyServer({
    changeOrigin : true,
    target: serverOne,
    ws: true
});

apiProxy.on("proxyReq", function(proxyReq, req, res, options) {
    if(req._token) {
        proxyReq.setHeader('Authorization', req._token);
        proxyReq.setHeader('If-Username-Match', username);
    }
});

app.get('/frontend/*', function(req, res) {
    apiProxy.web(req, res);
});

app.get("/rest/*", function(req, res) {
    apiProxy.web(req, res);
});

app.get('/x-one-webfg/*', function(req, res) {
    apiProxy.web(req, res);
});

app.use('/harmonicpattern', function (req, res) {
    var qs = require("qs");
    req.url = qs.stringify(req.query, {
        addQueryPrefix: true
    });
    apiProxy.web(req, res, {
        target: 'https://harmonicpattern.com/api/scan-pattern',
        changeOrigin: true
    })
});

// application -------------------------------------------------------------
app.get('*', function(req, res) {
    res.sendFile('chart.html', {root: _dirName});
});

apiProxy.on('error', function(e) {
    console.log(e);
});

var server = app.listen(8081);

server.on('upgrade', function (req, socket, head) {
    apiProxy.ws(req, socket, head);
});