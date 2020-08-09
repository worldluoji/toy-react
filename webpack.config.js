module.exports = {
    entry: './index.js',
    mode: 'development',
    optimization: {
        minimize: false
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [[
                            '@babel/plugin-transform-react-jsx', //babel处理jsx的插件
                            {pragma: 'ToyReact.createElement'}
                        ]]
                    }
                }
            }
        ]
    }
};