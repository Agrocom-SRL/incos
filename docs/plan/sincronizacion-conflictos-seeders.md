# Conflictos seeders (`02-seeders`) vs servidor

> Generado el 2026-10-19. Compara los `INSERT` de `02-seeders/` contra los datos del servidor
> (`backend/database/instituto_incos/tablas/`) **por `id`**. Se omiten las filas idénticas.
> Los valores personales aparecen como `[dato personal]`.
> Prioridad acordada: **servidor** manda en los datos; **seeder** manda en roles/permisos (RBAC)
> y en horarios 2026.
> Histórico de la 4.ª migración: [sincronizacion-historico-migraciones.md](sincronizacion-historico-migraciones.md).

## 1. Resultado

El seeder y el servidor coinciden casi por completo: **33 tablas (1.849 filas) son idénticas** y no
se detallan: actividades, actividades_calendario, asignacion_horarios, asignaciones_docentes,
asignaturas_plan, aulas, bancos_autorizados, carreras, configuracion_aportes, cuentas_pago,
departamentos, documentacion, estados_civiles, gestiones, gestiones_planes, horarios, idiomas,
materias, metodos_pago, municipios, oferta_cursos, paises, paralelos, paralelos_gestion, periodos,
periodos_academicos, planes_estudios, prerrequisitos, provincias, roles, tipos_discapacidad,
tipos_evaluacion, tipos_parentesco.

**Horarios 2026:** `horarios` (60 filas) y `asignacion_horarios` (540 filas) son **idénticos** al
servidor, igual que `asignaciones_docentes` (140), `oferta_cursos` (140) y `paralelos_gestion` (18).
No hay conflicto de `id` en la cadena de horarios: el servidor ya tiene exactamente las
combinaciones del seeder. (Esto resuelve el riesgo anotado en el plan, §2 regla 3.)

| Tabla | Seeder | Servidor | Iguales | Conflictos | Solo seeder | Solo servidor |
|-------|--------|----------|---------|------------|-------------|---------------|
| `becas_descuentos` | 12 | 12 | 11 | **1** (resuelto) | 0 | 0 |
| `configuracion_sistema` | 5 | 7 | 1 | **4** | 0 | **2** |
| `docentes` | 33 | 33 | 32 | **1** | 0 | 0 |
| `configuracion_evaluacion` | 4 | 3 | 3 | 0 | **1** | 0 |
| `usuarios` | 1 | 2 | 1 | 0 | 0 | **1** |
| `personal` | 1 (sin `id`) | 4 | — | — | — | — |
| `modalidades_grado` | 4 (seed 57) | tabla nueva | — | — | 4 | — |
| `permisos` (por `codigo`) | 118 | 126 | 105 | — | 13 | 21 |
| `grupos_ui` (por `codigo`) | 68 | 69 | 63 | — | 5 | 6 |

## 2. Conflictos por `id` (mismo `id`, valor distinto) — RESUELTOS

Decisiones del 2026-10-19:

| Tabla / id | Seeder | Servidor | Resolución |
|-----------|--------|----------|------------|
| `configuracion_sistema` 2–5 (contadores `admision_gestion_2026…2023`) | 305 / 96 / 4 / 1 | 319 / 200 / 53 / 26 | **Servidor oficial.** `tablas/` ya los trae; el seeder 21 no se modifica |
| `configuracion_sistema` 6–7 (`admision_gestion_2022`, `_2021`) | no existían | 5 / 1 | Se quedan (ya están en `tablas/`) |
| `docentes` 12 `color_hex` | `#ABCD9D` | `#E4DD55` | **Servidor.** `tablas/` ya lo trae; el seeder 26 no se modifica |
| `becas_descuentos` 6 `tipo_automatica` | `PROMEDIO_80` | `''` (inválido) | **`PROMEDIO_80`** aplicado en `tablas/becas_descuentos.sql` |

**Hallazgo en `becas_descuentos` 6:** el `''` del servidor se debía a que el `ENUM` de
`tipo_automatica` solo permitía `('PROMEDIO_90','MANUAL')`: `PROMEDIO_80` no existía, MySQL guardó
`''`. Por eso se amplió el enum a `('PROMEDIO_90','PROMEDIO_80','MANUAL')` **solo en
`tablas/becas_descuentos.sql`** (los archivos de `tablas/` son los que se ejecutan; `01-schemas/` y
`02-seeders/` no se tocan en este proceso).

