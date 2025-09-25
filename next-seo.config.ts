import {DefaultSeoProps} from "next-seo";

const config: DefaultSeoProps = {
  titleTemplate: "%s | El Arca",
  defaultTitle: "El Arca Cervecería",
  description: "Cervezas artesanales inspiradas en travesías náuticas.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: "https://elarca.mx",
    siteName: "El Arca Cervecería"
  }
};

export default config;
