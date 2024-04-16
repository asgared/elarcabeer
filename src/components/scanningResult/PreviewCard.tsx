import { useState } from 'react'
import { useTranslation } from 'next-i18next'

import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalOverlay,
  Text,
  useDisclosure,
  HStack,
  useToast,
  VStack,
} from '@chakra-ui/react'
import ButtonTaggy from '../ui/ButtonTaggy'
import ButtonTaggySimple from '../ui/ButtonTaggySimple'
import CommunityCardV from '../community/CommunityCardV'

import { useTaggyStore } from '@/store/taggyStore'

import { supabase } from '@/utils/supabase-client'
import { useUserContext } from '@/hooks/useAuthUser'

import { FiSend } from 'react-icons/fi'
import { FaEye, FaSave } from 'react-icons/fa'
import ButtonTaggyGhost from '../ui/ButtonTaggyGhost'
import Toast from '../ui/Toast'

interface Props {
  typeText: string
  text: string
  tags: string
}

export default function PreviewCard({ typeText, text, tags }: Props) {
  const [loading, setLoading] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)

  const detectionResult = useTaggyStore(state => state.detectionResult)
  const userContext = useUserContext()

  const toast = useToast()

  const { t } = useTranslation('community')
  const { isOpen, onOpen, onClose } = useDisclosure()

  const getTypeUser = () => {
    const type = window.localStorage.getItem('actor') ?? 'USER'
    if (type === 'CREATOR') return 2
    if (type === 'COMPANY') return 3
    return 1
  }

  const sendToCommunity = async () => {
    setLoading(true)

    const shortedText = text.substring(0, 520)

    const { error } = await supabase.from('community').insert([
      {
        user_id: userContext?.user.id,
        image_url: detectionResult.secureUrl,
        type_user_id: getTypeUser(),
        [typeText]: shortedText,
        tags,
      },
    ])

    setLoading(false)
    if (!error) {
      toast({
        position: 'bottom-right',
        render: () => (
          <Toast
            text={t('sendToCommunity.sent')}
            success
          />
        ),
      })
    }
  }

  const saveGeneration = async () => {
    setLoadingSave(true)
    const shortedText = text.substring(0, 520)

    const { error } = await supabase.from('generations').insert([
      {
        user_id: userContext?.user.id,
        image_url: detectionResult.secureUrl,
        type_user_id: getTypeUser(),
        caption: shortedText,
        tags,
      },
    ])

    setLoadingSave(false)

    if (!error) {
      toast({
        position: 'bottom-right',
        render: () => (
          <Toast
            text={t('saveGeneration')}
            success
          />
        ),
      })
    }
  }

  return (
    <>
      <ButtonTaggySimple
        title='Preview'
        handleClick={onOpen}
      >
        <FaEye />
      </ButtonTaggySimple>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent
          sx={{
            background: 'transparent',
            backdropFilter: 'blur(10px)',
          }}
          border={'1px'}
          borderColor={'taggyDark.300'}
          rounded={12}
        >
          <ModalCloseButton />
          <ModalBody
            px={{ base: 1, md: 0 }}
            py={{ base: 8, md: 6 }}
          >
            <Box
              margin={'auto'}
              w={'340px'}
              minW={'340px'}
            >
              <CommunityCardV
                image={detectionResult.secureUrl}
                createdBy={userContext?.user?.user_metadata?.full_name}
                typeUser={getTypeUser()}
                text={text}
                tags={tags}
              />
            </Box>
          </ModalBody>

          {userContext?.session && (
            <ModalFooter
              margin={'auto'}
              mb={8}
              p={0}
            >
              <VStack gap={4}>
                <HStack>
                  {userContext?.user?.is_subscribed && (
                    <ButtonTaggyGhost
                      id='save-generation-btn'
                      loading={loadingSave}
                      handleClick={saveGeneration}
                    >
                      <FaSave /> {t('saveGeneration')}
                    </ButtonTaggyGhost>
                  )}

                  <ButtonTaggy
                    id='send-community-btn'
                    loading={loading}
                    handleClick={sendToCommunity}
                  >
                    <FiSend /> {t('sendToCommunity.button')}
                  </ButtonTaggy>
                </HStack>

                <Box px={8}>
                  <Text
                    fontSize={'xs'}
                    color={'taggyGray.200'}
                  >
                    {t('sendToCommunity.sendedCaption')}
                  </Text>
                </Box>
              </VStack>
            </ModalFooter>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}
