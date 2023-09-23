import { Preview } from "@storybook/react";
// @ts-ignore
import { themes } from "@storybook/theming";
import React from "react";
import "../app/globals.css";

window.React = React;

const preferDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

const preview: Preview = {
  parameters: {
    darkMode: {
      stylePreview: true,
      classTarget: "html",
      // storybook自体のthemeは固定する
      dark: preferDark ? themes.dark : themes.normal,
      light: preferDark ? themes.dark : themes.normal,
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
    backgrounds: {
      disable: true,
    },
  },
};

export default preview;
