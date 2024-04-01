import { Box, Text, VStack } from '@chakra-ui/react'

interface Props {
  image: string
  text: string
  tags: string
}
export default function CommunityCardH({ image, tags, text }: Props) {
  return (
    <Box
      boxShadow='0 4px 10px rgba(0,0,0,0.8)'
      rounded={20}
      w={'340px'}
      // aspectRatio={'9/16'}
      // border={'4px'}
      // borderColor={'white'}
      overflow={'hidden'}
      backgroundColor={'taggyDark.50'}
    >
      <VStack justifyContent={'space-between'}>
        <VStack
          justifyContent={'flex-end'}
          height={'400px'}
          w={'full'}
          // aspectRatio={'9/16'}
          sx={{
            backgroundImage: 'url("/images/demos/demo_022.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repet',
          }}
        >
          <Box
            height={20}
            width={'full'}
            sx={{
              background: 'linear-gradient(to bottom, rgb(9,9,9,0), rgb(9,9,9,0.4), rgb(9,9,9))',
            }}
          ></Box>
        </VStack>
        <Box width={'full'}>
          <Text
            whiteSpace={'pre-line'}
            color={'white'}
            p={4}
            pt={0}
            fontSize='sm'
          >
            {`💄 Get ready to glam up with these stunning makeup looks! 💁‍♀️🔥

As a makeup artist, I'll guide you through step-by-step tutorials and share my tips and tricks to achieve flawless looks. Whether you're a beginner or a seasoned pro, you'll find inspiration and techniques to enhance your beauty game.

Like and follow me for daily makeup inspiration and tutorials! Let's slay together! 💋✨`}
          </Text>
          <Text
            px={4}
            pb={4}
            fontSize='sm'
            fontWeight={'semibold'}
            color={'white'}
            textShadow={'0px 0px 1px rgba(0,0,0)'}
          >
            #makeup #makeupartist #makeuptutorial #model #like #followme
          </Text>
        </Box>
      </VStack>
    </Box>
  )
}
