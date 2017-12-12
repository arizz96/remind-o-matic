mockingoose = require('mockingoose');

const request = require('supertest');
const app = require('../app');

describe('test the finish EP', () => {
  test('It should response the GET method', (done) => {
    request(app).get('/api/v1/finish').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
