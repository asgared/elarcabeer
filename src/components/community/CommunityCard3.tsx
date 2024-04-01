import { Box, Text, VStack } from '@chakra-ui/react'

import animations from '@/styles/animations.module.css'

export default function CommunityCard3() {
  return (
    <Box
      className={`${animations.trackingInExpandForwardBottom}`}
      boxShadow='0 4px 10px rgba(0,0,0,0.8)'
      rounded={20}
      // border={'4px'}
      // borderColor={'white'}
      overflow={'hidden'}
    >
      <VStack
        justifyContent={'flex-end'}
        w={'340px'}
        // aspectRatio={'9/16'}
        backgroundColor={'taggyDark.50'}
        sx={{
          backgroundImage: 'url("/images/demos/demo_022.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repet',
        }}
      >
        <Box
          rounded={20}
          sx={{
            background: 'transparent',
            backdropFilter: 'blur(2px)',
          }}
        >
          <Text
            whiteSpace={'pre-line'}
            color={'white'}
            p={4}
            fontSize='sm'
            textShadow={'0px 0px 3px rgba(0,0,0,0.8)'}
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
