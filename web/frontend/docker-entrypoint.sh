#!/bin/sh
set -eu
dns_resolver="${DNS_RESOLVER:-$(awk '$1 == "nameserver" { print $2; exit }' /etc/resolv.conf)}"
if [ -z "$dns_resolver" ]; then
    echo "No DNS resolver found in /etc/resolv.conf" >&2
    exit 1
fi
sed "s|__API_HOST__|${API_HOST:-api}|g; s|__API_PORT__|${API_PORT:-10000}|g; s|__API_SCHEME__|${API_SCHEME:-http}|g; s|__DNS_RESOLVER__|$dns_resolver|g" /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
exec "$@"
