import React, { useRef } from 'react'
import { Box, Grid, GridItem, Skeleton } from '@chakra-ui/react'

import { useScrollData } from '@/hooks/useScrollData'
import { type Generation } from '@/types'
import CommunityCardV from '../community/CommunityCardV'

interface Props {
  community: Generation[]
}
export default function GridCommunity({ community }: Props) {
  const containerRef = useRef(null)

  const { isLoading, loadedData } = useScrollData('community', community, containerRef)

  return (
    <Box
      ref={containerRef}
      w='full'
    >
      <Grid
        templateColumns='repeat(auto-fill, minmax(340px, 1fr))'
        gap={6}
      >
        {loadedData.map((generation: Generation) => (
          <GridItem key={generation.id}>
            <CommunityCardV
              image={generation.image_url}
              typeUser={generation.type_user_id}
              text={generation.caption}
              tags={generation.tags}
              showCreator={false}
            />
          </GridItem>
        ))}
      </Grid>
      {isLoading && (
        <Grid
          templateColumns='repeat(auto-fill, minmax(340px, 1fr))'
          gap={6}
          pt={6}
        >
          <GridItem>
            <Skeleton
              height='640px'
              rounded={16}
              startColor='taggyGray.700'
              endColor='taggyGray.900'
            />
          </GridItem>
          <GridItem>
            <Skeleton
              height='660px'
              rounded={16}
              startColor='taggyGray.700'
              endColor='taggyGray.900'
            />
          </GridItem>
          <GridItem>
            <Skeleton
              height='660px'
              rounded={16}
              startColor='taggyGray.700'
              endColor='taggyGray.900'
            />
          </GridItem>
        </Grid>
      )}
    </Box>
  )
}
