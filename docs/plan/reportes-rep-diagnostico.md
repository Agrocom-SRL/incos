# Módulo Reportes (REP) — diagnóstico y recomendación

> Informe del `arquitecto` (2026-07-29), a pedido del usuario: cruzar el seed
> 63 contra las exportaciones ya existentes en EstudiantesList,
> InscripcionesList, PagosList y BecasList (+ resto del sistema).
> **Recomendación central: disolver REP — los reportes viven con su módulo
> dueño.** Decisión del usuario pendiente al pie.

## 1. Qué define hoy el seed 63

`backend/database/02-seeders/63-seed-permisos-rep.sql`: 4 grupos UI
(`rep_avance`, `rep_asistencia`, `rep_desercion`, `rep_solicitudes`) y **7
permisos** con LISTAR+EXPORTAR (`reportes.avance_academico`,
`reportes.asistencia`, `reportes.desercion`,
`reportes.solicitudes.{general,becas,traspaso,pasantia}`). Roles: RECTOR en
todos; DIR_ADMIN solo en `solicitudes.pasantia`. Bloque final (2026-06-24) de
**deshabilitación total** (`activo=0, deleted_at`). La sección REP de la
matriz (~línea 981) está obsoleta (solo una acción genérica "VER").

Matiz sobre la auditoría: "sin backend ni frontend" es impreciso — existe
esqueleto frontend (`modules/reportes/routes.jsx`, 8 rutas UnderConstruction,
registradas en `presentation/modules/index.js`, iconos `REP-*` en
`menuIcons.js`). Backend: cero.

## 2. Exportaciones/reportes YA construidos (inventario verificado)

| Capacidad | Permiso (acción) | Endpoint / generador |
|---|---|---|
| Estadística de inscritos (EstudiantesList) | `matricula.admision.ver` EXPORTAR | `GET /estudiantes/export/estadistica-inscritos` → vista 06 |
| Lista de inscritos por carrera (InscripcionesList) | `matricula.admision.ver`/`matricula.inscribir` EXPORTAR | `GET /estudiantes/export/lista-inscritos-por-carrera` → vistas 34/88 |
| Excel de aportes por carrera (PagosList) | `finanzas.pago.ver`/`matricula.pago.aporte.ver` EXPORTAR | `GET /pagos-aportes/export/lista-por-carrera` → vistas 89/90 |
| **Becas por carrera** (FIN→Reportes, real) | `finanzas.beca.reporte` | `GET /pagos-aportes/reportes/becas-por-carrera(+/export)` + página |
| **Cuentas por cobrar** (FIN→Reportes, real) | `finanzas.cuenta-cobrar.reporte` | ídem + página |
| Centralizador por paralelo/carrera | `academico.calificacion.centralizador` EXPORTAR | vista 135 |
| Cuaderno pedagógico Excel + boletín PDF | `academico.calificacion.cuaderno` | `BoletinPdfGenerator` |
| Historial académico (kardex) Excel+PDF, self ESTUDIANTE | `academico.historial.academico` EXPORTAR | vistas 141–143 |
| Inscritos de Capacitación | `capacitacion.inscripcion` EXPORTAR | builder propio |
| Panel acompañamiento PDF, bitácora tutor, dictámenes | `tutorias.*` EXPORTAR | vistas 156–158, 163 |

Toolkit consolidado: `excel/shared/` (`ExcelSheetComposer`, `ExcelTheme`) y
`pdf/IncosPDFLibBase.js`. **Deuda detectada de paso:** `docentes.ver`
EXPORTAR, `docentes.supervision.reporte` EXPORTAR y `capacitacion.pago`
EXPORTAR están sembrados **sin endpoint**.

## 3. Cruce seed 63 → estado

| Código seed 63 | Estado | Reemplazo |
|---|---|---|
| `reportes.avance_academico` | Parcial, duplicado | Dueño ACA: `academico.avance` (bloque off del seed 59, ruta `/academico/avance` ya existe con `labelByRole` ESTUDIANTE "Mi avance"); falta vista de % avance sobre la 141 (revisar si la 143 ya trae numerador) + endpoint + Excel + página |
| `reportes.asistencia` | Parcial, duplicado | `academico.asistencia.consolidado.ver` está **ACTIVO** en seed 59; ruta placeholder declarada; falta vista % (agregación de la 133/134) + endpoint + página Consolidado |
| `reportes.desercion` | Falta el reporte; el dato existe | Único sin dueño actual → dueño propuesto ACA (`academico.desercion` nuevo): vistas fila+agregado carrera×gestión espejo de 156/157 pero sobre estados ABANDONO/RETIRADO de `matriculas_materia` |
| `reportes.solicitudes.general` | Falta todo | Bandeja transversal prematura (depende de traspasos y pasantías): retirar y re-evaluar después |
| `reportes.solicitudes.becas` | **Cubierto** | FIN→Reportes Becas + BecasList (vista 137). Retirar |
| `reportes.solicitudes.traspaso` | Falta, dueño definido | Nacerá con el ítem ACA traspasos (bloque off seed 59). Retirar código REP |
| `reportes.solicitudes.pasantia` | Falta, dueño en construcción | Módulo Pasantías (Fase 2) es el dueño. Retirar código REP |

