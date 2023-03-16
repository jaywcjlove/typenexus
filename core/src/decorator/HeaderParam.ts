import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Injects a request's cookie value to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function HeaderParam(name: string): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'header',
      object: object,
      method: methodName,
      index: index,
      name: name,
    });
  };
}
