import { Button } from '@chakra-ui/react'

interface ButtonProps {
  id: string
  title?: string
  disabled?: boolean
  children: React.ReactNode
  handleClick: () => void
}

export default function SecondaryPricingButton({ id, title = '', children, handleClick }: ButtonProps) {
  return (
    <Button
      id={id}
      width={'full'}
      p={{ base: 2, md: 4 }}
      gap={2}
      height={'40px'}
      display={'flex'}
      alignItems={'center'}
      fontSize={{ base: 'sm' }}
      textTransform={'uppercase'}
      fontFamily={'boston-bold'}
      color={'taggyText.900'}
      boxShadow='0 0 10px rgba(0,0,0,0.6)'
      _hover={{
        backgroundColor: 'taggyDark.200',
      }}
      onClick={handleClick}
    >
      {children}
    </Button>
  )
}
