import { MenuItem } from '@chakra-ui/react'

interface Props {
  children: React.ReactNode
  handle: () => void
}
export default function MenuNavLink({ children, handle }: Props) {
  return (
    <MenuItem
      backgroundColor={'transparent'}
      gap={2}
      _hover={{ color: 'taggyText.900', background: 'taggyDark.300' }}
      onClick={handle}
    >
      {children}
    </MenuItem>
  )
}
