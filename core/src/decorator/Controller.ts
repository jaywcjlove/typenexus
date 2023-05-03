import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

export function Controller(baseRoute: string = ''): ClassDecorator {
  return (object: Function) => {
    getMetadataArgsStorage().controllers.push({
      type: 'json',
      target: object,
      route: baseRoute,
    });
  };
}
