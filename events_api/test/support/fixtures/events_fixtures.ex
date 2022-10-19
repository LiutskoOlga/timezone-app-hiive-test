defmodule EventsApi.EventsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `EventsApi.Events` context.
  """

  @doc """
  Generate a event.
  """
  def event_fixture(attrs \\ %{}) do
    {:ok, event} =
      attrs
      |> Enum.into(%{
        actor: "some actor",
        event_type: :new_listing,
        message: "some message",
        object: :listing,
        occured_at: ~U[2022-10-18 00:13:00Z],
        target: "some target"
      })
      |> EventsApi.Events.create_event()

    event
  end
end
