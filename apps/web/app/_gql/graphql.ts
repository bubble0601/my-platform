/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  /** A field whose value conforms to the standard internet email address format as specified in HTML Spec: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address. */
  EmailAddress: { input: string; output: string };
};

export type CreateUserInput = {
  email: Scalars["EmailAddress"]["input"];
  name?: InputMaybe<Scalars["String"]["input"]>;
  sub: Scalars["String"]["input"];
};

export type CreateUserResponse = {
  __typename?: "CreateUserResponse";
  ok?: Maybe<Scalars["Boolean"]["output"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  createUser?: Maybe<CreateUserResponse>;
};

export type MutationCreateUserArgs = {
  data: CreateUserInput;
};

export type Query = {
  __typename?: "Query";
  me?: Maybe<User>;
  user?: Maybe<User>;
  users?: Maybe<Array<Maybe<User>>>;
};

export type QueryUserArgs = {
  id: Scalars["ID"]["input"];
};

export type User = {
  __typename?: "User";
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
};

export type CreateUserMutationVariables = Exact<{
  email: Scalars["EmailAddress"]["input"];
  sub: Scalars["String"]["input"];
}>;

export type CreateUserMutation = {
  __typename?: "Mutation";
  createUser?: {
    __typename?: "CreateUserResponse";
    ok?: boolean | null;
  } | null;
};

export type GetProfileQueryVariables = Exact<{ [key: string]: never }>;

export type GetProfileQuery = {
  __typename?: "Query";
  me?: { __typename?: "User"; id: string; name: string } | null;
};

export const CreateUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "email" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "EmailAddress" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sub" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "data" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "email" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "email" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "sub" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "sub" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "ok" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateUserMutation, CreateUserMutationVariables>;
export const GetProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetProfile" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "me" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetProfileQuery, GetProfileQueryVariables>;
