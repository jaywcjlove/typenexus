/** @jest-environment node */
import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import path from 'node:path';
import { UserController, CustomErrorHandler } from '../dist/UserController.js';

describe('API request test case', () => {
  let app: TypeNexus;
  let agent: supertest.SuperAgentTest;
  beforeAll(() => {
    app = new TypeNexus(3002, {
      defaultErrorHandler: false,
    });
    app.express.set('views', path.resolve(__dirname, '../dist/views'));
    app.express.set('view engine', 'ejs');
    app.controllers([UserController], [CustomErrorHandler]);
    agent = supertest.agent(app.app);
  });

  test('GET / \x1b[34;1mHome Page\x1b[0m', async () => {
    const result = await agent
      .get('/')
      .expect('Content-Type', /html/)
      .expect(200)
    expect(result.text.includes('My Blog')).toEqual(true);
  });

  test('GET /error-test \x1b[34;1mError Page\x1b[0m', async () => {
    const result = await agent
      .get('/error-test')
      .expect('Content-Type', /html/)
      .expect(500)
    expect(result.text.includes('Nooooo')).toEqual(true);
  });

});

