#!/bin/sh
set -eu
sed "s|__API_HOST__|${API_HOST:-api}|g; s|__API_PORT__|${API_PORT:-10000}|g" /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec "$@"
