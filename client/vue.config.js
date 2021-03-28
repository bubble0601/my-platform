module.exports = {
  outputDir: '../static',
  productionSourceMap: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    devtool: 'source-map',
  },

  transpileDependencies: [
    'vuetify'
  ],

  css: {
    loaderOptions: {
      scss: {
        additionalData: `
          @import "src/scss/mixins";
        `
      },
    },
  },
};
