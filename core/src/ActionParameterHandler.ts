import { DataSource } from 'typeorm';
import { Driver } from './Driver.js'
import { ParamMetadata } from './metadata/ParamMetadata.js';
import { ParamConstructorMetadata } from './metadata/ParamConstructorMetadata.js';
import { Action } from './Action.js';
import { isPromiseLike } from './utils/isPromiseLike.js';
import { CurrentUserCheckerNotDefinedError } from './http-error/CurrentUserCheckerNotDefinedError.js';
import { ParamRequiredError } from './http-error/ParamRequiredError.js';
import { AuthorizationRequiredError } from './http-error/AuthorizationRequiredError.js';
/**
 * Handles action parameter.
 */
export class ActionParameterHandler<T extends Driver> {
  constructor(private driver: T) {}
  /**
   * Handles action constructor parameter.
   */
  handleConstructor(action: Action, param: ParamConstructorMetadata): DataSource {
    if (param.type === 'data-source') return action.dataSource;
  }
  /**
   * Handles action parameter.
   */
  handle(action: Action, param: ParamMetadata): Promise<any> | any {
    if (param.type === 'request') return action.request;
    if (param.type === 'response') return action.response;
    if (param.type === 'data-source') return action.dataSource;

    // get parameter value from request and normalize it
    const value = this.normalizeParamValue(this.driver.getParamFromRequest(action, param), param);
    if (isPromiseLike(value)) return value.then(value => this.handleValue(value, action, param));
    return this.handleValue(value, action, param);
  }
  /**
   * Normalizes parameter value.
   */
  protected async normalizeParamValue(value: any, param: ParamMetadata): Promise<any> {
    if (value === null || value === undefined) return value;
    return value;
  }
  /**
   * Handles non-promise value.
   */
  protected handleValue(value: any, action: Action, param: ParamMetadata): Promise<any> | any {

    // if its current-user decorator then get its value
    if (param.type === 'current-user') {
      if (!this.driver.currentUserChecker) throw new CurrentUserCheckerNotDefinedError();

      value = this.driver.currentUserChecker(action);
    }
    // check cases when parameter is required but its empty and throw errors in this case
    if (param.required) {
      const isValueEmpty = value === null || value === undefined || value === '';
      const isValueEmptyObject = typeof value === 'object' && value !== null && Object.keys(value).length === 0;

      if (param.type === 'body' && !param.name && (isValueEmpty || isValueEmptyObject)) {
        // body has a special check and error message
        return Promise.reject(new ParamRequiredError(action, param));
      } else if (param.type === 'current-user') {
        // current user has a special check as well

        if (isPromiseLike(value)) {
          return value.then(currentUser => {
            if (!currentUser) return Promise.reject(new AuthorizationRequiredError(action));

            return currentUser;
          });
        } else {
          if (!value) return Promise.reject(new AuthorizationRequiredError(action));
        }
      } else if (param.name && isValueEmpty) {
        // regular check for all other parameters // todo: figure out something with param.name usage and multiple things params (query params, upload files etc.)
        return Promise.reject(new ParamRequiredError(action, param));
      }
    }


    return value;
  }


}