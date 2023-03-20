import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

export function DSource(): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    getMetadataArgsStorage().params.push({
      type: 'data-source',
      object: object,
      method: methodName,
      index: index,
    });
  };
}