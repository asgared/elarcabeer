import { extendTheme, type ThemeConfig } from "@chakra-ui/react"

const config: ThemeConfig = {
	initialColorMode: "dark",
	useSystemColorMode: false,
}

const theme = extendTheme({
	config,
	styles: {
		global: () => ({
			body: {
				bg: "#1A1A1A",
				fontFamily: "optima-medium",
			},
		}),
	},
	colors: {
		arcaPrimary: {
			900: "#f7be00",
		},
		arcaSecondary: {
			900: "#5EAD27",
		},
		arcaTertiary: {
			900: "#245484",
		},
		arcaText: {
			900: "#e6e6e6",
		},
		arcaGray: {
			100: "#7F7F7F",
			500: "#464646",
			900: "#1A1A1A",
		},
		arcaCardBg: {
			900: "#222222",
		},
		arcaDisabled: {
			900: "#385425",
		},
		// textBtn: {
		// 	900: "#808080",
		// },
		taggyPrimary: {
			100: '#f7be00',
			200: '#f7d033',
			300: '#f7d95a',
			400: '#f7e281',
			500: '#f7e795',
			600: '#f7eba9',
			900: '#f7f4d0',
		},
		taggySecondary: {
			100: '#3385ff',
			200: '#5a91ff',
			300: '#769eff',
			400: '#8dabff',
			500: '#8dabff',
			600: '#a2b9ff',
			900: '#b6c6ff',
		},
		taggyTertiary: {
			900: '#85FF33',
		},
		taggyText: {
			900: '#E0E0E0',
		},
		taggyDark: {
			50: '#090909',
			100: '#272727',
			200: '#353535',
			300: '#444444',
			400: '#535353',
			500: '#626262',
			600: '#717171',
		},
		taggyGray: {
			100: '#B8B8B8',
			500: '#949494',
			700: '#272727',
			900: '#181818',
		},
		taggyDisabledPrimary: {
			// 900: '#f7be00',
			900: '#c49700',
		},
		taggyDisabledTertiary: {
			900: '#2664BF',
		},
		taggyDisabled: {
			900: '#539F20',
		},
		textBtn: {
			900: '#f7be00',
		},
		taggyTags: {
		900: '#111111',
		100: '#3e3e3e',
		},
	},
	fonts: {
		body: 'optima-medium',
		heading: 'optima-medium',
	  },
})

export default theme
