import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Injects all request's cookies to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function CookieParams(): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'cookies',
      object: object,
      method: methodName,
      index: index,
    });
  };
}
