import { Box, Skeleton, Text } from '@chakra-ui/react'

interface Props {
  plan: string
  loading: boolean
}

export default function BadgedPlan({ plan, loading }: Props) {
  return (
    <Skeleton
      isLoaded={!loading}
      startColor='taggyGray.700'
      endColor='taggyGray.900'
    >
      <Box
        bg={'taggyDark.50'}
        borderRadius={3}
        py={1}
        px={2}
      >
        <Text
          bgGradient='linear(to-l,  taggyPrimary.500, taggySecondary.500)'
          bgClip='text'
          fontSize='xs'
          fontFamily='boston-bold'
          textTransform={'uppercase'}
          letterSpacing={1}
        >
          {plan ?? 'Hobby'}
        </Text>
      </Box>
    </Skeleton>
  )
}
