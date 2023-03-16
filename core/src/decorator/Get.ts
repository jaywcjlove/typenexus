
import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Registers an action to be executed when GET request comes on a given route.
 * Must be applied on a controller action.
 */
export function Get(route: string | RegExp = ''): PropertyDecorator {
  return (object: Object, methodName: string | symbol) => {
    getMetadataArgsStorage().actions.push({
      type: 'get',
      target: object.constructor,
      method: methodName as string,
      route,
    })
  };
}