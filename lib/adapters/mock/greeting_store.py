from domain.greeting import GreetingStats, GreetingStore, GreetingTypeStat, NameFrequency


class MockGreetingStore(GreetingStore):
    """No-op GreetingStore — no persistence until the Postgres adapter is wired."""

    def record_greeting(self, greeting_type: str, name: str) -> None:
        pass

    def get_stats(self) -> list[GreetingStats]:
        return []

    def get_name_frequencies(self) -> list[NameFrequency]:
        return []

    def list_greeting_type_stats(self, limit: int, cursor: str) -> tuple[list[GreetingTypeStat], str]:
        return [], ""

    def list_greeted_names(self, limit: int, cursor: str) -> tuple[list[NameFrequency], str]:
        return [], ""
