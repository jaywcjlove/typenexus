import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Specifies a template to be rendered by a controller action.
 * Must be applied on a controller action.
 */
export function Render(template: string): Function {
  return function (object: Object, methodName: string) {
    getMetadataArgsStorage().responseHandlers.push({
      type: 'rendered-template',
      target: object.constructor,
      method: methodName,
      value: template,
    });
  };
}
