#!/usr/bin/env bash

set -e

echo "postCreateCommand: running as: $(id)"

echo "postCreateCommand: Fixing permissions"
sudo chown node \
  ~/.ssh \
  ~/.config

echo "postCreateCommand: Updating omz plugins"
sed -i 's/^plugins=.*/plugins=(git gh z)/' ~/.zshrc

echo "postCreateCommand: Configuring zsh history"
echo "# hist config
export HISTSIZE=1000000
export SAVEHIST=1000000
" > ~/.oh-my-zsh/custom/history.zsh
