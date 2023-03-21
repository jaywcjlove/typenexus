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

  log('GET', '/api/questions');
  const agent = supertest.agent(app.app);
  let result = await agent
    .get('/api/questions')
    .set('Accept', 'application/json')
    .expect(204)
  assert.deepEqual(result.body, {});

  log('GET', '/api/questions/1');
  result = await agent
    .get('/api/questions/1')
    .set('Accept', 'application/json')
    .expect(200)

  log('GET', '/api/questions/2');
  result = await agent
    .get('/api/questions/2')
    .set('Accept', 'application/json')
    .expect(200)

  log('GET', '/api/questions/3');
  result = await agent
    .get('/api/questions/3')
    .set('Accept', 'application/json')
    .expect(404)

  log('GET', '/api/questions/4');
  result = await agent
    .get('/api/questions/4')
    .set('Accept', 'application/json')
    .expect(200)

})();
