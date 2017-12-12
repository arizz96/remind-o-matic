mockingoose = require('mockingoose');

const request = require('supertest');
const app = require('../app');

describe('test welcome EP', () => {
  test('it should response the GET method', (done) => {
    request(app).get('/api/v1/welcome').then((response) => {
      expect(response.statusCode).toBe(200);
      done();
    });
  });
});
