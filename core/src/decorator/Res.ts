import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Injects a Response object to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function Res(): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'response',
      object: object,
      method: methodName,
      index: index,
    });
  };
}
