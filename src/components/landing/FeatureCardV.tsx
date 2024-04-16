import { Card, CardBody, Heading, Image, Stack } from '@chakra-ui/react'
import Description from './Description'

interface Props {
  title: string
  description: string
  image: string
}

export default function FeatureCardV({ title, description, image }: Props) {
  return (
    <Card
      w={'full'}
      height={'fit-content'}
      flex={1}
      rounded={6}
      overflow={'hidden'}
      bg={'taggyDark.50'}
      border={'1px'}
      borderColor={'taggyDark.300'}
      // boxShadow='0px 4px 10px rgba(0,0,0,0.4)'
    >
      <CardBody p={0}>
        <Image
          src={image}
          height={'300px'}
          width={'full'}
          objectFit={'cover'}
        />
        {/* <Divider /> */}
        <Stack p={{ base: 4, lg: 6 }}>
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
        </Stack>
      </CardBody>
    </Card>
  )
}
