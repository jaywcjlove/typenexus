import { BadRequestError } from './BadRequestError.js';
import { ParamMetadata } from '../metadata/ParamMetadata.js';
import { Action } from '../Action.js';

/**
 * Thrown when parameter is required, but was missing in a user request.
 */
export class ParamRequiredError extends BadRequestError {
  name = 'ParamRequiredError';

  constructor(action: Action, param: ParamMetadata) {
    super();
    Object.setPrototypeOf(this, ParamRequiredError.prototype);

    let paramName: string;
    switch (param.type) {
      case 'param':
        paramName = `Parameter "${param.name}" is`;
        break;

      case 'body':
        paramName = 'Request body is';
        break;

      case 'body-param':
        paramName = `Body parameter "${param.name}" is`;
        break;

      case 'query':
        paramName = `Query parameter "${param.name}" is`;
        break;

      case 'header':
        paramName = `Header "${param.name}" is`;
        break;

      case 'session':
        paramName = 'Session is';
        break;

      case 'cookie':
        paramName = 'Cookie is';
        break;

      default:
        paramName = 'Parameter is';
    }

    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const uri = `${action.request.method} ${action.request.url}`; // todo: check it it works in koa
    this.message = `${paramName} required for request on ${uri}`;
  }
}
