import { useEffect, useContext } from 'react'
import { supabase } from '../utils/supabase-client'
import router from 'next/router'
import UserContext from '@/context/user'

export const signOut = async () => {
  await supabase.auth.signOut()
  window.location.href = '/auth'
}

export const RequireAuth = () => {
  const useContext = useUserContext()

  useEffect(() => {
    if (useContext?.user === null) {
      router.push('/signin')
    }
  }, [useContext])
}

export const RequireRecoveryType = () => {
  useEffect(() => {
    const path = router.asPath
    if (!path.includes('type=recovery')) {
      router.push('/auth')
    }
  }, [router])
}

export const AuthRedirect = () => {
  const userContext = useUserContext()

  useEffect(() => {
    const session = userContext?.session
    const isLoading = userContext?.isLoading
    // console.log(session, 'HOOK')
    if (!isLoading && session) {
      // console.log('se ejecuta auth redirect')
      router.push('/generation')
    }
  }, [userContext])
}

export const useUserContext = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`)
  }

  return context
}
