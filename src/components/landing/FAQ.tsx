import NextLink from 'next/link'
import { useTranslation } from 'next-i18next'

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  HStack,
  Text,
  VStack,
} from '@chakra-ui/react'
import Title from './Title'

export default function FAQ() {
  const { t } = useTranslation('faq')
  const { t: tc } = useTranslation('common')

  return (
    <VStack
      w={'full'}
      mb={12}
    >
      <Title text={t('title')} />
      <Accordion
        allowToggle
        w={'full'}
      >
        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                {t('q1.question')}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel
            fontSize={{ base: 'sm', lg: 'md' }}
            pb={4}
          >
            {t('q1.answer')}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                {t('q2.question')}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel
            fontSize={{ base: 'sm', lg: 'md' }}
            pb={4}
          >
            {t('q2.answer')}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                {t('q3.question')}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel
            fontSize={{ base: 'sm', lg: 'md' }}
            pb={4}
          >
            {t('q3.answer')}
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                {t('q4.question')}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel
            fontSize={{ base: 'sm', lg: 'md' }}
            pb={4}
          >
            {t('q4.answer')}
            <Box mt={4}>
              <NextLink
                href='https://support.google.com/chrome/answer/9658361?hl=en&co=GENIE.Platform%3DAndroid'
                target='_blank'
                passHref
              >
                <Text textDecor={'underline'}>{t('howInstallPWA')}</Text>
              </NextLink>
            </Box>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                {t('q5.question')}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel
            fontSize={{ base: 'sm', lg: 'md' }}
            pb={4}
          >
            {t('q5.answer')}
            <HStack
              alignItems={'center'}
              mt={4}
            >
              <NextLink
                href='https://twitter.com/taggy_ai'
                target='_blank'
                passHref
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Text textDecor={'underline'}>@taggy_ai</Text>
              </NextLink>
            </HStack>
            <NextLink
              href='https://docs.google.com/forms/d/e/1FAIpQLSf7V_kD51kod0ar3pbnBZmZQ9x6OSoZCFb1BGE_Bbd3pbxovg/viewform?usp=sf_link'
              target='_blank'
              passHref
            >
              <Text textDecor={'underline'}>{tc('buttons.feedback')}</Text>
            </NextLink>
          </AccordionPanel>
        </AccordionItem>

        {/* <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                What happens if I exceed my generation limit on the free plan?
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel  fontSize={{ base: 'sm', lg: 'md' }} pb={4}>
            If you exceed your generation limit on the free plan, you will need to upgrade to the pro plan to continue
            generating quotes.
          </AccordionPanel>
        </AccordionItem> */}

        {/* <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                Can I give feedback or suggest new features?
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel  fontSize={{ base: 'sm', lg: 'md' }} pb={4}>
            Absolutely! I would love to hear your feedback and any suggestions you may have for new features. Please
            feel free to reach out to me on Twitter and I'll do my best to get back to you as soon as possible.
          </AccordionPanel>
        </AccordionItem> */}

        {/* <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                How can I see how many generations I have left on my plan?
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel  fontSize={{ base: 'sm', lg: 'md' }} pb={4}>
            The number of generations you have left is displayed next to the "Pricing" tab in the navigation bar at the
            top of the website.
          </AccordionPanel>
        </AccordionItem> */}

        {/* <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                Can I upgrade to the pro plan at any time?
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel  fontSize={{ base: 'sm', lg: 'md' }} pb={4}>
            Absolutely! I would love to hear your feedback and any suggestions you may have for new features. Please
            feel free to reach out to me on Twitter and I'll do my best to get back to you as soon as possible.Yes, you
            can upgrade from the free plan to the pro plan at any time by subscribing to the pro plan. If you switch
            from the free plan to the pro plan, you will immediately gain access to all of the features available to pro
            plan users.
          </AccordionPanel>
        </AccordionItem> */}

        {/* <AccordionItem>
          <h3>
            <AccordionButton>
              <Box
                as='span'
                flex='1'
                textAlign='left'
                fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
              >
                Can I cancel my subscription at any time?
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel  fontSize={{ base: 'sm', lg: 'md' }} pb={4}>
            Yes, you can cancel your subscription at any time by clicking the downgrade button on the free plan.
            However, the number of generations you have left will still be kept, so you can continue to use them.
          </AccordionPanel>
        </AccordionItem> */}
      </Accordion>
    </VStack>
  )
}
