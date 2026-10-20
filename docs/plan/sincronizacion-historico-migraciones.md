# Migraciones (`05-migrations`) vs servidor hoy

> **Estado: implementado (informe) — verificado 2026-10-20.** Comprobado contra el código: informe del 2026-10-19 sobre `05-migrations/10-28`, que existen en el repo. No es un plan ejecutable; el detalle por fila vive fuera del repo (`_reportes/`). Falta: decidir qué diferencias se reconcilian.


> Generado el 2026-10-19 comparando por `id` los `INSERT` de `05-migrations/10–25` (4.ª migración: snapshot del
> servidor de su época; solo filas vivas) contra `backend/database/instituto_incos/tablas/` (servidor hoy).
> Las columnas de auditoría (`created_*`, `updated_*`, `deleted_*`) no cuentan como cambio.
> Detalle fila a fila en `backend/database/instituto_incos/_reportes/migracion_vs_servidor_<tabla>.csv` (no se versiona).

## Resumen por tabla

| Tabla | Filas migración | Filas servidor hoy | Sin cambios | Cambiadas | Ya no existen | Nuevas vivas | Nuevas inactivas | Desactivadas después |
|---|---|---|---|---|---|---|---|---|
| `documentos_estudiante` | 815 | 1220 | 813 | 2 | 0 | 402 | 3 | 2 |
| `estudiantes` | 384 | 578 | 384 | 0 | 0 | 193 | 1 | 0 |
| `estudiantes_apoderados` | 312 | 391 | 312 | 0 | 0 | 78 | 1 | 0 |
| `estudiantes_becas` | 60 | 128 | 60 | 0 | 0 | 67 | 1 | 0 |
| `estudiantes_datos_academicos` | 384 | 578 | 372 | 12 | 0 | 193 | 1 | 0 |
| `estudiantes_discapacidades` | 22 | 24 | 21 | 1 | 0 | 2 | 0 | 1 |
| `estudiantes_documentos_entrega` | 1934 | 2920 | 1934 | 0 | 0 | 981 | 5 | 0 |
| `estudiantes_origenes` | 384 | 608 | 379 | 5 | 0 | 198 | 26 | 5 |
| `inscripciones` | 383 | 578 | 382 | 1 | 0 | 195 | 0 | 1 |
| `instituciones` | 6 | 16 | 6 | 0 | 0 | 10 | 0 | 0 |
| `matriculas_materia` | 2919 | 4372 | 2912 | 7 | 0 | 1393 | 60 | 7 |
| `pago_aporte` | 384 | 582 | 374 | 10 | 0 | 194 | 4 | 1 |
| `pago_cuotas` | 398 | 617 | 392 | 6 | 0 | 216 | 3 | 2 |
| `transitabilidades` | 3 | 6 | 3 | 0 | 0 | 3 | 0 | 0 |
| `traspasos` | 3 | 10 | 3 | 0 | 0 | 7 | 0 | 0 |


- **Sin cambios**: mismo `id` y mismos valores (no se detalla).
- **Cambiadas**: mismo `id`, algún valor distinto (ver abajo).
- **Ya no existen**: estaban en la migración y hoy no hay fila con ese `id`.
- **Nuevas vivas / inactivas**: `id` que la migración no tenía; "inactivas" = `activo=0` o `deleted_at` (la migración nunca incluyó filas muertas).
- **Desactivadas después**: estaban vivas en la migración y hoy están `activo=0` o con `deleted_at`.

## Qué cambió (tablas con cambios de valor)

### `documentos_estudiante` — 2 filas cambiadas

| Columna | Filas | Transición (antes → hoy) |
|---|---|---|
| activo | 2 | `1` → `0` ×2 |

### `estudiantes_datos_academicos` — 12 filas cambiadas

| Columna | Filas | Transición (antes → hoy) |
|---|---|---|
| carrera_id | 12 | `NULL` → `2` ×5; `NULL` → `1` ×5; `1` → `NULL` ×1; `NULL` → `3` ×1 |
| estado_registro | 1 | `BORRADOR` → `ADMITIDO` ×1 |

### `estudiantes_discapacidades` — 1 filas cambiadas

| Columna | Filas | Transición (antes → hoy) |
|---|---|---|
| activo | 1 | `1` → `0` ×1 |

### `estudiantes_origenes` — 5 filas cambiadas

| Columna | Filas | Transición (antes → hoy) |
|---|---|---|
| activo | 5 | `1` → `0` ×5 |

### `inscripciones` — 1 filas cambiadas

| Columna | Filas | Transición (antes → hoy) |
|---|---|---|
| activo | 1 | `1` → `0` ×1 |

### `matriculas_materia` — 7 filas cambiadas

| Columna | Filas | Transición (antes → hoy) |
|---|---|---|
| activo | 7 | `1` → `0` ×7 |

### `pago_aporte` — 10 filas cambiadas

| Columna | Filas | Transición (antes → hoy) |
|---|---|---|
| estado | 10 | `PARCIAL` → `CANCELADO` ×10 |
| activo | 1 | `1` → `0` ×1 |

### `pago_cuotas` — 6 filas cambiadas

| Columna | Filas | Transición (antes → hoy) |
|---|---|---|
| monto | 6 | `100.00` → `300.00` ×3; `0.00` → `400.00` ×1; `200.00` → `400.00` ×1; `100.00` → `400.00` ×1 |
| descripcion | 4 | 4 valores distintos (dato personal) |
| activo | 2 | `1` → `0` ×2 |
| fecha_pago | 1 | `2026-04-30` → `2026-10-08` ×1 |

## Datos nuevos y que ya no están

- `documentos_estudiante`: 402 nuevas vivas, 3 nuevas inactivas, 2 desactivadas después
- `estudiantes`: 193 nuevas vivas, 1 nuevas inactivas
- `estudiantes_apoderados`: 78 nuevas vivas, 1 nuevas inactivas
- `estudiantes_becas`: 67 nuevas vivas, 1 nuevas inactivas
- `estudiantes_datos_academicos`: 193 nuevas vivas, 1 nuevas inactivas
- `estudiantes_discapacidades`: 2 nuevas vivas, 1 desactivadas después
- `estudiantes_documentos_entrega`: 981 nuevas vivas, 5 nuevas inactivas
- `estudiantes_origenes`: 198 nuevas vivas, 26 nuevas inactivas, 5 desactivadas después
- `inscripciones`: 195 nuevas vivas, 1 desactivadas después
- `instituciones`: 10 nuevas vivas
- `matriculas_materia`: 1393 nuevas vivas, 60 nuevas inactivas, 7 desactivadas después
- `pago_aporte`: 194 nuevas vivas, 4 nuevas inactivas, 1 desactivadas después
- `pago_cuotas`: 216 nuevas vivas, 3 nuevas inactivas, 2 desactivadas después
- `transitabilidades`: 3 nuevas vivas
- `traspasos`: 7 nuevas vivas
