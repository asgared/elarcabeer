import type { NextApiRequest, NextApiResponse } from 'next'

import * as taggyTags from '@/data/tagsByCategories'

import { type Tag, type Taggy, type TaggyResponse } from '@/types.d'

export default function handler(req: NextApiRequest, res: NextApiResponse<TaggyResponse>) {
  const tagsDetected = req.body.tagsDetected

  const hashtagsDetected = tagsDetected.map((tag: Tag) => tag.hashtag)
  const keywordsDetected = tagsDetected.map((tag: Tag) => tag.name)

  const allTags: string[] = []

  const taggyAdapterKewWords = (tags: Tag[]): Tag[] => {
    return tags.map((tag, i) => ({ name: tag.name, hashtag: tag.hashtag, selected: i < 3 }))
  }

  const taggyAdapter = (tags: string[], selected = false): Tag[] => {
    // const found = tags.filter(tag => hashtagsDetected.includes(tag) && !allTags.includes(tag))
    const found = tags.filter(tag => hashtagsDetected.includes(tag))

    if (found.length && !selected) {
      return tags.map(tag => {
        allTags.push(tag)
        return { hashtag: tag, selected }
      })
    } else if (found.length) {
      return found.map(tag => {
        allTags.push(tag)
        return { hashtag: tag, selected }
      })
    }

    return []
  }

  const getTopHashtags = () => {
    let topTags = taggyAdapter(taggyTags.top100, true)
    if (!topTags.length) {
      topTags = taggyTags.top12.map(tag => {
        allTags.push(tag)
        return { hashtag: tag, selected: false }
      })
    }

    return topTags
  }

  const getOtherTopTags = (topTags: string[]) => {
    let count = 0
    const otherTags: string[] = []
    const topMatch = topTags.filter(tag => hashtagsDetected.includes(tag))

    for (const tag of topTags) {
      if (!topMatch.includes(tag) && !otherTags.includes(tag) && !allTags.includes(tag) && count < 6) {
        otherTags.push(tag)
        allTags.push(tag)
        count++
      }
    }

    return otherTags.map(tag => {
      return { hashtag: tag, selected: false }
    })
  }

  const allKewords = taggyAdapterKewWords(tagsDetected)

  const topTags = getTopHashtags()
  const otherTopTags = getOtherTopTags(taggyTags.top100)

  const art = taggyAdapter(taggyTags.art)
  const bussiness = taggyAdapter(taggyTags.bussiness)
  const contest = taggyAdapter(taggyTags.contest)
  const fashion = taggyAdapter(taggyTags.fashion)
  const fitness = taggyAdapter(taggyTags.fitness)
  const foodAndBeverage = taggyAdapter(taggyTags.foodAndBeverage)
  const holiday = taggyAdapter(taggyTags.holiday)
  let likesAndFollows = taggyAdapter(taggyTags.likesAndFollows)
  if (!likesAndFollows.length) {
    likesAndFollows = taggyTags.likesAndFollows.map(tag => {
      allTags.push(tag)
      return { hashtag: tag, selected: false }
    })
  }
  const music = taggyAdapter(taggyTags.music)
  const nature = taggyAdapter(taggyTags.nature)
  const pet = taggyAdapter(taggyTags.pet)
  let photography = taggyAdapter(taggyTags.photography)
  if (!photography.length) {
    photography = taggyTags.photography.map(tag => {
      allTags.push(tag)
      return { hashtag: tag, selected: false }
    })
  }
  const reels = taggyAdapter(taggyTags.reels)
  const retail = taggyAdapter(taggyTags.retail)
  const sports = taggyAdapter(taggyTags.sports)
  const entertainment = taggyAdapter(taggyTags.entertainment)
  const beautyAndMakeup = taggyAdapter(taggyTags.beautyAndMakeup)
  const techAndGadgets = taggyAdapter(taggyTags.techAndGadgets)
  const lifestyle = taggyAdapter(taggyTags.lifestyle)
  const homeAndGarden = taggyAdapter(taggyTags.homeAndGarden)
  const parenting = taggyAdapter(taggyTags.parenting)
  const animals = taggyAdapter(taggyTags.animals)
  const motivational = taggyAdapter(taggyTags.motivational)
  const finance = taggyAdapter(taggyTags.finance)
  const advertisingAndMarketing = taggyAdapter(taggyTags.advertisingAndMarketing)
  const motoring = taggyAdapter(taggyTags.motoring)
  const education = taggyAdapter(taggyTags.education)
  const travel = taggyAdapter(taggyTags.travel)
  const wedding = taggyAdapter(taggyTags.wedding)
  const christmas = taggyAdapter(taggyTags.christmas)
  const gym = taggyAdapter(taggyTags.gym)
  const yoga = taggyAdapter(taggyTags.yoga)
  const funny = taggyAdapter(taggyTags.funny)
  const cats = taggyAdapter(taggyTags.cats)
  const dogs = taggyAdapter(taggyTags.dogs)
  const birthday = taggyAdapter(taggyTags.birthday)
  const summer = taggyAdapter(taggyTags.summer)
  const sunset = taggyAdapter(taggyTags.sunset)
  const beach = taggyAdapter(taggyTags.beach)
  const coffee = taggyAdapter(taggyTags.coffee)
  const design = taggyAdapter(taggyTags.design)
  const party = taggyAdapter(taggyTags.party)
  const anime = taggyAdapter(taggyTags.anime)
  const tattoo = taggyAdapter(taggyTags.tattoo)
  const books = taggyAdapter(taggyTags.books)
  const baby = taggyAdapter(taggyTags.baby)
  const bike = taggyAdapter(taggyTags.bike)
  const smile = taggyAdapter(taggyTags.smile)
  const chef = taggyAdapter(taggyTags.chef)
  const colors = taggyAdapter(taggyTags.colors)
  const dress = taggyAdapter(taggyTags.dress)
  const shop = taggyAdapter(taggyTags.shop)
  const bikini = taggyAdapter(taggyTags.bikini)
  const hair = taggyAdapter(taggyTags.hair)
  const interior = taggyAdapter(taggyTags.interior)
  const festival = taggyAdapter(taggyTags.festival)
  const architecture = taggyAdapter(taggyTags.architecture)
  const jewellery = taggyAdapter(taggyTags.jewellery)
  const restaurant = taggyAdapter(taggyTags.restaurant)
  const drink = taggyAdapter(taggyTags.drink)
  const motorcycle = taggyAdapter(taggyTags.motorcycle)
  const cars = taggyAdapter(taggyTags.cars)
  const logo = taggyAdapter(taggyTags.logo)
  const nonprofit = taggyAdapter(taggyTags.nonprofit)
  let generatedByAI = taggyAdapter(taggyTags.generatedByAI)
  if (!generatedByAI.length) {
    generatedByAI = taggyTags.generatedByAI.map(tag => {
      allTags.push(tag)
      return { hashtag: tag, selected: false }
    })
  }

  const resp = {
    keyWords: [
      {
        category: 'Keywords Detected',
        tags: allKewords,
      },
    ],
    tags: [
      {
        category: 'Top Hashtags',
        tags: topTags,
      },
      {
        category: 'Other trends Hashtags',
        tags: otherTopTags,
      },
      {
        category: 'Advertising and Marketing',
        tags: advertisingAndMarketing,
      },
      {
        category: 'Animals',
        tags: animals,
      },
      {
        category: 'Anime',
        tags: anime,
      },
      {
        category: 'Architecture',
        tags: architecture,
      },
      {
        category: 'Art',
        tags: art,
      },
      {
        category: 'Baby',
        tags: baby,
      },
      {
        category: 'Beach',
        tags: beach,
      },
      {
        category: 'Beauty and Makeup',
        tags: beautyAndMakeup,
      },
      {
        category: 'Bike',
        tags: bike,
      },
      {
        category: 'Bikini',
        tags: bikini,
      },
      {
        category: 'Birthday',
        tags: birthday,
      },
      {
        category: 'Books',
        tags: books,
      },
      {
        category: 'Bussiness',
        tags: bussiness,
      },
      {
        category: 'Cars',
        tags: cars,
      },
      {
        category: 'Cats',
        tags: cats,
      },
      {
        category: 'Chef',
        tags: chef,
      },
      {
        category: 'Coffee',
        tags: coffee,
      },
      {
        category: 'Colors',
        tags: colors,
      },
      {
        category: 'Contest',
        tags: contest,
      },
      {
        category: 'Christmas',
        tags: christmas,
      },
      {
        category: 'Design',
        tags: design,
      },
      {
        category: 'Dress',
        tags: dress,
      },
      {
        category: 'Drink',
        tags: drink,
      },
      {
        category: 'Dogs',
        tags: dogs,
      },
      {
        category: 'Education',
        tags: education,
      },
      {
        category: 'Entertainment',
        tags: entertainment,
      },
      {
        category: 'Fashion',
        tags: fashion,
      },
      {
        category: 'Finance',
        tags: finance,
      },
      {
        category: 'Festival',
        tags: festival,
      },
      {
        category: 'Fitness',
        tags: fitness,
      },
      {
        category: 'Food and Beverage',
        tags: foodAndBeverage,
      },
      {
        category: 'Funny',
        tags: funny,
      },
      {
        category: 'Gym',
        tags: gym,
      },
      {
        category: 'Hair',
        tags: hair,
      },
      {
        category: 'Holiday',
        tags: holiday,
      },
      {
        category: 'Home and Garden',
        tags: homeAndGarden,
      },
      {
        category: 'Interior',
        tags: interior,
      },
      {
        category: 'Jewellery',
        tags: jewellery,
      },
      {
        category: 'Lifestyle',
        tags: lifestyle,
      },
      {
        category: 'Likes and Follows',
        tags: likesAndFollows,
      },
      {
        category: 'Logo',
        tags: logo,
      },
      {
        category: 'Motivational',
        tags: motivational,
      },
      {
        category: 'Motorcylce',
        tags: motorcycle,
      },
      {
        category: 'Motoring',
        tags: motoring,
      },

      {
        category: 'Music',
        tags: music,
      },
      {
        category: 'Nature',
        tags: nature,
      },
      {
        category: 'Nonprofit',
        tags: nonprofit,
      },
      {
        category: 'Party',
        tags: party,
      },
      {
        category: 'Parenting',
        tags: parenting,
      },
      {
        category: 'Pet',
        tags: pet,
      },
      {
        category: 'Photography',
        tags: photography,
      },
      {
        category: 'Reels',
        tags: reels,
      },
      {
        category: 'Restaurant',
        tags: restaurant,
      },
      {
        category: 'Retail',
        tags: retail,
      },
      {
        category: 'Shop',
        tags: shop,
      },
      {
        category: 'Smile',
        tags: smile,
      },
      {
        category: 'Summer',
        tags: summer,
      },
      {
        category: 'Sunset',
        tags: sunset,
      },
      {
        category: 'Sports',
        tags: sports,
      },
      {
        category: 'Tattoo',
        tags: tattoo,
      },
      {
        category: 'Tech and Gadgets',
        tags: techAndGadgets,
      },
      {
        category: 'Travel',
        tags: travel,
      },
      {
        category: 'Yoga',
        tags: yoga,
      },
      {
        category: 'Wedding',
        tags: wedding,
      },
      {
        category: 'If your image is generated by AI',
        tags: generatedByAI,
      },
    ].filter(tags => tags.tags.length) as Taggy[],
    topics: [],
    keywordsDetected,
  }

  res.status(200).json(resp)
}
