import { memo, useEffect, useState } from 'react'

// import ScanningResult from '@/components/scanningResult/ScanningResult'
// import ScanningLoading from '@/components/setupScanning/ScanningLoading'
// import UploadingLoading from '@/components/setupScanning/UploadingLoading'
// import TaggyError from '@/components/setupScanning/TaggyError'

import { withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useTaggyStore } from '@/store/taggyStore'

import { ImageStatus } from '@/types.d'
import { Center } from '@chakra-ui/react'
// import { TaggyDropzone } from '@/components/ui'
// import { Demos } from '@/components/home'
import AppLayout from '@/components/layouts/AppLayout'
// import ScanningLayout from '@/components/layouts/ScanningLayout'

function HomePage() {
  const imageStatus = useTaggyStore(state => state.imageStatus)
  const [imageStatusState, setImageStatusState] = useState<ImageStatus>()

  useEffect(() => {
    setImageStatusState(imageStatus)
  }, [imageStatus])

  useEffect(() => {
    if (imageStatusState === ImageStatus.READY) {
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
            <Center
              as='section'
              className='demos-section'
            >
              {/* <Demos /> */}
            </Center>
          </>
        )
      // case ImageStatus.DONE:
      //   return <ScanningResult />
      // case ImageStatus.UPLOADING:
      //   return <UploadingLoading />
      // case ImageStatus.SCANNING:
      //   return <ScanningLoading />
      // case ImageStatus.ERROR:
      //   return <TaggyError />
      // default:
      //   return null
    }
  }

  return (
    <>
      {imageStatusState === ImageStatus.READY || imageStatusState === ImageStatus.DONE ? (
        <AppLayout
          title={'El Arca Beer'}
          pageDescription={'Find the right text for your posts based on the content of your photo.'}
        >
          {renderContent()}
        </AppLayout>
      ) : (
        <AppLayout title={''} pageDescription={''}>
          {/* <ScanningLayout
            title={'Taggy'}
            pageDescription={'Find the right text for your posts based on the content of your photo.'}
          >
            {renderContent()}
          </ScanningLayout> */}
          {renderContent()}
        </AppLayout>
      )}
    </>
  )
}

export const getStaticProps = async ({ locale = 'en' }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'home', 'footer'])),
    },
  }
}

export default withTranslation(['common', 'home', 'footer'])(memo(HomePage))
