// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	ssr: false,
	devtools: { enabled: false },
	compatibilityDate: '2024-11-01',
	css: ['@/assets/style/core.less'],
	app: {
		head: {
			titleTemplate: "Hello, I'm Louis Rozier",
			htmlAttrs: {
				lang: 'en'
			},
			meta: [
				{ name: 'description', content: '' }
			],
			link: [
				{
					rel: 'stylesheet',
					href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
				},
				{ rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
				{ rel: 'apple-touch-icon', href: '/apple-touch-icon-180x180.png' },
				{ rel: 'icon', href: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
				{ rel: 'icon', href: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
				{ rel: 'manifest', href: '/site.webmanifest' }
			],
		},
	},
	vue: {
		compilerOptions: {
			isCustomElement: (tag: string) => {
				return tag.startsWith('iconify-icon')
			},
		}
	},
	runtimeConfig: {
		weatherApiKey: ''
	}
})
