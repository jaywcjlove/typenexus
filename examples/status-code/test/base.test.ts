/** @jest-environment node */
import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import { UserController } from '../dist/UserController.js';

describe('API request test case', () => {
  let app: TypeNexus;
  let agent: supertest.SuperAgentTest;
  beforeAll(() => {
    app = new TypeNexus(3002, {
      routePrefix: '/api',
      developmentMode: false,
    });
    app.controllers([UserController]);
    agent = supertest.agent(app.app);
  });

  test('GET /api/questions', async () => {
    const result = await agent
      .get('/api/questions')
      .set('Accept', 'application/json')
      .expect(204)
    expect(result.body).toEqual({});
  });

  test('GET /api/questions/1', async () => {
    const result = await agent
      .get('/api/questions/1')
      .set('Accept', 'application/json')
      .expect(200)
  });

  test('GET /api/questions/2', async () => {
    const result = await agent
      .get('/api/questions/2')
      .set('Accept', 'application/json')
      .expect(200)
  });

  test('GET /api/questions/3', async () => {
    const result = await agent
      .get('/api/questions/3')
      .set('Accept', 'application/json')
      .expect(404)
  });

  test('GET /api/questions/4', async () => {
    const result = await agent
      .get('/api/questions/4')
      .set('Accept', 'application/json')
      .expect(200)
  });

  test('GET /api/users/4', async () => {
    const result = await agent
      .get('/api/users/4')
      .set('Accept', 'application/json')
      .expect(404)
    expect(result.body.message).toEqual('User not found!');
  });
});
