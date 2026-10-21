# Centralizador de notas ↔ Libro de registro (+ hallazgo Nivelación) — plan de desarrollo

> **Estado: implementado — verificado 2026-10-20.** Comprobado contra el código: ciclo cerrado; continúa en `calificaciones-centralizador-nivelacion-rediseno.md`. Falta: nada.


> **CERRADO/HECHO — continúa en `docs/plan/calificaciones-centralizador-nivelacion-rediseno.md`.**
> Este documento no se reabre; el siguiente ciclo (auditoría de la base
> Calificaciones + hoja de ruta Fases A-E, incluida la decisión de
> arquitectura Centralizador↔Nivelación) vive en ese archivo nuevo.

> Plan de alineación (2026-08-06), persistido para retomar en sesión nueva sin
> depender de la memoria de la conversación. **Alcance decidido con el
> usuario: "solo alinear y corregir"** — se mantienen "Centralizador de notas"
> y "Libros de registro" como dos módulos/menús/RBAC separados (como hoy); NO
> se fusionan, NO se consolidan los pipelines de export Excel
> (`excel/centralizador/` sigue como está). Los códigos `AP`/`PRE` que
> aparecen en los Excel reales del instituto quedan explícitamente fuera de
> alcance de este ciclo (solo se sigue modelando `NP`).
>
> **Estado:** ✔ HECHO (2026-08-06) — ver Bitácora al pie. Pendiente solo lo
> documentado como fuera de alcance (Nivelación, AP/PRE).

## 0. Contexto

El módulo "Libro de registro" (académico/libros, schema 25) se terminó en esta
misma sesión: genera el "Centralizador de Calificaciones" oficial (formato
físico del Ministerio de Educación) en Excel, a partir de la vista 135. El
módulo "Centralizador de notas" (académico/centralizador) es más viejo y fue
construido **sin considerar** que Libros existiría — hoy ambos leen la misma
vista 135 pero calculaban el veredicto "aprobado/reprobado" por caminos
distintos, lo que podía hacer que las dos pantallas mostraran un resultado
diferente para el mismo estudiante. Investigación previa (3 agentes Explore +
lectura directa del código) confirmó 5 problemas concretos — al verificar, el
diagnóstico del problema #1 **cambió respecto a la sospecha inicial** (ver abajo).

---

## Problema #1 (CRÍTICO, prioridad 1) — doble fuente de verdad para "aprobado/reprobado"

**Verificado en el código — es al revés de lo que se sospechaba al principio:**

- `GetCentralizadorParaleloUseCase.js` (líneas 126-139, ANTES del fix)
  **recalculaba** `notaAnual`/`observacion` ponderando `bim1..bim4` con
  `calcularNotaFinalGestion` + pesos de la política institucional —
  comparando `notaAnual >= notaMinimaAprobacion`. Esto SÍ estaba bien.
- `folioCeldasHelper.js::derivarEstadoAcademico()` (usado por el Libro al
  generar folios) decidía `REPROBADO` solo si `fila.estado === 'REPROBADO'` —
  pero, verificado por grep exhaustivo de todos los `UPDATE matriculas_materia`
  del backend, **ningún caso de uso escribe `matriculas_materia.estado` a
  `APROBADO`/`REPROBADO`/`ABANDONO`/`RETIRADO`** (solo llega hasta `CURSANDO`,
  vía `SubjectEnrollmentRepository.marcarCursandoPorGestion/marcarCursandoPorInscripcion`).
  **Consecuencia real: el Libro tenía un bug silencioso que marcaba a
  CUALQUIER estudiante como APROBADO** (la condición `algunaReprobada` nunca
  era `true`). Centralizador sí calculaba bien. Es decir: **el que había que
  arreglar era el Libro, no Centralizador** — al revés de la sospecha inicial.
- La nota NUMÉRICA sí coincide matemáticamente (mismo `pesosBimestres`, misma
  fórmula) — ahí el recálculo de Centralizador era redundante y se elimina en
  favor del caché `nota_final`; el veredicto APROBADO/REPROBADO es lo que
  había que unificar y corregir en un solo sitio.

### Solución aplicada: una función de veredicto pura y compartida

