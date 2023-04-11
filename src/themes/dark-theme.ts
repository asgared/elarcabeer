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
			900: "#f2b826",
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
		textBtn: {
			900: "#808080",
		},
	},
	fonts: {
		body: 'optima-medium',
		heading: 'optima-medium',
	  },
})

export default theme
