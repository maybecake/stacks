-- name: InsertGreetingLog :exec
INSERT INTO greeting_log (greeting_type, name)
VALUES ($1, $2);

-- name: UpsertGreetingStats :exec
INSERT INTO greeting_stats (greeting_type, count)
VALUES ($1, 1)
ON CONFLICT (greeting_type)
DO UPDATE SET count = greeting_stats.count + 1;

-- name: GetAllStats :many
SELECT greeting_type, count
FROM greeting_stats
ORDER BY greeting_type;

-- name: GetNameFrequencies :many
SELECT name, COUNT(*) AS count
FROM greeting_log
GROUP BY name
ORDER BY count DESC;

-- name: ListGreetingTypeStatsPaginated :many
SELECT greeting_type, count
FROM greeting_stats
ORDER BY greeting_type
LIMIT $1 OFFSET $2;

-- name: ListGreetedNamesPaginated :many
SELECT name, COUNT(*) AS count
FROM greeting_log
GROUP BY name
ORDER BY count DESC
LIMIT $1 OFFSET $2;
