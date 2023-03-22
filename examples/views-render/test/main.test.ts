import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UserController, CustomErrorHandler } from '../dist/UserController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

;(async () => {
  const app = new TypeNexus(3002, {
    defaultErrorHandler: false,
  });
  app.express.set('views', path.resolve(__dirname, '../dist/views'));
  app.express.set('view engine', 'ejs');
  app.controllers([UserController], [CustomErrorHandler]);
  const log = (method: string = 'GET', url: string, info?: string) => console.log(...[`\x1b[32;1m ${method}\x1b[0m`, url, info ? `\x1b[34;1m ${info}\x1b[0m` : '']);

  log('GET', '/', 'Home Page');
  const agent = supertest.agent(app.app);
  let result = await agent
    .get('/')
    .expect('Content-Type', /html/)
    .expect(200)
  assert.deepEqual(result.text.includes('My Blog'), true);

  log('GET', '/error-test', 'Error Page');
  result = await agent
    .get('/error-test')
    .expect('Content-Type', /html/)
    .expect(500)
  assert.deepEqual(result.text.includes('Nooooo'), true);

})();
