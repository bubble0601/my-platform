Sequel.migration do
  up do
    add_column :songs, :user_id, :bigint, null: false
    DB[:songs].update(user_id: DB[:users].first[:id])
    alter_table(:songs) do
      add_foreign_key [:user_id], :users
      add_index :user_id
    end

    add_column :albums, :user_id, :bigint, null: false
    DB[:albums].update(user_id: DB[:users].first[:id])
    alter_table(:albums) do
      add_foreign_key [:user_id], :users
      add_index :user_id
    end

    add_column :artists, :user_id, :bigint
    DB[:artists].update(user_id: DB[:users].first[:id])
    alter_table(:artists) do
      add_foreign_key [:user_id], :users
      add_index :user_id
    end

    add_column :playlists, :user_id, :bigint, null: false
    DB[:playlists].update(user_id: DB[:users].first[:id])
    alter_table(:playlists) do
      add_foreign_key [:user_id], :users
      add_index :user_id
    end
  end

  down do
    alter_table(:songs) do
      drop_foreign_key :user_id
    end
    alter_table(:albums) do
      drop_foreign_key :user_id
    end
    alter_table(:artists) do
      drop_foreign_key :user_id
    end
    alter_table(:playlists) do
      drop_foreign_key :user_id
    end
  end
end
