import { useTranslation } from 'next-i18next'

import { Text, VStack } from '@chakra-ui/react'
import IconTaggy from '../../assets/taggyIcons/IconTaggy'

import animations from '@/styles/animations.module.css'

export default function ScanningLoading() {
  const { t } = useTranslation()

  return (
    <VStack
      padding={12}
      as='section'
    >
      <IconTaggy
        className={animations.iconLoading}
        width={'150px'}
      />
      <Text
        fontSize={22}
        textAlign={'center'}
      >
        {t('scanningArea.scanning')}
      </Text>
    </VStack>
  )
}
