import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Injects currently authorized user.
 * Authorization logic must be defined in `TypeNexus` settings.
 */
export function CurrentUser(options?: { required?: boolean }) {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'current-user',
      object: object,
      method: methodName,
      index: index,
      required: options ? options.required : undefined,
    });
  };
}
