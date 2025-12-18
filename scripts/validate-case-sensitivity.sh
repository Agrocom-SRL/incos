#!/bin/bash
# Script para validar problemas de case-sensitivity antes de hacer commit
# Ejecutar: ./scripts/validate-case-sensitivity.sh

echo "🔍 Validando case-sensitivity en importaciones..."

cd "$(dirname "$0")/.." || exit 1

ERRORS=0

# Verificar importaciones en archivos de rutas
echo "📁 Verificando archivos de rutas..."
for route_file in frontend/src/router/modules/*.routes.jsx; do
    if [ -f "$route_file" ]; then
        # Buscar importaciones con minúsculas en @pages y @estudiantes
        while IFS= read -r line; do
            if echo "$line" | grep -qE "@pages/[a-z]|@estudiantes/[^/]*/[a-z]"; then
                echo "⚠️  $route_file: Importación con minúsculas encontrada:"
                echo "   $line"
                ERRORS=$((ERRORS + 1))
            fi
        done < "$route_file"
    fi
done

# Verificar importaciones en módulos
echo "📦 Verificando importaciones en módulos..."
find frontend/src -name "*.jsx" -o -name "*.js" | while read file; do
    if grep -qE "@estudiantes/[^/]*/[a-z]|@modules/[^/]*/[a-z]" "$file" 2>/dev/null; then
        echo "⚠️  $file: Importación con minúsculas encontrada en módulos"
        grep -E "@estudiantes/[^/]*/[a-z]|@modules/[^/]*/[a-z]" "$file" | head -3
        ERRORS=$((ERRORS + 1))
    fi
done

# Verificar importaciones en index.js de pages
echo "📄 Verificando index.js en pages..."
find frontend/src/presentation/pages -name "index.js" -type f | while read index_file; do
    if grep -q "from './[a-z]" "$index_file" 2>/dev/null; then
        dir=$(dirname "$index_file")
        # Verificar si hay archivos .jsx con mayúsculas en el mismo directorio
        for jsx_file in "$dir"/*.jsx; do
            if [ -f "$jsx_file" ]; then
                basename_file=$(basename "$jsx_file" .jsx)
                if echo "$basename_file" | grep -q "^[A-Z]"; then
                    if grep -q "from './[a-z]" "$index_file"; then
                        echo "⚠️  $index_file: Importación con minúsculas pero archivo con mayúsculas:"
                        echo "   Archivo: $basename_file.jsx"
                        ERRORS=$((ERRORS + 1))
                    fi
                fi
            fi
        done
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo "✅ No se encontraron problemas de case-sensitivity"
    exit 0
else
    echo "❌ Se encontraron $ERRORS problemas de case-sensitivity"
    echo "💡 Ejecuta: python3 fix_route_case.py (si existe) o corrige manualmente"
    exit 1
fi
