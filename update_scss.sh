#!/bin/bash

# Update all component SCSS files with the new import structure
find src/components -name "*.scss" -type f -exec sed -i '' 's/@import.*\/styles\/variables.scss.*/@use "..\/..\/..\/styles" as s;/g' {} \;
find src/components -name "*.scss" -type f -exec sed -i '' 's/@import.*\/styles\/mixins.scss.*//g' {} \;

echo "SCSS imports updated!"
