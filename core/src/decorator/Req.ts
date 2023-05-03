import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Injects a request object to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function Req(): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'request',
      object: object,
      method: methodName,
      index: index,
    });
  };
}
