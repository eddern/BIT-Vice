var express = require('express');
var session = require('cookie-session');
var ApiClient = require('api-poc-client');
var request = require('superagent');

// SETUP
var app = module.exports = express();
var client = new ApiClient({
    authServer: "https://id.sandbox.sparebank1.no",
    clientId: "76eb8f7e-f1c3-42e9-bfe5-ab92a8c92c4c",
    clientSecret: "f3275c627a7646c912a338724fac6132215f009b8f48418f1e89d699a870a30f75501a0cf80f840b4ce19ecaf06a7a6de05b84f8dcfa2a9ec743c27afbbd6532",
    scope: ["accountsRead","transactionsRead", "clientsRead","tagsRead"],
    redirectUri: "http://localhost:3560/auth/callback",
    debugLog: console.log
});
app.use(session({
    name: 'session-example-client',
    secret: 'little-elephant-crossing-borders'
}));

// AUTH

// ROUTES
app.get("/auth", client.authorize);

app.get("/auth/callback", client.authorizeCallback, function (req, res) {
    res.redirect("/");
})

app.get("/", client.secured, function (req, res, next) {
    var accessToken = req.session.access_token;
console.log(accessToken);
    request.get('https://id.sandbox.sparebank1.no/api/v1/me')
        .set('Authorization', 'Bearer ' + accessToken)
        .end(function (err, result) {
            if (err) {
                return next(err);
            }
            res.send(result);
        });
})

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: err.filename + ":" + err.lineNumber
    });
})

// SERVER
var port = process.env.PORT || 3560;
var server = app.listen(port, function () {
    var host = server.address().address;
    console.log("Client lib example app running on " + host + ":" + port);
});
