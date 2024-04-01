import { Heading } from '@chakra-ui/react'

interface Props {
  text: string
}
export default function Title({ text }: Props) {
  return (
    <Heading
      as={'h1'}
      fontSize={{ base: 'xl', lg: '2xl' }}
      textAlign={'center'}
      fontWeight={'bold'}
      fontFamily='boston-bold'
      mb={4}
    >
      {text}
    </Heading>
  )
}
