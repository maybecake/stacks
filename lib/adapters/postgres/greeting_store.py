import logging
import os

import psycopg

from domain.greeting import GreetingStats, GreetingStore, GreetingTypeStat, NameFrequency

logger = logging.getLogger(__name__)


class PostgresGreetingStore(GreetingStore):
    """GreetingStore backed by Postgres using psycopg v3."""

    def __init__(self, dsn: str | None = None) -> None:
        self._dsn = dsn or os.environ["DATABASE_URL"]

    def _connect(self) -> psycopg.Connection:
        return psycopg.connect(self._dsn)

    def record_greeting(self, greeting_type: str, name: str) -> None:
        try:
            with self._connect() as conn:
                conn.execute(
                    "INSERT INTO greeting_log (greeting_type, name) VALUES (%s, %s)",
                    (greeting_type, name),
                )
                conn.execute(
                    """
                    INSERT INTO greeting_stats (greeting_type, count)
                    VALUES (%s, 1)
                    ON CONFLICT (greeting_type)
                    DO UPDATE SET count = greeting_stats.count + 1
                    """,
                    (greeting_type,),
                )
        except Exception as exc:
            logger.warning("greeting-store: record_greeting failed: %s", exc)

    def get_stats(self) -> list[GreetingStats]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT greeting_type, count FROM greeting_stats ORDER BY greeting_type"
            ).fetchall()
        return [GreetingStats(greeting_type=r[0], count=r[1]) for r in rows]

    def get_name_frequencies(self) -> list[NameFrequency]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT name, COUNT(*) AS count FROM greeting_log GROUP BY name ORDER BY count DESC"
            ).fetchall()
        return [NameFrequency(name=r[0], count=r[1]) for r in rows]

    def list_greeting_type_stats(self, limit: int, cursor: str) -> tuple[list[GreetingTypeStat], str]:
        offset = int(cursor) if cursor else 0
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT greeting_type, count FROM greeting_stats ORDER BY greeting_type LIMIT %s OFFSET %s",
                (limit + 1, offset),
            ).fetchall()
        has_more = len(rows) > limit
        items = [GreetingTypeStat(greeting_type=r[0], count=r[1]) for r in rows[:limit]]
        next_cursor = str(offset + limit) if has_more else ""
        return items, next_cursor

    def list_greeted_names(self, limit: int, cursor: str) -> tuple[list[NameFrequency], str]:
        offset = int(cursor) if cursor else 0
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT name, COUNT(*) AS count FROM greeting_log GROUP BY name ORDER BY count DESC LIMIT %s OFFSET %s",
                (limit + 1, offset),
            ).fetchall()
        has_more = len(rows) > limit
        items = [NameFrequency(name=r[0], count=r[1]) for r in rows[:limit]]
        next_cursor = str(offset + limit) if has_more else ""
        return items, next_cursor
