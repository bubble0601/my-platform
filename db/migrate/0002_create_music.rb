Sequel.migration do
  change do
    create_table(:artists, :ignore_index_errors=>true) do
      primary_key :id, :type=>:Bignum
      DateTime :created_at
      DateTime :updated_at
      String :name, :size=>255, :null=>false
      String :ruby, :size=>255
    end

    create_table(:albums, :ignore_index_errors=>true) do
      primary_key :id, :type=>:Bignum
      DateTime :created_at
      DateTime :updated_at
      String :title, :size=>255, :null=>false
      foreign_key :artist_id, :artists, :type=>:Bignum, :null=>false
      Integer :year
      Integer :track_count
      Integer :disc_count, :default=>1

      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:artist_id), 0)
      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:year), 0)
      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:track_count), 0)
      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:disc_count), 0)
    end

    create_table(:songs, :ignore_index_errors=>true) do
      primary_key :id, :type=>:Bignum
      DateTime :created_at
      DateTime :updated_at
      String :filename, :size=>255, :null=>false
      String :digest, :size=>255, :null=>false
      String :title, :size=>255, :null=>false
      String :artist_name, :size=>255
      foreign_key :artist_id, :artists, :type=>:Bignum
      foreign_key :album_id, :albums, :type=>:Bignum
      Integer :track_num
      Integer :disc_num, :default=>1
      TrueClass :has_artwork, :default=>false, :null=>false
      TrueClass :has_lyric, :default=>false, :null=>false
      Integer :length, :null=>false
      Integer :rate, :default=>0, :null=>false

      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:artist_id), 0)
      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:album_id), 0)
      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:track_num), 0)
      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:disc_num), 0)
      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:length), 0)
      check Sequel::SQL::BooleanExpression.new(:>=, Sequel::SQL::Identifier.new(:rate), 0)

      index [:digest], :name=>:digest, :unique=>true
    end
  end
end
