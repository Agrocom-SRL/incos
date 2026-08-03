# Fase 4 — Libros de registro (schema 25, ítem de ACA) — plan de desarrollo

> Plan del `planificador` (2026-07-29), persistido para ejecutar por iteraciones.
> **Entrega por partes:** Iteración 1 = datos + RBAC + backend + documentación
> (bloques A archivos, B edición, C, E). Iteración 2 = frontend + verificación
> (bloques D, F). Los hitos de BD (ejecutar vistas A6, resembrar seed B3)
> requieren aprobación explícita del usuario en cualquiera de las iteraciones.
> Prerrequisitos: Fases 2 y 3 integradas (números de vista y archivos compartidos).
>
> **✔ ITERACIÓN 1 HECHA (2026-07-30):** A1-A5 (vistas **175/176/177** en disco),
> B1-B2 (seed 59 ampliado con `academico.libro` + retiro de
> `historial.folio`/`historial.validar`), C1-C11 (backend `/api/v1/libros`
> completo: modelos, repos A+B, 10 use cases, Excel builder con firmas de
> docentes + logo MINEDU + margen de encuadernado, router, DI, montaje) y E
> (matriz + este doc). ⛔ Pendiente BD (aprobación): A6 ejecutar vistas 175-177
> + B3 resembrar seed 59. **Correcciones de regla de negocio incorporadas
> (2026-07-30):** `numero_folio` correlativo POR GESTIÓN cruzando TODAS las
> carreras (asignado en transacción con FOR UPDATE, no por libro/carrera);
> `numero_libro` se INGRESA cada gestión (requerido en el payload, sin
> auto-sugerencia MAX+1 por carrera; mismo número entre carreras);
> `folio_actual` queda como informativo del último folio de ESTE libro.
> Iteración 2 (D, F) pendiente.

## 0.0 Corrección de negocio 2026-07-30 (aplica sobre C — backend en curso)

El usuario, con conocimiento operativo real del centralizador, corrigió dos
reglas que el plan original interpretó distinto:

1. **`numero_folio` es correlativo POR GESTIÓN, cruzando TODAS LAS CARRERAS**
   — no reinicia en 1 por cada libro/carrera. Ejemplo real: una gestión con
   3 carreras numera sus folios de corrido 1..68 (no 1..20 por carrera). Cada
   10 estudiantes = 1 folio nuevo sobre ese contador COMPARTIDO de la gestión.
   ⚠️ **SUPERADO 2026-08-03** — la frase "sin cambio de schema" de este punto
   quedó incorrecta: el parche por query (MAX cross-carrera) mitigaba el
   síntoma pero dejaba el LIBRO partido en 3 filas (una por carrera) sin
   ninguna ficha que lo mostrara completo, y el arranque de numeración cuando
   la gestión no tenía folios dependía de qué carrera generaba primero (frágil
   — reproducido en BD de desarrollo: Sistemas generó primero con
   `folio_inicial=56` tecleado a mano, Contaduría/Administración quedaron en
   0). Se aplicó el cambio de schema real: `libros_registro` ya NO tiene
   `carrera_id`, pasa a `UNIQUE(gestion_id)` + `UNIQUE(numero_libro)` — un
   libro por gestión, compartido por las 3 carreras. La carrera vive a nivel
   de FOLIO (`paralelo_gestion_id`), nunca a nivel de libro. Ver bitácora al
   pie. Texto original de este punto, para contexto histórico:
   `folios_libro` sigue UNIQUE(libro_id, numero_folio); el
   siguiente `numero_folio` se calcula como
   `MAX(fl.numero_folio) FROM folios_libro fl JOIN libros_registro lr ON
   lr.id=fl.libro_id WHERE lr.gestion_id=? AND activo=1 AND deleted_at IS
   NULL` + 1 (transaccional, cruzando todos los libros de esa gestión), NO
   `libro.folio_actual + 1` scoped a un solo libro/carrera.
