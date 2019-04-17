'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

// this makes the expect syntax available throughout
// this module
const expect = chai.expect;

const {BlockHeight} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// used to put randomish documents in db
// so we have data to work with and assert about.
// we use the Faker library to automatically
// generate placeholder values for author, title, content
// and then we insert that data into mongo
function seedBlockchainData() {
  console.info('seeding block height data');
  const seedData = [];

  seedData.push(generateBlockData());
  // this will return a promise
  return BlockHeight.insertMany(seedData);
}
// generate an object represnting a restaurant.
// can be used to generate seed data for db
// or request.body data

function generateBlockData() {
  return {
    height: faker.random.number({
      'min': 0,
      'max': 50000
    })
  };
}

// this function deletes the entire database.
// we'll call it in an `afterEach` block below
// to ensure data from one test does not stick
// around for next one
function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blockchains API resource', function() {

  // we need each of these hook functions to return a promise
  // otherwise we'd need to call a `done` callback. `runServer`,
  // `seedRestaurantData` and `tearDownDb` each return a promise,
  // so we return the value returned by these function calls.
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlockchainData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  // note the use of nested `describe` blocks.
  // this allows us to make clearer, more discrete tests that focus
  // on proving something small
  describe('GET endpoint', function() {

    it('should return block height in DB', function() {
      // strategy:
      //    1. get back all restaurants returned by by GET request to `/restaurants`
      //    2. prove res has right status, data type
      //    3. prove the number of blockheights we got back is equal to number
      //       in db.
      //
      // need to have access to mutate and access `res` across
      // `.then()` calls below, so declare it here so can modify in place
      let res;
      return chai.request(app)
        .get('/current-height-db')
        .then(function(_res) {
          // so subsequent .then blocks can access response object
          res = _res;
          expect(res).to.have.status(200);
          // otherwise our db seeding didn't work
          expect(res.body).to.be.a("object");
          expect(res.body.height).to.be.a('number');
          //return BlockHeight;
        })
        .then(count => {
          expect(BlockHeight.find().exec((err, results) => { 
            return results.length 
          })).to.equal(count);
        });
    });


    it('should return block height with right fields', function() {
      // Strategy: Get back all restaurants, and ensure they have expected keys

      let resBlockchain;
      return chai.request(app)
        .get('/current-height-db')
        .then(function(res) {
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body.height).to.be.a('number');
            expect(Object.entries(res.body)).to.have.lengthOf(1);
            expect(res.body).to.include.keys('height');
          });
       });
    });
});
