import { ChatCompletionRequestMessageRoleEnum, ChatCompletionResponseMessageRoleEnum } from 'openai'

export const getSystemMessageGenerate = (actor: string) => {
  let content = 'You are a social media user who wants to share their best moments.'
  if (actor === 'CREATOR') content = 'You are a content creator who wants to gain more followers.'
  if (actor === 'COMPANY') content = 'You are a company that wants to sell its product or service.'

  return {
    role: ChatCompletionRequestMessageRoleEnum.System,
    content,
  }
}

const getBaseRulesCaption = () => {
  return `
  I will provide you with a list of {keywords}, and your task is to create a captivating photo caption in {language}.

  Follow these guidelines:

  - Craft the caption in a {personality} and {feeling} tone.
  - Incorporate the provided keywords.
  - Convey a single idea within the caption.
  - Keep the caption under 40 words.
  - Include emojis.
  - Do not use hashtags or provide any additional explanations.
  - Ensure that the output is formatted in paragraphs with line breaks for organized presentation.
  - Add the following context if it exists: Location: {location} Occasion: {occasion} Additional context: {additionalContext}
  - Keep the verb tense of the shared context.
`
}

export const getSystemMessageRulesCaption = (actor: string) => {
  let examples = `
Keywords: "cloud dog sky travel fun landscape"
Language: "English"
Personality: "Neutral"
Feeling: "Neutral"
Caption generated: "Feeling on cloud nine as I embark on an epic adventure with my furry companion! 🐶🌥️🗺️\n\nFrom chasing fluffy clouds in the sky to exploring stunning landscapes, every moment is filled with excitement and laughter. 🌈✈️\n\nLet the journey unfold and create timeless memories that will last a lifetime! 🌍🐾🌟"

Keywords: "cloud dog sky travel fun landscape"
Language: "Español"
Personality: "Neutral"
Feeling: "Neutral"
Caption generated: "Me siento en las nubes al embarcarme en una aventura épica con mi peludo compañero. 🐶🌥️🗺️\n\nDesde perseguir esponjosas nubes en el cielo hasta explorar impresionantes paisajes, cada momento está lleno de emoción y risas. 🌈✈️\n\n¡Deja que el viaje se desarrolle y crea recuerdos eternos que durarán toda la vida! 🌍🐾🌟"

Keywords: "cloud, dog, sky, travel, fun, landscape"
Language: "Français"
Personality: "Friendly"
Feeling: "Loving"
Caption generated: "Ressentir une connexion unique avec la nature en parcourant le ciel avec mon fidèle compagnon canin. ☁️🐶✈️\nNous explorons ensemble, sautant à travers les nuages et admirant les paysages époustouflants qui nous entourent. 🌄🌍🌈\n\nLe voyage est rempli de plaisir et d'amour, créant des souvenirs inoubliables qui restent gravés dans le cœur. ❤️🗺️🐾"

Keywords: "adventure, nature, hiking"
Language: "Português"
Personality: "Adventurous"
Feeling: "Excited"
Caption generated: "Empolgado, parto para uma aventura natural, explorando a majestade da natureza enquanto caminho nas alturas. 🏞️🌲🥾\nCada passo me aproxima de paisagens de tirar o fôlego e experiências únicas. A adrenalina flui em cada momento dessa emocionante caminhada! 🌄🌿🚶‍♂️\n\nCada passo conta, cada emoção se intensifica - vamos descobrir o que a aventura nos reserva! 💪🌍🌟"
`

  if (actor === 'CREATOR')
    examples = `
Keywords: "makeup lips makeupartist follow"
Language: "English"
Personality: "Neutral"
Feeling: "Neutral"
Caption generated: "😘 Get ready to pucker up with these fabulous lip makeup looks! 💄💋\n\nAs a professional makeup artist, I love experimenting with different shades and textures to create the perfect pout. Whether it's a bold red for a night out or a nude lip for everyday glam, there's something for everyone.\n\nFollow me on this makeup journey as I create mesmerizing lip looks that are sure to turn heads!"

Keywords: "makeup lips makeupartist follow"
Language: "Español"
Personality: "Neutral"
Feeling: "Neutral"
Caption generated: "😘 ¡Prepárate para fruncir los labios con estos fabulosos looks de maquillaje de labios!\n\nComo maquilladora profesional, me encanta experimentar con diferentes tonos y texturas para crear los labios perfectos. Ya sea un rojo atrevido para una noche de fiesta o un labio desnudo para el glamour de todos los días, hay algo para todo el mundo.\n\n¡Segueme en este viaje de maquillaje mientras creo looks de labios fascinantes que seguro que harán girar cabezas!"

Keywords: "coffeecup, follow, breakfast"
Language: "Português"
Personality: "Pessimistic"
Feeling: "Angry"
Caption generated: "🤬☕️ Encare o dia com uma chávena de café e um pequeno-almoço dececionante.\n\nEnquanto saboreia sua bebida amarga, reflita sobre as expectativas não cumpridas da manhã.\nJunte-se a mim nesta jornada repleta de decepções e frustrações matinais.Não me siga se estiver à procura de alegria e otimismo! 🙅‍♀️🔥"

Keywords: "cloud, dog, sky, travel, fun, landscape"
Language: "Français"
Personality: "Adventurous"
Feeling: "Loving"
Caption generated: "💕🐶🌤️ tombez amoureux de paysages sans fin, où les nuages flottent doucement dans un ciel plein d'aventures.\nVoyagez et amusez-vous en explorant de nouveaux horizons avec votre fidèle compagnon à quatre pattes.\nParticipez à cette expérience inoubliable et amusante ! 🗺️🐾✨"
`

  if (actor === 'COMPANY')
    examples = `
Keywords: "clothes dress fashion"
Language: "English"
Personality: "Neutral"
Feeling: "Neutral"
Caption generated: "👗 Dress to impress!\n\nExplore our latest fashion collection and discover stylish clothes that will make you feel confident and fabulous. Whether you're looking for a casual outfit or a stunning dress for a special occasion, we've got you covered.\n\nStay on-trend and express your unique sense of style with our fashionable clothes. Shop now and elevate your fashion game! ✨🛍️"

Keywords: "clothes dress fashion"
Language: "Español"
Personality: "Neutral"
Feeling: "Neutral"
Caption generated: "👗 Explora nuestra última colección de moda y descubre prendas con estilo que te harán sentir segura y fabulosa.\n\nTanto si buscas un atuendo informal como un vestido espectacular para una ocasión especial, tenemos todo lo que necesitas.\n\nMantente a la moda y expresa tu sentido único del estilo con nuestra ropa de moda. ¡Compra ahora y eleva tu juego de moda! ✨🛍️"

Keywords: "tableware, food, drinkware, beer"
Language: "Русский"
Personality: "Professional"
Feeling: "Happy"
Caption generated: "🍽️ Удивите своих гостей нашей элегантной посудой и стеклянными изделиями.\n🍴🥂 Наслаждайтесь исключительными впечатлениями от ужина с нашей разнообразной посудой для подачи блюд и напитков. От изысканной посуды до пивных бокалов премиум-класса - мы гарантируем качество и удовлетворение.\n\n🎉 Отмечайте счастливые моменты стильно! 🥳✨"

Keywords: "beer, alcoholicbeverage, smallbusiness, local"
Language: "Português"
Personality: "Reliable"
Feeling: "Neutral"
Caption generated: "🍺🏪 Apoie as empresas locais e desfrute da nossa cerveja artesanal.\n🍻🌍 Como uma pequena empresa de confiança, orgulhamo-nos de lhe fornecer bebidas alcoólicas de qualidade. Nossos produtos são fabricados com paixão e cuidado, proporcionando um sabor único e autêntico.\n\nJunte-se à nossa comunidade e descubra o verdadeiro prazer de uma cerveja local - saúde! 🍻🌿"
`

  return [
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `${getBaseRulesCaption()}

      Here are some examples of good responses:

      ${examples}

      Answer OK if you understand all the rules.`,
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content:
        'OK. I understand all the rules. Please provide me with the keywords and the language to generate the engaging photo caption.',
    },
  ]
}

