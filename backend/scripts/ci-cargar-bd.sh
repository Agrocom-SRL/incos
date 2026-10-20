#!/usr/bin/env bash
# Carga una BD VACÍA y DESCARTABLE con el esquema del repo para las pruebas de integración.
#
#   database/01-schemas  ->  02-seeders  ->  03-views  ->  04-test-seeds
#
# (00-config se omite: solo hace SET GLOBAL y crea la BD de producción `instituto_incos`;
#  aquí la BD se crea con el mismo charset/collation.)
#
# Variables de entorno:
#   DB_HOST (127.0.0.1)  DB_PORT (3306)  DB_USER (root)  DB_PASSWORD ('')  DB_NAME (incos_ci_test)
#   DB_SOCKET  (opcional; si se define se usa en lugar de host/puerto, p. ej. MAMP)
#   MYSQL_BIN  (opcional; por defecto `mysql`, o `mariadb` si no existe)
#   RECREAR_BD (1) borra y recrea la BD si ya existe. Con 0 falla si existe.
#
# Seguridad: solo opera sobre una BD cuyo nombre termine en `_test`, y se niega a tocar
# `instituto_incos`. Nunca apuntar a una BD con datos reales.
set -euo pipefail

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_NAME="${DB_NAME:-incos_ci_test}"
RECREAR_BD="${RECREAR_BD:-1}"

if [[ ! "$DB_NAME" =~ ^[A-Za-z0-9_]+_test$ ]]; then
  echo "ERROR: DB_NAME debe terminar en _test (recibido: '$DB_NAME'). Se aborta para no tocar datos reales." >&2
  exit 1
fi

if [[ -n "${MYSQL_BIN:-}" ]]; then
  CLIENTE="$MYSQL_BIN"
elif command -v mysql >/dev/null 2>&1; then
  CLIENTE=mysql
elif command -v mariadb >/dev/null 2>&1; then
  CLIENTE=mariadb
else
  echo "ERROR: no se encontró el cliente mysql/mariadb (defina MYSQL_BIN)." >&2
  exit 1
fi

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/database"

ARGS=(--user="$DB_USER" --default-character-set=utf8mb4)
if [[ -n "${DB_SOCKET:-}" ]]; then
  ARGS+=(--socket="$DB_SOCKET")
else
  ARGS+=(--host="$DB_HOST" --port="$DB_PORT" --protocol=TCP)
fi
# La clave va por variable de entorno para que no aparezca en la lista de procesos.
export MYSQL_PWD="$DB_PASSWORD"

sql() { "$CLIENTE" "${ARGS[@]}" "$@"; }

echo ">> Cliente: $CLIENTE | BD: $DB_NAME"
sql -e "SELECT VERSION() AS servidor" >/dev/null || {
  echo "ERROR: no se pudo conectar al servidor de BD (host=$DB_HOST puerto=$DB_PORT socket=${DB_SOCKET:-n/a})." >&2
  exit 1
}

EXISTE="$(sql -N -e "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = '$DB_NAME'")"
if [[ "$EXISTE" != "0" && "$RECREAR_BD" != "1" ]]; then
  echo "ERROR: la BD $DB_NAME ya existe y RECREAR_BD=0." >&2
  exit 1
fi
sql -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Carga un directorio en orden numérico (sort -V: 2 < 10 < 100). Los scripts traen
# `USE instituto_incos;`: se elimina para que mande la BD de destino.
cargar_dir() {
  local dir="$1" n=0 f
  shift
  [[ -d "$RAIZ/$dir" ]] || { echo "   (sin $dir)"; return 0; }
  while IFS= read -r f; do
    if ! sed -E 's/^[[:space:]]*USE[[:space:]]+`?instituto_incos`?[[:space:]]*;[[:space:]]*$//I' "$f" \
        | sql --database="$DB_NAME" "$@" >/dev/null; then
      echo "ERROR cargando $dir/$(basename "$f")" >&2
      exit 1
    fi
    n=$((n + 1))
  done < <(find "$RAIZ/$dir" -maxdepth 1 -type f -name '*.sql' | sort -V)
  echo ">> $dir: $n archivos"
}

# Las vistas no siempre se numeran en orden de dependencia (p. ej. la 156 lee una vista
# definida en un archivo posterior). Se reintentan las pendientes hasta que no haya progreso.
cargar_vistas() {
  local pendientes=() siguientes=() f previo ok
  while IFS= read -r f; do pendientes+=("$f"); done \
    < <(find "$RAIZ/03-views" -maxdepth 1 -type f -name '*.sql' | sort -V)
  local total=${#pendientes[@]}
  while ((${#pendientes[@]} > 0)); do
    previo=${#pendientes[@]}
    siguientes=()
    for f in "${pendientes[@]}"; do
      if ! sed -E 's/^[[:space:]]*USE[[:space:]]+`?instituto_incos`?[[:space:]]*;[[:space:]]*$//I' "$f" \
          | sql --database="$DB_NAME" >/dev/null 2>&1; then
        siguientes+=("$f")
      fi
    done
    if ((${#siguientes[@]} == previo)); then
      echo "ERROR: vistas que no se pueden crear (dependencia faltante o SQL inválido):" >&2
      for f in "${siguientes[@]}"; do
        echo "  - $(basename "$f")" >&2
        sed -E 's/^[[:space:]]*USE[[:space:]]+`?instituto_incos`?[[:space:]]*;[[:space:]]*$//I' "$f" \
          | sql --database="$DB_NAME" 2>&1 >/dev/null | sed 's/^/      /' >&2 || true
      done
      exit 1
    fi
    pendientes=("${siguientes[@]+"${siguientes[@]}"}")
  done
  echo ">> 03-views: $total archivos"
}

cargar_dir 01-schemas
# Seeders con sql_mode no estricto: 22-seed-becas_descuentos.sql inserta tipo_automatica='PROMEDIO_80',
# valor que no existe en el ENUM del esquema (11-estudiantes-parte2.sql). En modo estricto aborta; aquí
# se trunca. Es una inconsistencia real del repo (reportada), no de la prueba.
cargar_dir 02-seeders --init-command="SET SESSION sql_mode=REPLACE(@@sql_mode,'STRICT_TRANS_TABLES','')"
cargar_vistas
cargar_dir 04-test-seeds

echo ">> BD $DB_NAME lista."
