import { Card, CardBody, Heading, Image, Stack } from '@chakra-ui/react'
import Description from './Description'

interface Props {
  title: string
  description: string
  image: string
}

export default function FeatureCardH({ title, description, image }: Props) {
  return (
    <Card
      direction={{ base: 'column', md: 'row' }}
      w={'full'}
      height={'fit-content'}
      rounded={6}
      overflow={'hidden'}
      // bg={'transparent'}
      bg={'taggyDark.50'}
      border={'1px'}
      borderColor={'taggyDark.300'}
      // boxShadow='0px 4px 10px rgba(0,0,0,0.4)'
    >
      <Image
        flex={1}
        src={image}
        width={{ base: '100%', md: '50%' }}
        objectFit={'cover'}
        alt='taggy keywords'
      />

      <Stack
        flex={1}
        p={{ base: 4, lg: 6 }}
      >
        <CardBody
          display={'flex'}
          flexDir={'column'}
          justifyContent={'center'}
          p={0}
        >
          <Heading
            as={'h3'}
            color='white'
            fontSize={['xl', '2xl', '2xl', '3xl', '3xl']}
            textAlign={'center'}
            fontWeight={'bold'}
            fontFamily='boston-bold'
            mb={{ base: 4, lg: 6 }}
          >
            {title}
          </Heading>

          <Description text={description} />
        </CardBody>
      </Stack>
    </Card>
  )
}
