import { Text } from '@chakra-ui/react'

interface Props {
  text: string
}

export default function Description({ text }: Props) {
  return (
    <Text
      fontSize={{ base: 'md', lg: 'lg', xl: 'xl' }}
      whiteSpace={'pre-line'}
    >
      {text}
    </Text>
  )
}
