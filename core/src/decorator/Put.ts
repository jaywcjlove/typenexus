import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Registers an action to be executed when PUT request comes on a given route.
 * Must be applied on a controller action.
 */
export function Put(route?: string | RegExp): PropertyDecorator {
  return function (object: Object, methodName: string) {
    getMetadataArgsStorage().actions.push({
      type: 'put',
      target: object.constructor,
      method: methodName,
      route: route,
    });
  };
}
