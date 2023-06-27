// see https://mongodb.github.io/node-mongodb-native/3.5/api/Collection.html#createIndex
type Ascending = 1;
type Descending = -1;
type Direction = Ascending | Descending;
type Text = 'text';
type Geospatial = '2dsphere' | '2d';
type IndexFieldArray = [string, Direction | Text | Geospatial];
type IndexFieldMap = Record<string, Direction | Text | Geospatial>;

export type IndexSpec =
  // This first form does not ensure order
  | IndexFieldMap
  // Ensures order of indexes
  | IndexFieldArray[]
  // For "foo" this is the equivalent of { foo: 1 }
  | string
  // For ["foo","bar"] this is the equivalent of { foo: 1, bar: 1 }
  | string[]
  // Like the first form but ensures order
  | IndexFieldMap[]
  // Just throw them all together: ['j', ['k', -1], { l: '2d' }]
  | (string | IndexFieldArray | IndexFieldMap)[];

export default class IndexDef {
  public readonly name: string;

  public readonly spec: IndexSpec;

  public readonly unique?: boolean;

  public constructor(name: string, spec: IndexSpec, unique?: boolean) {
    this.name = name;
    this.spec = spec;
    this.unique = unique;
  }
}
