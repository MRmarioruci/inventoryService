#!/bin/bash
set -e

host="$1"
port="$2"

until ncat -z -w 30 "$host" "$port"
do
  echo "Waiting for $host:$port to be available..."
  sleep 1
done

echo "$host:$port is available, continuing..."
exec "$@"
