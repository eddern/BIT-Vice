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
app.use(express.static('public'));

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
            //res.send(result);
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

          res.send(createDateSeries(log));


      });
})

function createDateSeries(log) {
  //Creating a series of day data
  var startDate = new Date("2016-12-31")
  var dates = []
  var sums = []
  for (var i = 0; i < 31; i++) {
    dates.unshift(new Date(startDate - i*86400000))
    sums.push(0)
  }
  var j = log.transactions.length-1;
  for (var i = dates.length-1; i >= 0; i--) {
    while (simpleCompareDate(new Date(log.transactions[j].createDate), dates[i])){
      if(!log.transactions[j].incoming){
        sums[i] += parseInt(log.transactions[j].amount)
      }
      j--;
    }
    sums[i] = Math.round(sums[i]/100)
  }

  for (var i = 0; i < dates.length; i++) {
    month = dates[i].getMonth()+1
    dates[i] = dates[i].getDate()+"/"+month+"/"+dates[i].getFullYear();
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

var varer = ["Harry Potter Samleboks (8 DVDs)", "Lamborghini Aventador", "Oppvaskbørste", "Kilo smågodt på Rema 1000", "Leverpostei", "Måneder WoW subscription"];
var bilder = ["http://dizw242ufxqut.cloudfront.net/images/product/movie/dvd/image0/harry_potter_samleboks_1_-_7_del_2_8_disc-15163013-frntl.jpg","https://finncdn.no/dynamic/1600w/2016/2/vertical-3/12/3/598/589/33_1034132342.jpg","https://www.norengros.no/norengros/frontend/mediabank/5/5790/6192V42373_l.jpg","http://www.vandergeeten.no/wp-content/uploads/2013/09/Smagodt1-700x400.jpg","http://www.matbox.no/images/605097.jpg","http://spifo.no/files/2015/06/WoW-logo-big.jpg"]
var priser = [249, 4790000, 19, 29, 14, 120];
var netWorth = 3100;
var cardtext = ""
var tall = Math.floor((Math.random() * 6) + 1)-1

function velgVare (){
    var antall = (netWorth/priser[tall]).toFixed(2);
    cardtext =  "Sparer du 100 kroner hver dag, kan du kjøpe " + antall + " stk " + varer[tall] + " etter en måned.";
}

app.get("/test", function(req, res) {
  velgVare();
  res.render('index', { title: 'Raindough', message: 'Hello there!', imgsource: bilder[tall], imgtext: cardtext});
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
