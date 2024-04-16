import { Card, CardBody, SimpleGrid, Box, useMediaQuery, CardFooter, Flex } from '@chakra-ui/react'
import CategorizationResult from './categorizationResult/CategorizationResult'

import TaggyResultMobile from './categorizationResult/CategorizationResultMobile'

import { useTaggyStore } from '@/store/taggyStore'
import ButtonTaggySimple from '@/components/ui/ButtonTaggySimple'
import IconTaggyAddImage from '@/assets/taggyIcons/IconTaggyAddImage'
import { useTranslation } from 'next-i18next'
import GenerateConfiguration from '@/components/scanningResult/categorizationResult/GenerateConfiguration'
import ImageCropResult from './imageResult/ImageCropResult'
import TaggyTabs from './TaggyTabs'
import { useConfigStore } from '@/store/configStore'

export default function ScanningResult() {
  const setInitialState = useTaggyStore(state => state.setInitialState)
  const setInitailStateConfig = useConfigStore(state => state.setInitialState)
  const { t } = useTranslation()

  const [isDesktop] = useMediaQuery('(min-width: 769px)')

  return (
    <>
      <Box w={'full'}>
        <SimpleGrid
          spacing={12}
          templateColumns='repeat(auto-fill, minmax(375px, 1fr))'
        >
          <Card
            id='taggy-image-section'
            as={'section'}
            rounded={{ base: 0, md: 6 }}
            bg={'taggyDark.50'}
            border={'1px'}
            borderColor={'taggyDark.300'}
            borderLeftColor={{ base: 'taggyDark.50', md: 'taggyDark.300' }}
            borderRightColor={{ base: 'taggyDark.50', md: 'taggyDark.300' }}
            height={'min-content'}
          >
            <CardBody
              p={`${isDesktop ? 6 : 4}`}
              pb={0}
            >
              <ImageCropResult />

              <Box id='taggy-generate__container'>
                {!isDesktop && <TaggyResultMobile />}
                <GenerateConfiguration />
                <TaggyTabs />
              </Box>
            </CardBody>
            <CardFooter
              display={'flex'}
              justifyContent={'flex-end'}
              pt={0}
              p={`${isDesktop ? 6 : 4}`}
            >
              <Flex
                w={'full'}
                justifyContent={'flex-end'}
                // borderTop={'1px'}
                // borderColor={'whiteAlpha.300'}
                pt={2}
              >
                <ButtonTaggySimple
                  id='upload-new-image'
                  handleClick={() => {
                    setInitialState()
                    setInitailStateConfig()
                  }}
                >
                  <IconTaggyAddImage
                    width='1rem'
                    color='#ff9db9'
                  />
                  {t('buttons.newImage')}
                </ButtonTaggySimple>
              </Flex>
            </CardFooter>
          </Card>

          {isDesktop && (
            <Box
              id='taggy-tags-section'
              as={'section'}
              bg={'transparent'}
              mb={12}
            >
              <CategorizationResult />
            </Box>
          )}
        </SimpleGrid>
      </Box>
      {/* <FloatButtonRegenerate />
      <FloatButton /> */}
    </>
  )
}
