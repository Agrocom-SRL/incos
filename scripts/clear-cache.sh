#!/bin/bash
# ============================================
# Script para limpiar caché de Node.js y sistema
# ============================================

# COLORES
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# DETECTAR SI ES ROOT O NECESITA SUDO
if [ "$EUID" -eq 0 ]; then
    SUDO_CMD=""
else
    SUDO_CMD="sudo"
fi

BASE_PATH="/var/www/html/incos"
BACKEND_PATH="$BASE_PATH/backend"
FRONTEND_PATH="$BASE_PATH/frontend"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Limpieza de Caché - Sistema INCOS  ${NC}"
echo -e "${GREEN}========================================${NC}"

# [1] Detener servicios
echo -e "\n${YELLOW}[1/6]${NC} Deteniendo servicios..."
$SUDO_CMD systemctl stop incos-backend 2>/dev/null || true
echo -e "${GREEN}✓${NC} Servicios detenidos"

# [2] Limpiar caché de Node.js (node_modules/.cache)
echo -e "${YELLOW}[2/6]${NC} Limpiando caché de Node.js..."
if [ -d "$BACKEND_PATH/node_modules/.cache" ]; then
    rm -rf "$BACKEND_PATH/node_modules/.cache"
    echo -e "${GREEN}✓${NC} Caché de backend limpiada"
else
    echo -e "${BLUE}ℹ${NC} No hay caché de backend"
fi

if [ -d "$FRONTEND_PATH/node_modules/.cache" ]; then
    rm -rf "$FRONTEND_PATH/node_modules/.cache"
    echo -e "${GREEN}✓${NC} Caché de frontend limpiada"
else
    echo -e "${BLUE}ℹ${NC} No hay caché de frontend"
fi

# [3] Limpiar caché de npm
echo -e "${YELLOW}[3/6]${NC} Limpiando caché de npm..."
if command -v npm &> /dev/null; then
    npm cache clean --force 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Caché de npm limpiada"
else
    echo -e "${BLUE}ℹ${NC} npm no encontrado"
fi

# [4] Limpiar caché del sistema de archivos (si está disponible)
echo -e "${YELLOW}[4/6]${NC} Limpiando caché del sistema..."
# Limpiar caché de systemd si existe
if [ -d "/var/cache/systemd" ]; then
    $SUDO_CMD systemd-tmpfiles --clean 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Caché de systemd limpiada"
fi

# Limpiar caché de V8/Node.js si existe
if [ -d "$HOME/.node-gyp" ]; then
    rm -rf "$HOME/.node-gyp" 2>/dev/null || true
    echo -e "${GREEN}✓${NC} Caché de node-gyp limpiada"
fi

# [5] Limpiar archivos temporales de Node.js
echo -e "${YELLOW}[5/6]${NC} Limpiando archivos temporales..."
# Limpiar .eslintcache si existe
find "$BASE_PATH" -name ".eslintcache" -type f -delete 2>/dev/null || true
find "$BASE_PATH" -name ".cache" -type d -exec rm -rf {} + 2>/dev/null || true
find "$BASE_PATH" -name "*.tsbuildinfo" -type f -delete 2>/dev/null || true
echo -e "${GREEN}✓${NC} Archivos temporales limpiados"

# [6] Forzar recarga de módulos ES (limpiar require cache si existe)
echo -e "${YELLOW}[6/6]${NC} Preparando recarga de módulos..."
# Node.js ES modules no tiene caché persistente, pero podemos forzar recarga
# eliminando cualquier archivo de lock temporal
find "$BASE_PATH" -name "*.lock" -type f -delete 2>/dev/null || true
echo -e "${GREEN}✓${NC} Sistema preparado para recarga"

# [7] Reiniciar servicios
echo -e "\n${YELLOW}[7/7]${NC} Reiniciando servicios..."
$SUDO_CMD systemctl daemon-reload
$SUDO_CMD systemctl start incos-backend
sleep 2

if $SUDO_CMD systemctl is-active --quiet incos-backend; then
    echo -e "${GREEN}✓${NC} Backend reiniciado correctamente"
else
    echo -e "${RED}✗${NC} Error al reiniciar backend"
    echo -e "${YELLOW}   ${NC} Ver logs: $SUDO_CMD journalctl -u incos-backend -n 50"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ Limpieza de caché completada ${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}COMANDOS ÚTILES:${NC}"
echo -e "  • Ver logs: ${YELLOW}$SUDO_CMD journalctl -u incos-backend -f${NC}"
echo -e "  • Estado: ${YELLOW}$SUDO_CMD systemctl status incos-backend${NC}"
echo -e "  • Verificar archivo: ${YELLOW}cat $BACKEND_PATH/src/infrastructure/container/modules/estudiantes.container.js | grep 'export function'${NC}"