export const getExampleMessagesGenerateCaption = (actor: string) => {
  if (actor === 'CREATOR') {
    return [
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Kewords: "food, cook, recipe, delicious"
        Language: "English"
        Personality: "Neutral"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          "🍽️ Indulge in the art of cooking with these mouthwatering recipes that are sure to tickle your taste buds! 🤤👨‍🍳\n\nFrom hearty comfort foods to exquisite culinary creations, explore a world of flavors and create delicious dishes that will leave you craving for more. Whether you're a seasoned chef or a beginner in the kitchen, these recipes will make you feel like a culinary maestro. Bon appétit!\n\nFollow me on this gastronomic journey as we whip up sensational meals that will have you coming back for seconds! 🥘🍴",
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Keywords: "travel adventure explore follow"
        Language: "Español"
        Personality: "Neutral"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          '✈️ ¡Embárcate en una emocionante aventura de viaje y descubre nuevos horizontes! 🌍💫\n\nSumérgete en la riqueza de culturas, explora destinos exóticos y vive experiencias inolvidables. Ya sea que te apasione la selva, los paisajes de montaña o las playas paradisíacas, hay un mundo esperándote para ser explorado.\n\n¡Acompáñame en este viaje sin igual mientras comparto mis aventuras y te inspiró a seguir esos sueños de viaje! 🗺️🌴🌍 No te pierdas ni un instante de esta travesía llena de descubrimientos y momentos únicos. ¡Únete a la experiencia de viaje definitiva! 🌎✨',
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.User,
        content: 'That caption has more than 50 words, rewrite it with only 40 words.',
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          '✈️ Embárcate en una emocionante aventura y descubre nuevos horizontes.\n\nExplora destinos exóticos y sumérgete en la riqueza de culturas. Desde la selva hasta las playas paradisíacas, hay un mundo esperándote.Acompáñame en este viaje sin igual mientras comparto mis aventuras.\n\n¡Únete a la experiencia de viaje definitiva! 🌍💫 ',
      },
    ]
  }

  if (actor === 'COMPANY') {
    return [
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Keywords: "organic, food, healthy"
        Language: "English"
        Personality: "Neutral"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content: `🌱 Nourish your body with our delicious and nutritious organic food!\n\n🥦🍎 Our products are made with the highest quality ingredients to promote a healthy lifestyle.From flavorful fruits and crisp vegetables to wholesome grains and natural snacks, we have everything you need to fuel your body with goodness.\n\nStart your journey to better health today! 🌿🥗`,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Keywords: "gadget, smartphone, innovation"
        Language:  "Español"
        Personality: "Neutral"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content: `📱 Descubre la última innovación en gadgets!\n\n💡⚙️ Nuestros smartphones están diseñados para brindarte la mejor experiencia tecnológica. Con características avanzadas y un rendimiento excepcional, nuestros dispositivos te mantienen conectado y te permiten hacer más. Disfruta de la excelencia en tecnología y descubre un mundo de posibilidades en la palma de tu mano. 🌟🔋\n\n¡Explora nuestros gadgets y lleva tu experiencia móvil al siguiente nivel!`,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.User,
        content: 'That caption has more than 50 words, rewrite it with only 50 words.',
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content: `📱 Descubre nuestra innovación en gadgets móviles: smartphones diseñados para brindarte la mejor experiencia tecnológica.\n\n💡⚙️ Con características avanzadas, rendimiento excepcional y una amplia gama de posibilidades, mantente conectado y maximiza tu productividad.\n\n🌟🔋¡Explora nuestros gadgets y lleva tu experiencia móvil al siguiente nivel!`,
      },
    ]
  }

  return [
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `Keywords: "beach, sunset, friends, happiness"
      Language: "English"
      Personality: "Neutral"
      Feeling: "Neutral"
      `,
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content: `Basking in the golden glow of the setting sun with my dear friends, embracing pure happiness at the beach. 🌅🏖️💛\n\nAs we watch the waves crash against the shore, laughter fills the air and unforgettable memories are created. 🌊😄✨\n\nThese moments remind us of the beauty of friendship and the joy that comes with simple pleasures. 🌺👭🌴`,
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `Keywords: "road trip car freedom adventure"
      Language: "Español"
      Personality: "Neutral"
      Feeling: "Neutral"
      `,
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content: `La carretera nos llama y respondemos con una sensación de libertad que corre por nuestras venas. 🛣️🚗🌅\n\nCon cada milla recorrida, se despliegan nuevas aventuras, territorios inexplorados que esperan ser explorados. 🌍🌟✨\n\nEn este épico viaje por carretera, abrazamos la espontaneidad, creamos recuerdos duraderos y nos damos cuenta de que el viaje es tan importante como el destino. 🗺️❤️🏞️`,
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.User,
      content: 'That caption has more than 50 words, rewrite it with only 50 words.',
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content: `La carretera nos llama y respondemos con una sensación de libertad en nuestras venas. 🛣️🚗🌅\n\nCon cada milla, nuevas aventuras se despliegan en territorios inexplorados. 🌍🌟✨\n\nEn este épico viaje, abrazamos la espontaneidad y creamos recuerdos duraderos. El viaje es tan importante como el destino. 🗺️❤️🏞️`,
    },
  ]
}

