/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				display: ['Familjen Grotesk Variable', 'Familjen Grotesk', 'sans-serif'],
				sans: [
					'Instrument Sans Variable',
					'Instrument Sans',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'sans-serif'
				],
				mono: ['JetBrains Mono', 'Fira Mono', 'monospace']
			}
		}
	},
	plugins: [require('daisyui')],
	daisyui: {
		themes: [
			{
				aevani: {
					primary: '#2E6B4F',
					'primary-content': '#F4F1EA',
					secondary: '#1E4A36',
					'secondary-content': '#F4F1EA',
					accent: '#8FD8B4',
					'accent-content': '#14261B',
					neutral: '#14261B',
					'neutral-content': '#DCE6DD',
					'base-100': '#F4F1EA',
					'base-200': '#EDE7DA',
					'base-300': '#E3DBC9',
					'base-content': '#22362A',
					info: '#2A6480',
					'info-content': '#F4F1EA',
					success: '#2E6B4F',
					'success-content': '#F4F1EA',
					warning: '#B8860B',
					'warning-content': '#14261B',
					error: '#B4432E',
					'error-content': '#F4F1EA',
					'--rounded-btn': '10px',
					'--rounded-box': '16px',
					'--animation-btn': '0.25s',
					'--animation-input': '0.25s',
					'--btn-focus-scale': '0.98'
				}
			},
			{
				'aevani-dark': {
					primary: '#6FC79A',
					'primary-content': '#14261B',
					secondary: '#A8E6C8',
					'secondary-content': '#14261B',
					accent: '#8FD8B4',
					'accent-content': '#14261B',
					neutral: '#2A2A2A',
					'neutral-content': '#E8E5DE',
					'base-100': '#1A1A1A',
					'base-200': '#242424',
					'base-300': '#2E2E2E',
					'base-content': '#E8E5DE',
					info: '#3DB89A',
					'info-content': '#1A1A1A',
					success: '#4DA375',
					'success-content': '#1A1A1A',
					warning: '#E8B630',
					'warning-content': '#1A1A1A',
					error: '#C75B45',
					'error-content': '#F4F1EA',
					'--rounded-btn': '10px',
					'--rounded-box': '16px',
					'--animation-btn': '0.25s',
					'--animation-input': '0.25s',
					'--btn-focus-scale': '0.98'
				}
			}
		],
		darkTheme: 'aevani-dark',
		base: true,
		styled: true,
		utils: true,
		prefix: '',
		logs: true,
		themeRoot: ':root'
	}
};
