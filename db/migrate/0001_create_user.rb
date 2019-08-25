Sequel.migration do
  change do
    create_table(:users, :ignore_index_errors=>true) do
      primary_key :id, :type=>:Bignum
      DateTime :created_at
      DateTime :updated_at
      String :name, :size=>255, :null=>false
      String :password, :size=>255, :null=>false

      index [:deleted_at], :name=>:idx_users_deleted_at
      index [:name], :name=>:name, :unique=>true
    end
  end
end
