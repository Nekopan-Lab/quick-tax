#!/bin/bash
# Git clean filter - strips DEVELOPMENT_TEAM value on commit
sed 's/DEVELOPMENT_TEAM = [A-Z0-9]*;/DEVELOPMENT_TEAM = "";/g'