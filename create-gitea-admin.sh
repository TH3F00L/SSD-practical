#!/bin/bash
# Run this AFTER `docker compose up -d` has started the gitea container
# (wait ~10-15 seconds for Gitea to finish its first-run initialization).
#
# Creates the admin account:
#   Username:  LimShangWeiBryan   (Gitea usernames can't contain spaces)
#   Full Name: Lim Shang Wei Bryan
#   Email:     2402209@sit.singaporetech.edu.sg
#   Password:  ylOgQpZvUWNtz0eR   (change this after first login!)

docker compose exec -u git gitea gitea admin user create \
  --username "LimShangWeiBryan" \
  --password "ylOgQpZvUWNtz0eR" \
  --email "2402209@sit.singaporetech.edu.sg" \
  --admin \
  --must-change-password=false

echo ""
echo "Admin account created."
echo "Log in at http://localhost:3000 with username 'LimShangWeiBryan'"
echo "IMPORTANT: change the password after your first login."
