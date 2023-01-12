defmodule EventsApi.Events.Event do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "events" do
    field :actor, :string

    field :event_type, Ecto.Enum,
      values: [
        :new_listing,
        :modify_listing,
        :withdraw_listing,
        :new_bid,
        :accept_bid,
        :reject_bid
      ]

    field :message, :string
    field :object, Ecto.Enum, values: [:listing, :bid]
    field :occurred_at, :utc_datetime
    field :target, :string

    timestamps()
  end

  @doc false
  def changeset(event, attrs) do
    event
    |> cast(attrs, [:actor, :event_type, :message, :object, :occurred_at, :target])
    |> validate_required([:actor, :event_type, :message, :object, :occurred_at, :target])
  end
end
