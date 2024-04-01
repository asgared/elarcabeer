import { createContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase-client'
import { type Session, type User } from '@supabase/supabase-js'

type UserContextProps = {
  session: Session | null | false
  user: any
  isLoading: boolean
} | null

const UserContext = createContext<UserContextProps>(null)

interface UserProviderProps {
  children: React.ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [session, setSession] = useState<Session | null | false>(false)
  const [user, setUser] = useState<User | null | false>(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) throw error

      if (session) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session?.user?.id).single()

        const { data: dataCustomer } = await supabase
          .rpc(
            'get_data_customer' as never,
            {
              user_id: session?.user?.id,
            } as any
          )
          .single()

        setUser({
          ...session?.user,
          ...profile,
          dataCustomer,
        })

        setSession(session ?? null)
      }
      setIsLoading(false)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      // console.log('Auth state change')
      getSession()
    })

    getSession()

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) {
      const subscription = supabase
        .channel('custom-filter-channel')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          payload => {
            // console.log('Change received!', user)
            // console.log('Change received!', payload)
            setUser({ ...user, ...payload.new })
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [user])

  const value = {
    session,
    user,
    isLoading,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export default UserContext
