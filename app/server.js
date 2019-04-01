'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const request = require('request');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');
const { BlockHeight } = require("./models");
// const { NextBlock } = require('./next-block.js')

const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
// // Logging
app.use(morgan('common'));
// app.use(express.json());
app.use(express.static("public"));
// // CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

const rp = require('request-promise');

class Options {
  constructor(uri, method, form, headers) {
      this.uri = uri;
      this.method = method;
      this.form = form;
      this.headers = headers;
  }
}

//const blockHeight = require('./models/BlockHeight');
app.get('/current-height-db', function (req, res, next) {
    BlockHeight
    .findOne()
    .then(block => res.json({
        height: block.height,
    }))
    .catch(err => {
        console.error(err)
        res.status(500).json({message: 'Something went wrong'})}
    );
});

app.delete('/delete-and-instantiate', function(req, res, next){

  BlockHeight.findOneAndDelete({}, function (err, block){
    if(err) { 
      throw err; 
    }
  });

  let height = { "height" : req.body.height };
  let blockheight = new BlockHeight(height);
  blockheight.save(function (err) {
      if (err) return handleError(err);
      res.status(200).end(); 
  })
});









  

app.put('/update-height', function (req, res, next) {
  const requiredFields = ['height'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  };

  BlockHeight.
    findOneAndUpdate({}, {$set:{ height : req.body.height }}, {new: true}, (err, block) => {
      if (err) {
          console.log("Something wrong when updating data!");
      }
      res.send(block);
  });  

});

app.get('/latest-block-height', (req, res) => {
  let blockHeightUrl = `https://blockchain.info/q/getblockcount`;
  const blockHeightOptions = new Options(blockHeightUrl);
  rp(blockHeightOptions)
    .then(function (height) {
      res.send(height);
    })
    .catch(function (err) {
      res.status(500).json({ message: "Internal server error; failed in outside call" });
    });
});



app.get('/block-info/:height', (req, res, next) => {
  let url = `http://localhost:8080/get-current-difficulty`;
  //get difficulty
  rp(url)
  .then(function(body){
    let difficulty = body;
    let blockInfoOptions = new Options(`https://blockchain.info/block-height/${req.params.height}?format=json`)
    //get the other info
    rp(blockInfoOptions)
    .then(function (body) {
      let obj = JSON.parse(body);
      obj = obj.blocks[0];  
      delete obj['tx'];
      res.json({
        "header" : {
          "version" : obj.ver,
          "previous_hash" : obj.prev_block,
          "merkle_root" : obj.mrkl_root,
          "time" : obj.time,
          "bits" : obj.bits,
          "nonce" : obj.nonce
        },
        "info" : {
          "hash" : obj.hash,
          "prev_block" : obj.prev_block,
          "next_block" : obj['next_block'][0],
          "difficulty" : difficulty,
          "height" : obj.height
        }
      })
    })
  })
  .catch(function (err) {
    res.status(500).json({ message: "Internal server error" });
  });
});

app.get('/get-current-difficulty', (req, res) => {
  let difficultyUrl = `https://blockchain.info/q/getdifficulty`;
  let difficultySettings = new Options(difficultyUrl);
  rp(difficultySettings)
  .then(function(body){
    res.send(body);
  })
  .catch(function(err){
    res.status(500).json({message: "unable to get difficulty"})
  });
});






app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});


// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };

