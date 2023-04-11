/* eslint-disable react/no-unescaped-entities */
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import {IconArcaLogo} from '@/assets/arcaIcons'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
      <main className={styles.main}>
        <div className={styles.center}>
          <Image
            className={styles.logo}
            src="/next.svg"
            alt="Next.js Logo"
            width={180}
            height={37}
            priority
          />
          <div className={styles.thirteen}>
            <IconArcaLogo />
            {/* <Image
              src="/thirteen.svg"
              alt="13"
              width={40}
              height={31}
              priority
            /> */}
          </div>
        </div>
      </main>
  )
}
