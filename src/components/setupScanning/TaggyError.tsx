import { Button, Text, VStack } from '@chakra-ui/react'

import { useTranslation } from 'next-i18next'

import { useTaggyStore } from '@/store/taggyStore'

export default function TaggyError() {
  const setInitialState = useTaggyStore(state => state.setInitialState)
  const imageUploaded = useTaggyStore(state => state.detectionResult.secureUrl)

  const { t } = useTranslation()

  return (
    <VStack padding={12}>
      <Text
        fontSize={22}
        textAlign={'center'}
      >
        Oops, something went wrong. 😣
      </Text>
      {imageUploaded !== '' && <Text fontSize={'sm'}>It seems that we are having an excess of requests.</Text>}
      {imageUploaded === '' && (
        <Text fontSize={'sm'}>
          It seems that the image could not be uploaded, verify that it is in the correct format.
        </Text>
      )}
      <Button
        mt={6}
        onClick={() => {
          setInitialState()
        }}
      >
        {t('scanningArea.tryAgain')}
      </Button>
    </VStack>
  )
}
