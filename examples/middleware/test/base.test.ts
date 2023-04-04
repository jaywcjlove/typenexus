/** @jest-environment node */
import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import { UserController, LoggingMiddleware, CustomErrorHandler } from '../dist/UserController.js';

describe('API request test case', () => {
  let app: TypeNexus;
  let agent: supertest.SuperAgentTest;
  beforeAll(() => {
    app = new TypeNexus(3002, {
      routePrefix: '/api',
      developmentMode: false,
    });
    app.controllers([UserController], [LoggingMiddleware, CustomErrorHandler]);  
    agent = supertest.agent(app.app);
  });

  test('GET /api/questions', async () => {
    const result = await agent
      .get('/api/questions')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)

    expect(Object.keys(result.body)).toEqual([ 'id', 'title' ]);
    expect(result.body.title).toEqual('Question wcjfetch-logologging');
  });

  test('GET /api/questions/detail', async () => {
    const result = await agent
      .get('/api/questions/detail')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403)

    expect(result.body).toEqual({
      name: 'ForbiddenError',
      message: 'Nooooo this message will be lost'
    });
  });
});


