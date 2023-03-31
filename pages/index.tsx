import { MainLayout, SecondLayout } from "@/components/layouts"
import { Home } from "@/components/home"

function HomePage() {
    const homeStatus = 'READY'

	const renderContent = () => {
		switch (homeStatus) {
			case 'READY':
				return <Home />
			default:
				return null
		}
	}

	return (
        <>
			{homeStatus === 'READY' ? (
				<MainLayout
                    title={"Cervecería artesanal El Arca | Sabores inspirados en la historia"}
					pageDescription={ "Descripción: En la cervecería artesanal El Arca, creamos cervezas únicas inspiradas en barcos legendarios de diferentes países. Nuestros productos son el resultado de años de experiencia y pasión por la elaboración de cerveza artesanal. Descubre nuestros tres estilos de cerveza y nuestras deliciosas galletas 'Naufragio', hechas con cebada sobrante de la elaboración de la cerveza. ¡Ven y saborea la historia con nosotros!" }
				>
					{renderContent()}
				</MainLayout>
			) : (
				<SecondLayout
					title={"Cervecería artesanal El Arca | Sabores inspirados en la historia"}
					pageDescription={
						"Test"
					}
				>
					{renderContent()}
				</SecondLayout>
			)}
		</>
	)
}

export default (HomePage)
