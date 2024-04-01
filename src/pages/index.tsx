import { useRef } from 'react'
import { useRouter } from 'next/router'
import { useTranslation, withTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import { useInView } from 'framer-motion'

import { Box, Center, Text, VStack, Card, CardHeader, Heading, CardBody, CardFooter, Button } from '@chakra-ui/react'
// import LandingSection from '@/components/ui/LandingSection'
import LandingLayout from '@/components/layouts/LandingLayout'
// import MarqueeCard from '@/components/landing/MarqueeCard'
// import IconTaggy from '@/assets/taggyIcons/IconTaggy'
// import AsSeenOn from '@/components/landing/AsSeenOn'
// import Counters from '@/components/community/Counters'
// import FeatureCardH from '@/components/landing/FeatureCardH'
// import Title from '@/components/landing/Title'
import { FaMagic } from 'react-icons/fa'

import { useUserContext } from '@/hooks/useAuthUser'

import styles from '@/styles/section.module.css'

const LandingPage = () => {
  const userContext = useUserContext()
  const mySession = userContext?.session

  const { push } = useRouter()

  const { t } = useTranslation('landing')

  const sectionRef1 = useRef(null)
  const isInView1 = useInView(sectionRef1, { once: true })

  const sectionRef2 = useRef(null)
  const isInView2 = useInView(sectionRef2, { once: true })

  return (
    <LandingLayout
      title={'Cervecería El Arca | Home'}
      pageDescription={
        'En la cervecería artesanal El Arca, creamos cervezas únicas inspiradas en barcos legendarios de diferentes países. Nuestros productos son el resultado de años de experiencia y pasión por la elaboración de cerveza artesanal. Descubre nuestros tres estilos de cerveza y nuestras deliciosas galletas "Naufragio", hechas con cebada sobrante de la elaboración de la cerveza. ¡Ven y saborea la historia con nosotros!'
      }
      imageUrl={
        'https://kcucmyjfkamgodxkmurb.supabase.co/storage/v1/object/public/taggy-assets/og-image-updated.jpg?t=2023-08-24T16%3A25%3A57.112Z'
      }
    >
      {/* hero section  */}
      <Center
        as='section'
        px={4}
        className='sectionHeight'
        id='hero-section'
        width={['100%', '100%', '90%', '90%', '80%']}
        mt={'-56px'}
        position={'relative'}
        ref={sectionRef1}
      >
        <Box
          position={'absolute'}
          height={'80%'}
          width={{ base: '100%', lg: '80%' }}
          left={{ base: '0', lg: '10%' }}
          top={0}
          zIndex={'-1'}
          sx={{
            background:
              'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.6) 1%, rgb(255, 177, 199,0.6) 10%, rgb(159, 32, 83,0.6) 30%, #181818 50%)',
          }}
        />
        <Card
          id='bottom-landing-section-cta'
          bg={'transparent'}
          border={'none'}
          boxShadow={'none'}
          align='center'
          transform={'translateY(100px)'}
          opacity={0}
          sx={{
            transform: isInView1 ? 'none' : 'translateY(200px)',
            opacity: isInView1 ? 1 : 0,
            transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.3s',
          }}
        >
          <CardHeader p={0}>
            <Heading
              as={'h1'}
              color={'white'}
              fontSize={['5xl', '5xl', '5xl', '6xl', '7xl']}
              textAlign={'center'}
              fontWeight='extrabold'
              lineHeight={1.2}
              fontFamily='boston-heavy'
              mb={6}
              sx={{ textWrap: 'balance' }}
            >
              {t('mainSection.value')} <span style={{ fontSize: '40px' }}>🖼️</span>
            </Heading>
          </CardHeader>
          <CardBody
            p={0}
            mb={12}
          >
            <Text
              as={'h2'}
              fontSize={{ base: 'lg', lg: 'xl', xl: '2xl' }}
              textAlign={'center'}
              sx={{ textWrap: 'balance' }}
              w={'full'}
              maxW={'800px'}
            >
              {t('mainSection.description')} ✍️
            </Text>
          </CardBody>
          <CardFooter p={0}>
            <Button
              title='Generate now'
              size={'lg'}
              gap={2}
              display={'flex'}
              alignItems={'center'}
              fontSize={'md'}
              fontWeight={'bold'}
              fontFamily={'boston-heavy'}
              textTransform={'uppercase'}
              color={'taggyDark.100'}
              boxShadow='0px 4px 10px rgba(0,0,0,0.4)'
              sx={{
                backgroundImage: 'linear-gradient(to right, #ff9db9 0%, #ff3385  51%, #ff9db9  100%)',
                transition: '0.5s',
                backgroundSize: '200% auto',
              }}
              _hover={{
                backgroundPosition: 'right center',
              }}
              onClick={() => {
                push(`${!mySession ? '/freegeneration' : '/app/dashboard'}`)
              }}
            >
              <FaMagic /> {t('mainSection.cta')}
            </Button>
          </CardFooter>
        </Card>
      </Center>

      {/* community section  */}
      {/* <LandingSection
        id='community-section'
        bg='skewedDark'
      >
        <VStack
          width={'full'}
          gap={0}
        >
          <Title text={t('community.title')} />

          <Counters />
          <Box
            width={'full'}
            rounded={12}
            overflow={'hidden'}
            bg={'taggyDark.50'}
            border={'1px'}
            borderColor={'taggyDark.300'}
            boxShadow='0 6px 10px rgba(0,0,0,0.6)'
            p={4}
            mb={{ base: 6, lg: 12 }}
          >
            <Box
              rounded={6}
              overflow={'hidden'}
            >
              <MarqueeCard />
            </Box>
          </Box>

          <AsSeenOn />
        </VStack>
      </LandingSection> */}

      {/* steps  */}
      {/* <LandingSection
        id='upload-section'
        hf={false}
      >
        <Title text={t('howDoesItWorks')} />

        <VStack
          gap={{ base: 6, lg: 12 }}
          maxW={'4xl'}
          margin={'auto'}
          mb={12}
        >
          <Center>
            <FeatureCardH
              title={t('section1.title')}
              description={t('section1.description.text1')}
              image={'/images/landing/413shots_so.png'}
            />
          </Center>

          <Center>
            <FeatureCardH
              title={t('section2.title')}
              description={t('section2.description.text1')}
              image={'/images/landing/441shots_so.png'}
            />
          </Center>
          <Center>
            <FeatureCardH
              title={t('section3.title')}
              description={t('section3.description.text1')}
              image={'/images/landing/782shots_so.png'}
            />
          </Center>

          <Center>
            <FeatureCardH
              title={t('section4.title')}
              description={t('section4.description.text1')}
              image={'/images/landing/637shots_so.png'}
            />
          </Center>

          <Center>
            <FeatureCardH
              title={t('section5.title')}
              description={t('section5.description.text1')}
              image={'/images/landing/568shots_so.png'}
            />
          </Center>
        </VStack>
      </LandingSection> */}

      {/* bottom cta */}
      <Center
        as='section'
        id={'bottom-cta-section'}
        px={4}
        className='sectionHeight'
        position={'relative'}
        ref={sectionRef2}
      >
        <Box
          width={['100%', '100%', '90%', '80%']}
          margin={'auto'}
          pt={'3rem'}
          pb={'5rem'}
        >
          <Card
            id='bottom-landing-section-cta'
            bg={'transparent'}
            border={'none'}
            boxShadow={'none'}
            align='center'
            transform={'translateY(100px)'}
            opacity={0}
            sx={{
              transform: isInView2 ? 'none' : 'translateY(200px)',
              opacity: isInView2 ? 1 : 0,
              transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.3s',
            }}
          >
            <CardHeader p={0}>
              <Box
                margin={'auto'}
                mb={6}
                width={['70px', '70px', '80px', '90px']}
                height={['70px', '70px', '80px', '90px']}
                rounded={'50%'}
                bg={'taggyDark.50'}
                border={'1px'}
                borderColor={'taggyDark.300'}
              >
                {/* <IconTaggy /> */}
              </Box>
              <Heading
                as={'h3'}
                color={'white'}
                fontSize={['5xl', '5xl', '5xl', '6xl', '7xl']}
                textAlign={'center'}
                fontWeight='extrabold'
                lineHeight={1.2}
                fontFamily='boston-heavy'
                mb={6}
              >
                {t('ctaBottom.title')}
              </Heading>
            </CardHeader>
            <CardBody
              p={0}
              mb={12}
            >
              <Text
                fontSize={{ base: 'lg', lg: 'xl', xl: '2xl' }}
                textAlign={'center'}
                sx={{ textWrap: 'balance' }}
              >
                {t('ctaBottom.subtitle')}
              </Text>
            </CardBody>
            <CardFooter p={0}>
              <Button
                title='Generate now'
                size={'lg'}
                gap={2}
                display={'flex'}
                alignItems={'center'}
                fontSize={'md'}
                fontWeight={'bold'}
                fontFamily={'boston-heavy'}
                textTransform={'uppercase'}
                color={'taggyDark.100'}
                boxShadow='0px 4px 10px rgba(0,0,0,0.4)'
                sx={{
                  backgroundImage: 'linear-gradient(to right, #ff9db9 0%, #ff3385  51%, #ff9db9  100%)',
                  transition: '0.5s',
                  backgroundSize: '200% auto',
                }}
                _hover={{
                  backgroundPosition: 'right center',
                }}
                onClick={() => {
                  push(`${!mySession ? '/freegeneration' : '/app/dashboard'}`)
                }}
              >
                <FaMagic /> {t('mainSection.cta')}
              </Button>
            </CardFooter>
          </Card>
        </Box>
        <Box
          position={'absolute'}
          height={'100%'}
          width={{ base: '100%', lg: '80%' }}
          bottom={0}
          left={{ base: '0', lg: '10%' }}
          zIndex={'-1'}
          sx={{
            background:
              'radial-gradient(circle at 50% 100%, rgba(255,255,255,0.6) 1%, rgb(255, 177, 199,0.6) 10%, rgb(159, 32, 83,0.6) 30%, #181818 50%)',
          }}
        />
        <div className={`${styles.skewed} `} />
      </Center>
    </LandingLayout>
  )
}

export const getStaticProps = async ({ locale = 'en' }: any) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'home', 'footer', 'landing', 'community', 'faq'])),
    },
  }
}

export default withTranslation(['common', 'home', 'footer', 'landing', 'community', 'faq'])(LandingPage)
