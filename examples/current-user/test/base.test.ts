/** @jest-environment node */
import { TypeNexus, Action } from 'typenexus';
import supertest from 'supertest';
import { UserController } from '../dist/UserController.js';
import { User } from '../dist/User.js';

describe('API request test case 1', () => {
  let app: TypeNexus;
  let agent: supertest.SuperAgentTest;
  beforeAll(() => {
    app = new TypeNexus(3002, {
      routePrefix: '/api',
      developmentMode: false,
    });
  
    app.currentUserChecker = async (action: Action) => {
      return new User(1, 'Johny', 'Cage');
    }
    app.controllers([UserController]);
    agent = supertest.agent(app.app);
  
  });

  test('GET /api/questions', async () => {
    const result = await agent
      .get('/api/questions')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(Object.keys(result.body)).toEqual([ 'id', 'title' ]);
    expect(result.body).toEqual({
      "id": 1,
      "title": "Question by Johny"
    });
  });
});

describe('API request test case 1', () => {
  let app: TypeNexus;
  let agent: supertest.SuperAgentTest;
  beforeAll(() => {
    app = new TypeNexus(3003, {
      routePrefix: '/api',
      developmentMode: false,
    });
  
    app.currentUserChecker = async (action: Action) => {
      return;
    }
  
    app.controllers([UserController]);  
    agent = supertest.agent(app.app);
  });

  test('POST /api/questions required=true', async () => {
    const result = await agent
      .post('/api/questions')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401)
    expect(Object.keys(result.body)).toEqual([ 'name', 'message' ]);
    expect(result.body.name).toEqual('AuthorizationRequiredError');
  });
});
