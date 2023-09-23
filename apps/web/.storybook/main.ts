import type { StorybookConfig } from "@storybook/react-webpack5";
import path from "node:path";

const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-webpack5",
    options: {
      builder: {
        useSWC: true,
      },
    },
  },
  stories: ["../app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: "@storybook/addon-styling",
      options: {
        // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
        // For more details on this addon's options.
        postCss: {
          implementation: require.resolve("postcss"),
        },
      },
    },
    "sb-addon-permutation-table",
    "storybook-dark-mode",
  ],
  docs: {
    autodocs: false,
  },
  staticDirs: ["../public"],
  webpackFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "~": path.resolve(__dirname, "../app"),
      },
    };
    return config;
  },
};

export default config;
