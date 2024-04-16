import styles from '@/styles/marquee-card.module.css'
import CommunityCardV from '../community/CommunityCardV'
import { useEffect, useState } from 'react'
import { supabase } from '@/utils/supabase-client'
import { type Community } from '@/types'

export default function MarqueeCard() {
  const [community, setCommunity] = useState<Community>({
    regularUser: [],
    contentCreator: [],
    business: [],
  })
  const [addAnimation, setAddAnimation] = useState(false)

  useEffect(() => {
    const getCommunity = async () => {
      const { data: regularUser } = await supabase
        .from('community')
        .select('*, profiles(full_name)')
        .eq('type_user_id', 1)
        .eq('approved', 1)
      const { data: contentCreator } = await supabase
        .from('community')
        .select('*, profiles(full_name)')
        .eq('type_user_id', 2)
        .eq('approved', 1)
      const { data: business } = await supabase
        .from('community')
        .select('*, profiles(full_name)')
        .eq('type_user_id', 3)
        .eq('approved', 1)

      setCommunity({
        regularUser: regularUser ?? [],
        contentCreator: contentCreator ?? [],
        business: business ?? [],
      })
    }

    getCommunity()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setAddAnimation(true)
    }, 5000)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  const column1 = [
    ...community.business,
    ...community.regularUser,
    ...community.contentCreator,
    ...community.business,
    ...community.regularUser,
    ...community.contentCreator,
  ]
  const column2 = [
    ...community.contentCreator,
    ...community.business,
    ...community.regularUser,
    ...community.contentCreator,
    ...community.business,
    ...community.regularUser,
  ]
  const column3 = [
    ...community.regularUser,
    ...community.contentCreator,
    ...community.business,
    ...community.regularUser,
    ...community.contentCreator,
    ...community.business,
  ]

  return (
    <div className={`${styles.slideContainer}`}>
      <div className={`${styles.row}`}>
        <div className={`${styles.column} ${styles.slideWrapper}`}>
          {column1.map(c => (
            <div
              key={c.id}
              // className={`${styles.slideItem}`}
            >
              <div style={{ marginBottom: '1rem' }}>
                <CommunityCardV
                  image={c.image_url}
                  createdBy={c.profiles?.full_name}
                  typeUser={c.type_user_id}
                  text={c?.caption ? c.caption.replace(/\\n/g, '\n') : c.quotes.replace(/\\n/g, '\n')}
                  tags={c.tags}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={`${styles.column} ${addAnimation ? styles.slideWrapper : ''}`}>
          {column2.map(c => (
            <div
              key={c.id}
              // className={`${styles.slideItem}`}
            >
              <div style={{ marginBottom: '1rem' }}>
                <CommunityCardV
                  image={c.image_url}
                  createdBy={c.profiles?.full_name}
                  typeUser={c.type_user_id}
                  text={c?.caption ? c.caption.replace(/\\n/g, '\n') : c.quotes.replace(/\\n/g, '\n')}
                  tags={c.tags}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={`${styles.column} ${styles.slideWrapper}`}>
          {column3.map(c => (
            <div
              key={c.id}
              // className={`${styles.slideItem}`}
            >
              <div style={{ marginBottom: '1rem' }}>
                <CommunityCardV
                  image={c.image_url}
                  createdBy={c.profiles?.full_name}
                  typeUser={c.type_user_id}
                  text={c?.caption ? c.caption.replace(/\\n/g, '\n') : c.quotes.replace(/\\n/g, '\n')}
                  tags={c.tags}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
