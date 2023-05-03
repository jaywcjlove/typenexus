import { ActionType } from './types/ActionType.js';
import { ControllerMetadata } from './ControllerMetadata.js';
import { ActionMetadataArgs } from './args/ActionMetadataArgs.js';
import { ResponseHandlerMetadata } from './ResponseHandleMetadata.js';
import { Action } from '../Action.js';
import { ParamMetadata } from './ParamMetadata.js';
import { ParamConstructorMetadata } from './ParamConstructorMetadata.js';
import { UseMetadata } from './UseMetadata.js';
import { TypeNexusOptions } from '../DriverOptions.js';

/**
 * Action metadata.
 */
export class ActionMetadata {
  /**
   * Action's controller.
   */
  controllerMetadata: ControllerMetadata;
  /**
   * Class on which's method this action is attached.
   */
  target: Function;

  /**
   * Object's method that will be executed on this action.
   */
  method: string;

  /**
   * Route to be registered for the action.
   */
  route: string | RegExp;

  /**
   * Action type represents http method used for the registered route. Can be one of the value defined in ActionTypes
   * class.
   */
  type: ActionType;

  /**
   * Action's parameters.
   */
  params: ParamMetadata[];

  /**
   * Action's constructor parameters.
   */
  paramsConstructor: ParamConstructorMetadata[] = [];

  /**
   * Full route to this action (includes controller base route).
   */
  fullRoute: string | RegExp;

  /**
   * Indicates if this action uses Authorized decorator.
   */
  isAuthorizedUsed: boolean;

  /**
   * Roles set by @Authorized decorator.
   */
  authorizedRoles: any[];

  /**
   * Indicates if controller of this action is json-typed.
   */
  isJsonTyped: boolean;
  /**
   * Action's use metadatas.
   */
  uses: UseMetadata[];
  /**
   * Http code to be used on undefined action returned content.
   */
  undefinedResultCode: number | Function;

  /**
   * Http code to be used on null action returned content.
   */
  nullResultCode: number | Function;

  /**
   * Http code to be set on successful response.
   */
  successHttpCode: number;

  /**
   * Specifies redirection url for this action.
   */
  redirect: string;

  /**
   * Rendered template to be used for this controller action.
   */
  renderedTemplate: string;

  /**
   * Response headers to be set.
   */
  headers: { [name: string]: any };
  constructor(
    controllerMetadata: ControllerMetadata,
    args: ActionMetadataArgs,
    private globalOptions: TypeNexusOptions,
  ) {
    this.controllerMetadata = controllerMetadata;
    this.route = args.route;
    this.target = args.target;
    this.method = args.method;
    this.type = args.type;
  }
  /**
   * Builds everything action metadata needs.
   * Action metadata can be used only after its build.
   */
  build(responseHandlers: ResponseHandlerMetadata[]) {
    const authorizedHandler = responseHandlers.find((handler) => handler.type === 'authorized');
    const contentTypeHandler = responseHandlers.find((handler) => handler.type === 'content-type');
    const undefinedResultHandler = responseHandlers.find((handler) => handler.type === 'on-undefined');
    const nullResultHandler = responseHandlers.find((handler) => handler.type === 'on-null');
    const successCodeHandler = responseHandlers.find((handler) => handler.type === 'success-code');
    const redirectHandler = responseHandlers.find((handler) => handler.type === 'redirect');
    const renderedTemplateHandler = responseHandlers.find((handler) => handler.type === 'rendered-template');

    if (successCodeHandler) this.successHttpCode = successCodeHandler.value;
    if (redirectHandler) this.redirect = redirectHandler.value;
    if (renderedTemplateHandler) this.renderedTemplate = renderedTemplateHandler.value;

    this.undefinedResultCode = undefinedResultHandler
      ? undefinedResultHandler.value
      : this.globalOptions.defaults && this.globalOptions.defaults.undefinedResultCode;

    this.nullResultCode = nullResultHandler
      ? nullResultHandler.value
      : this.globalOptions.defaults && this.globalOptions.defaults.nullResultCode;

    this.isJsonTyped =
      contentTypeHandler !== undefined
        ? /json/.test(contentTypeHandler.value)
        : this.controllerMetadata.type === 'json';

    this.fullRoute = this.buildFullRoute();
    this.headers = this.buildHeaders(responseHandlers);
    this.isAuthorizedUsed = this.controllerMetadata.isAuthorizedUsed || !!authorizedHandler;
    this.authorizedRoles = (this.controllerMetadata.authorizedRoles || []).concat(
      (authorizedHandler && authorizedHandler.value) || [],
    );
  }
  /**
   * Appends base route to a given regexp route.
   */
  static appendBaseRoute(baseRoute: string, route: RegExp | string) {
    const prefix = `/${baseRoute}`.replace(/\/+/g, '/');
    if (typeof route === 'string') return `${prefix}/${route}`.replace(/\/+/g, '/');
    if (!baseRoute || baseRoute === '') return route;
    const fullPath = `^${prefix}${route.toString().substring(1)}?$`;
    return new RegExp(fullPath, route.flags);
  }
  /**
   * Builds full action route.
   */
  private buildFullRoute(): string | RegExp {
    if (this.route instanceof RegExp) {
      if (this.controllerMetadata.route) {
        return ActionMetadata.appendBaseRoute(this.controllerMetadata.route, this.route);
      }
      return this.route;
    }

    let path: string = '';
    if (this.controllerMetadata.route) path += this.controllerMetadata.route;
    if (this.route && typeof this.route === 'string') path += this.route;
    return path;
  }
  /**
   * Calls action method.
   * Action method is an action defined in a user controller.
   */
  callMethod(params: any[], paramsConstructor: any[], action: Action) {
    const controllerInstance = this.controllerMetadata.getInstance(action, paramsConstructor);
    return controllerInstance[this.method].apply(controllerInstance, params);
  }

  /**
   * Builds action response headers.
   */
  private buildHeaders(responseHandlers: ResponseHandlerMetadata[]) {
    const locationHandler = responseHandlers.find((handler) => handler.type === 'location');
    const contentTypeHandler = responseHandlers.find((handler) => handler.type === 'content-type');
    const headerHandlers = responseHandlers.filter((handler) => handler.type === 'header');
    const headers: ActionMetadata['headers'] = {};
    if (locationHandler) headers['Location'] = locationHandler.value;
    if (contentTypeHandler) headers['Content-type'] = contentTypeHandler.value;
    if (headerHandlers) headerHandlers.map((handler) => (headers[handler.value] = handler.secondaryValue));
    return headers;
  }
}
