import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import assert from 'node:assert/strict';
import { UserController } from '../dist/UserController.js';

;(async () => {
  const app = new TypeNexus(3002, {
    routePrefix: '/api',
    developmentMode: false,
  });
  app.controllers([UserController]);
  const log = (method: string = 'GET', url: string, info?: string) => console.log(...[`\x1b[32;1m ${method}\x1b[0m`, url, info ? `\x1b[34;1m ${info}\x1b[0m` : '']);

  log('GET', '/api/users');
  const agent = supertest.agent(app.app);
  let result = await agent
    .get('/api/users')
    .set('Accept', 'application/json')
    .expect(302)

  assert.deepEqual(result.redirect, true);
  assert.deepEqual(result.header.location, 'http://github.com/jaywcjlove/typenexus');

  log('GET', '/api/redirect/github');
  result = await agent
    .get('/api/redirect/github')
    .set('Accept', 'application/json')
    .expect(302)

  assert.deepEqual(result.redirect, true);
  assert.deepEqual(result.header.location, 'http://github.com');

  log('GET', '/api/redirect/location');
  result = await agent
    .get('/api/redirect/location')
    .set('Accept', 'application/json')
    .expect(201)

  assert.deepEqual(result.redirect, false);
  assert.deepEqual(result.header.location, 'https://bing.com');

  log('GET', '/api/users/12');
  result = await agent
    .get('/api/users/location')
    .set('Accept', 'application/json')
    .expect(200)

  assert.deepEqual(result.redirect, false);
  assert.deepEqual(result.header['cache-control'], 'none');

})();
