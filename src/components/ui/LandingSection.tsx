import { useRef } from 'react'
import { useInView } from 'framer-motion'

import { Box } from '@chakra-ui/react'

import styles from '@/styles/section.module.css'

interface Props {
  children: React.ReactNode
  id?: string
  bg?: string
  hf?: boolean
}

export default function LandingSection({ children, id = undefined, bg = '', hf = true }: Props) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <Box
      as='section'
      className={hf ? 'sectionHeight' : ''}
      ref={ref}
      id={id}
      position={'relative'}
    >
      <Box
        width={['100%', '100%', '90%', '90%', '80%']}
        px={4}
        margin={'auto'}
        py={'3rem'}
        transform={'translateY(100px)'}
        opacity={0}
        sx={{
          transform: isInView ? 'none' : 'translateY(200px)',
          opacity: isInView ? 1 : 0,
          transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.3s',
        }}
      >
        {children}
      </Box>
      <div className={`${styles.skewed} ${styles[bg]}`} />
    </Box>
  )
}
