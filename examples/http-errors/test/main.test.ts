import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import assert from 'node:assert/strict';
import { UserController } from '../dist/UserController.js';

;(async () => {
  const app = new TypeNexus(3002, {
    developmentMode: false,
  });
  app.controllers([UserController]);
  const log = (method: string = 'GET', url: string, info?: string) => console.log(...[`\x1b[32;1m ${method}\x1b[0m`, url, info ? `\x1b[34;1m ${info}\x1b[0m` : '']);

  log('GET', '/blogs');
  const agent = supertest.agent(app.app);
  let result = await agent
    .get('/blogs')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(403)
  assert.deepEqual(result.body, { name: 'ForbiddenError', message: 'Nooooo this message will be lost' });

})();