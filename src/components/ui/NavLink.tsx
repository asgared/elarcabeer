import { Box } from '@chakra-ui/react'
import Link from 'next/link'
import React from 'react'

interface Props {
  href: string
  text: string | React.ReactNode
  blank?: boolean
}

export default function NavLink({ href, text, blank }: Props) {
  return (
    <Link
      href={href}
      target={blank ? '_blank' : '_self'}
    >
      <Box
        color='taggyText.900'
        fontSize={'sm'}
        _hover={{ color: 'white', textDecoration: 'none' }}
      >
        {text}
      </Box>
    </Link>
  )
}
