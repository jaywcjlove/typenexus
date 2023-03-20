import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Sets response Content-Type.
 * Must be applied on a controller action.
 */
export function ContentType(contentType: string): PropertyDecorator {
  return function (object: Object, methodName: string) {
    getMetadataArgsStorage().responseHandlers.push({
      type: 'content-type',
      target: object.constructor,
      method: methodName,
      value: contentType,
    });
  };
}
