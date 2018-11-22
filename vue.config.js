module.exports = {
	baseUrl: process.env.NODE_ENV === 'production' ? '/grid-demo/' : '/',
    configureWebpack: {
        output: {
            library: 'VueDynamicGrid',
            libraryExport: 'default'
        }
    },
    css: {
        extract: false
    }
}