const getBaseRulesQuotes = () => {
  return `
  I will provide you with a list of {keywords}, and your task is to create captivating photo quotes in {language}.

  Follow these guidelines:

  - Craft the quotes in a {personality} and {feeling} tone.
  - Incorporate the provided keywords.
  - Keep each quote under 20 words.
  - Include emojis.
  - Do not use hashtags or provide any additional explanations.
  - Add the following context if it exists: Location: {location} Occasion: {occasion} Additional context: {additionalContext}
  - Keep the verb tense of the shared context.
`
}

export const getSystemMessageRulesQuotes = (actor: string) => {
  let examples = `
Keywords: "cloud dog sky travel fun landscape"
Language: "English"
Personality: "Neutral"
Feeling: "Neutral"
Quotes generated: "1. Find your joy in the simple things: a cloud as fluffy as a dog's fur 🌤️🐶✨\n\n2. Beneath the vast sky, embrace the adventure, and let the fun unfold! 🌎🎉 \n\n3. Exploring new horizons with a wagging tail, because life is a journey 🐾❤️ "

Keywords: "cloud dog sky travel fun landscape"
Language: "Español"
Personality: "Neutral"
Feeling: "Neutral"
Quotes generated: "1. Encuentra tu alegría en las cosas simples: una nube tan esponjosa como el pelaje de un perro 🌤️🐶✨\n\n2. Bajo el amplio cielo, abraza la aventura y deja que la diversión se despliegue! 🌎🎉\n\n3. Explorando nuevos horizontes con la cola enérgica, porque la vida es un viaje 🐾❤️"

Keywords: "walking, nature, hiking, explore"
Language: "Français"
Personality: "Adventurous"
Feeling: "Exited"
Quotes generated: "1. Marcher dans la nature, explorer de nouveaux sentiers pleins d'excitation et d'aventure 🌿🚶‍♀️🌄 Explorons ! ✨\n\n2. A chaque pas, la nature me captive et me remplit de vie, partons ensemble à l'aventure sur ce sentier fascinant ! 🌿🥾🌳\n\n3. Laissez vos pieds vous guider vers des paysages captivants et des expériences inoubliables - la beauté de la nature attend impatiemment votre arrivée ! 🌲🗺️🌈"
`

  if (actor === 'CREATOR')
    examples = `
Keywords: "makeup lips makeupartist follow"
Language: "English"
Personality: "Neutral"
Feeling: "Neutral"
Quotes generated: "1. Make your lips pop and paint the world with confidence. Follow me for all things makeup! 💄\n\n2. A talented makeup artist can transform faces and inspire beauty. Join me on this colorful journey! 🎨\n\n3. Follow my makeup adventures as we explore the artistry of lips and unlock the power of self-expression! 💋"

Keywords: "makeup lips makeupartist follow"
Language: "Español"
Personality: "Neutral"
Feeling: "Neutral"
Quotes generated: "1.  Haz que tus labios resalten y pinta el mundo con confianza. ¡Sígueme para todo lo relacionado con maquillaje! 💄\n\n2. Un talentoso maquillador puede transformar rostros e inspirar belleza. ¡Únete a mí en este viaje colorido! 🎨\n\n3. ¡Sigue mis aventuras de maquillaje mientras exploramos la artesanía de los labios y desbloqueamos el poder de la autoexpresión! 💋"

Keywords: "podcast, entertainment, follow"
Language: "Português"
Personality: "Friendly"
Feeling: "Happy"
Quotes generated: "1. Descubra o podcast mais engraçado e junte-se à diversão! 😄🎧 Segue-me para te manteres a par dos melhores momentos de entretenimento.\n\n2. Entre no mundo do podcast e deixe-se levar pela alegria da diversão. siga-me e continue a sorrir em cada episódio! 😃🎙️\n\n3. mergulhe num mar de entretenimento e junte-se a mim no meu podcast cheio de risos e diversão. siga a diversão e deixe-se contagiar pela alegria! 😁🔊"
`

  if (actor === 'COMPANY')
    examples = `
Keywords: "clothes dress fashion"
Language: "English"
Personality: "Neutral"
Feeling: "Neutral"
Quotes: generated: "1. Embrace your style and let your clothes speak volumes about your confidence. Dress to impress! 👗✨\n\n2. Fashion is a form of self-expression. So, wear your favorite clothes and let your inner beauty shine! 💃✨\n\n3. Who said you can't be stylish and comfortable at the same time? Stay trendy with clothes that make you feel amazing! 👚🌟"

Keywords: "clothes dress fashion"
Language: "Español"
Personality: "Neutral"
Feeling: "Neutral"
Quotes generated: "1. Abraza tu estilo y deja que tu ropa hable por tu confianza. ¡Vístete para impresionar! 👗✨\n\n2. La moda es una forma de expresión personal. ¡Así que usa tu ropa favorita y deja brillar tu belleza interior! 💃✨\n\n3. ¿Quién dijo que no puedes estar a la moda y cómodo a la vez? ¡Mantente a la moda con ropa que te haga sentir increíble! 👚🌟"

Keywords: "beer, alcoholicbeverage, smallbusiness, local"
Language: "Français"
Personality: "Reliable"
Feeling: "Neutral"
Quotes generated: "1. Soutenir les entreprises locales et apprécier notre bière artisanale. 🍺🏪\n\n2. En tant que petite entreprise de confiance, nous sommes fiers de fournir des boissons alcoolisées de qualité. 🍻🌍\n\n3. Rejoignez notre communauté et découvrez le vrai plaisir d'une bière locale - cheers ! 🍻🌿"
`
  return [
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `${getBaseRulesQuotes()}

      Here are some examples of good responses:

      ${examples}

      Answer OK if you understand all the rules.`,
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content:
        'OK. I understand all the rules. Please provide me with the keywords and the language to generate the engaging photo caption.',
    },
  ]
}

export const getExampleMessagesGenerateQuotes = (actor: string) => {
  if (actor === 'CREATOR') {
    return [
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Kewords: "food cook recipe delicious"
        Language: "English"
        Personality: "Neutral"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          '1. Indulge in the art of cooking and explore delicious recipes. Join me on a mouthwatering culinary journey! 🍳🍴\n\n2. Master the flavors of your favorite dishes and create culinary magic. Follow me for tasty recipes! 🌟🍽️\n\n3. Discover the joy of cooking and unleash your inner chef. Follow along for delectable recipes that will tantalize your taste buds! 😋🍲',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Keywords: "walking, nature, hiking, explore"
        Language: "Español"
        Personality: "Adventurous"
        Feeling: "Exited"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content: `1. Caminando entre la naturaleza, explorando nuevos senderos llenos de emoción y aventura 🌿🚶‍♀️🌄 ¡Vamos a explorar! ✨\n\n2. En cada paso, la naturaleza me cautiva y me llena de vida. ¡Aventurémonos juntos en este fascinante sendero! 🌿🥾🌳 #explore #naturaleza\n\n3. Deja que tus pies te guíen hacia paisajes cautivadores y experiencias inolvidables. ¡La belleza de la naturaleza espera ansiosa tu llegada! 🌲🗺️🌈 #hiking #naturaleza`,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: "I don't want to put hashtags into the quotes",
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content: `1. Caminando entre la naturaleza, explorando nuevos senderos llenos de emoción y aventura 🌿🚶‍♀️🌄 ¡Vamos a explorar! ✨\n\n2. En cada paso, la naturaleza me cautiva y me llena de vida. ¡Aventurémonos juntos en este fascinante sendero! 🌿🥾🌳\n\n3. Deja que tus pies te guíen hacia paisajes cautivadores y experiencias inolvidables. ¡La belleza de la naturaleza espera ansiosa tu llegada! 🌲🗺️🌈`,
      },
    ]
  }

  if (actor === 'COMPANY') {
    return [
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: 'Keywords: "organic food healthy" Language: "English"',
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          '1. Nourish your body with the goodness of organic food. Stay healthy and embrace a vibrant life! 🌱🥦\n\n2. Choose organic for a healthier you. Fill your plate with nutritious food and let nature fuel your well-being! 🍃🥑\n\n3. Discover the power of organic food and let it nourish your body from within. Health starts with what you eat! 🌿🍎',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: 'Keywords: "gadget smartphone innovation" Language:  "Español"',
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          '1. Descubre la innovación en tus manos con los últimos gadgets y smartphones. ¡La tecnología al servicio de tus necesidades! 📱🚀\n\n2. Deja que la innovación guíe tu día a día. Los gadgets y smartphones te abren un mundo de posibilidades. ¡Explora y sorpréndete! 💡📲\n\n3. Las nuevas tecnologías son el motor de la innovación. Mantente conectado y descubre las maravillas que los gadgets y smartphones tienen para ofrecerte. 🌟🔌',
      },
    ]
  }

  return [
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: 'Keywords: "beach sunset friends happiness" Language: "English"',
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content:
        '1. Cherish the golden moments and feel the warmth of friendship beneath the sunset glow. 🌅🏖️👭😊\n\n2. Dancing with the waves, embracing joy, and creating memories that shimmer like the sunset. 🌊🌅🌴🌟😄\n\n3. In the company of good friends, happiness blooms like a vibrant sunset over the endless beach. 🏖️🌅🌺🌞😃',
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: 'Keywords: "road trip car freedom adventure" Language: "Español"',
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content:
        '1. En cada kilómetro recorrido hay una dosis de libertad y aventura en el camino. 🚗🛣️🌟🌄\n\n2. Con el viento en el rostro y el espíritu libre, cada viaje en auto se convierte en una gran aventura. 🌬️🚗🗺️🌅\n\n3. En un increíble viaje por carretera, la libertad se encuentra en cada curva y la aventura se despliega ante tus ojos. 🛣️🚗🌄🌌',
    },
  ]
}

const getBaseRulesCaptionTweet = () => {
  return `
  I will provide you with a list of {keywords}, and your task is to create a captivating photo caption in {language} in Tweet format.

  Follow these guidelines:

  - Craft the caption in a {personality} and {feeling} tone.
  - Convey a single idea within the caption.
  - Incorporate the provided keywords.
  - Include emojis.
  - Do not use hashtags or provide any additional explanations.
  - Ensure that the caption is suitable for a tweet.
  - Add the following context if it exists: Location: {location} Occasion: {occasion} Additional context: {additionalContext}
  - Keep the verb tense of the shared context.
`
}

export const getSystemMessageRulesCaptionTweet = (actor: string) => {
  let examples = `
  Keywords: "walking, nature, hiking, explore"
  Language: "Español"
  Personality: "Adventurous"
  Feeling: "Exited"
  Tweet generated:  "¡Día de aventura al aire libre! 🚶‍♀️🌿 La naturaleza me llama y yo respondo. Hoy, me adentré en el sendero menos transitado para explorar nuevos rincones de este maravilloso mundo. Cada paso es una aventura, ¡y no puedo estar más emocionado! 🌄🌳🌍 #ExploraciónNatural #ExcitaciónTotal"

  Keywords: "dog, pet, doglovers"
  Language: "Español"
  Personality: "English"
  Feeling: "Loving"
  Tweet generated: ""Spent the day with my furry best friend! 🐾❤️ There's nothing quite like the love and joy a pet brings into your life. Share a pic of your beloved fur baby below! Let's spread some puppy love today. 🐶💕 #DogLovers #FurryFriend #UnconditionalLove"
`

  if (actor === 'CREATOR')
    examples = `

    Keywords: "lip, makeup, makeupartist, follow"
    Language: "Español"
    Personality: "Creative"
    Feeling: "Happy"
    Tweet generated: "¡Descubre cómo mis labios se convierten en lienzos de creatividad! 💄✨ Soy amante del maquillaje y artista en creación de looks únicos. ¡Sígueme en este viaje de belleza y creatividad! 💋💖✨ #Maquillaje #ArtistaDelMaquillaje #Sígueme #Creatividad"

    Keywords: "singing, livemusic, follow, music"
    Language: "Español"
    Personality: "Professional"
    Feeling: "Excited"
    Tweet generated: "¡La música es mi vida y quiero compartirla contigo! 🎶🎤🎵 Sígueme para disfrutar de actuaciones en vivo, explorar nuevos géneros y conectarnos a través de la pasión por la música. ¡Únete a esta emocionante travesía musical! 🎉🎶✨ #MúsicaEnVivo #Sígueme #PasiónPorLaMúsica"
`

  if (actor === 'COMPANY')
    examples = `
Keywords: "clothes dress fashion"
Language: "English"
Personality: "Neutral"
Feeling: "Neutral"
Tweet generated: "Discover the latest trends in fashion with our exquisite collection of dresses and clothing. Elevate your style and stay ahead of the fashion game. Explore our range today! 👗👠🛍️ #Fashion #Style #ShopNow"

Keywords: "clothes dress fashion"
Language: "Español"
Personality: "Professional"
Feeling: "Happy"
Tweet generated: "Descubre nuestro catálogo de moda con las últimas tendencias en vestimenta y accesorios. Te ayudamos a lucir radiante y elegante en cualquier ocasión. ¡Renueva tu estilo con nosotros y siéntete feliz con cada elección! 👗👠✨ #Moda #Tendencias #FelizCompra"

Keywords: "tableware, food, drinkware, beer"
Language: "Русский"
Personality: "Reliable"
Feeling: "Neutral"
Tweet generated: "🍽️ Наши столовые приборы и посуда созданы для вашего удовольствия! Поднимите уровень вашего стола с нашей продукцией. Идеально подходит для ужина и развлечений. Посмотрите наш ассортимент сегодня. 🥂 #СтоловаяПосуда #Ужин #Качество #Развлечения"
`

  return [
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `${getBaseRulesCaptionTweet()}

      Here are some examples of good responses:

      ${examples}

      Answer OK if you understand all the rules.`,
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content: 'OK. I understand all the rules.',
    },
  ]
}

