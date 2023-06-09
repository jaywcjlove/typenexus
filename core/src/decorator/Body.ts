import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Allows to inject a request body value to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function Body(options?: any): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'body',
      object: object,
      method: methodName,
      index: index,
      extraOptions: options ? options : undefined,
    });
  };
}
