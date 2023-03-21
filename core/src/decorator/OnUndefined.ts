import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Used to set specific HTTP status code when result returned by a controller action is equal to undefined.
 * Must be applied on a controller action.
 */
export function OnUndefined(codeOrError: number | Function): PropertyDecorator {
  return function (object: Object, methodName: string) {
    getMetadataArgsStorage().responseHandlers.push({
      type: 'on-undefined',
      target: object.constructor,
      method: methodName,
      value: codeOrError,
    });
  };
}
