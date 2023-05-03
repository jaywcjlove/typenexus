/** @jest-environment node */
import { TypeNexus, Action, HttpError } from 'typenexus';
import supertest from 'supertest';
import { UserController } from '../dist/UserController.js';

export class AuthorizationCheckerNotDefinedError extends HttpError {
  name = 'AuthorizationError';
  constructor(message: string = '') {
    super(401);
    Object.setPrototypeOf(this, AuthorizationCheckerNotDefinedError.prototype);
    if (message) this.message = message;
  }
}

describe('API request test case', () => {
  let app: TypeNexus;
  beforeAll(() => {
    app = new TypeNexus(3002, {
      routePrefix: '/api',
      developmentMode: false,
    });
    app.authorizationChecker = async (action: Action, roles: string[]) => {
      if (action.request.path === '/api/questions/info') {
        throw new AuthorizationCheckerNotDefinedError('Failed to verify token!')
      }
      return false;
    }
  });

  test('GET /api/questions', async () => {
    app.controllers([UserController]);
    const result = await supertest.agent(app.app)
      .get('/api/questions')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);
    expect(result.body.name).toEqual('AuthorizationRequiredError');
    expect(Object.keys(result.body)).toEqual([ 'name', 'message' ]);
  });

  test('GET /api/questions/info', async () => {
    app.controllers([UserController]);
    const result = await supertest.agent(app.app)
      .get('/api/questions/info')
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401);

    expect(result.body.name).toEqual('AuthorizationError');
    expect(result.body).toEqual({
      name: 'AuthorizationError',
      message: 'Failed to verify token!',
    });
  });
});