2. **`numero_libro` se ingresa manualmente y es (en la práctica) el mismo
   valor para todas las carreras de una gestión** — NO se auto-sugiere por
   MAX+1 **por carrera** (eso daría números distintos por carrera, que es
   justo lo que no se quiere). `codigo_registro` también se ingresa (el
   frontend puede prellenar "81981609" como sugerencia, pero el backend no
   lo fuerza).
3. **Nuevo en el export Excel** (aplica al bloque C7 cuando se implemente):
   - Página/hoja adicional por paralelo con las firmas de TODOS los
     docentes de ese paralelo, al final de sus folios — NO incrementa
     `numero_folio` (artefacto de impresión, no fila de `folios_libro`).
   - Logo del Ministerio de Educación en la cabecera (si no existe el asset
     en el repo, queda documentado como pendiente de que el usuario lo
     provea — no bloquea el resto).
   - Márgenes de página pensando en encuadernado (margen izquierdo más
     ancho, solo en este builder).

Corrección enviada en caliente al agente backend que ya tenía escrita la
lógica anterior (`AbrirLibroUseCase`, `GenerarFoliosParaleloUseCase` con el
bug exacto de numeración por-carrera) — ver bitácora al pie del documento
para el resultado aplicado.

## 0. Correcciones al enunciado (verificadas en repo)

1. **El seeder ACA es `59-seed-permisos-aca.sql`, no 58** (renumeración tras
   entrar `57-seed-titulacion-modalidades.sql`: 58-MAT, 59-ACA, 60-DOC, 61-FIN,
   62-INST, 63-REP, 64-CAP, 65-TUT, 66-CFG, 67-SEG). Los comentarios "seed 58"
   en `historial/routes.jsx` son texto legado.
2. Vistas: última en disco `165`; 166+ lo consumen Fases 2/3. Números de las
   vistas de libros **a confirmar al implementar**.

## 0.1 Evidencia del documento real (leído del xlsx)

`/Users/miguel/Documents/incos/pasantia/LIBRO LLENADO SISTEMAS  11 dic  2025 ok ultimo.xlsx`:
**una hoja por paralelo** ("1RO A SIST", "1RO B SIST.", "2DO A SIST.", "3RO A
SIST"), folios **apilados verticalmente** (folio 56 filas 1–35, folio 57
35+…), con print areas. Cabecera por folio: `Código de Registro: 81981609` ·
"CENTRALIZADOR DE CALIFICACIONES" · `LIBRO N° 14` / `FOLIO N° 56` · TURNO ·
INSTITUCIÓN + `R.M. 0426/2016` · CARÁCTER FISCAL · GESTIÓN · NIVEL · CARRERA ·
RÉGIMEN ANUAL · CURSO "PRIMERO - PARALELO A". Columnas: N°, NÓMINA (apellidos
primero), C.I. (+expedido), **nota final por materia** (sigla `MPI-101`… o
`NP`), ESTADO (APROBADO/REPROBADO/ABANDONO), OBSERVACIONES. Máx. 10 filas.
Firmas: JEFE(A) DE CARRERA · DIRECTOR(A) ACADÉMICO(A) · RECTOR(A).

**Recomendación Excel vs PDF: Excel.** El libro real ES un xlsx multi-hoja; el
toolkit `excel/shared/` (`ExcelSheetComposer.js`, `ExcelTheme.js` con banda
`FF196B45`) y `excel/centralizador/CentralizadorSheetBuilder.js` calzan 1:1
(multi-hoja por paralelo ya resuelto en
`ExportCentralizadorCarreraBimestreExcelUseCase`). PDF de folio suelto =
extensión futura, fuera de esta fase.

## 0.2 Módulos de referencia por capa

