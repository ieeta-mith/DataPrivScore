#!/bin/sh

cat >.npmrc <<EOF
@bioinformatics-ua:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=$BUILD_NPM_TOKEN
EOF
