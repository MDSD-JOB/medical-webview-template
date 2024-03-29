const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin

const resolve = dir => path.join(__dirname, dir)
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV)
const IS_TEST = ['test'].includes(process.env.NODE_ENV)

module.exports = {
  // 输出文件目录
  publicPath: IS_PROD ? './' : '/',
  // 'dist', 生产环境构建文件的目录
  outputDir: process.env.outputDir || 'dist',
  // 相对于outputDir的静态资源(js、css、img、fonts)目录
  assetsDir: '',
  configureWebpack: config => {
    const plugins = []
    if (IS_TEST) {
      return {
        devtool: 'nosources-source-map'
      }
    }

    config.devtool = IS_PROD ? false : 'source-map'
    config.plugins = [...config.plugins, ...plugins]
  },
  chainWebpack: config => {
    config.entry.app = ['./src/main.js']

    // 修复HMR
    config.resolve.symlinks(true)

    config.module
      .rule('js')
      .test(/\.(js|jsx)$/)
      .exclude.add([/@babel(?:\/|\\{1,2})runtime|core-js/])
      .end()
      .use('babel-loader')
      .loader('babel-loader')
      .options({
        babelrc: false,
        configFile: path.resolve(__dirname, 'babel.config.js'),
        compact: false,
        cacheDirectory: true,
        sourceMaps: false
      })
      .end()

    config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/icons'))
      .end()

    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })

    config.resolve.alias
      .set('vue$', 'vue/dist/vue.esm.js')
      .set('@$', resolve('src'))
      .set('@assets', resolve('src/assets'))
      .set('@components', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@utils', resolve('src/utils'))
      .set('@config', resolve('src/config'))
      .set('@layouts', resolve('src/layouts'))
      .set('@store', resolve('src/store'))
      .set('@mixins', resolve('src/mixins'))

    config
      .plugin('ignore')
      .use(
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /zh-cn$/)
      )

    if (process.env.IS_ANALYZ) {
      config.plugin('webpack-report').use(BundleAnalyzerPlugin, [
        {
          analyzerMode: 'static'
        }
      ])
    }

    if (IS_PROD) {
      config.optimization.splitChunks({
        cacheGroups: {
          utils: {
            name: 'chunk-utils',
            test: /[\\/]src[\\/](components|utils|services)/,
            priority: 8,
            chunks: 'all',
            minChunks: 2
          },
          commons: {
            name: 'chunk-commons',
            test: /[\\/]src/,
            priority: 4,
            chunks: 'all',
            minChunks: 2
          },
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'all'
          },
          vantUI: {
            name: 'chunk-vantUI',
            test: /[\\/]node_modules[\\/]vant[\\/]/,
            priority: 20
          }
        }
      })
      config.optimization.minimizer([
        new TerserPlugin({
          // 多进程
          parallel: true,
          sourceMap: !IS_PROD,
          terserOptions: {
            ecma: 5,
            warnings: false,
            parse: {},
            compress: {
              drop_console: true,
              drop_debugger: true,
              pure_funcs: ['console.log']
            }
          }
        })
      ])
    }

    return config
  },
  css: {
    modules: false,
    extract: IS_PROD,
    sourceMap: false,
    loaderOptions: {
      css: {}
    }
  },
  // Babel 显式转译一个依赖，可以在 transpileDependencies选项中列出来
  transpileDependencies: [],
  lintOnSave: true,
  // 控制是否在生产环境下生成map文件
  productionSourceMap: !IS_PROD,
  devServer: {
    open: true,
    hotOnly: true
  },
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'less',
      patterns: [path.resolve(__dirname, 'src/assets/styles/variables.less')]
    }
  }
}
