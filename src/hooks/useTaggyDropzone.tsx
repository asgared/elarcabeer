import { useCallback, useState } from 'react'
import router from 'next/router'
import axios from 'axios'

import { useDropzone } from 'react-dropzone'

import { useTaggyStore } from '@/store/taggyStore'
import { scanningAndCategorization } from '@/services/cloudinary'

import { saveUpload } from '@/utils/supabase-db'
import { supabase } from '@/utils/supabase-client'

import { ImageStatus } from '@/types.d'
interface ReturnProps {
  selectedFile: File | null
  getRootProps: () => any
  getInputProps: () => any
  isDragActive: boolean
  isDragReject: boolean
  isFileTooLarge: boolean
}

const acceptedFileTypes: any = ['image/*']
const maxFileSize = 8388608

export default function useTaggyDropzone(): ReturnProps {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [isDragReject, setIsDragReject] = useState(false)
  const [isFileTooLarge, setIsFileTooLarge] = useState(false)

  const setImageStatus = useTaggyStore(state => state.setImageStatus)
  const setDetectionResult = useTaggyStore(state => state.setDetectionResult)
  const setUploadId = useTaggyStore(state => state.setUploadId)

  const getUser = async () => {
    return await supabase.auth.getUser()
  }

  const sendFile = useCallback(
    (file: File, user: string) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_PRESET as string)
      formData.append('timestamp', (Date.now() / 1000).toString())
      formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY as string)

      axios({
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        url: `${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_URL}/image/upload`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: formData,
      })
        .then((response: any) => {
          setImageStatus(ImageStatus.SCANNING)
          scanningAndCategorization(response.data.secure_url)
            .then(resp => {
              setDetectionResult({
                secureUrl: response.data.secure_url,
                publicId: response.data.public_id,
                categoryTags: resp.taggyCategorization.tags,
                categoryTopics: resp.taggyCategorization.tags,
                keyWords: resp.taggyCategorization.keyWords,
                keywordsDetected: resp.taggyCategorization.keywordsDetected,
              })

              saveUpload(user)
                .then(data => {
                  setUploadId(data.id)
                  setImageStatus(ImageStatus.DONE)
                })
                .catch(err => {
                  console.log('save upload->', err)
                  setImageStatus(ImageStatus.ERROR)
                })
            })
            .catch(err => {
              console.log('scanning->', err)
              setImageStatus(ImageStatus.ERROR)
            })
        })
        .catch(error => {
          console.log('upaload->', error)
          setImageStatus(ImageStatus.ERROR)
        })
    },
    [setDetectionResult, setImageStatus]
  )

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      getUser().then(({ data }) => {
        const user = data?.user

        if (!user) {
          router.push('/auth')
        } else {
          setImageStatus(ImageStatus.UPLOADING)

          const file = acceptedFiles[0]
          // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
          if (file && file.type.startsWith('image/')) {
            setSelectedFile(file)
            setIsDragActive(false)
            setIsDragReject(false)
            setIsFileTooLarge(file.size > maxFileSize)

            sendFile(file, user.id)
          } else {
            setIsDragReject(true)
            setImageStatus(ImageStatus.ERROR)
          }
        }
      })
    },
    [sendFile, setImageStatus]
  )

  const onDragEnter = useCallback(() => {
    setIsDragActive(true)
  }, [])

  const onDragLeave = useCallback(() => {
    setIsDragActive(false)
  }, [])

  const onDropRejected = useCallback(() => {
    setIsDragReject(true)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    onDropRejected,
    accept: acceptedFileTypes,
    maxSize: maxFileSize,
    multiple: false,
  })

  return { selectedFile, getRootProps, getInputProps, isDragActive, isDragReject, isFileTooLarge }
}
