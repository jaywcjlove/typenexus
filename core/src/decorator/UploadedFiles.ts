import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Injects an uploaded file object to the controller action parameter.
 * Must be applied on a controller action parameter.
 */
export function UploadedFiles(name: string, options?: any): Function {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'files',
      object: object,
      method: methodName,
      index: index,
      name: name,
      extraOptions: options ? options.options : undefined,
    });
  };
}
