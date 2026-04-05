from abc import ABC, abstractmethod


class GreetingStore(ABC):
    @abstractmethod
    def record_greeting(self, greeting_type: str, name: str) -> None:
        ...


def greet_sup(name: str, store: GreetingStore) -> str:
    try:
        store.record_greeting("sup", name)
    except Exception:
        # Storage errors are non-fatal; greeting is the primary contract
        pass
    return f"Sup, {name}!"
