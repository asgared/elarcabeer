import Head from "next/head";
import {ReactNode} from "react";

// import { Footer, Header } from "../ui"

interface Props {
  children: ReactNode;
  title: string;
  pageDescription: string;
  imageUrl?: string;
}

export default function SecondLayout({
  children,
  imageUrl = "https://res.cloudinary.com/ljtdev/image/upload/v1678488373/WhatsApp_Image_2023-03-10_at_17.45.20_xdibu7.jpg",
  pageDescription,
  title,
}: Props) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={pageDescription} />

        <meta name="og:title" content={title} />
        {imageUrl && <meta name="og:image" content={imageUrl} />}
        <meta name="og:description" content={pageDescription} />

        <meta property="og:title" content={title} />
        {imageUrl && <meta property="og:image" content={imageUrl} />}
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.elarcabeer.com/" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.elarcabeer.com/" />
        <meta property="twitter:title" content={title} />
        <meta property="twitter:description" content={pageDescription} />
        {imageUrl && <meta property="twitter:image" content={imageUrl} />}
      </Head>

      {/* <Header /> */}

      <main className="mx-auto mb-[4.5rem] w-full max-w-[1200px] md:w-[90%] lg:w-4/5">
        {children}
      </main>

      {/* <Footer /> */}
    </>
  );
}
