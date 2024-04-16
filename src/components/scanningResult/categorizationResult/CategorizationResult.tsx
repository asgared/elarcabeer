import { useTranslation } from 'next-i18next'

import { Box, Button, Flex, Heading, HStack, Tooltip, useMediaQuery } from '@chakra-ui/react'
import TaggyList from './TaggyList'
import TaggyListKeywords from './TaggyListKeywords'

import { InfoIcon } from '@chakra-ui/icons'
import TaggyCopyToClipboardSimple from '@/components/ui/TaggyCopyToClipboardSimple'
import { useUserContext } from '@/hooks/useAuthUser'
import { useTaggyStore } from '@/store/taggyStore'

import styles from '../../../styles/animations.module.css'

export default function CategorizationResult() {
  const userContext = useUserContext()
  const user = userContext?.user
  const keywordsDetected = useTaggyStore(state => state.detectionResult.keywordsDetected)

  const [isDesktop] = useMediaQuery('(min-width: 769px)')

  const { t } = useTranslation()

  return (
    <>
      <Box mb={12}>
        <Flex
          justifyContent={'center'}
          alignItems={'center'}
          pb={`${isDesktop ? 4 : 2}`}
        >
          <Heading
            as={'h2'}
            fontSize={{ base: 'md', lg: 'xl' }}
            textAlign={'center'}
            fontWeight={'bold'}
            fontFamily='boston-bold'
            textTransform={'uppercase'}
          >
            <Tooltip
              hasArrow
              label={t('tooltip.keywords')}
              placement={`${isDesktop ? 'right' : 'bottom'}`}
              bg='#e6e6e6'
            >
              <Button
                variant='unstyled'
                size={'sm'}
              >
                <InfoIcon
                  fontSize={'18px'}
                  color='taggySecondary.500'
                  className={`${styles.blob}`}
                />
              </Button>
            </Tooltip>
            {t('scanningResults.keywordsDetected')}
          </Heading>
        </Flex>
        <TaggyListKeywords />
        {user.is_subscribed && (
          <HStack
            mt={2}
            justifyContent={'flex-end'}
          >
            <TaggyCopyToClipboardSimple
              text={keywordsDetected?.join(', ')}
              id={'tags-detected'}
              buttonText={t('buttons.copyKeywords')}
            />
          </HStack>
        )}
      </Box>
      <Box>
        <Flex
          justifyContent={'center'}
          alignItems={'center'}
          pb={`${isDesktop ? 4 : 2}`}
        >
          <Heading
            as={'h2'}
            fontSize={{ base: 'md', lg: 'xl' }}
            textAlign={'center'}
            fontWeight={'bold'}
            fontFamily='boston-bold'
            textTransform={'uppercase'}
          >
            {t('scanningResults.suggestedHashtags')}
          </Heading>
        </Flex>
        <TaggyList />
      </Box>
    </>
  )
}
