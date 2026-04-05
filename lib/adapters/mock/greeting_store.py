from domain.greeting import GreetingStore


class MockGreetingStore(GreetingStore):
    """No-op GreetingStore — no persistence until the Postgres adapter is wired."""

    def record_greeting(self, greeting_type: str, name: str) -> None:
        pass
