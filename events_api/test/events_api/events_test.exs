defmodule EventsApi.EventsTest do
  use EventsApi.DataCase

  alias EventsApi.Events

  describe "events" do
    alias EventsApi.Events.Event

    import EventsApi.EventsFixtures

    @invalid_attrs %{
      actor: nil,
      event_type: nil,
      message: nil,
      object: nil,
      occured_at: nil,
      target: nil
    }

    test "list_events/0 returns all events" do
      event = event_fixture()
      assert Events.list_events() == [event]
    end

    test "get_event!/1 returns the event with given id" do
      event = event_fixture()
      assert Events.get_event!(event.id) == event
    end

    test "create_event/1 with valid data creates a event" do
      valid_attrs = %{
        actor: "some actor",
        event_type: :new_listing,
        message: "some message",
        object: :listing,
        occured_at: ~U[2022-10-18 00:13:00Z],
        target: "some target"
      }

      assert {:ok, %Event{} = event} = Events.create_event(valid_attrs)
      assert event.actor == "some actor"
      assert event.event_type == :new_listing
      assert event.message == "some message"
      assert event.object == :listing
      assert event.occured_at == ~U[2022-10-18 00:13:00Z]
      assert event.target == "some target"
    end

    test "create_event/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Events.create_event(@invalid_attrs)
    end

    test "update_event/2 with valid data updates the event" do
      event = event_fixture()

      update_attrs = %{
        actor: "some updated actor",
        event_type: :modify_listing,
        message: "some updated message",
        object: :listing,
        occured_at: ~U[2022-10-19 00:13:00Z],
        target: "some updated target"
      }

      assert {:ok, %Event{} = event} = Events.update_event(event, update_attrs)
      assert event.actor == "some updated actor"
      assert event.event_type == :modify_listing
      assert event.message == "some updated message"
      assert event.object == :listing
      assert event.occured_at == ~U[2022-10-19 00:13:00Z]
      assert event.target == "some updated target"
    end

    test "update_event/2 with invalid data returns error changeset" do
      event = event_fixture()
      assert {:error, %Ecto.Changeset{}} = Events.update_event(event, @invalid_attrs)
      assert event == Events.get_event!(event.id)
    end

    test "delete_event/1 deletes the event" do
      event = event_fixture()
      assert {:ok, %Event{}} = Events.delete_event(event)
      assert_raise Ecto.NoResultsError, fn -> Events.get_event!(event.id) end
    end

    test "change_event/1 returns a event changeset" do
      event = event_fixture()
      assert %Ecto.Changeset{} = Events.change_event(event)
    end
  end
end
