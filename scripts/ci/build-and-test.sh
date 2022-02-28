#!/bin/bash
set -eu

echo "=====Install dependency====="
npm i
echo "=====Run unit test====="
npm run test
echo "=====Build project====="
npm run build 
echo "=====Run cypress example====="
npm run test:example