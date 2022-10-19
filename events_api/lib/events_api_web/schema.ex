defmodule EventsApiWeb.Schema do
  use Absinthe.Schema
  import_types(EventsApiWeb.Schema.ContentTypes)

  alias EventsApiWeb.Resolvers

  query do
    @desc "Get all Events"
    field :events, list_of(:event) do
      resolve(&Resolvers.Events.list_events/3)
    end
  end
end