## 4. Recomendación de arquitectura: disolver REP

REP **no** debe existir como módulo con páginas propias. Precedente
inequívoco del repo: los reportes viven con su dominio (`finanzas/reportes/`
con hub propio, centralizador en Calificaciones, historial en Estudiantes,
inscritos en Capacitación). Un dominio REP paralelo duplicaría permisos
EXPORTAR (costo visible en los guards duales existentes), generadores y
entradas de menú — la misma deuda que la regla de vistas prohíbe en SQL,
trasladada a RBAC.

1. **Avance académico** → ítem ACA `academico.avance` (rehabilitar bloque off
   seed 59). Página con dos pestañas: "Avance" (permiso `academico.avance`) y
   "Deserción" (permiso nuevo `academico.desercion`, LISTAR/EXPORTAR,
   RECTOR/DIR_ACADEMICO) — comparten grano; `PermisoGuard` por pestaña.
2. **Asistencia** → ya es el Consolidado % de ACA Asistencia; solo construirlo.
3. **Solicitudes** → nada en REP (becas cubierto; traspaso/pasantía nacen con
   sus dueños; general diferido).
4. Hub transversal de menú: **no recomendado**. Si se quiere descubribilidad
   para RECTOR: tarjetas en su dashboard con `PermisoGuard` de los códigos
   dueños (mejora posterior, cero permisos nuevos).

## 5. Plan por partes (si se aprueba la disolución)

**Iteración 1 — backend** (vistas/seeds en BD requieren aprobación):
- Vistas (números libres al momento del merge, tras Fases 2/3): consolidado
  asistencia (agregación sobre 133/134; revisar si basta GROUP BY sobre la
  133), avance (estudiante×plan sobre 141/143), deserción (fila + agregado,
  espejo estructural de 156/157 — consumidor distinto justificado: métrica
  institucional de abandono, no riesgo por notas).
- Repos arquetipo B, use cases `Get*`/`Export*Excel` en
  `use-cases/academico/`, Excel con toolkit `shared/` (planilla verde),
  endpoints en rutas ACA con permisos ACA.
- Seeds: rehabilitar en el 59 `academico.avance` + añadir
  `academico.desercion`; **del 63 no se rehabilita nada** — retiro definitivo
  de los 7 documentado en el archivo y en la matriz con el reemplazo de cada
  uno. Decidir también los EXPORTAR huérfanos (`docentes.ver`,
  `docentes.supervision.reporte`, `capacitacion.pago`).

**Iteración 2 — frontend:**
- `modules/academico/avance/`: página con tabs Avance/Deserción (reemplaza
  UnderConstruction), hooks api/state, columnas, `ActionButton` EXPORTAR.
- `modules/academico/asistencia/`: página Consolidado % en la ruta declarada.
- Limpieza REP: borrar `modules/reportes/routes.jsx`, su registro en
  `presentation/modules/index.js`, iconos `REP-*`.
- Matriz: sección REP → retiro + punteros a los dueños.

## 6. Riesgos

- No clonar generadores: usar toolkit `shared/` + patrón builder por reporte.
- Los EXPORTAR quedan con el módulo dueño (patrón vigente) — rehabilitar el
  63 crearía pares de códigos y guards `permisoAny` en cascada.
- Numeración de vistas: asignar al integrar (colisión con Fases 2/3).
- **Deserción por bimestre**: ABANDONO/RETIRADO son consolidados anuales; si
  se pide deserción intra-gestión habría que derivarla también de asistencia
  (133) — validar grano con el usuario antes de fijar la vista.
- Código muerto: secuenciar la rehabilitación de `academico.avance` con el
  despliegue de su página (no mostrar menú hacia UnderConstruction).

## Decisión del usuario (2026-07-29)

- [x] **Disolución de REP APROBADA**: retiro de los 7 códigos del seed 63 +
  limpieza del esqueleto frontend; Avance/Deserción y Consolidado de
  asistencia se construyen bajo ACA.
- [x] **Grano de deserción: ANUAL por estados de matrícula**
  (ABANDONO/RETIRADO de `matriculas_materia`, vistas espejo de 156/157).
  La variante intra-gestión por asistencia queda como evolución futura si el
  instituto la pide.
