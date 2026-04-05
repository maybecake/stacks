from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class GreetingStats:
    greeting_type: str
    count: int


@dataclass
class NameFrequency:
    name: str
    count: int


class GreetingStore(ABC):
    @abstractmethod
    def record_greeting(self, greeting_type: str, name: str) -> None:
        ...

    @abstractmethod
    def get_stats(self) -> list[GreetingStats]:
        ...

    @abstractmethod
    def get_name_frequencies(self) -> list[NameFrequency]:
        ...


def greet_sup(name: str, store: GreetingStore) -> str:
    try:
        store.record_greeting("sup", name)
    except Exception:
        # Storage errors are non-fatal; greeting is the primary contract
        pass
    return f"Sup, {name}!"