| Capa | Referencia |
|---|---|
| Vistas SQL | patrón final delgada de `135`; ficha paralelo `127-vista-base-paralelo-gestion-ficha.sql` |
| Backend CRUD (escritura) | **Licencias** (`licencias.routes.js`, `use-cases/academico/licencias/`, `container/modules/academico/licencias.container.js`) |
| Backend lectura por vista | **Centralizador** (`repositories/views/CalificacionCentralizadorRepository.js`, arquetipo B: interfaz NO extiende IRepository) |
| Export Excel | **Centralizador/Historial** (`excel/centralizador/*`, `excel/historial-academico/*`, `ICentralizadorExcelGenerator`, DI en `services.container.js` ~142) |
| Frontend drill-down | **Centralizador** (`modules/academico/centralizador/` P1→P2→P3) |
| Frontend listado | `DocentesList.jsx` (`PageTemplate` + `TableListView`) |
| Frontend ficha | `CarreraDetailPage.jsx` (shell `sd-*` de `detail-page.css`) |

---

## ITERACIÓN 1 — datos + RBAC + backend + documentación

### Bloque A — Datos (vistas SQL) ⛔ ejecución en BD requiere aprobación

Las 3 tablas ya están en BD; **no hay DDL de tablas**. Solo vistas nuevas
(números secuenciales tras Fases 2/3):

- **A1.** `NNN-vista-libros-registro-listado.sql` — grano 1 fila por libro:
  `libros_registro` + `carreras.nombre` + `gestiones.anio/nombre` + agregados
  de `folios_libro` (COUNT activos, MAX `numero_folio`, COUNT FIRMADOS) +
  COUNT estudiantes vía `folio_estudiantes`. Consumidor:
  `LibroRegistroViewRepository.listarLibros()` → listado P1.
- **A2.** `NNN-vista-base-libro-folio-fila.sql` — grano 1 fila por folio:
  `folios_libro` + JOIN vista `127` (carrera/curso/paralelo/turno) + COUNT
  `folio_estudiantes`. No repetir la cadena `paralelos_gestion→periodos` a
  mano. Consumidor: `GetLibroByIdUseCase` y cabecera de impresión.
- **A3.** `NNN-vista-base-libro-paralelo-estudiante.sql` — grano estudiante ×
  `paralelo_gestion_id`: ids, `ci`, nombre APELLIDO_PATERNO APELLIDO_MATERNO
  NOMBRES. Reutilizar bases de inscripciones (`03`/`17`/`99`/`100`).
  Consumidor: `GenerarFoliosParaleloUseCase`.
- **A4.** **Notas por materia: NO crear vista.** Reutilizar la `135` vía
  `calificacionCentralizadorRepository.listarFilasCentralizadorPorParaleloGestion(paraleloGestionId)`
  (ya en DI). El folio deriva `nota_final` por materia (NULL/ABANDONO → "NP"),
  siglas y orden.
- **A5.** Limitación documentada: la `135` filtra asignación **vigente** — el
  libro se genera al cierre de la gestión mientras es vigente; el folio
  congela `estado_academico`+`observaciones`. Reimpresión de gestiones pasadas
  = evolución futura (parametrizar la 135).
- **A6.** ⛔ Ejecutar las 3 vistas en BD (tras aprobación) + SELECT de humo.

### Bloque B — RBAC (seed 59) ⛔ resiembra requiere aprobación

- **B1.** Ampliar `backend/database/02-seeders/59-seed-permisos-aca.sql`:
  - `grupos_ui`: `('aca_libros', 'Libros de registro', 'ACADEMICO', 21, …)`
    (máximo actual: 20 `aca_cal_centralizador`).
  - `permisos`: `('academico.libro', 'Libros de registro del centralizador',
    NULL, 'ACADEMICO', 'ACA', 'aca_libros', '/academico/libros', 1, …)`.
  - `permiso_acciones`: LISTAR, DETALLE, CREAR, EDITAR, APROBAR, EXPORTAR
    (sin ELIMINAR — un folio no se borra, se ANULA con EDITAR/APROBAR).
  - `roles_permisos`: RECTOR y DIR_ACADEMICO las 6; SEC_ACADEMICA
    LISTAR/DETALLE/CREAR/EDITAR/EXPORTAR (prepara, no firma). DOCENTE/
    ESTUDIANTE: nada. ADMIN_SISTEMA nunca se siembra.
