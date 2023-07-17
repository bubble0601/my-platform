import type { CodegenConfig } from "@graphql-codegen/cli";
import { envsafe, url } from "envsafe";

const env = envsafe({
  API_URL: url({
    devDefault: "http://localhost:8080",
  }),
});

const config: CodegenConfig = {
  schema: `${env.API_URL}/graphql`,
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
};
export default config;
