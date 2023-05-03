import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

export function DSource(): ParameterDecorator {
  return function (object: Object, methodName: string, index: number) {
    const storage = getMetadataArgsStorage();
    // Support `constructor` decorator definition
    if (!methodName && typeof index === 'number') {
      storage.paramsConstructor.push({
        type: 'data-source',
        object: object,
        method: 'constructor',
        index: index,
      });
    } else {
      storage.params.push({
        type: 'data-source',
        object: object,
        method: methodName,
        index: index,
      });
    }
  };
}
