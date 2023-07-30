import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "src/modules/*/schema.gql",
  generates: {
    "src/modules/": {
      preset: "graphql-modules",
      presetConfig: {
        baseTypesPath: "../schema/types.ts",
        filename: "module-types.ts",
        useGraphQLModules: false,
        requireRootResolvers: true,
      },
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "~/context#Context",
        avoidOptionals: {
          field: true,
          inputValue: true,
          object: true,
          defaultValue: true,
          resolvers: true,
        },
        enumsAsTypes: true,
        useTypeImports: true,
        strictScalars: true,
        defaultScalarType: "unknown",
        scalars: {
          EmailAddress: "string",
        },
        mappers: {
          User: "~/db/types#User as UserModel",
        },
      },
    },
    "src/schema/schema.gql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
  },
  hooks: {
    afterAllFileWrite: ["prettier --write"],
  },
};
export default config;
