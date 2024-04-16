import { Heading } from '@chakra-ui/react'

interface Props {
  text: string
}

export default function Title({ text }: Props) {
  return (
    <Heading
      as={'h2'}
      fontSize={['2xl', '3xl', '3xl', '4xl', '4xl']}
      textAlign={'center'}
      fontWeight={'bold'}
      fontFamily='boston-bold'
      mb={{ base: 6, lg: 12 }}
    >
      {text}
    </Heading>
  )
}
