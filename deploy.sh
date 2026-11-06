#!/usr/bin/env bash
set -euo pipefail

web_root="${1:-/var/www/html}"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

install -d -m 0755 -- "$web_root"
install -m 0644 -- \
    "$script_dir/index.html" \
    "$script_dir/home.html" \
    "$script_dir/login.html" \
    "$script_dir/signup.html" \
    "$script_dir/styles.css" \
    "$script_dir/app.js" \
    "$script_dir/charger.svg" \
    "$web_root/"

printf 'Good Goods storefront deployed to %s\n' "$web_root"
