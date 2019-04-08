const withCSS = require('@zeit/next-css')
const withTypescript = require('@zeit/next-typescript')
const withPlugins = require('next-compose-plugins')

module.exports = withTypescript(
    withCSS({
        webpack(config, options) {
            config.module.rules.push({
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 100000
                    }
                }
            })

            return config
        }
    })
)
