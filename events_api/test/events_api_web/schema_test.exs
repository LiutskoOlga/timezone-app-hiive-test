defmodule EventsApiWeb.SchemaTest do
  use EventsApiWeb.ConnCase

  import EventsApi.EventsFixtures

  @events_query """
  query {
    events {
      actor
      event_type
      message
      object
      occurred_at
      target
    }
  }
  """

  test "query: events", %{conn: conn} do
    event_fixture(%{
      actor: "Luke Skywalker",
      event_type: :new_listing,
      message: "Listed 1,000 shares of Merchant Guild",
      object: :listing,
      occurred_at: ~U[2022-10-18 00:13:00Z],
      target: "Merchant Guild"
    })

    conn =
      post(conn, "/api", %{
        "query" => @events_query
      })

    assert json_response(conn, 200) == %{
             "data" => %{
               "events" => [
                 %{
                   "actor" => "Luke Skywalker",
                   "event_type" => "NEW_LISTING",
                   "message" => "Listed 1,000 shares of Merchant Guild",
                   "object" => "LISTING",
                   "occurred_at" => "2022-10-18T00:13:00Z",
                   "target" => "Merchant Guild"
                 }
               ]
             }
           }
  end
end
