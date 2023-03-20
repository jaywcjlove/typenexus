import { Action } from '../Action.js';
import { ForbiddenError } from './ForbiddenError.js';

/**
 * Thrown when route is guarded by @Authorized decorator.
 */
export class AccessDeniedError extends ForbiddenError {
  name = 'AccessDeniedError';

  constructor(action: Action) {
    super();
    Object.setPrototypeOf(this, AccessDeniedError.prototype);
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const uri = `${action.request.method} ${action.request.url}`; // todo: check it it works in koa
    this.message = `Access is denied for request on ${uri}`;
  }
}
