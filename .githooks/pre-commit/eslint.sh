#!/bin/bash
require_clean_work_tree () {
  # Update the index
  git update-index -q --ignore-submodules --refresh
  err=0

  # Disallow unstaged changes in the working tree
  if ! git diff-files --quiet --ignore-submodules --
  then
    echo >&2 "You have unstaged changes."
    git diff-files --name-status -r --ignore-submodules -- >&2
    err=1
  fi
  if [ $err = 1 ]
  then
    echo >&2 "Please stage or stash your unstaged changes (git stash -k)."
    exit 1
  fi
}

require_clean_work_tree
npm run lint
