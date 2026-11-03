#!/usr/bin/env bash
# Escaneo ligero de secretos en archivos versionados (sin dependencias ni licencias).
# Busca claves privadas, tokens de proveedores conocidos y asignaciones literales de
# credenciales reales. Falla (exit 1) si encuentra coincidencias.
#
# Excluye plantillas (.env.example), lockfiles, pruebas y documentación, donde las claves
# son literales de prueba. Para un falso positivo puntual añada `# secreto-ok` en la línea.
#
# Uso (desde la raíz del repo):  bash backend/scripts/ci-escanear-secretos.sh
set -uo pipefail

RAIZ="$(git rev-parse --show-toplevel)"
cd "$RAIZ"

EXCLUIR=(
  ':(exclude)*package-lock.json'
  ':(exclude)*.lock'
  ':(exclude).env.example'
  ':(exclude)*/.env.example'
  ':(exclude)backend/tests/*'
  ':(exclude)backend/src/infrastructure/container/tokens/*'
  ':(exclude)frontend/**/*.test.*'
  ':(exclude)docs/*'
  ':(exclude)*.md'
  ':(exclude)backend/scripts/ci-escanear-secretos.sh'
)

PATRONES=(
  '-----BEGIN (RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY'
  'AKIA[0-9A-Z]{16}'
  'gh[pousr]_[A-Za-z0-9]{36,}'
  'github_pat_[A-Za-z0-9_]{50,}'
  'xox[baprs]-[A-Za-z0-9-]{10,}'
  'sk-[A-Za-z0-9]{32,}'
  'AIza[0-9A-Za-z_-]{35}'
  '(password|passwd|secret|api[_-]?key|token)[A-Za-z_]*[[:space:]]*[:=][[:space:]]*["'"'"'][A-Za-z0-9/+_=.-]{16,}["'"'"']'
  '(mysql|postgres|mongodb)(\+srv)?://[^:/[:space:]]+:[^@[:space:]]{4,}@'
)

hallazgos=0
for patron in "${PATRONES[@]}"; do
  salida="$(git grep -nIE -e "$patron" -- . "${EXCLUIR[@]}" | grep -v 'secreto-ok' || true)"
  if [ -n "$salida" ]; then
    echo "::error::Posible secreto (patrón: $patron)"
    # Muestra archivo:línea sin imprimir el valor completo.
    echo "$salida" | cut -c1-120 | sed 's/\(.\{60\}\).*/\1.../'
    hallazgos=1
  fi
done

if [ "$hallazgos" -ne 0 ]; then
  echo "Se encontraron posibles secretos versionados. Revise, rote la credencial y quítela del repo."
  exit 1
fi
echo "Sin secretos evidentes en archivos versionados."
