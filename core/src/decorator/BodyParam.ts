import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Takes partial data of the request body.
 * Must be applied on a controller action parameter.
 */
export function BodyParam(name: string): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'body-param',
      object: object,
      method: methodName,
      index: index,
      name: name,
    });
  };
}
