/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop, type Crop, type PixelCrop } from 'react-image-crop'
// import { buildUrl } from 'cloudinary-build-url'

import { AspectRatio, Box, useMediaQuery } from '@chakra-ui/react'
import ControlsImage from './ControlsImage'

import { useTaggyStore } from '@/store/taggyStore'

import { taggyParams } from '@/services/cloudinary'

import { TaggyImageCropType, TaggyImageType } from '@/types.d'

import 'react-image-crop/dist/ReactCrop.css'
import { useDebounceEffect } from './useDebounceEffect'
import { canvasPreview } from './canvasPreview'

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 100,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function ImageCropResult() {
  const [isDesktop] = useMediaQuery('(min-width: 769px)')
  const [imageCropSelected, setImageCropSelected] = useState(TaggyImageCropType.SQUARECROP)
  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [aspect, setAspect] = useState<number | undefined>(undefined)

  const [editImage, setEditImage] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const blobUrlRef = useRef('')
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null)

  const detectionResult = useTaggyStore(state => state.detectionResult)

  useEffect(() => {
    if (imgRef.current != null) {
      const ar = imageCropSelected === TaggyImageCropType.SQUARECROP ? 1 / 1 : 4 / 5
      const { width, height } = imgRef.current

      const y = imageCropSelected === TaggyImageCropType.SQUARECROP ? (height - width) / 2 : height

      setAspect(ar)
      setCrop(centerAspectCrop(width, height, ar))
      setCompletedCrop({
        unit: 'px',
        x: 0,
        y,
        width,
        height: width,
      })
    }
  }, [imageCropSelected, editImage])

  useEffect(() => {
    if (imgRef.current != null) {
      const { width, height } = imgRef.current
      const y = imageCropSelected === TaggyImageCropType.SQUARECROP ? (height - width) / 2 : 0
      const customHeight = imageCropSelected === TaggyImageCropType.SQUARECROP ? width : height

      setCompletedCrop({
        unit: 'px',
        x: 0,
        y,
        width,
        height: customHeight,
      })
    }
  }, [imageCropSelected, crop])

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }
  }

  // const myBuildUrl = useCallback(
  //   (imageType: TaggyImageType) => {
  //     const imageParams = taggyParams()
  //     const paramValue = imageParams[imageType]

  //     return buildUrl(detectionResult.publicId, {
  //       cloud: {
  //         cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  //       },
  //       transformations: {
  //         rawTransformation: paramValue,
  //       },
  //     })
  //   },
  //   [detectionResult.publicId]
  // )

  function saveImage() {
    if (previewCanvasRef.current == null) {
      throw new Error('Crop canvas does not exist')
    }

    previewCanvasRef.current.toBlob(blob => {
      if (blob == null) {
        throw new Error('Failed to create blob')
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current)
      }
      blobUrlRef.current = URL.createObjectURL(blob)
      if (hiddenAnchorRef.current) {
        hiddenAnchorRef.current.href = blobUrlRef.current
        hiddenAnchorRef.current?.click()
      }
    })
  }

  useDebounceEffect(
    async () => {
      if (completedCrop?.width && completedCrop?.height && imgRef.current != null && previewCanvasRef.current != null) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate)
      }
    },
    100,
    [completedCrop, scale, rotate]
  )

  // const imgSrc = useMemo(() => myBuildUrl(TaggyImageType.IMAGECROPPAD), [myBuildUrl])
  // const imgSrcBlur = useMemo(() => myBuildUrl(TaggyImageType.IMAGECROPPADBLUR), [myBuildUrl])

  return (
    <>
      {/* <AspectRatio
        p={10}
        ratio={[4 / 5.3]}
        backgroundImage={
          "url('https://res.cloudinary.com/ljtdev/image/upload/e_blur:1000/v1680458575/taggypwa_yjsfaw.png')"
        }
        backgroundRepeat={'no-repeat'}
        backgroundSize={'cover'}
        backgroundPosition={'center'}
      >
        <Box
          bgGradient={`${
            isDesktop
              ? 'linear(taggyCardBg.900 0%, taggyCardBg.900 30%, taggyGray.900 70%)'
              : 'linear(#1A1A1A 0%, #1A1A1A 0%)'
          }`}
          borderRadius={3}
          sx={{
            position: 'relative',
            height: '100%',
            width: '100%',
            backgroundImage: `url(${imgSrcBlur})`,
            backgroundPosition: 'center center',
            backgroundSize: '100%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {!!imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => {
                setCrop(percentCrop)
              }}
              onComplete={c => {
                setCompletedCrop(c)
              }}
              aspect={aspect}
            >
              <img
                crossOrigin='anonymous'
                ref={imgRef}
                alt='Crop me'
                src={imgSrc}
                style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                onLoad={onImageLoad}
              />
            </ReactCrop>
          )}
          {!editImage && (
            <img
              crossOrigin='anonymous'
              alt='Taggy image'
              src={imgSrc}
              style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
            />
          )}
        </Box>
      </AspectRatio> */}

      <canvas
        ref={previewCanvasRef}
        style={{
          display: 'none',
          objectFit: 'contain',
          width: completedCrop?.width,
          height: completedCrop?.height,
        }}
      />

      <a
        ref={hiddenAnchorRef}
        download
        style={{
          position: 'absolute',
          top: '-200vh',
          visibility: 'hidden',
        }}
      >
        Hidden download
      </a>

      <Box>
        {/* <ControlsImage
          imgSrc={imgSrc}
          scale={scale}
          rotate={rotate}
          imageCropSelected={imageCropSelected}
          editImage={editImage}
          setScale={setScale}
          setRotate={setRotate}
          setImageCropSelected={setImageCropSelected}
          saveImage={saveImage}
          setEditImage={setEditImage}
        /> */}
      </Box>
    </>
  )
}
