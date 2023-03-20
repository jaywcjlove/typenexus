import { InternalServerError } from './InternalServerError.js';

/**
 * Thrown when currentUserChecker function is not defined in TypeNexus options.
 */
export class CurrentUserCheckerNotDefinedError extends InternalServerError {
  name = 'CurrentUserCheckerNotDefinedError';

  constructor() {
    super(
      `Cannot use @CurrentUser decorator. Please define currentUserChecker function in TypeNexus action before using it.`
    );
    Object.setPrototypeOf(this, CurrentUserCheckerNotDefinedError.prototype);
  }
}
