import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Registers an action to be executed when POST request comes on a given route.
 * Must be applied on a controller action.
 */
export function Post(route: string | RegExp = ''): PropertyDecorator {
  return function (object: Object, methodName: string | symbol) {
    getMetadataArgsStorage().actions.push({
      type: 'post',
      target: object.constructor,
      method: methodName as string,
      route,
    });
  };
}
