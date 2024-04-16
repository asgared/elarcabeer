import { useTranslation } from 'next-i18next'

import {
  Button,
  Flex,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from '@chakra-ui/react'
import IconTaggyDownloadImage from '@/assets/taggyIcons/IconTaggyDownloadImage'
import IconTaggyRectangle from '@/assets/taggyIcons/IconTaggyRectangle'
import IconTaggySquareImage from '@/assets/taggyIcons/IconTaggySquareImage'

import { TaggyImageCropType } from '@/types.d'

import { FaImage } from 'react-icons/fa'
import ButtonTaggyGhost from '@/components/ui/ButtonTaggyGhost'

interface Props {
  imgSrc: string
  scale: number
  rotate: number
  editImage: boolean
  imageCropSelected: TaggyImageCropType
  setScale: (value: number) => void
  setRotate: (value: number) => void
  setImageCropSelected: (value: TaggyImageCropType) => void
  saveImage: () => void
  setEditImage: (value: boolean) => void
}

export default function ControlsImage({
  scale,
  rotate,
  imageCropSelected,
  editImage,
  setImageCropSelected,
  setScale,
  setRotate,
  saveImage,
  setEditImage,
}: Props) {
  const { t } = useTranslation()

  return (
    <Accordion
      id='taggy-edit-image__container'
      allowMultiple
    >
      <AccordionItem>
        <AccordionButton
          id='taggy-edit-image__acordion-button'
          px={0}
          fontWeight={'bold'}
          onClick={() => {
            setEditImage(!editImage)
          }}
        >
          <Box
            as='span'
            flex='2'
            textAlign='left'
          >
            <Flex
              gap={2}
              alignItems={'center'}
            >
              <FaImage fontSize={'0.8rem'} />
              {t('buttons.editImage')}
            </Flex>
          </Box>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel
          id='taggy-edit-image__acordion-content'
          py={8}
        >
          <Flex
            gap={6}
            justifyContent={'space-between'}
            mb={2}
          >
            <Flex gap={2}>
              <Button
                variant='unstyled'
                onClick={() => {
                  setImageCropSelected(TaggyImageCropType.SQUARECROP)
                }}
              >
                <IconTaggySquareImage
                  fill={imageCropSelected === TaggyImageCropType.SQUARECROP ? '#E0E0E0' : '#3a3a3a'}
                  width='30px'
                />
              </Button>
              <Button
                variant='unstyled'
                onClick={() => {
                  setImageCropSelected(TaggyImageCropType.VERTICALCROP)
                }}
              >
                <IconTaggyRectangle
                  fill={imageCropSelected === TaggyImageCropType.VERTICALCROP ? '#E0E0E0' : '#3a3a3a'}
                  width='30px'
                />
              </Button>
            </Flex>

            <ButtonTaggyGhost
              id={'save-image'}
              handleClick={saveImage}
            >
              <IconTaggyDownloadImage
                width={'1rem'}
                color='#ff9db9'
              />
              {t('buttons.saveImage')}
            </ButtonTaggyGhost>
          </Flex>
          <Box>
            <label htmlFor='scale-input'>{t('scanningResults.scale')}: </label>
            <Slider
              boxShadow='lg'
              min={1}
              max={4}
              step={0.1}
              value={scale}
              defaultValue={4}
              onChange={ev => {
                setScale(Number(ev))
              }}
            >
              <SliderTrack bg='taggyGray.500'>
                <SliderFilledTrack bg='taggySecondary.500' />
              </SliderTrack>
              <SliderThumb
                fontSize='sm'
                width='12px'
                height='12px'
                bg='taggySecondary.500'
                boxShadow='lg'
                _focus={{ boxShadow: 'outline' }}
              />
            </Slider>
          </Box>
          <Box>
            <label htmlFor='rotate-input'>{t('scanningResults.rotate')}: </label>
            <Slider
              boxShadow='lg'
              min={-180}
              max={180}
              step={1}
              value={rotate}
              onChange={ev => {
                setRotate(Math.min(180, Math.max(-180, Number(ev))))
              }}
            >
              <SliderTrack bg='taggyGray.500'>
                <SliderFilledTrack bg='taggySecondary.500' />
              </SliderTrack>
              <SliderThumb
                fontSize='sm'
                width='12px'
                height='12px'
                bg='taggySecondary.500'
                boxShadow='lg'
                _focus={{ boxShadow: 'outline' }}
              />
            </Slider>
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
}
