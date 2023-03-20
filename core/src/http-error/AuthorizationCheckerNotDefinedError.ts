import { InternalServerError } from './InternalServerError.js';

/**
 * Thrown when authorizationChecker function is not defined in `TypeNexus` options.
 */
export class AuthorizationCheckerNotDefinedError extends InternalServerError {
  name = 'AuthorizationCheckerNotDefinedError';

  constructor() {
    super(
      `Cannot use @Authorized decorator. Please define 'authorizationChecker' function in "TypeNexus" action before using it.`
    );
    Object.setPrototypeOf(this, AuthorizationCheckerNotDefinedError.prototype);
  }
}
