import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'en' | 'no'

const translations = {
  en: {
    // Home
    tagline: 'TRACK · DRINK · CONQUER',
    create: 'Create',
    createDesc: 'Start a new game',
    join: 'Join',
    joinDesc: 'Enter a room ID',
    madeFor: 'Made for mobile. Consumed with friends.',

    // Create room
    back: '← BACK',
    unitSize: 'UNIT SIZE',
    unitGoal: 'UNIT GOAL',
    unitGoalPlaceholder: 'e.g. 10',
    unitGoalHint: 'How many units until the game ends',
    creatingRoom: 'Creating…',
    createRoom: 'Create room →',

    // Join room
    roomId: 'ROOM ID',
    roomIdPlaceholder: 'e.g. abc123',
    checking: 'Checking…',
    joinRoom: 'Join room →',

    // Username
    whatsYourName: "👋 What's your name?",
    joiningRoom: 'Joining room',
    yourName: 'YOUR NAME',
    namePlaceholder: 'e.g. Alice',
    joining: 'Joining…',
    letsDrink: "Let's drink! 🍺",
    nameTaken: 'That name is already taken in this room. Pick another.',
    roomNotFound: 'Room not found.',

    // Room
    room: 'ROOM',
    share: '🔗 Share',
    copied: '✓ Copied',
    leave: '🚪 Leave',
    goalProgress: '🏆 Goal progress',
    units: 'units',
    beerSize: '🍺 BEER SIZE',
    noPlayers: 'No players yet — share the link!',
    you: 'YOU',
    leaveRoom: 'Leave room?',
    leaveDesc: "You'll go back to the home page, but you'll stay in the game.",
    cancel: 'Cancel',
    leaveBtn: 'Leave',

    // Errors
    serverDown: 'Could not reach the server. Is it running?',
    lostConnection: 'Lost connection to server.',
    failedCreateRoom: 'Failed to create room',
    failedDrink: 'Failed to add drink. Try again.',
    failedUndrink: 'Failed to remove drink. Try again.',
    positiveGoal: 'Unit goal must be a positive number.',
    roomNotFoundShort: 'not found.',
  },
  no: {
    tagline: 'TELL · DRIKK · HERSK',
    create: 'Opprett',
    createDesc: 'Start et nytt spill',
    join: 'Bli med',
    joinDesc: 'Skriv inn rom-ID',
    madeFor: 'Laget for mobil. Nytes med venner.',

    back: '← TILBAKE',
    unitSize: 'ENHETSSTØRRELSE',
    unitGoal: 'ENHETSMÅL',
    unitGoalPlaceholder: 'f.eks. 10',
    unitGoalHint: 'Antall enheter før spillet er over',
    creatingRoom: 'Oppretter…',
    createRoom: 'Opprett rom →',

    roomId: 'ROM-ID',
    roomIdPlaceholder: 'f.eks. abc123',
    checking: 'Sjekker…',
    joinRoom: 'Bli med i rom →',

    whatsYourName: '👋 Hva heter du?',
    joiningRoom: 'Blir med i rom',
    yourName: 'DITT NAVN',
    namePlaceholder: 'f.eks. Alice',
    joining: 'Blir med…',
    letsDrink: 'La oss drikke! 🍺',
    nameTaken: 'Det navnet er allerede tatt i dette rommet. Velg et annet.',
    roomNotFound: 'Rommet ble ikke funnet.',

    room: 'ROM',
    share: '🔗 Del',
    copied: '✓ Kopiert',
    leave: '🚪 Forlat',
    goalProgress: '🏆 Målprogresjon',
    units: 'enheter',
    beerSize: '🍺 ØLSTØRRELSE',
    noPlayers: 'Ingen spillere ennå — del lenken!',
    you: 'DEG',
    leaveRoom: 'Forlate rommet?',
    leaveDesc: 'Du kommer tilbake til forsiden, men du er fortsatt med i spillet.',
    cancel: 'Avbryt',
    leaveBtn: 'Forlat',

    serverDown: 'Kunne ikke nå serveren. Kjører den?',
    lostConnection: 'Mistet tilkoblingen til serveren.',
    failedCreateRoom: 'Kunne ikke opprette rom',
    failedDrink: 'Kunne ikke legge til drink. Prøv igjen.',
    failedUndrink: 'Kunne ikke fjerne drink. Prøv igjen.',
    positiveGoal: 'Enhetsmål må være et positivt tall.',
    roomNotFoundShort: 'ble ikke funnet.',
  },
} satisfies Record<Lang, Record<string, string>>

type Translations = typeof translations.en

const I18nContext = createContext<{ t: Translations; lang: Lang; setLang: (l: Lang) => void }>({
  t: translations.en,
  lang: 'en',
  setLang: () => {},
})

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => {
    AsyncStorage.getItem('beerio_lang').then((saved) => {
      if (saved === 'en' || saved === 'no') setLangState(saved)
    })
  }, [])

  function setLang(l: Lang) {
    setLangState(l)
    AsyncStorage.setItem('beerio_lang', l)
  }

  const t = translations[lang]

  return <I18nContext.Provider value={{ t, lang, setLang }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
