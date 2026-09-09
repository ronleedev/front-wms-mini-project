const { configure } = require('quasar/wrappers')

module.exports = configure(function () {
  return {
    boot: ['axios'],
    css: ['app.scss'],
    extras: ['roboto-font', 'material-icons'],
    build: {
      target: { browser: ['es2019'], node: 'node20' },
      vueRouterMode: 'hash'
    },
    devServer: {
      port: 9000,
      open: true
    },
    framework: {
      config: {},
      plugins: []
    }
  }
})
