/* eslint-disable @typescript-eslint/restrict-plus-operands */

export const updateLocalHIstory = (tab: string, newText: string, tags: string[]) => {
  let history = []
  const plainTags = tags.map(t => `#${t}`).join(' ')

  console.log({ plainTags })

  if (tab === 'CAPTION') {
    history = JSON.parse(localStorage.getItem('captionHistory') ?? '[]')
  } else {
    history = JSON.parse(localStorage.getItem('quotesHistory') ?? '[]')
  }

  const total = history.length + 1
  const newTexts = [...history, { id: total, text: `${newText}\n\n${plainTags}` }]

  localStorage.setItem(tab === 'CAPTION' ? 'captionHistory' : 'quotesHistory', JSON.stringify(newTexts))
  return newTexts
}

export const saveTextEditedHistory = (tab: string, elementId: string, id: string) => {
  let history = []

  if (tab === 'CAPTION') {
    history = JSON.parse(localStorage.getItem('captionHistory') ?? '[]')
  } else {
    history = JSON.parse(localStorage.getItem('quotesHistory') ?? '[]')
  }

  const rawText: any = document.getElementById(elementId)
  if (rawText) {
    const updated = history.map((text: any) => {
      if (text.id === id) {
        return { ...text, text: rawText?.value }
      }
      return text
    })

    localStorage.setItem(tab === 'CAPTION' ? 'captionHistory' : 'quotesHistory', JSON.stringify(updated))
  }
}