1. **`backend/src/application/use-cases/academico/libros/helpers/folioCeldasHelper.js`**
   — nueva función exportada `calcularVeredictoMateria(fila135, notaMinimaAprobacion)`:
   decide `ABANDONO` si `estado ∈ {ABANDONO, RETIRADO}`, `CURSANDO` si
   `nota_final == null`, si no `APROBADO`/`REPROBADO` por umbral. Es la fuente
   ÚNICA de veredicto, usada por AMBOS módulos. `derivarEstadoAcademico`
   ahora recibe `notaMinimaAprobacion` y agrega el veredicto por materia (misma
   semántica de siempre: alguna REPROBADO → REPROBADO; alguna CURSANDO →
   CURSANDO; todas ABANDONO → ABANDONO; si no, APROBADO).
2. **`helpers/generarFoliosParaleloHelper.js`** — `calcularPaginasParalelo` y
   `generarParaUnParalelo` reciben `notaMinimaAprobacion` y lo pasan al helper.
3. **`GenerarFoliosParaleloUseCase.js` / `GenerarFoliosGestionUseCase.js`** —
   inyectan `calificacionContextoRepository` + `evaluationConfigurationRepository`
   (mismo patrón que `GetCentralizadorParaleloUseCase`), cargan
   `cargarCuotasPoliticaGestion(...)` **una sola vez** (en la variante de
   gestión, antes del loop de paralelos) y pasan `notaMinimaAprobacion`.
4. **`libros.container.js`** — registra esos dos repositorios (tokens ya
   existentes) en `generarFoliosParaleloUseCase`/`generarFoliosGestionUseCase`.
5. **`GetCentralizadorParaleloUseCase.js`** — usa `calcularVeredictoMateria`
   en vez de recalcular: `notaAnual` pasa a ser `row.nota_final` (cuando
   `gestionCompleta`), `observacion` sale de `calcularVeredictoMateria`.
   Contrato de salida sin cambios (mismos nombres/tipos de campo) → no rompe
   `CentralizadorAnualGrid.jsx`, el boletín PDF, ni los exports bimestrales
   (verificado: solo consumen `bim1..bim4`/`observacionesBimestre`, nunca
   `notaAnual`/`observacion`). El export anual de P2
   (`ExportCentralizadorAnualParaleloExcelUseCase.js`) NO reutiliza este use
   case — reutiliza el pipeline del propio Libro leyendo `folio_estudiantes`
   congelado, sin riesgo cruzado.

**Importante:** folios YA generados no se tocan retroactivamente (siguen
leyendo su snapshot congelado); solo folios nuevos o reajustados ("Generar
todos los folios") usan el veredicto corregido.

---

## Problema #2 (prioridad 2) — badge Libro/Folio falta en la vista bimestral (P3)

`useCentralizadorParalelo.js` ya trae `libro` del backend sin importar la
ruta (P2 o P3); solo faltaba usarlo en pantalla.

**`CentralizadorMatrizPage.jsx`** — destructura `libro` del hook, importa
`CentralizadorLibroBadge` (igual que ya hace `CentralizadorAnualPage.jsx`) y
lo renderiza junto a `CentralizadorContextoHeader`. Sin cambios de backend.

---

## Problema #3 (prioridad 3) — "Observaciones" ambiguo en P3

Dos campos con el mismo nombre visual, semántica distinta:
`bimestres_matricula.observaciones` (por bimestre, editable en P3) vs
`folio_estudiantes.observaciones` (por folio/anual, editable solo en
`FolioPreviewPage.jsx`).

**`CentralizadorGrid.jsx`** — columna `'Observaciones'` → `'Observación del
bimestre'` (el placeholder del `TextArea` ya decía eso, solo faltaba el
encabezado). No se toca `FolioPreviewPage.jsx` (ahí ya es inambiguo).

---

## Problema #4 (prioridad 4) — leyenda NP/AP/PRE describe códigos que el sistema no modela

El sistema nunca produce `'AP'`/`'PRE'` en ninguna celda; P3 tampoco muestra
nunca el texto `'NP'` (usa `—`).

- `backend/src/domain/constants/libros.constants.js` →
  `LIBRO_REGISTRO_DOC.leyendaNotas`: solo `'NP = No se Presentó'`.
- `frontend/.../libros/utils/libroDoc.js` → mismo texto (espejo backend/frontend).
- `CentralizadorGrid.jsx` (`LeyendaCentralizador`): quita las líneas NP/AP/PRE
  (no aplican a esa pantalla), deja solo la leyenda real de puntaje bimestral.

---

## Problema #5 (prioridad 5) — documentación desalineada

**`docs/referencia/matriz-permisos-sistema.md`**, sección "ACA - Libros de
registro": describía el diseño VIEJO (1 libro por carrera+gestión,
`BORRADOR→IMPRESO→FIRMADO`). Se actualiza a: 1 libro por GESTIÓN compartido
por las 3 carreras; folio `BORRADOR→ANULADO` (sin IMPRESO/FIRMADO, el cierre
oficial es `libros_registro.estado`); EDITAR bloqueado solo si el folio está
ANULADO.

