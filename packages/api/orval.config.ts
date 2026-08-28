import { InputTransformerFn, defineConfig } from 'orval';

import { POST_FORMAT } from './src/api/http/format';

interface Node {
  $ref?: string;
  items?: Node;
  oneOf?: unknown[];
  parameters?: unknown[];
  type?: string;
  properties?: Record<string, Node>;
  components?: {
    schemas?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
  };
  [key: string]: unknown;
}

const isObject = (value: unknown): value is Node =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const refName = (value: unknown): string | undefined =>
  typeof value === 'string' ? value.split('/').pop() : undefined;

// Query parameters the request interceptor owns. They must not reach callers,
// or a caller could ask for a format the response type does not describe.
const PINNED_PARAMS = ['PostV2Flag', 'PostV2Mode'];

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
  const name = `${refName(item.items.$ref)}List`;
  schemas[name] ??= { type: 'array', items: { $ref: item.items.$ref } };
  return { $ref: `#/components/schemas/${name}` };
};

// The spec documents every response format the API can return, keyed by the
// `x-format` and `x-mode` markers on each oneOf branch. This client speaks one
// of them, pinned by POST_FORMAT and enforced at runtime by postFormatInterceptor.
const selectFormat: InputTransformerFn = (spec) => {
  const root = spec as unknown as Node;
  const components = (root.components ??= {});
  const schemas = (components.schemas ??= {});

  let selected = 0;

  const pick = (branches: unknown[]): unknown => {
    const marked = branches.filter(
      (b) => isObject(b) && typeof b['x-format'] === 'string',
    );
    if (!marked.length) return undefined;
    const ofFormat = marked.filter(
      (b) => isObject(b) && b['x-format'] === POST_FORMAT.format,
    );
    const exact = ofFormat.find(
      (b) => isObject(b) && b['x-mode'] === POST_FORMAT.mode,
    );
    const modeless = ofFormat.find((b) => isObject(b) && !('x-mode' in b));
    return exact ?? modeless;
  };

  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) return node.map(walk);
    if (!isObject(node)) return node;

    if (Array.isArray(node.oneOf)) {
      const chosen = pick(node.oneOf);
      if (chosen && isObject(chosen)) {
        selected++;
        const {
          'x-format': _f,
          'x-mode': _m,
          'x-wrapper': _w,
          ...rest
        } = chosen;
        return registerArrayComponent(schemas, walk(rest));
      }
    }

    if (Array.isArray(node.parameters)) {
      node.parameters = node.parameters.filter(
        (p) => !(isObject(p) && PINNED_PARAMS.includes(refName(p.$ref) ?? '')),
      );
    }

    for (const key of Object.keys(node)) node[key] = walk(node[key]);
    return node;
  };

  walk(root);

  // Reachability decides, so a shape a non-v2 endpoint still uses survives.
  const schemasRecord = schemas as Record<string, unknown>;
  const reachable = new Set<string>();
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isObject(node)) return;
    if (typeof node.$ref === 'string') {
      const name = refName(node.$ref);
      if (name && !reachable.has(name)) {
        reachable.add(name);
        visit(schemasRecord[name]);
      }
    }
    for (const [key, value] of Object.entries(node)) {
      if (key !== '$ref') visit(value);
    }
  };
  visit(root['paths']);

  for (const name of Object.keys(schemasRecord)) {
    if (!reachable.has(name)) delete schemasRecord[name];
  }

  const parameters = components.parameters;
  if (isObject(parameters)) {
    for (const name of Object.keys(parameters)) {
      if (!reachable.has(name))
        delete (parameters as Record<string, unknown>)[name];
    }
  }

  if (selected === 0) {
    throw new Error(
      'no response format was selected; are the x-format markers present?',
    );
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
        transformer: selectFormat,
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
        // The default header injects info.description into all 361 files, raw
        // and unprefixed, which is malformed inside a JSDoc block.
        header: (info) => [
          'Generated by orval. Do not edit manually.',
          info.title,
          `e621ng ${info.version}`,
        ],
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
