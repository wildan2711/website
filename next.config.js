require('dotenv').config();

module.exports = {
    webpack(config) {
        config.module.rules.push(
            {
                test: /\.(png|svg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                        publicPath: '/_next/static/',
                        outputPath: 'static/',
                        name: '[name].[ext]'
                    }
                }
            },
            {
                test: /\.md$/,
                use: {
                    loader: 'raw-loader'
                }
            }
        );
        return config;
    },
    env: {
        SITE_URL: process.env.SITE_URL,
        DISQUS_SHORTNAME: process.env.DISQUS_SHORTNAME
    }
};
