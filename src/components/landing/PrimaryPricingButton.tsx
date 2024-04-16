import { Button } from '@chakra-ui/react'

interface ButtonProps {
  id: string
  title?: string
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  handleClick: () => void
}

export default function PrimaryPricingButton({ id, title = '', loading, children, handleClick }: ButtonProps) {
  return (
    <Button
      id={id}
      isLoading={loading}
      title={title}
      p={4}
      height={'40px'}
      width={'full'}
      gap={1}
      display={'flex'}
      alignItems={'center'}
      fontSize={{ base: 'sm' }}
      fontFamily={'boston-bold'}
      color={'taggyDark.100'}
      textTransform={'uppercase'}
      boxShadow='0 4px 10px rgba(0,0,0,0.4)'
      bg={'taggyText.900'}
      // sx={{
      //   backgroundImage: 'linear-gradient(to right, #8dabff 0%, #3385ff  51%, #8dabff  100%)',
      //   transition: '0.5s',
      //   backgroundSize: '200% auto',
      // }}
      _hover={{
        // backgroundPosition: 'right center',
        bg: 'white',
      }}
      onClick={handleClick}
    >
      {children}
    </Button>
  )
}
