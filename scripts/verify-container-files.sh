#!/bin/bash
# ============================================
# Script para verificar que los archivos del container estén correctos
# Ejecutar en el servidor: bash verify-container-files.sh
# ============================================

BASE_PATH="/var/www/html/incos"
BACKEND_PATH="$BASE_PATH/backend"
CONTAINER_PATH="$BACKEND_PATH/src/infrastructure/container/modules"

echo "🔍 Verificando archivos del container..."

# Verificar que el archivo existe
if [ ! -f "$CONTAINER_PATH/estudiantes.container.js" ]; then
    echo "❌ ERROR: El archivo estudiantes.container.js NO existe"
    echo "   Ruta esperada: $CONTAINER_PATH/estudiantes.container.js"
    exit 1
fi

echo "✅ Archivo existe"

# Verificar que tiene la exportación correcta
if ! grep -q "export function registerEstudiantesModule" "$CONTAINER_PATH/estudiantes.container.js"; then
    echo "❌ ERROR: El archivo NO tiene la exportación 'export function registerEstudiantesModule'"
    echo ""
    echo "📋 Contenido del archivo (primeras 40 líneas):"
    head -40 "$CONTAINER_PATH/estudiantes.container.js"
    echo ""
    echo "💡 Solución: El archivo necesita tener esta línea:"
    echo "   export function registerEstudiantesModule(container) {"
    exit 1
fi

echo "✅ Exportación encontrada"

# Verificar sintaxis de Node.js
echo "🔍 Verificando sintaxis..."
if node --check "$CONTAINER_PATH/estudiantes.container.js" 2>&1; then
    echo "✅ Sintaxis correcta"
else
    echo "❌ ERROR: El archivo tiene errores de sintaxis"
    node --check "$CONTAINER_PATH/estudiantes.container.js"
    exit 1
fi

# Verificar que index.js puede importarlo
echo "🔍 Verificando importación..."
cd "$BACKEND_PATH" || exit 1
if node -e "import('$CONTAINER_PATH/estudiantes.container.js').then(m => { if (m.registerEstudiantesModule) { console.log('✅ Exportación encontrada'); process.exit(0); } else { console.log('❌ Exportación no encontrada'); process.exit(1); } }).catch(e => { console.error('❌ Error:', e.message); process.exit(1); })" 2>&1; then
    echo "✅ Importación exitosa"
else
    echo "❌ ERROR: No se puede importar el módulo"
    exit 1
fi

echo ""
echo "✅ Todos los archivos están correctos"
echo ""
echo "📋 Resumen:"
echo "   • Archivo existe: ✅"
echo "   • Exportación correcta: ✅"
echo "   • Sintaxis válida: ✅"
echo "   • Importación funciona: ✅"
