import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Registers a controller method to be executed when DELETE request comes on a given route.
 * Must be applied on a controller action.
 */
export function Delete(route: string | RegExp = ''): PropertyDecorator {
  return (object: Object, methodName: string) => {
    getMetadataArgsStorage().actions.push({
      type: 'delete',
      target: object.constructor,
      method: methodName as string,
      route,
    });
  };
}
