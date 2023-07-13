// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt-alt/proxy'],
  css: [
    '~/assets/styles/main.scss',
    'bootstrap-icons/font/bootstrap-icons.scss',
  ],
  devServer: {
    port: 50051,
  },
  proxy: {
    proxies: {
      '^/api': {
        target: 'http://100.122.80.56:50050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
