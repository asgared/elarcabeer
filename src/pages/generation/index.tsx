import { memo, useEffect, useState } from 'react'
import AppLayout from '@/components/layouts/AppLayout'
import ScanningLayout from '@/components/layouts/ScanningLayout'
import ScanningResult from '@/components/scanningResult/ScanningResult'
import ScanningLoading from '@/components/setupScanning/ScanningLoading'
import UploadingLoading from '@/components/setupScanning/UploadingLoading'
import TaggyError from '@/components/setupScanning/TaggyError'

import { withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useTaggyStore } from '@/store/taggyStore'

import { ImageStatus } from '@/types.d'
import { Center } from '@chakra-ui/react'
// import { TaggyDropzone } from '@/components/ui'

function GenerationPage() {
  const imageStatus = useTaggyStore(state => state.imageStatus)
  const [imageStatusState, setImageStatusState] = useState<ImageStatus>()

  useEffect(() => {
    setImageStatusState(imageStatus)
  }, [imageStatus])

  useEffect(() => {
    if (imageStatusState === ImageStatus.READY || imageStatusState === ImageStatus.DONE) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [imageStatusState])

  const renderContent = () => {
    switch (imageStatusState) {
      case ImageStatus.READY:
        return (
          <>
            <Center
              as='section'
              className='dropzone-section'
            >
              {/* <TaggyDropzone /> */}
            </Center>
          </>
        )
      case ImageStatus.DONE:
        return <ScanningResult />
      case ImageStatus.UPLOADING:
        return <UploadingLoading />
      case ImageStatus.SCANNING:
        return <ScanningLoading />
      case ImageStatus.ERROR:
        return <TaggyError />
      default:
        return null
    }
  }

  return (
    <>
      {imageStatusState === ImageStatus.READY || imageStatusState === ImageStatus.DONE ? (
        <AppLayout
          title={'Cervecería el Arca'}
          pageDescription={
            'En la cervecería artesanal El Arca, creamos cervezas únicas inspiradas en barcos legendarios de diferentes países. Nuestros productos son el resultado de años de experiencia y pasión por la elaboración de cerveza artesanal. Descubre nuestros tres estilos de cerveza y nuestras deliciosas galletas "Naufragio", hechas con cebada sobrante de la elaboración de la cerveza. ¡Ven y saborea la historia con nosotros!'
          }
          imageUrl={
            'https://kcucmyjfkamgodxkmurb.supabase.co/storage/v1/object/public/taggy-assets/og-image-updated.jpg?t=2023-08-24T16%3A25%3A57.112Z'
          }
        >
          {renderContent()}
        </AppLayout>
      ) : (
        <ScanningLayout
          title={'Cervecería el Arca'}
          pageDescription={
            'En la cervecería artesanal El Arca, creamos cervezas únicas inspiradas en barcos legendarios de diferentes países. Nuestros productos son el resultado de años de experiencia y pasión por la elaboración de cerveza artesanal. Descubre nuestros tres estilos de cerveza y nuestras deliciosas galletas "Naufragio", hechas con cebada sobrante de la elaboración de la cerveza. ¡Ven y saborea la historia con nosotros!'
          }
          imageUrl={
            'https://kcucmyjfkamgodxkmurb.supabase.co/storage/v1/object/public/taggy-assets/og-image-updated.jpg?t=2023-08-24T16%3A25%3A57.112Z'
          }
        >
          {renderContent()}
        </ScanningLayout>
      )}
    </>
  )
}

export const getStaticProps = async ({ locale = 'en' }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'home', 'footer', 'community'])),
    },
  }
}

export default withTranslation(['common', 'home', 'footer', 'community'])(memo(GenerationPage))
