import type { CodegenConfig } from "@graphql-codegen/cli";
import { envsafe, url } from "envsafe";

const env = envsafe({
  API_URL: url({
    default: "http://localhost:8080/graphql",
  }),
});

const config: CodegenConfig = {
  schema: env.API_URL,
  documents: ["app/**/*.ts", "app/**/*.tsx"],
  ignoreNoDocuments: true,
  errorsOnly: true,
  generates: {
    "./app/_gql/": {
      preset: "client",
      config: {
        scalars: {
          EmailAddress: "string",
        },
      },
    },
  },
  hooks: {
    afterAllFileWrite: ["prettier --write"],
  },
};
export default config;
