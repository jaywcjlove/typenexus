import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import assert from 'node:assert/strict';
import { UserController, LoggingMiddleware, CustomErrorHandler } from '../dist/UserController.js';

;(async () => {
  const app = new TypeNexus(3002, {
    routePrefix: '/api',
    developmentMode: false,
  });

  app.controllers([UserController], [LoggingMiddleware, CustomErrorHandler]);

  const log = (method: string = 'GET', url: string, info?: string) => console.log(...[`\x1b[32;1m ${method}\x1b[0m`, url, info ? `\x1b[34;1m ${info}\x1b[0m` : '']);

  log('GET', '/api/questions');
  const agent = supertest.agent(app.app);
  let result = await agent
    .get('/api/questions')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)

  assert.deepEqual(Object.keys(result.body), [ 'id', 'title' ]);
  assert.deepEqual(result.body.title, 'Question wcjfetch-logo');
  
  log('GET', '/api/questions/detail');
  result = await agent
    .get('/api/questions/detail')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(403)

  assert.deepEqual(result.body, {
    name: 'ForbiddenError',
    message: 'Nooooo this message will be lost'
  });
})();
