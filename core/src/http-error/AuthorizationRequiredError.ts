import { Action } from '../Action.js';
import { UnauthorizedError } from './UnauthorizedError.js';

/**
 * Thrown when authorization is required thought @CurrentUser decorator.
 */
export class AuthorizationRequiredError extends UnauthorizedError {
  name = 'AuthorizationRequiredError';

  constructor(action: Action) {
    super();
    Object.setPrototypeOf(this, AuthorizationRequiredError.prototype);
    const uri = `${action.request.method} ${action.request.url}`;
    this.message = `Authorization is required for request on "${uri}"`;
  }
}
