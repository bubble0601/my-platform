# Columns
#   id:           bigint, PRIMARY KEY, AUTO INCREMENT, NOT NULL
#   created_at:   datetime
#   updated_at:   datetime
#   title:        varchar(255), NOT NULL
#   artist_id:    bigint, NOT NULL
#   year:         int
#   track_count:  int
#   disc_count:   int, DEFAULT 1
class Album < Sequel::Model(:albums)
  one_to_many :songs
  many_to_one :artist
end
