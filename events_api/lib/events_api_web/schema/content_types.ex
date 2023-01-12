defmodule EventsApiWeb.Schema.ContentTypes do
  use Absinthe.Schema.Notation

  object :event do
    field :id, :id
    field :actor, :string
    field :event_type, :event_type
    field :message, :string
    field :object, :object
    field :occurred_at, :datetime
    field :target, :string
  end

  enum :event_type do
    values(Ecto.Enum.values(EventsApi.Events.Event, :event_type))
  end

  enum :object do
    values(Ecto.Enum.values(EventsApi.Events.Event, :object))
  end

  scalar :datetime do
    description("UTC Timestamp in ISO8601 format")
    serialize(&DateTime.to_iso8601(&1))

    parse(fn datetime ->
      {:ok, datetime, 0} = DateTime.from_iso8601(datetime)
      datetime
    end)
  end
end