> Pendiente fuera de la base de datos: `backend/src/domain/constants/becas.constants.js` y
> `presentation/validators/estudiantes/beca-descuento.validator.js` solo conocen `PROMEDIO_90`/`MANUAL`;
> `PROMEDIO_80` no aparece en backend ni frontend. Al editar esa beca desde la UI el validador
> podría rechazarla. Ver si se agrega la constante y la regla de `promedioMinimo`.

## 3. Filas que solo existen de un lado

| Tabla | Fila | De dónde | Qué se hizo |
|-------|------|----------|-------------|
| `configuracion_evaluacion` | id 4 `ACOMPANAMIENTO_ASISTENCIA` (umbral 75 %, `ULTIMO_BIMESTRE`) | solo seeder 54 | **Agregada** a `tablas/configuracion_evaluacion.sql` (y `AUTO_INCREMENT` 4 → 5) |
| `modalidades_grado` | PSP, PG, PE, TD | solo seeder 57 (tabla nueva) | **Agregadas** a `tablas/modalidades_grado.sql` |
| `usuarios` | id 2 `secretaria` (`rol_id` 1, `tipo_referencia` DIRECTOR, `referencia_id` 4) | solo servidor | Se queda (el seed 56 solo crea `admin`) |
| `personal` | 3 de las 4 filas | solo servidor | Se quedan; el seed 56 inserta 1 fila sin `id` y se omite |
| `configuracion_sistema` | ids 6 y 7 | solo servidor | Se quedan |

> `usuarios` id 2 (`secretaria`) se queda tal como está en el servidor, con `rol_id` = 1
> (`ADMIN_SISTEMA`) y `tipo_referencia` DIRECTOR / `referencia_id` 4. Decisión confirmada el 2026-10-19.

## 4. RBAC — manda el seeder

Los seeders 58–67 no usan `id` (referencian por `codigo`), así que se comparan por código:

- **13 permisos solo en el seeder** (nuevos): `academico.acompanamiento.{alerta,panel,sesion}`,
  `academico.desercion`, `academico.libro`, `docentes.supervision.ficha`, `titulacion.avance`,
  `titulacion.bitacora`, `titulacion.pasantia{,.empresa,.informe,.seguimiento}`, `titulacion.proyecto`.
- **21 permisos solo en el servidor** (antiguos, que los seeds dieron de baja o reemplazaron):
  `academico.historial.{folio,validar}`, `docentes.supervision.{evaluar,programar,reporte,
  ficha.crear,ficha.editar,pasantia.evaluar,pasantia.seguimiento,pasantia.solicitar}`,
  `matricula.pasantia.{aprobar,evaluar,solicitar,ver}`, `reportes.{asistencia,avance_academico,
  desercion}`, `reportes.solicitudes.{becas,general,pasantia,traspaso}`.
- **grupos_ui:** 5 nuevos (`aca_acompanamiento`, `aca_desercion`, `aca_libros`, `tit_pasantias`,
  `tit_proyectos`); 6 solo en el servidor (`doc_pasantias`, `mat_pasantias`, `rep_asistencia`,
  `rep_avance`, `rep_desercion`, `rep_solicitudes`).

**Aplicado en `tablas/`:** `permisos`, `permiso_acciones`, `roles_permisos` y `grupos_ui` ya **no
llevan datos** (1.291 filas en total). Se apartaron en
`backend/database/instituto_incos/_descartado_rbac/` por si hay que consultar qué tenía cada
rol (`roles_permisos` del servidor: 755 asignaciones; RECTOR 312, DIR_ACADEMICO 222, DIR_ADMIN 105, …).
Se cargan ejecutando los seeders 58–67 sobre la base ya poblada.

> Nota: los seeds 59, 60, 61, 63 y 66 ya traen `UPDATE`/`DELETE` que dan de baja códigos viejos
> (`@fecha_baja`); por eso el servidor tiene permisos que el seeder ya no define.

## 5. Seeders y schemas del repo (sin cambios)

Por decisión del 2026-10-19 **no se modifican** `01-schemas/` ni `02-seeders/`: todos los ajustes viven
en `backend/database/instituto_incos/tablas/`, que es lo que se ejecuta. Quedan como deuda a revisar
más adelante, fuera de esta sincronización:

| Archivo | Diferencia con `tablas/` |
|---------|--------------------------|
| `02-seeders/21-seed-configuracion-sistema.sql` | Contadores ids 2–5 y filas 6–7 distintos |
| `02-seeders/26-seed-docentes.sql` | `color_hex` del docente 12 |
| `01-schemas/11-estudiantes-parte2.sql` | Enum `tipo_automatica` sin `PROMEDIO_80` |