export const getExampleMessagesGenerateCaptionTweet = (actor: string) => {
  if (actor === 'CREATOR') {
    return [
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Kewords: "food, cook, recipe, delicious"
        Language: "English"
        Personality: "Neutral"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          'Exploring the world of culinary delights, one recipe at a time. 🍳🍲 Follow along for delicious dishes and cooking inspiration! #Foodie #Cooking #Recipes #Delicious',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Keywords: "travel adventure explore follow"
        Language: "Español"
        Personality: "Neutral"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          'Explorar el mundo es una aventura sin fin. Únete a mí mientras descubro lugares nuevos y emocionantes. 🌍✈️ #Viajar #Aventura #Explorar #Sígueme',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Keywords: "outerwear, cloud, peopleinnature, happy"
        Language: "Español"
        Personality: "Adenturous"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          '¡Enfrentando los elementos y abrazando la naturaleza al máximo! 🏔️☁️⛷️ Acompáñame en mis viajes llenos de diversión y paisajes impresionantes. ¡Descubre cómo la ropa adecuada puede hacer que cada aventura sea aún más emocionante! 🌬️⛰️✨ #RopaDeExterior #GenteEnLaNaturaleza #Viajes #Diversión #Paisajes',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: 'This tweet exceeds the number of characters, adjust it accordingly.',
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          'Enfrentando los elementos y abrazando la naturaleza al máximo! 🏞️ Acompáñame en mis viajes llenos de diversión y paisajes impresionantes. ¡Descubre cómo la ropa adecuada puede hacer que cada aventura sea aún más emocionante! 🌬️✨ #AventurasNaturales #Viajes #Paisajes',
      },
    ]
  }

  if (actor === 'COMPANY') {
    return [
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Keywords: "organic, food, healthy"
        Language: "English"
        Personality: "Neutral"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          'Experience the goodness of our organic, healthy food products. 🌿🍲 Discover the natural flavors that your taste buds deserve. #Organic #Food #HealthyChoices',
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: `Keywords: "gadget, smartphone, innovation"
        Language:  "Español"
        Personality: "Neutral"
        Feeling: "Neutral"
        `,
      },
      {
        role: ChatCompletionResponseMessageRoleEnum.Assistant,
        content:
          'Descubre la innovación en tus manos con nuestro último gadget. 📱💡 Explora lo que la tecnología puede hacer por ti. #Gadget #Smartphone #Innovación',
      },
    ]
  }

  return [
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `Keywords: "beach, sunset, friends, happiness"
      Language: "English"
      Personality: "Neutral"
      Feeling: "Neutral"
      `,
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content:
        "Chasing sunsets with friends at the beach 🌅🏖️. There's a unique kind of happiness in these moments - simple and beautiful. #BeachSunset #Friends #Happiness",
    },
    {
      role: ChatCompletionRequestMessageRoleEnum.User,
      content: `Keywords: "road trip car freedom adventure"
      Language: "Español"
      Personality: "Neutral"
      Feeling: "Neutral"
      `,
    },
    {
      role: ChatCompletionResponseMessageRoleEnum.Assistant,
      content:
        'Disfrutando de la carretera, la libertad de un viaje en coche. Cada kilómetro es una nueva aventura. 🚗🛣️ #ViajeEnCoche #Aventura #Libertad',
    },
  ]
}
