import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Sets Location header with given value to the response.
 * Must be applied on a controller action.
 */
export function Location(url: string): PropertyDecorator {
  return function (object: Object, methodName: string) {
    getMetadataArgsStorage().responseHandlers.push({
      type: 'location',
      target: object.constructor,
      method: methodName,
      value: url,
    });
  };
}
