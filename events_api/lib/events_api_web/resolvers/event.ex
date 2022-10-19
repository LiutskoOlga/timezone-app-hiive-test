defmodule EventsApiWeb.Resolvers.Events do
  alias EventsApi.Events

  def list_events(_parent, _args, _resolution) do
    {:ok, Events.list_events()}
  end
end
