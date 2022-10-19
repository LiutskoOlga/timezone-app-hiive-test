defmodule EventsApi.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      EventsApi.Repo,
      # Start the Telemetry supervisor
      EventsApiWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: EventsApi.PubSub},
      # Start the Endpoint (http/https)
      EventsApiWeb.Endpoint
      # Start a worker by calling: EventsApi.Worker.start_link(arg)
      # {EventsApi.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: EventsApi.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    EventsApiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
