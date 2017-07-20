const request = require('supertest');
const { expect } = require('chai');
const { app } = require('./../server/app');
const { testUser, testFiddle } = require('./seedData');

describe('GET /profile/:id returns a user and fiddles', function () {
  const agent = request.agent(app);

  it('should get correct user and fiddles from DB', (done) => {
    agent.get('/profile/' + testUser.user1._id)
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });

  it('should return 404 for a false id param', (done) => {
    agent.get(`/profile/${parseInt(Date.now(), 10).toString(36)}`)
      .expect(404)
      .end(function (err, res) {
        if (err) return done(err);
        done();
      });
  });
});
