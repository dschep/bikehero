#!/bin/bash

for i in 57 60 72 76 114 120 144 152 180 32 194 96 192 16; do
    convert -background none -scale ${i}x${i} logo.svg logo-w$i.png
done
