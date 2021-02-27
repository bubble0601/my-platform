module.exports = {
  outputDir: 'static',
  productionSourceMap: process.env.NODE_ENV !== 'production',
  configureWebpack: {
    devtool: 'source-map',
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "src/scss/mixins";
        `
      },
    },
  },
};
