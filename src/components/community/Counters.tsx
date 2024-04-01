import { useEffect, useState } from 'react'

import { useTranslation } from 'next-i18next'
import { supabase } from '@/utils/supabase-client'

import { Box, Flex, Stack, Stat, StatLabel, StatNumber } from '@chakra-ui/react'
import { FaUser, FaPenAlt } from 'react-icons/fa'

export default function Counters() {
  const { t } = useTranslation('community')

  const [totalUsers, setTotalUsers] = useState(200)
  const [totalGenerations, setTotalGenerations] = useState(3000)

  useEffect(() => {
    const getTotalGenerations = async () => {
      const { data } = await supabase.rpc('get_generations_sum' as never)
      setTotalGenerations(data ?? 3000)
    }
    getTotalGenerations()
  }, [])

  useEffect(() => {
    const getTotalUsers = async () => {
      const { data } = await supabase.rpc('get_total_users' as never)
      setTotalUsers(data ?? 200)
    }
    getTotalUsers()
  }, [])

  return (
    <Stack
      flexDir={{ base: 'column', md: 'row' }}
      width={'full'}
      maxW={'3xl'}
      justifyContent={'center'}
      gap={6}
      mb={{ base: 6, lg: 12 }}
    >
      <Stat
        rounded={6}
        border={'1px'}
        borderColor={'taggyDark.300'}
        boxShadow='0 0 10px rgba(0,0,0,0.6)'
        p={6}
      >
        <Flex justifyContent={'space-between'}>
          <Box>
            <StatLabel
              fontSize={'md'}
              mb={2}
            >
              {t('counters.users')}
            </StatLabel>
            <StatNumber
              fontSize={['4xl', '6xl']}
              fontWeight={'bold'}
              lineHeight={1}
            >
              {totalUsers}
            </StatNumber>
          </Box>
          <Box
            my={'auto'}
            alignContent={'center'}
            color={'taggyDark.300'}
          >
            <FaUser size={40} />
          </Box>
        </Flex>
      </Stat>

      <Stat
        rounded={6}
        border={'1px'}
        borderColor={'taggyDark.300'}
        boxShadow='0 0 10px rgba(0,0,0,0.6)'
        p={6}
      >
        <Flex
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Box>
            <StatLabel
              fontSize={'md'}
              mb={2}
            >
              {t('counters.captions')}
            </StatLabel>
            <StatNumber
              fontSize={['4xl', '6xl']}
              fontWeight={'bold'}
              lineHeight={1}
            >
              {totalGenerations}
            </StatNumber>
          </Box>
          <Box
            my={'auto'}
            alignContent={'center'}
            color={'taggyDark.300'}
          >
            <FaPenAlt size={40} />
          </Box>
        </Flex>
      </Stat>
    </Stack>
  )
}
