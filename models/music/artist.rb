# Columns
#   id:         bigint(20), PRIMARY KEY, AUTO INCREMENT, NOT NULL
#   created_at: datetime
#   updated_at: datetime
#   name:       varchar(255), NOT NULL
#   ruby:       varchar(255)
class Artist < Sequel::Model(:artists)
  one_to_many :songs
  one_to_many :albums
end
