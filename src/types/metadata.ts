export type GameMetadata = {
  title: string
  description: string | null
  release_date: string | null
  metacritic_score: number | null
  user_score: number | null
  genres: string[]
  publishers: string[]
  developers: string[]
  platforms: string[]
  multiplayer: boolean | null
  coop: boolean | null
  esrb_rating: string | null
  background_image: string | null
  website: string | null
  metacritic_url: string | null
}

export type MetadataCache = {
  [gameTitle: string]: {
    metadata: GameMetadata
    fetchedAt: number
  }
}
