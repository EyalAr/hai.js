module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: [ 'mocha' ],

    files: [
        'node_modules/babel-core/browser-polyfill.js',
        'node_modules/phantomjs-polyfill/bind-polyfill.js',
        { pattern: 'test/test-context.js', watched: false },
        { pattern: 'test/**/*.html', watched: false, served: true, included: false },
        { pattern: 'test/**/*.less', watched: false, served: true, included: false },
    ],

    preprocessors: {
        'test/test-context.js': [ 'webpack' ]
    },

    webpack: {
        module: {
            loaders: [
                { test: /\.js/, exclude: /node_modules/, loader: 'babel-loader' }
            ]
        },
        watch: false
    },

    webpackServer: {
        noInfo: true
    },

    exclude: [],

    reporters: [ 'spec' ],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: [ 'PhantomJS' ],

    singleRun: true
  });
};
