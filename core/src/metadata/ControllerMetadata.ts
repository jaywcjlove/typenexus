import { ControllerMetadataArgs } from './args/ControllerMetadataArgs.js'
import { ResponseHandlerMetadata } from './ResponseHandleMetadata.js';
import { ActionMetadata } from './ActionMetadata.js';
import { UseMetadata } from './UseMetadata.js';
import { Action } from '../Action.js';

/**
 * Container options.
 */
export interface UseContainerOptions {
  /**
   * If set to true, then default container will be used in the case if given container haven't returned anything.
   */
  fallback?: boolean;

  /**
   * If set to true, then default container will be used in the case if given container thrown an exception.
   */
  fallbackOnErrors?: boolean;
}


let userContainer: { get<T>(someClass: ClassConstructor<T> | Function, action?: Action): T };
let userContainerOptions: UseContainerOptions;
export type ClassConstructor<T> = { new (...args: any[]): T };

/**
 * Container to be used by this library for inversion control. If container was not implicitly set then by default
 * container simply creates a new instance of the given class.
 */
const defaultContainer: { get<T>(someClass: ClassConstructor<T> | Function): T } = new (class {
  private instances: { type: Function; object: any }[] = [];
  get<T>(someClass: ClassConstructor<T>): T {
    let instance = this.instances.find(instance => instance.type === someClass);
    if (!instance) {
      instance = { type: someClass, object: new someClass() };
      this.instances.push(instance);
    }

    return instance.object;
  }
})();

/**
 * Gets the IOC container used by this library.
 * @param someClass A class constructor to resolve
 * @param action The request/response context that `someClass` is being resolved for
 */
export function getFromContainer<T>(someClass: ClassConstructor<T> | Function, action?: Action): T {
  if (userContainer) {
    try {
      const instance = userContainer.get(someClass, action);
      if (instance) return instance;

      if (!userContainerOptions || !userContainerOptions.fallback) return instance;
    } catch (error) {
      if (!userContainerOptions || !userContainerOptions.fallbackOnErrors) throw error;
    }
  }
  return defaultContainer.get<T>(someClass);
}


/**
 * Controller metadata.
 */
export class ControllerMetadata {
  actions: ActionMetadata[];
  /**
   * Indicates object which is used by this controller.
   */
  target: Function;

  /**
   * Base route for all actions registered in this controller.
   */
  route: string;

  /**
   * Controller type. Can be default or json-typed. Json-typed controllers operate with json requests and responses.
   */
  type: 'default' | 'json';

  /**
   * Indicates if this action uses Authorized decorator.
   */
  isAuthorizedUsed: boolean;

  /**
   * Middleware "use"-s applied to a whole controller.
   */
  uses: UseMetadata[];

  /**
   * Roles set by @Authorized decorator.
   */
  authorizedRoles: any[];
  constructor(args: ControllerMetadataArgs) {
    this.target = args.target;
    this.route = args.route;
    this.type = args.type;
  }
  /**
   * Gets instance of the controller.
   * @param action Details around the request session
   */
  getInstance(action: Action): any {
    return getFromContainer(this.target, action);
  }
  /**
   * Builds everything controller metadata needs.
   * Controller metadata should be used only after its build.
   */
  build(responseHandlers: ResponseHandlerMetadata[]) {
    const authorizedHandler = responseHandlers.find(handler => handler.type === 'authorized' && !handler.method);
    this.isAuthorizedUsed = !!authorizedHandler;
    this.authorizedRoles = [].concat((authorizedHandler && authorizedHandler.value) || []);
  }
}