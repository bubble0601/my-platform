# Columns
#   id:         bigint(20), PRIMARY KEY, AUTO INCREMENT, NOT NULL
#   created_at: datetime
#   updated_at: datetime
#   name:       varchar(255), NOT NULL
#   ruby:       varchar(255)
#   user_id:    bigint, NOT NULL
class Artist < Sequel::Model(:artists)
  many_to_one :user
  one_to_many :songs
  one_to_many :albums
end