---

## Hallazgo relacionado, FUERA de este plan: "Nivelación"

Durante la sesión se revisaron 3 Excel reales de "CENTRALIZADOR DE NIVELACIÓN"
del instituto (`/Users/miguel/Documents/incos/NIVELACION {SISTEMAS,ADMI,CONTA}...xlsx`)
para responder si debían entrar al menú Centralizador.

**Respuesta: no van dentro de "Centralizador de notas" — ya existe un menú
propio reservado para esto** (`academico/nivelaciones`, rutas `/listar`
`/inscribir` `/aprobar`), hoy apuntando a `<UnderConstruction />` y con sus
permisos RBAC desactivados a propósito (`activo=0` desde 2026-06-24, "se
ocultan hasta que las pantallas existan" — junto con Traspasos y Transitabilidad).

Lo notable: el schema (`backend/database/01-schemas/16-nivelaciones.sql`,
tablas `historial_matricula` + `nivelaciones`) **ya fue diseñado pensando en
estos libros reales** — el ENUM `historial_matricula.tipo_estado` mapea casi
1:1 contra los valores encontrados en los Excel:

| Excel real | `tipo_estado` ya definido |
|---|---|
| AP-2024 / AP GESTIÓN 2024 (aprobado gestión anterior) | no es un `tipo_estado`; es `matriculas_materia.estado=APROBADO` en esa gestión |
| NIVELA 1RA/2DA INSTANCIA | `NIVELACION_1RA` / `NIVELACION_2DA` |
| NIVELA ART. 18 | `ARTICULO_18` |
| VENCIDA EN LA GESTIÓN 2024 | `VENCIDA` |
| CHOQUE DE HORARIO | `CHOQUE_HORARIO` |
| PRE REQUISITO | `PRE_REQUISITO` |
| NO LLEVA POR VOLUNTAD PROPIA | `NO_LLEVA_POR_VOLUNTAD` |
| CURSA LA ASIGNATURA / LLEVA EN [año] | `LLEVA_EN_GESTION` |
| HOMOLOGACIÓN / REINCORPORACIÓN | `HOMOLOGACION` / `REINCORPORACION` |

Tabla `nivelaciones` (el examen puntual en sí): `historial_matricula_id`,
`gestion_id`, `docente_evaluador_id`, `fecha_examen`, `nota_nivelacion`,
`estado` ENUM(`PROGRAMADA/EN_CURSO/APROBADA/REPROBADA/CANCELADA`), `aprobado`.

Pero las tablas están vacías, sin controller/router, sin seeders, sin pantalla
real (`domain`/`infra` existen — modelos, entidad `Leveling`,
`LevelingRepository`, `SubjectEnrollmentHistoryRepository` — pero nada de
`application`/`presentation` los usa). Es un dominio propio (historial de
arrastre de materias multi-gestión), materialmente más grande que este ajuste
y con su propio menú ya reservado.

**No se diseña dentro de este ciclo.** Recomendación para una sesión dedicada
futura: activar `academico.nivelacion.*`, construir use cases/controllers
sobre los repositorios que ya existen, y la pantalla real reemplazando el
stub `<UnderConstruction />`.

---

## Verificación

- Backend: lint de los archivos tocados.
- Generar folios de un paralelo con al menos un estudiante con nota por
  debajo del mínimo institucional → confirmar que `folio_estudiantes.estado_academico`
  ahora sí queda en `REPROBADO` (antes quedaba `APROBADO` siempre).
- Abrir P2 (`CentralizadorAnualPage`) del mismo paralelo → confirmar que
  `observacion`/`notaAnual` no cambiaron de valor para ningún estudiante
  (mismo número que antes, solo cambia la fuente del cómputo).
- Abrir P3 (`CentralizadorMatrizPage`) → badge Libro/Folio visible (si el
  paralelo ya tiene folios) y columna "Observación del bimestre".
- Exportar el Excel del folio (Libro) y el Excel anual de Centralizador →
  leyenda al pie dice solo "NP = No se Presentó".
- Frontend: lint.

---

## Bitácora de cambios

- **2026-08-06:** plan escrito, revisado (3 agentes Explore + Plan agent +
  lectura directa) y aprobado por el usuario. **Implementación completa en la
  misma sesión:**
  - [x] Problema #1.1 — `calcularVeredictoMateria` agregada y `derivarEstadoAcademico`
        actualizado en `folioCeldasHelper.js`.
  - [x] Problema #1.2 — `generarFoliosParaleloHelper.js` propaga `notaMinimaAprobacion`.
  - [x] Problema #1.3 — `GenerarFoliosParaleloUseCase.js` / `GenerarFoliosGestionUseCase.js`
        cargan la política institucional (`cargarCuotasPoliticaGestion`, una
        sola vez en la variante de gestión, antes del loop de paralelos).
  - [x] Problema #1.4 — `libros.container.js` registra `calificacionContextoRepository`
        + `evaluationConfigurationRepository` en ambos use cases.
  - [x] Problema #1.5 — `GetCentralizadorParaleloUseCase.js` usa
        `calcularVeredictoMateria` en vez de recalcular; `notaAnual` pasa a
        ser `row.nota_final`.
  - [x] Problema #2 — badge Libro/Folio agregado a `CentralizadorMatrizPage.jsx` (P3).
  - [x] Problema #3 — columna renombrada a "Observación del bimestre" en `CentralizadorGrid.jsx`.
  - [x] Problema #4 — leyenda recortada a solo `'NP = No se Presentó'` en
        `libros.constants.js` (backend), `libroDoc.js` (frontend) y
        `LeyendaCentralizador` (`CentralizadorGrid.jsx`).
  - [x] Problema #5 — `matriz-permisos-sistema.md` actualizado (sección "ACA -
        Libros de registro" + tabla de endpoints): 1 libro por GESTIÓN
        compartido por 3 carreras, `BORRADOR→ANULADO` sin IMPRESO/FIRMADO,
        EDITAR bloqueado solo si ANULADO, endpoint de generación por gestión
        agregado a la tabla.
  - [x] Verificación: lint backend limpio en archivos tocados (2 violaciones
        `max-len`/`no-continue` preexistentes en `GetCentralizadorParaleloUseCase.js`,
        ajenas a este cambio, en el bloque de observaciones de bimestre — no
        tocadas); lint frontend limpio; dry-run del container DI (los 3 use
        cases tocados resuelven, con las nuevas dependencias inyectadas);
        smoke test de `calcularVeredictoMateria`/`derivarEstadoAcademico` con
        datos mock (reprobado/aprobado/cursando/abandono, los 4 casos OK —
        confirmado que el caso "materia reprobada" ahora sí devuelve
        REPROBADO, antes devolvía APROBADO siempre).
  - Pendiente (fuera de alcance, ver sección "Hallazgo relacionado" arriba):
    reajustar folios YA generados si se quiere que reflejen el veredicto
    corregido (botón "Generar todos los folios" en `LibroDetailPage`, no
    automático); 2-3 tests unitarios formales para `folioCeldasHelper.js`/
    `GetCentralizadorParaleloUseCase.js` (recomendado, no bloqueante);
    iniciativa "Nivelación" (dominio propio, sesión dedicada).
