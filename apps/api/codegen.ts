import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "**/schema.gql",
  generates: {
    "src/schema/resolvers-types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        avoidOptionals: {
          field: true,
          inputValue: true,
          object: true,
          defaultValue: true,
          resolvers: true,
        },
        contextType: "~/context#Context",
        strictScalars: true,
        scalars: {
          EmailAddress: "string",
        },
      },
    },
    "src/schema/generated.gql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
};
export default config;
