defmodule EventsApi.Repo do
  use Ecto.Repo,
    otp_app: :events_api,
    adapter: Ecto.Adapters.Postgres
end
