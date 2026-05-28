import { InputTransformerFn, defineConfig } from 'orval';

interface Node {
  $ref?: string;
  items?: Node;
  oneOf?: unknown[];
  parameters?: unknown[];
  description?: string;
  type?: string;
  properties?: Record<string, Node>;
  components?: { schemas?: Record<string, unknown> };
  [key: string]: unknown;
}

const isObject = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const refContainsV2 = (value: unknown): boolean =>
  typeof value === 'string' && value.includes('PostV2');

const isV2Variant = (item: unknown): boolean => {
  if (!isObject(item)) return false;
  if (refContainsV2(item.$ref)) return true;
  if (isObject(item.items) && refContainsV2(item.items.$ref)) return true;
  if (
    typeof item.description === 'string' &&
    /^(v2 |Unwrapped)/i.test(item.description)
  )
    return true;
  return false;
};

// Unwrap a single-array-property wrapper object to match the runtime behavior
// of objectUnpackInterceptor (`{ posts: [...] }` is returned as `[...]`).
const unwrapSingleArrayProp = (item: unknown): unknown => {
  if (!isObject(item) || item.type !== 'object' || !isObject(item.properties))
    return item;
  const keys = Object.keys(item.properties);
  if (keys.length !== 1) return item;
  const prop = item.properties[keys[0]!];
  if (isObject(prop) && prop.type === 'array') return prop;
  return item;
};

// Promote an inline `array of $ref Foo` schema to a named component `FooList`.
// Orval emits `unknown` for inline array schemas at response level;
// referencing a named component makes it generate the proper `Foo[]` type.
const registerArrayComponent = (
  schemas: Record<string, unknown>,
  item: unknown,
): unknown => {
  if (
    !isObject(item) ||
    item.type !== 'array' ||
    !isObject(item.items) ||
    typeof item.items.$ref !== 'string'
  )
    return item;
  const refName = item.items.$ref.split('/').pop();
  if (!refName) return item;
  const name = `${refName}List`;
  schemas[name] ??= { type: 'array', items: { $ref: item.items.$ref } };
  return { $ref: `#/components/schemas/${name}` };
};

const ignoreV2: InputTransformerFn = (spec) => {
  const root = spec as unknown as Node;
  const components = (root.components ??= {});
  const schemas = (components.schemas ??= {});

  const stripV2 = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(stripV2);
    if (!isObject(node)) return node;
    if (Array.isArray(node.oneOf) && node.oneOf.some(isV2Variant)) {
      const kept = node.oneOf
        .filter((item) => !isV2Variant(item))
        .map(unwrapSingleArrayProp)
        .map(stripV2)
        .map((item) => registerArrayComponent(schemas, item));
      if (kept.length === 1) return kept[0];
      node.oneOf = kept;
      return node;
    }
    if (Array.isArray(node.parameters)) {
      node.parameters = node.parameters.filter(
        (param) => !(isObject(param) && refContainsV2(param.$ref)),
      );
    }
    for (const key of Object.keys(node)) {
      node[key] = stripV2(node[key]);
    }
    return node;
  };

  stripV2(root);

  // Drop now-unreferenced v2 components. Orval does not auto-prune.
  const componentsRecord = components as Record<string, unknown>;
  for (const collectionKey of ['schemas', 'parameters']) {
    const collection = componentsRecord[collectionKey];
    if (!isObject(collection)) continue;
    for (const name of Object.keys(collection)) {
      if (name.startsWith('PostV2')) delete collection[name];
    }
  }

  return spec;
};

export default defineConfig({
  api: {
    input: {
      target: './api.yml',
      filters: {
        mode: 'include',
        tags: [
          'posts',
          'users',
          'tickets',
          'post_replacements',
          'mod_actions',
          'post_events',
          'user_feedbacks',
          'post_versions',
          'post_flags',
          'tag_aliases',
          'tag_implications',
          'bulk_update_requests',
          'appeals',
        ],
      },
      override: {
        transformer: ignoreV2,
      },
    },
    output: {
      clean: true,
      workspace: './src/api/e621',
      mode: 'tags',
      target: 'api.ts',
      schemas: 'model',
      client: 'axios-functions',
      urlEncodeParameters: true,
      prettier: true,
      override: {
        useDates: true,
        useNativeEnums: true,
        mutator: {
          path: '../http/axios.ts',
          name: 'makeRequest',
        },
        transformer: (options) => {
          // remove get prefix from operation name
          options = {
            ...options,
            operationName: options.operationName.replace(
              /^get(.)(.*)/,
              (_, firstChar, rest) => firstChar.toLowerCase() + rest,
            ),
          };
          return options;
        },
      },
    },
  },
});
