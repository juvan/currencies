'use strict';

var express = require('express');
var cors = require('cors');
var app = express();

var os = require('os');
var ifaces = os.networkInterfaces();

var redis = require('redis');
var client = redis.createClient(6379, 'currencies_redis_1'); //creates a new client

client.on('connect', function() {
    console.log('connected');
});

client.exists('currencies', function(err, reply) {
    if (reply === 1) {
        console.log('exists');
    } else {
        console.log('doesn\'t exist');
        //Store HASH
        client.hmset('currencies', {
            'USD': 'US Dollar',
            'EUR': 'Euro',
            'GBP': 'Pounds'
        });
    }
});

var host = {};

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      return;
    }

    if (alias >= 1) {
      // this single interface has multiple ipv4 addresses
      console.log(ifname + ':' + alias, iface.address);
      host.server = {
        name: ifname + ':' + alias,
        adress: iface.address
      }
    } else {
      // this interface has only one ipv4 adress
      console.log(ifname, iface.address);
      host.server = {
        name: ifname,
        adress: iface.address,
        process: require('os').hostname()
      }
    }
    ++alias;
  });
});
// Beautify JSON
app.set('json spaces', 2);

// CORS
app.use(cors({ origin: true, credentials: true }));

app.get('/', function (req, res) {
    res.json(JSON.stringify(host));
});

app.get('/currencies', function (req, res) {
  //Get Hash
  client.hgetall('currencies', function(err, reply) {
    res.json(reply);
  });
});
  var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
  });
