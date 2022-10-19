defmodule EventsApi.Repo.Migrations.CreateEvents do
  use Ecto.Migration

  def change do
    create table(:events, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :event_type, :string
      add :actor, :string
      add :object, :string
      add :target, :string
      add :occured_at, :utc_datetime
      add :message, :text

      timestamps()
    end
  end
end
