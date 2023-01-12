alias EventsApi.Events.Event
alias EventsApi.Repo

defmodule SeedHelpers do
  @moduledoc false

  @random_dates for _ <- 1..30,
                    do: Faker.DateTime.between(~U[2022-01-01 00:00:00Z], ~U[2022-12-31 00:00:00Z])

  def random_date do
    date = @random_dates |> Enum.random() |> DateTime.to_date()
    Faker.DateTime.between(DateTime.new!(date, ~T[00:00:00]), DateTime.new!(date, ~T[23:59:59]))
  end

  def random_event_type do
    Enum.random(Ecto.Enum.values(Event, :event_type))
  end

  def object(event_type) when event_type in [:new_listing, :modify_listing, :withdraw_listing],
    do: :listing

  def object(event_type) when event_type in [:new_bid, :accept_bid, :reject_bid], do: :bid
end

for _ <- 1..250 do
  event_type = SeedHelpers.random_event_type()

  attrs = %{
    actor: Faker.StarWars.character(),
    event_type: event_type,
    message: Faker.StarWars.quote(),
    object: SeedHelpers.object(event_type),
    occurred_at: SeedHelpers.random_date(),
    target: Faker.UUID.v4()
  }

  %Event{}
  |> Event.changeset(attrs)
  |> Repo.insert!()
end
