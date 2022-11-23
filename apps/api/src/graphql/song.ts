import { objectType, queryType } from 'nexus'
import { Song } from '~/@generated'

export const SongType = objectType({
  name: Song.$name,
  definition(t) {
    t.field(Song.id)
    t.field(Song.title)
    t.field(Song.createdAt)
  },
})

export const SongQuery = queryType({
  definition(t) {
    t.list.field('songs', {
      type: SongType,
      async resolve(_, __, { db }) {
        return await db.song.findMany()
      },
    })
  },
})