- **B2.** Códigos apagados cercanos (líneas ~60–62 y ~349–350): **retirar ambos**.
  - `academico.historial.folio`: concepto anterior al schema 25 (folio del
    egresado) → reemplazado por `academico.libro`.
  - `academico.historial.validar`: la validación de egreso pasa a Fase 5
    (`tutorias.titulo.*`). Nota en la matriz.
  - Frontend acompañante (iteración 2, D1): eliminar `ACA-HIS-FOLIO` y
    `ACA-HIS-VALIDAR` de `historial/routes.jsx` en el MISMO cambio que la
    resiembra, para no dejar rutas con permiso inexistente.
- **B3.** ⛔ Re-sembrar el bloque ACA en BD (con aprobación). Sin esto todo → 403.

### Bloque C — Backend (`/api/v1/libros`)

Contrato de respuesta (literales que el front replica):

| Endpoint | Acción (`academico.libro`) | `dataFieldName` | Forma |
|---|---|---|---|
| `GET /` | LISTAR | `libros` | lista |
| `POST /` (abrir libro) | CREAR | `libro` | objeto |
| `GET /:id` | DETALLE | `libro` | objeto (cabecera + `folios[]`) |
| `PATCH /:id` (editar/cerrar) | EDITAR | `libro` | objeto |
| `GET /:id/paralelos` (apoyo generador) | CREAR | `paralelos` | lista |
| `POST /:id/folios` (generar; body `paraleloGestionId`) | CREAR | `folios` | lista |
| `GET /:id/folios/:folioId` | DETALLE | `folio` | objeto (+`estudiantes[]` con celdas 135) |
| `PATCH /:id/folios/:folioId/estado` (BORRADOR→IMPRESO→FIRMADO / ANULADO) | APROBAR | `folio` | objeto |
| `PATCH /:id/folios/:folioId/estudiantes/:filaId` (si NO FIRMADO) | EDITAR | `folioEstudiante` | objeto |
| `GET /:id/export` (xlsx libro completo, banda #196B45) | EXPORTAR | — | binario |

Archivos (bajo `backend/src/`):
1. **Modelos**: `models/libro_registro.js`, `folio_libro.js`,
   `folio_estudiante.js` + export en `models/index.js` (patrón `licencia.js`).
2. **Constantes**: `domain/constants/libros.constants.js` —
   `CODIGO_REGISTRO_INSTITUCIONAL = '81981609'` (default editable en el alta),
   enums de estado, `ESTUDIANTES_POR_FOLIO = 10`, metadatos de cabecera
   (espejo de `CENTRALIZADOR_DOC`: R.M. 0426/2016, NIVEL, RÉGIMEN, FISCAL).
3. **Interfaces**: `ILibroRegistroRepository` (arquetipo A) e
   `ILibroRegistroViewRepository` (arquetipo B, NO extiende IRepository);
   `services/ILibroRegistroExcelGenerator`.
4. **Repositorios**: `LibroRegistroRepository.js` (escritura transaccional 3
   tablas) y `views/LibroRegistroViewRepository.js` (vistas A1–A3). Registrar
   en `repositories.container.js` + `repositorios.tokens.js`.
5. **Use cases** en `use-cases/academico/libros/`: `ListLibrosUseCase`,
   `AbrirLibroUseCase` (sugiere `numero_libro` = MAX por carrera + 1, secuencia
   12→13→14; valida UNIQUE carrera+gestión; `folio_inicial` editable),
   `GetLibroByIdUseCase`, `EditarLibroUseCase` (incluye cierre),
   `ListParalelosLibroUseCase`, `GenerarFoliosParaleloUseCase` (**corazón**:
   nómina A3 ordenada por apellido → páginas de 10 → `numero_folio` continuo
   desde `folio_actual`/`folio_inicial`, `orden_en_paralelo`, `numero_orden`
   continuo; `estado_academico` sugerido desde filas 135: alguna materia
   REPROBADO → REPROBADO; todas ABANDONO/RETIRADO/NP → ABANDONO; si no →
   APROBADO; actualiza `folio_actual`; transaccional; rechaza si el paralelo
   ya tiene folios activos), `GetFolioByIdUseCase` (fusión folio + celdas 135),
   `CambiarEstadoFolioUseCase` (máquina de estados; FIRMADO = inmutable;
   ANULADO exige motivo), `EditarFolioEstudianteUseCase`, `ExportLibroExcelUseCase`.
6. **Mapper**: `application/mappers/academico/LibroRegistroPresentationMapper.js`
   (nombres con `buildFullName`).
7. **Excel**: `infrastructure/external/excel/libro-registro/LibroRegistroExcelBuilder.js`
   + `sheet/libroRegistroSheetConfig.js|Layout.js|Formatters.js` — réplica del
   formato §0.1 con el toolkit `shared/`; DI en `services.container.js` +
   `servicios.tokens.js` (patrón `centralizadorExcelGenerator`).
8. **Controllers**: `controllers/academico/libros/*.controller.js`.
9. **Validators**: `validators/academico/` + export en su `index.js`.
10. **Router**: `routes/libros.routes.js` (`buildLibrosRouter`, patrón
    `licencias.routes.js`; estáticas antes de `/:id`).
11. **DI**: `container/modules/academico/libros.container.js` + tokens en
    `academico.tokens.js` + composición en `modules/academico/index.js` +
    montaje `/libros` en `routes/index.js`.

### Bloque E — Documentación

1. `docs/referencia/matriz-permisos-sistema.md`: sección "ACA - Libros de
   registro" (6 acciones, pantallas/endpoints/roles); **eliminar**
   `academico.historial.folio` y `academico.historial.validar` con nota en
   changelog ("folio del egresado reemplazado por `academico.libro`;
   validación de egreso pasa a Fase 5 `tutorias.titulo.*`").
2. `docs/plan/titulacion-y-dominios-pendientes.md`: marcar Fase 4 + corregir
   "seed 58"→59.
3. Cabeceras de las 3 vistas con consumidores y `-- Modelo de negocio:`.

---

## ITERACIÓN 2 — frontend + verificación

### Bloque D — Frontend (bajo ACA, junto al Centralizador; `order: 2.7`)

1. **Rutas**: `presentation/modules/academico/libros/routes.jsx` —
   `/academico/libros` (menú, permiso `academico.libro` LISTAR, key
   `ACA-LIBROS`, label "Libros de registro"), `/academico/libros/:id`
   (DETALLE, `ACA-LIBROS-DETALLE`, breadcrumbParent `ACA-LIBROS`),
   `/academico/libros/:id/folios/:folioId` (DETALLE, `ACA-LIBROS-FOLIO`).
   Registrar spread junto a `centralizadorRoutes`. En el mismo cambio:
   eliminar `ACA-HIS-FOLIO`/`ACA-HIS-VALIDAR` de `historial/routes.jsx` (B2).
2. **Icono**: `menuIcons.js` — `'ACA-LIBROS': ProfileOutlined` (o `BookOutlined`).
3. **Contrato dominio/infra** (patrón Centralizador): `endpoints.js`
   (`createCRUDEndpoints('/libros')` + anidados), repositorio HTTP con
   **`dataKey` literales: `libros`, `libro`, `paralelos`, `folios`, `folio`,
   `folioEstudiante`** (== tabla C), use cases frontend y registro en
   `academico.container.js`.
4. **Application module** `application/modules/academico/libros/`: hooks api
   (`useLibrosApi`, `useLibroDetalleApi`, `useFolioDetalleApi`,
   `useGenerarFolios`, `useExportLibroExcel` — patrón
   `useExportCentralizadorExcel`), hooks state (`useLibrosList`,
   `useLibroDetail`, `useFolioPreview`), utils (`librosPaths.js`,
   `librosPermisos.js`, `libroDoc.js`), `mappers/librosMapper.js`.
5. **Presentation**: connectors lazy, pages (`LibrosListPage` — shell
   `DocentesList` + CTA "Abrir libro" ActionButton CREAR; `LibroDetailPage` —
   shell `sd-*` con cabecera LIBRO N°/carrera/gestión/81981609/folios/estado +
   tabla folios `TableActions` fail-closed + "Generar folios de paralelo"
   (CREAR) + "Exportar libro" (EXPORTAR) + cierre (EDITAR);
   `FolioPreviewPage` — réplica en pantalla del folio real §0.1, CSS propio
   `styles/libros.css`; Firmar/Anular con APROBAR, edición de fila con
   EDITAR), configs de columnas.
6. Textos "usted"; AntD 6; Alerts con moderación; `Empty` en vacíos.
7. Alias `@application-academico`/`@academico` ya existen — nada nuevo.

### Bloque F — Verificación (requiere A6 + B3 ejecutadas)

1. Lint backend/frontend + build.
2. `dataKey` == `dataFieldName` en los 6 literales.
3. Datos de prueba SIN seeder: crear por API/UI el libro de Sistemas gestión
   vigente (`folio_inicial` 56, código 81981609), generar folios de un
   paralelo con >10 estudiantes → verificar corte en páginas de 10,
   `numero_orden` y `numero_folio` continuos, notas == Centralizador.
4. Export xlsx comparado lado a lado con el libro real (hoja por paralelo,
   cabecera, NP, firmas, banda #196B45).
5. RBAC 3 capas: DIR_ACADEMICO todo; SEC_ACADEMICA sin APROBAR (botón Firmar
   oculto + PATCH estado → 403); DOCENTE menú invisible + API 403; FIRMADO
   inmutable (4xx claro); folio inexistente → 404.
6. Compuertas `verificador` + `revisor-ui` (P3 imprimible es la delicada).

## Dependencias y orden

```
A (vistas, HITO aprobación) ──┐
B (seed 59, HITO re-siembra) ──┼→ C (backend) → D (frontend) → E (docs ∥ C/D) → F
```

## Nota de integración opcional (post-fase)

`centralizadorDoc.js` (frontend) declara que LIBRO N°/FOLIO N° "no existen en
el sistema": al existir este módulo, la cabecera del Centralizador (pantalla y
Excel) puede mostrar LIBRO/FOLIO reales consultando `folios_libro` por
`paralelo_gestion_id` — mejora pequeña fuera de alcance que cierra ese comentario.

## Bitácora de cambios

- **2026-07-30 (backend, iteración 1):** implementados A1-A5, B1-B2, C1-C11 y E.
  La corrección §0.0 quedó APLICADA en código:
  1. `LibroRegistroRepository.getMaxNumeroFolioByGestion(gestionId, {transaction,
     lock})` (MAX cross-carrera por gestión) y `crearFoliosConEstudiantes` ahora
     ASIGNA `numero_folio` dentro de la transacción (lectura `FOR UPDATE`,
     arranque en `folio_inicial` solo si la gestión no tiene folios);
     `folio_actual` quedó como informativo del último folio de ESTE libro.
     `GenerarFoliosParaleloUseCase` ya no calcula números fuera de la transacción.
  2. `AbrirLibroUseCase` exige `numeroLibro` (validator `.isInt({min:1})`
     requerido); eliminado `getMaxNumeroLibroByCarrera` y toda auto-sugerencia
     MAX+1 por carrera. `codigoRegistro` sigue opcional (default institucional
     81981609 solo si no llega).
  3. Export Excel (`LibroRegistroExcelBuilder`/`SheetBuilder`): página de
     FIRMAS DE DOCENTES al final de cada hoja de paralelo (una fila por
     materia+docente, fuente vista 135; sin numero_folio), logo del Ministerio
     embebido desde `infrastructure/external/templates/ministerio.png` (asset
     ya existente en el repo — no quedó pendiente) y `pageSetup` propio con
     margen izquierdo de encuadernado (0.9" vs 0.3", landscape, page break por
     folio). Smoke test con exceljs OK (folios apilados en bloques de 34 filas).
  - ⛔ Pendiente BD (aprobación): ejecutar vistas 175-177 + resembrar seed 59.
- **2026-07-31 (backend, integración Libros ↔ Centralizador + bug fix):**
  1. **Bug fix** `GetCentralizadorParaleloUseCase`: `notaAnual` ahora se gatea
     por `gestionCompleta` igual que `observacion` (antes exponía un número con
     bimestres sin cargar). No toca `calcularNotaFinalGestion` ni `nota_final`
     de `matriculas_materia`.
  2. **Centralizador lee LIBRO/FOLIO real** (read-only, sin vista nueva):
     `LibroRegistroViewRepository.listarFoliosPorParaleloGestion` (176 + JOIN
     `libros_registro` por `libro_estado`) y
     `listarUbicacionEstudiantesPorParaleloGestion` (176 + JOIN
     `folio_estudiantes`); `GetCentralizadorParaleloUseCase` las consume como
     dependencia OPCIONAL (`libroRegistroViewRepository`) y agrega `libro` +
     `folioNumero`/`numeroOrdenFolio` por estudiante al DTO.
  3. **Generación masiva por gestión**: `ORDEN_CARRERAS_LIBRO`/`ordenCarreraLibro`
     (CON-GEN→ADM-EMP→SIS-INF) en `libros.constants.js`;
     `listarParalelosPorGestion` (127, orden en memoria); CORE de
     `GenerarFoliosParaleloUseCase` extraído a
     `helpers/generarFoliosParaleloHelper.js#generarParaUnParalelo` (mismo
     comportamiento, smoke test OK); `GenerarFoliosGestionUseCase` nuevo
     (precondición: libro ABIERTO por carrera con paralelos en la gestión;
     idempotente — folios vigentes u otros `ValidationError` del helper se
     OMITEN y van al array `omitidos`, sin frenar el resto); endpoint
     `POST /api/v1/libros/gestiones/:gestionId/folios` (permiso
     `academico.libro` CREAR), `dataFieldName` = **`resumenGeneracion`**
     (`{ paralelosGenerados, foliosCreados, folioDesde, folioHasta, omitidos }`).
  4. **Firmas de docentes + estadísticas** (documento oficial completo):
     `_firmasDocentes` reestructurado a grilla de 3 columnas (nombre + materia,
     espacio en blanco arriba, sin línea de firma); `_estadisticasParalelo`
     nuevo (tabla DETALLE/CANTIDAD/% con banda #196B45); leyenda
     "NP = No se Presentó / AP = Aprobado / PRE = Prerrequisito" bajo la
     nómina de cada folio; helper puro
     `helpers/estadisticasParaleloHelper.js#calcularEstadisticasParalelo`.
     Corregido de paso el CURSO del documento ("TERCERO - PARALELO A", no
     "PRIMER AÑO - PARALELO PRIMERO A") vía
     `application/utils/libroFolioExcelDatos.js` (nuevo, espejo de
     `centralizadorExcelDatos.js` para el grano anual;
     `construirHojaParalelo` reutilizado por `ExportLibroExcelUseCase` y el
     export nuevo). **Pendiente de iteración 2 (frontend):**
     `librosMapper.js` (`mapFolio`/`mapParaleloLibro`) tiene el MISMO defecto
     de formato de CURSO — no se tocó (fuera de alcance backend); igual el
     comentario obsoleto en `centralizadorDoc.js` ("LIBRO N°/FOLIO N° no
     existen en el sistema", línea 9) que ya no es cierto.
  5. **Export "Centralizador anual"** (grano nuevo, no existía):
     `ExportCentralizadorAnualParaleloExcelUseCase` — exige folios YA
     generados (4xx claro si no; NUNCA genera folios como efecto colateral),
     delega en `construirHojaParalelo` + `ILibroRegistroExcelGenerator`
     (mismo generador del Libro, una sola hoja). Endpoint
     `GET /api/v1/calificaciones/centralizador/:paraleloGestionId/anual/export`
     (permiso `academico.calificacion.centralizador` EXPORTAR).
  - Sin vistas SQL nuevas, sin DDL, sin resiembra de RBAC (reutiliza 127/135/176
    y los permisos ya sembrados de `academico.libro`/
    `academico.calificacion.centralizador`). Verificación: lint limpio en
    archivos tocados (2 violaciones `max-len`/`no-continue` preexistentes en
    `GetCentralizadorParaleloUseCase.js`, ajenas a este cambio, no tocadas);
    dry-run del container (routers + use cases nuevos resuelven); smoke tests
    de `generarParaUnParalelo` (paginación/numeración intactas),
    `construirHojaParalelo`/formateadores de CURSO y render real con
    `exceljs` (leyenda, grilla de firmas, bloque ESTADÍSTICAS) — todo con
    datos mock, sin tocar BD real. Pendiente iteración 2 (frontend): badge
    LIBRO/FOLIO en el grid del Centralizador, botón "Exportar centralizador
    anual", botón "Generar folios de la gestión", fix de `librosMapper.js` y
    del comentario de `centralizadorDoc.js`.
- **2026-08-03 (cambio de schema — libro = 1 fila por GESTIÓN, no por
  carrera+gestión):** el usuario detectó, usando el listado real de la BD de
  desarrollo, que el parche §0.0/2026-07-30 (numeración por query) no
  resolvía el problema de fondo: `libros_registro` seguía con 3 filas por
  gestión (una por carrera), sin ficha que mostrara el libro completo y con
  un arranque de numeración frágil (dependía de qué carrera generaba folios
  primero). Confirmado con datos reales de BD dev: Sistemas (carrera_id=1)
  tenía `libro_id=1`, `folio_inicial=56` tecleado a mano; Contaduría
  (carrera_id=3) tenía `libro_id=2` con `folio_actual=0`; Administración
  (carrera_id=2) no tenía fila. Cambios aplicados (sin datos reales que
  migrar — BD de desarrollo, confirmado con el usuario):
  1. **Schema** (`01-schemas/25-libros-registro.sql`): `libros_registro`
     pierde `carrera_id` (columna, FK e índices); `UNIQUE(numero_libro,
     carrera_id)` → `UNIQUE(numero_libro)`; `UNIQUE(carrera_id, gestion_id)`
     → `UNIQUE(gestion_id)`. `folios_libro`/`folio_estudiantes` sin cambios.
  2. **Vista 175**: quita el JOIN a `carreras` y sus 4 columnas a nivel de
     libro; agrega `carreras_con_folio` (GROUP_CONCAT DISTINCT de códigos de
     carrera con folios en el libro, orden canónico CON-GEN·ADM-EMP·SIS-INF).
     Vistas 176/177 sin cambios (la carrera ya vivía a nivel de folio, vía
     `paralelo_gestion_id` → vista 127).
  3. **Backend/Frontend**: refactor delegado a agentes `backend`/`frontend`
     en paralelo contra este contrato — ver resultado en el reporte de
     ejecución (no repetido aquí para no duplicar la fuente de verdad, que es
     el código).
  - ⛔ Pendiente BD (aprobación del usuario, igual que siempre): recrear
    `libros_registro`/`folios_libro`/`folio_estudiantes` (DROP+CREATE, sin
    datos reales que preservar) y la vista 175 en la BD de desarrollo.
