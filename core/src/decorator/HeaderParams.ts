import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Injects a request's http header value to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function HeaderParams(): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'headers',
      object: object,
      method: methodName,
      index: index,
    });
  };
}
