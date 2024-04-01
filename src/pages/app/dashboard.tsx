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
import { TaggyDropzone } from '@/components/ui'

function DashboardPage() {
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
              <TaggyDropzone />
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
          title={'Generate - Taggy'}
          pageDescription={
            'Enhance your visibility on social media by generating engaging captions and quotes based on your picture content.'
          }
          imageUrl={
            'https://kcucmyjfkamgodxkmurb.supabase.co/storage/v1/object/public/taggy-assets/og-image-updated.jpg?t=2023-08-24T16%3A25%3A57.112Z'
          }
        >
          {renderContent()}
        </AppLayout>
      ) : (
        <ScanningLayout
          title={'Taggy - Free generation'}
          pageDescription={
            'Enhance your visibility on social media by generating engaging captions and quotes based on your picture content.'
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

export default withTranslation(['common', 'home', 'footer', 'community'])(memo(DashboardPage))
