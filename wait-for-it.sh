#!/bin/bash
# wait-for-it.sh

set -e

host="$1"
shift
cmd="$@"

# 使用 docker-compose.yml 中设置的密码
export PGPASSWORD=postgres

# 增加重试次数和间隔时�?max_attempts=30
attempt=0

until psql -h "db" -U "postgres" -c '\q'; do
  attempt=$((attempt + 1))
  >&2 echo "Postgres is unavailable - sleeping (attempt $attempt/$max_attempts)"
  
  if [ $attempt -ge $max_attempts ]; then
    >&2 echo "Postgres did not become available in time - exiting"
    exit 1
  fi
  
  # 增加等待时间�?5 �?  sleep 5
done

>&2 echo "Postgres is up - executing command"
exec $cmd 
