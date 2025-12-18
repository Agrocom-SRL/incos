#!/bin/bash
# ============================================
# Script SIMPLE para limpiar caché en el servidor
# Ejecutar directamente en el servidor: bash clear-cache-server.sh
# ============================================

BASE_PATH="/var/www/html/incos"
BACKEND_PATH="$BASE_PATH/backend"

echo "🧹 Limpiando caché de Node.js..."

# Detener servicio
sudo systemctl stop incos-backend 2>/dev/null || true

# Limpiar caché
rm -rf "$BACKEND_PATH/node_modules/.cache" 2>/dev/null || true
find "$BACKEND_PATH" -name ".eslintcache" -type f -delete 2>/dev/null || true
find "$BACKEND_PATH" -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true

# Limpiar caché de npm
npm cache clean --force 2>/dev/null || true

# Recargar systemd
sudo systemctl daemon-reload

# Reiniciar servicio
sudo systemctl start incos-backend

echo "✅ Caché limpiada y servicio reiniciado"
echo "📋 Ver logs: sudo journalctl -u incos-backend -f"
