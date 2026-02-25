#!/bin/sh

git filter-branch --env-filter '
OLD_EMAIL="gouthamgv403@gmail.com"
CORRECT_NAME="Sahil Kumar"
CORRECT_EMAIL="sahil.628401@gmail.com"

export GIT_COMMITTER_NAME="$CORRECT_NAME"
export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
export GIT_AUTHOR_NAME="$CORRECT_NAME"
export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
' --tag-name-filter cat -- --branches --tags
