import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: './api.json',
    },
    output: {
      workspace: './src/api',
      mode: 'tags',
      schemas: 'model',
      target: 'api.ts',
      client: 'react-query',
      clean: true,
      urlEncodeParameters: true,
      prettier: true,
      override: {
        useDates: true,
        query: {
          useQuery: true,
          useMutation: true,
          useInfiniteQueryParam: 'page',
        },
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
          // enable infinite query for endpoints with pages
          if (options.queryParams?.schema.model.includes('page?: number;')) {
            options = {
              ...options,
              override: {
                ...options.override,
                query: {
                  ...options.override.query,
                  useInfinite: true,
                },
              },
            };
          }
          return options;
        },
      },
    },
  },
});
