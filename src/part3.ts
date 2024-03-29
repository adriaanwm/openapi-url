
type OptionalNevers<T> = {
  [K in keyof T as (T[K] extends never ? never : K)]: T[K] extends object ? OptionalNevers<T[K]> : T[K]
} & {
  [K in keyof T as (T[K] extends never ? K : never)]?: T[K]
}

interface Example {
  a: never;
  z: never;
  y: string;
  b: string;
  c: {
    d: never;
    e: number;
  };
}

type Testing = OptionalNevers<Example>

const x: Testing = {
  b: 'hello',
  y: 'yo yo',
  c: {
    e: 123
  }
}

type ExampleTransformer<T extends Record<string, any>> = {
  paths: {
    [key in keyof T]: {
      [method in keyof T[key]]: {
        query?: T[key][method]['parameters'] extends { query: infer Q } ? Q : never;
        path?: T[key][method]['parameters'] extends { path: infer P } ? P : never;
        requestBody?: T[key][method]['requestBody'] extends { content: { 'application/json': infer R } } ? R : never;
        responseBody?: T[key][method]['responses'][keyof T[key][method]['responses']] extends { content: { 'application/json': infer R } } ? R : never;
      };
    };
  };
};
