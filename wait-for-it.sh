#!/bin/bash

set -e

host="$1"
shift
cmd="$@"

export PGPASSWORD=${POSTGRES_PASSWORD:-postgres}

max_attempts=30
attempt=0

until psql -h "db" -U "postgres" -p 5432 -c '\q'; do
  attempt=$((attempt + 1))
  >&2 echo "Postgres is unavailable (attempt $attempt/$max_attempts) - sleeping..."
  
  if [ $attempt -ge $max_attempts ]; then
    >&2 echo "Postgres did not become available in time - exiting."
    exit 1
  fi
  
  sleep 2
done

>&2 echo "Postgres is up - executing command."
exec $cmd