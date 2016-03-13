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
app.set('view engine', 'jade');
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
    console.log("TOKEN: ")
    console.log(accessToken);
    request.get('https://id.sandbox.sparebank1.no/api/v1/me')
        .set('Authorization', 'Bearer ' + accessToken)
        .end(function (err, result) {
            if (err) {
                return next(err);
            }
            res.send(result);
        });
    console.log("Prøver å hente noe shit:")

    request.get('https://api.sandbox.sparebank1.no/api/v1/transactions/all').
      set('Authorization', 'Bearer ' + accessToken)
      .end(function (err, result, body) {
          if (err) {
              return next(err);
          }
          log = JSON.parse(result.text)

          //Sorting data =)
          log.transactions.sort(function (a, b) {
            return new Date(a.createDate.substring(0, 10)) - new Date(b.createDate.substring(0, 10));
          });

          console.log(createDateSeries(log));


      });
})

function createDateSeries(log) {
  //Creating a series of day data
  var startDate = new Date("2016-12-31")
  var dates = []
  var sums = []
  for (var i = 0; i < 30; i++) {
    dates.unshift(new Date(startDate - i*86400000))
    sums.push(0)
  }
  var j = log.transactions.length-1;
  for (var i = dates.length-1; i >= 0; i--) {
    while (simpleCompareDate(new Date(log.transactions[j].createDate), dates[i])){
      sums[i] += parseInt(log.transactions[j].amount)
      j--;
    }
  }
  var chartData = {
    labels: dates,
    values: sums
  }
  return chartData
}

function simpleCompareDate(d1, d2) {
  if (d1.getDate() == d2.getDate() && d1.getMonth() == d2.getMonth() && d1.getFullYear() == d2.getFullYear()) {
    return true;
  } else {
    return false;
  }
}

app.get("/test", function(req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});

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
