import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in TypeNexus settings.
 */
export function Authorized(): PropertyDecorator;

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in TypeNexus settings.
 */
export function Authorized(role: any): PropertyDecorator;

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in TypeNexus settings.
 */
export function Authorized(roles: any[]): PropertyDecorator;

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in TypeNexus settings.
 */
export function Authorized(role: Function): PropertyDecorator;

/**
 * Marks controller action to have a special access.
 * Authorization logic must be defined in TypeNexus settings.
 */
export function Authorized(roleOrRoles?: string | string[] | Function): PropertyDecorator {
  return function (clsOrObject: Function | Object, method?: string) {
    getMetadataArgsStorage().responseHandlers.push({
      type: 'authorized',
      target: method ? clsOrObject.constructor : (clsOrObject as Function),
      method: method,
      value: roleOrRoles,
    });
  };
}
