import { useTranslation } from 'next-i18next'
import { Text, Center, useMediaQuery, VStack, Box } from '@chakra-ui/react'
import useTaggyDropzone from '@/hooks/useTaggyDropzone'
// import IconTaggyAddImage from '../../assets/taggyIcons/IconTaggyAddImage'
// import IconTaggyTriangle from '../../assets/taggyIcons/IconTaggyTriangle'
import styles from '@/styles/dropzone.module.css'
import animations from '@/styles/animations.module.css'

export default function TaggyDropzone() {
  const { getRootProps, getInputProps, isDragActive, isDragReject, isFileTooLarge } = useTaggyDropzone()

  const { t } = useTranslation()

  const [isDesktop] = useMediaQuery('(min-width: 769px)')

  return (
    <VStack>
      <Box
        id='taggy-dropzone__container'
        position={'relative'}
      >
        <Center
          w={`${isDesktop ? '484px' : '320px'}`}
          h={`${isDesktop ? '484px' : '320px'}`}
          mt={`${isDesktop ? 10 : '8rem'}`}
          mb={`${isDesktop ? 6 : '8rem'}`}
        >
          {/* <IconTaggyTriangle /> */}
          <div
            id='taggy-dropzone'
            {...getRootProps()}
            className={styles.dropzoneForm}
          >
            {/* <IconTaggyAddImage width='40px' /> */}
            <input
              {...getInputProps()}
              type='file'
            />
            <Text
              className={animations.scaleElement}
              fontSize={'xl'}
              fontWeight={'extrabold'}
              maxW={'140px'}
              textAlign={'center'}
              pointerEvents={'none'}
            >
              {!isDragActive && t('scanningArea.dropTapText')}
              {isDragActive && !isDragReject && "Drop it like it's hot!"}
              {isDragReject && 'File type not accepted, sorry!'}
              {isFileTooLarge && 'File is too large'}
            </Text>
          </div>
        </Center>
        <Box
          boxShadow='0 0 100px 60px rgba(255,255,255,0.2);'
          w={120}
          h={120}
          rounded={'50%'}
          position={'absolute'}
          top={'50%'}
          left={'50%'}
          transform={'translate(-50%, -50%)'}
          zIndex={'-100'}
        ></Box>
      </Box>
    </VStack>
  )
}
