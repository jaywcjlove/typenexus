import { Driver } from './Driver.js'
import { ParamMetadata } from './metadata/ParamMetadata.js';
import { Action } from './Action.js';
import { isPromiseLike } from './utils/isPromiseLike.js';
/**
 * Handles action parameter.
 */
export class ActionParameterHandler<T extends Driver> {
  constructor(private driver: T) {}
  /**
   * Handles action parameter.
   */
  handle(action: Action, param: ParamMetadata): Promise<any> | any {
    if (param.type === 'request') return action.request;
    if (param.type === 'response') return action.response;
    if (param.type === 'data-source') return action.dataSource;

    // get parameter value from request and normalize it
    const value = this.normalizeParamValue(this.driver.getParamFromRequest(action, param), param);
    return value;
  }
  /**
   * Normalizes parameter value.
   */
  protected async normalizeParamValue(value: any, param: ParamMetadata): Promise<any> {
    if (value === null || value === undefined) return value;
    return value;
  }

}