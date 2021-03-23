const pathResolver = require('path').resolve
const HTML = require('html-webpack-plugin')



module.exports = {
    entry: './src/index',
    output: {
        filename: 'js/[name].js',
        path: '/public',
        publicPath: '/'
    },
    devServer: {
        open: true,
        port: 1001,
        proxy: {

        }
    },
    module: {
        rules: [
            {
                test: /\.(tsx|ts)$/,
                loader: 'awesome-typescript-loader'
            },
            {
                test: /\.(cht)$/,
                loader: pathResolver('./loader/echart-loader')
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true
                        }
                    },
                    'less-loader'
                ]
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.ts', '.tsx'],
        alias: {
            '@src': pathResolver(__dirname, 'src')
        }
    },
    plugins: [
        new HTML({
            template: './public/index.html'
        })
    ]
}