defmodule EventsApi.Repo.Migrations.RenameOccuredAtOccurredAt do
  use Ecto.Migration

  def change do
    rename table(:events), :occured_at, to: :occurred_at
  end
end
