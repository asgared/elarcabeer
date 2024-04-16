import { useTranslation } from 'next-i18next'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Select,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react'

import { Actor, type ActorValue } from '@/types.d'

import { MdSettingsSuggest } from 'react-icons/md'
import { feelings, languages, personalities } from '@/data/config'

import { useUserContext } from '@/hooks/useAuthUser'
import { useConfigStore } from '@/store/configStore'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const actorValues: ActorValue[] = [
  {
    option: Actor.USER,
    value: 'Instagram user',
  },
  {
    option: Actor.CREATOR,
    value: 'Content Creator',
  },
  {
    option: Actor.COMPANY,
    value: 'Company',
  },
]

export default function GenerateConfiguration() {
  const { t } = useTranslation()
  const userContext = useUserContext()
  const { config, setConfig } = useConfigStore()

  const user = userContext?.user
  const { locale } = useRouter()

  useEffect(() => {
    const lang = languages.find(lang => lang.code === locale)
    setConfig({ language: lang?.nameInLanguage ?? 'English' })
  }, [locale, setConfig])

  return (
    <Accordion
      id='taggy-keywords-hashtags__container'
      allowMultiple
      w={'full'}
    >
      <AccordionItem>
        <AccordionButton
          id='taggy-result-controls__acordion-button'
          px={0}
          fontSize={'md'}
          fontWeight={'bold'}
        >
          <Box
            as='span'
            flex='2'
            textAlign='left'
          >
            <Flex
              gap={1}
              alignItems={'center'}
            >
              <MdSettingsSuggest fontSize={'1rem'} />
              {t('buttons.magicConfiguration')}
            </Flex>
          </Box>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel
          id='taggy-controls__acordion-content'
          p={0}
          pb={4}
        >
          <HStack
            justify={'space-between'}
            width={'full'}
          >
            <Box
              py={4}
              flex={1}
            >
              <Text
                mb={1}
                fontSize={'sm'}
              >
                {t('configurations.chooseLanguage')}
              </Text>
              <Select
                size='md'
                value={config.language}
                disabled={!user?.is_subscribed}
                onChange={ev => {
                  if (!user?.is_subscribed) return
                  setConfig({ language: ev.target.value })
                }}
              >
                {languages.map(l => (
                  <option
                    key={l.code}
                    value={l.nameInLanguage}
                  >
                    {`🌐`} {l.nameInLanguage}
                  </option>
                ))}
              </Select>
            </Box>
            <Box
              py={4}
              flex={1}
            >
              <Text
                mb={1}
                fontSize={'sm'}
              >
                {t('scanningResults.actAs')}
              </Text>
              <Select
                size='md'
                value={config.actor}
                onChange={ev => {
                  setConfig({ actor: ev.target.value as Actor })
                  window.localStorage.setItem('actor', ev.target.value)
                }}
              >
                {actorValues.map(a => (
                  <option
                    key={a.option}
                    value={a.option}
                  >
                    {`🗣️`} {t(`scanningResults.actor.${a.option}`)}
                  </option>
                ))}
              </Select>
            </Box>
          </HStack>

          <HStack
            justify={'space-between'}
            width={'full'}
          >
            <Box
              py={4}
              flex={1}
            >
              <Text
                mb={1}
                fontSize={'sm'}
              >
                {t('configurations.choosePersonality')}
              </Text>
              <Select
                size='md'
                disabled={!user?.is_subscribed}
                value={config.personality}
                onChange={ev => {
                  if (!user?.is_subscribed) return
                  setConfig({ personality: ev.target.value })
                }}
              >
                {personalities.map(l => (
                  <option
                    key={l.code}
                    value={l.name}
                  >
                    {l.icon} {l.name}
                  </option>
                ))}
              </Select>
            </Box>
            <Box
              py={4}
              flex={1}
            >
              <Text
                mb={1}
                fontSize={'sm'}
              >
                {t('configurations.chooseFeeling')}
              </Text>
              <Select
                size='md'
                disabled={!user?.is_subscribed}
                value={config.feeling}
                onChange={ev => {
                  if (!user?.is_subscribed) return
                  setConfig({ feeling: ev.target.value })
                }}
              >
                {feelings.map(a => (
                  <option
                    key={a.code}
                    value={a.name}
                  >
                    {a.icon} {a.name}
                  </option>
                ))}
              </Select>
            </Box>
          </HStack>

          <HStack
            justify={'space-between'}
            width={'full'}
          >
            <Box
              py={4}
              flex={1}
            >
              <Text mb={1}>{t('configurations.location')}</Text>
              <Textarea
                rows={4}
                maxLength={32}
                readOnly={!user?.is_subscribed}
                value={config.location}
                placeholder={t('configurations.placeholderLocation') ?? ''}
                onChange={ev => {
                  if (!user?.is_subscribed) return
                  setConfig({ location: ev.target.value })
                }}
              />
            </Box>
            <Box
              py={4}
              flex={1}
            >
              <Text mb={1}>{t('configurations.occasion')} </Text>
              <Textarea
                rows={4}
                maxLength={32}
                readOnly={!user?.is_subscribed}
                value={config.occasion}
                placeholder={t('configurations.placeholderOccasion') ?? ''}
                onChange={ev => {
                  if (!user?.is_subscribed) return
                  setConfig({ occasion: ev.target.value })
                }}
              />
            </Box>
          </HStack>

          <HStack
            justify={'space-between'}
            width={'full'}
          >
            <Box
              py={4}
              flex={1}
            >
              <Text mb={1}>{t('configurations.additionalContext')}</Text>
              <Textarea
                rows={4}
                maxLength={32}
                readOnly={!user?.is_subscribed}
                value={config.additionalContext}
                placeholder={t('configurations.placeholderAdditionalContext') ?? ''}
                onChange={ev => {
                  if (!user?.is_subscribed) return
                  setConfig({ additionalContext: ev.target.value })
                }}
              />
            </Box>
            <Box
              py={4}
              flex={1}
            >
              <FormControl
                display='flex'
                alignItems='center'
              >
                <FormLabel
                  htmlFor='email-alerts'
                  mb='0'
                >
                  {t('configurations.tweetFormat')}
                </FormLabel>
                <Switch
                  id='twitter format'
                  disabled={!user?.is_subscribed}
                  size={'sm'}
                  onChange={ev => {
                    if (!user?.is_subscribed) return
                    setConfig({ tweetFormat: ev.target.checked })
                  }}
                />
              </FormControl>
            </Box>
          </HStack>

          {!user.is_subscribed && (
            <Text
              fontSize={'sm'}
              color={'taggyDark.600'}
            >
              {t('configurations.configurationsMsg')}
            </Text>
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
