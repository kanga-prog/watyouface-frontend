#!/bin/bash

# dossier à scanner
DIR="src/components"

# regex pour className w-xx h-xx
REGEX='className="w-[0-9]+ h-[0-9]+"'

echo "=== Dry run : voici les fichiers et lignes qui seront modifiés ==="
grep -RnE "$REGEX" $DIR

echo ""
echo "=== FIN du dry run ==="
echo "Pour appliquer les modifications, réexécute le script avec l'option 'apply'"
