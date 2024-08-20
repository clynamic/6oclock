import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "./api.yml",
    },
    output: {
      workspace: "./src/api",
      mode: "tags",
      target: "query.ts",
      schemas: "model",
      client: "react-query",
      urlEncodeParameters: true,
      prettier: true,
      override: {
        useDates: true,
        query: {
          useQuery: true,
          useMutation: true,
          useInfiniteQueryParam: "page",
        },
        mutator: {
          path: "../http/axios.ts",
          name: "makeRequest",
        },
        transformer: (options) => {
          // remove get prefix from operation name
          options = {
            ...options,
            operationName: options.operationName.replace(
              /^get(.)(.*)/,
              (_, firstChar, rest) => firstChar.toLowerCase() + rest
            ),
          };
          // enable infinite query for endpoints with pages
          if (options.queryParams?.schema.model.includes("page?: number;")) {
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
