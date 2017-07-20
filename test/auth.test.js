const request = require('supertest');
const superagent = require('superagent');
const { expect } = require('chai');
const { app } = require('./../server/app');
const passportMock = require('./passport-mock');
const { testUser, testFiddle } = require('./seedData');

describe('GET /github/myProfile authorized', function () {
  const agent = request.agent(app);
  beforeEach(function (done) {
    passportMock(app, {
      passAuthentication: true,
      userId: testUser.user1._id
    });
    agent.get('/mock/login')
      .end(function (err, result) {
        if (!err) {
          done();
        } else {
          done(err);
        }
      });
  })

  it('should allow access to /github/myProfile', function (done) {
    const req = agent.get('/github/myProfile');
    //agent.attachCookies(req);
    req.expect(200, done);
  });
});
