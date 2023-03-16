import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Injects all request's query parameters to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function QueryParams(): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'queries',
      object: object,
      method: methodName,
      index: index,
      name: '',
    });
  };
}
