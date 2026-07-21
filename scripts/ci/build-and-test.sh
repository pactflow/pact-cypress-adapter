#!/bin/bash
set -eu

echo "=====Install dependency====="
npm ci
echo "=====Check lint and format====="
npm run check
echo "=====Run unit test====="
npm run test
echo "=====Build project====="
npm run build
echo "=====Run cypress example====="
npm run test:example
