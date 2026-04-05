from domain.greeting import GreetingStats, GreetingStore, NameFrequency


class MockGreetingStore(GreetingStore):
    """No-op GreetingStore — no persistence until the Postgres adapter is wired."""

    def record_greeting(self, greeting_type: str, name: str) -> None:
        pass

    def get_stats(self) -> list[GreetingStats]:
        return []

    def get_name_frequencies(self) -> list[NameFrequency]:
        return []
