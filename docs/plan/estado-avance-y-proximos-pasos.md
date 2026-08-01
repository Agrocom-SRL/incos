# Estado de avance y próximos pasos — retomar en sesión nueva

> **Fecha de corte:** 2026-08-01 (actualizado; corte anterior 2026-07-30).
> **Propósito:** este documento es el punto de entrada para CONTINUAR el
> trabajo en una conversación nueva sin re-derivar contexto. Léelo completo
> antes de tocar código. Último commit al corte: `035ed101` (frontend de las
> 3 extensiones TUT + integración Libros↔Centralizador). En el working tree
> quedan las correcciones post-verificación del 2026-08-01 (menu:null de los
> reportes TUT + botones en ProyectosGradoList + fixes AntD6 del modal de
> folios) y el frente "Seguimiento académico", ya TERMINADO y verificado
> (lint + build OK), pendiente solo de commit (ver §3.1).

## 0. Autorización vigente (no volver a preguntar)

El usuario aprobó **gestión autónoma completa** para este frente de trabajo
(continuar y cerrar las Fases 2-5 de `titulacion-y-dominios-pendientes.md` +
la disolución de REP + las 3 funcionalidades nuevas de Tutorías descritas en
§4): ejecutar cambios de código, correr vistas SQL y re-sembrar RBAC en la BD
de desarrollo **sin pedir confirmación paso a paso**. Al retomar en una sesión
nueva, actúa con esa misma autorización — no se necesita volver a confirmar.

**Única excepción que sigue en pie** (regla general del proyecto, memoria
`feedback-aprobar-cambios-schema`): si alguna de las 3 funcionalidades nuevas
de §4 requiere **crear una tabla nueva** (DDL, no solo vistas de lectura),
eso sí requiere una pausa explícita para que el usuario apruebe el diseño de
schema antes de escribir el `CREATE TABLE` — igual que se hizo con todos los
schemas anteriores. Vistas SQL de lectura, seeds RBAC (ampliar archivos
existentes) y todo el código de aplicación NO necesitan esa pausa.

## 1. Regla de entrega establecida esta sesión (seguir usándola)

**Todo módulo/fase se entrega en 2 iteraciones**, por pedido explícito del
usuario (miedo a quedarse sin tokens a mitad de una tarea grande):
1. **Iteración 1 — backend**: datos (vistas SQL) + RBAC (seeds) + backend
   completo (modelos/repos/use cases/controllers/router/DI) + documentación +
   verificación backend (lint + arranque en seco del container + coherencia
   seed↔router). Se cierra ejecutando en BD lo que quedó gated.
2. **Iteración 2 — frontend**: páginas/hooks/UI, en una tarea/agente aparte,
   posiblemente en otra sesión.

Patrón de verificación backend que se ha usado con éxito (repetir):
```bash
# lint de los archivos del módulo
cd backend && npx eslint <rutas de archivos tocados>

# arranque en seco (sin BD) — confirma que el container resuelve el router
node --input-type=module -e "
import { container } from './src/infrastructure/container/index.js';
import { X_TOKENS } from './src/infrastructure/container/tokens/index.js';
const router = container.resolve(X_TOKENS.xRouter);
console.log('OK, rutas:', router.stack.length);
"
```

Patrón de ejecución en BD que se ha usado con éxito (repetir tal cual):
```bash
cd backend
DB_PASS=$(grep '^DB_PASSWORD=' .env | cut -d= -f2)
MYSQL_BIN=/Applications/MAMP/Library/bin/mysql80/bin/mysql
CONN="-h 127.0.0.1 -P 8889 -u root -p$DB_PASS instituto_incos"

# 1. Crear vistas nuevas (una por una, en orden)
$MYSQL_BIN $CONN < database/03-views/NNN-nombre.sql

# 2. Re-sembrar TODO el RBAC (vacía y resiembra los 10 módulos completos,
#    porque los seeds son por-módulo y se resiembran enteros; es la forma
#    en que se ha hecho toda la sesión, sin roturas)
$MYSQL_BIN $CONN -e "SET FOREIGN_KEY_CHECKS=0; DELETE FROM roles_permisos; DELETE FROM permiso_acciones; DELETE FROM permisos; DELETE FROM grupos_ui; SET FOREIGN_KEY_CHECKS=1;"
for s in 58 59 60 61 62 63 64 65 66 67; do
  f=$(ls database/02-seeders/$s-*.sql)
  $MYSQL_BIN $CONN < "$f" && echo "seed $s OK"
done
```
Conexión: MAMP, cliente en `/Applications/MAMP/Library/bin/mysql80/bin/mysql`,
host `127.0.0.1`, puerto `8889`, usuario `root`, password en `backend/.env`
(`DB_PASSWORD`), base `instituto_incos`.

## 2. Estado por fase/módulo (tabla de control)

| # | Fase/módulo | Backend | BD | Frontend | Plan detallado |
|---|---|---|---|---|---|
| 2 | Pasantías (TUT) | ✅ | ✅ | ✅ | `titulacion-y-dominios-pendientes.md` §Fase 2 |
| — | Disolución REP (avance/deserción/consolidado → ACA) | ✅ | ✅ | ✅ | `reportes-rep-diagnostico.md` |
| 3 | Supervisión docente (DOC) | ✅ | ✅ | ✅ (commit `088ebe02`) | `supervision-docente-plan-desarrollo.md` |
| 4 | Libros de registro (ACA) | ✅ | ✅ | ✅ (+integración Centralizador, `035ed101`) | `libros-registro-plan-desarrollo.md` |
| 5 | Títulos y certificados (TUT) | ⛔ GATED | — | — | `titulacion-y-dominios-pendientes.md` §Fase 5 |
| — | 3 funcionalidades nuevas TUT (ver §4) | ✅ | ✅ (vistas 178-181) | ✅ (`035ed101` + corrección menú 2026-08-01) | `titulacion-avance-y-modalidad-plan-desarrollo.md` |
| — | Seguimiento académico (ACA, reorganización de menú) | n/a (solo frontend) | n/a | ✅ verificado 2026-08-01 (pendiente de commit) | ver nota §3.1 |
| — | Acta de defensa de grado (TIT) — Iteración 1 | ✅ | ⛔ DDL listo, sin aplicar | ⛔ pendiente (Iteración 2) | `acta-defensa-grado-plan-desarrollo.md` |

### Números de referencia (para no colisionar)

- **Última vista SQL en disco:** `177` (Libros de registro). Próxima
  disponible: **178**.
- **Seeders RBAC vigentes** (todos por-módulo, se resiembran completos):
  `58-seed-permisos-mat.sql`, `59-seed-permisos-aca.sql`,
  `60-seed-permisos-doc.sql`, `61-seed-permisos-fin.sql`,
  `62-seed-permisos-inst.sql`, `63-seed-permisos-rep.sql` (tombstone, REP
  disuelto — NO reactivar), `64-seed-permisos-cap.sql`,
  `65-seed-permisos-tut.sql`, `66-seed-permisos-cfg.sql`,
  `67-seed-permisos-seg.sql`. Cualquier permiso nuevo AMPLÍA el archivo de su
  módulo dueño — nunca crear seeder 68+.
- **Checksum de verificación tras resiembra** (para confirmar que no se rompió
  nada): `SELECT COUNT(*) FROM permisos;` debe dar **118**.
- **OJO con `docs/plan/tutorias-plan-desarrollo.md`:** tiene nombres de tabla
  VIEJOS para los satélites del schema 23 (`tutoria_integrantes`,
  `tutoria_avances`, etc.). Los nombres REALES en BD/código son
  `integrantes_proyecto`, `avances_proyecto`, `bitacora_proyecto`,
  `dictamenes_proyecto`, `sesiones_refuerzo`, `sesion_refuerzo_estudiantes`.
  Usa siempre el código/schema actual como fuente de verdad, no ese doc.

## 3. Próximas acciones — orden de ejecución recomendado

### 3.1 Estado 2026-08-01 (lo vigente)

Los puntos 1-3 originales de esta sección ya están TERMINADOS (ver tabla §2).
Lo único activo:

- **Seguimiento académico (frontend): TERMINADO Y VERIFICADO 2026-08-01**
  (lint limpio en los módulos tocados + build de producción OK; solo persiste
  la deuda transversal `set-state-in-effect` preexistente, ver abajo). Por
  decisión del usuario, los ítems de menú "Avance académico" (ACA-AVANCE) y
  los 3 de Acompañamiento (Panel, Alumnos en riesgo, Sesiones de refuerzo) se
  agruparon bajo UN ítem único "Seguimiento académico"
  (`/academico/seguimiento`, key ACA-SEGUIMIENTO, `permisoAny`) con tabs
  gateadas por permiso (patrón AvanceAcademico/disolución REP). Sidebar
  SIEMPRE 2 niveles (dominio→ítem, sin submenús). Rutas viejas viven como
  gemelas del contenedor con `menu: null` + `breadcrumbParent` y abren su
  pestaña original (`defaultTab`). `labelByRole ESTUDIANTE: 'Mi avance'`
  (página degrada a ficha propia con alcance PROPIO). Sin cambios
  FUNCIONALES de RBAC (códigos/acciones/roles intactos); en el seed 59 solo
  se alinearon `ruta_sidebar` (5 permisos → `/academico/seguimiento`) y los
  nombres de los 3 `grupos_ui` («Seguimiento académico · avance/deserción/
  acompañamiento») para la grilla de Seguridad — **PENDIENTE: aplicar en la
  BD existente** (resembrar RBAC o correr los UPDATEs equivalentes; lo
  ejecuta el usuario). Connectors de acompañamiento con prop `embedded`;
  hooks de Avance/Deserción con `enabled`. Decisiones cerradas:
  Traspasos/Transitabilidad NO se fusionan; Libros de registro conserva su
  ítem; la bitácora de tutoría NO registra modalidad presencial/virtual
  (ver bitácoras de los planes y memoria `criterio-menu-item-proceso`).
- **Pendiente de commit (todo staged, verificado):** el frente Seguimiento
  académico + correcciones post-verificación 2026-08-01 (reportes TUT a
  `menu: null` + botones de cabecera en `ProyectosGradoList`, fixes AntD6 en
  `GenerarFoliosGestionModal`).
- **Deuda transversal detectada (no urgente):** 30 ocurrencias de
  `react-hooks/set-state-in-effect` en hooks api de todo `src/` (patrón
  replicado; limpieza en tanda propia, no por módulo).

- **Acta de defensa de grado (TIT): backend Iteración 1 TERMINADO 2026-08-01**
  (`docs/plan/acta-defensa-grado-plan-desarrollo.md`, P1-P8 resueltas).
  Tablas nuevas `actas_defensa` + `tribunal_acta_defensa` (DDL ya en
  `22-modalidades-grado.sql`, **sin aplicar en BD** — pendiente de
  aprobación/ejecución del usuario; sin migración incremental porque el
  módulo TIT no tiene datos en servidor todavía). Backend completo por
  capas: use cases (`RegistrarActaDefensaUseCase` delega la transición T11,
  `ListActasDefensaProyectoUseCase`, `ExportActaDefensaPdfUseCase`),
  `ActaDefensaPdfGenerator` (pdf-lib, espejo del acta física), RBAC sin
  permisos nuevos (reutiliza `titulacion.proyecto`), DI verificada por
  resolución real del contenedor (lint limpio, sin BD). Contrato:
  `dataFieldName: 'actasDefensa'` en `GET/POST /:id/acta-defensa`, PDF en
  `GET /:id/acta-defensa/:actaId/pdf`. Pendiente: Iteración 2 (frontend, tab
  «Acta de defensa» en `ProyectoGradoDetail.jsx`) — ver bloques D/F/G del
  plan.

### 3.2 Histórico (ya ejecutado, conservado como referencia)

1. **Frontend de Supervisión docente** (tarea más simple, backend+BD ya
   listos). Contrato: `dataFieldName: 'fichasSeguimiento'` (listas) /
   `'fichaSeguimiento'` (objeto). Endpoints en
   `backend/src/presentation/routes/supervision-docente.routes.js`. Seguir
   bloques D/F/G de `supervision-docente-plan-desarrollo.md`: módulo
   `frontend/src/presentation/modules/docentes/supervision/` (ruta
   `/docentes/supervision`, **antes** de `/docentes/:id`), tab «Supervisión»
   en el portal del docente (`GET /mis-fichas`, anti-IDOR ya resuelto en
   servidor). Lanzar con agente `frontend`.

2. **Frontend de Libros de registro** (backend+BD ya listos). Contrato:
   `dataFieldName`: `libros`, `libro`, `paralelos`, `folios`, `folio`,
   `folioEstudiante`. Endpoints en `backend/src/presentation/routes/libros.routes.js`.
   Seguir bloque D de `libros-registro-plan-desarrollo.md`: módulo
   `frontend/src/presentation/modules/academico/libros/` bajo ACA, junto al
   Centralizador (listado de libros → ficha con folios → generar folios de un
   paralelo → ficha de folio con firmar/anular/editar fila). Incluye limpiar
   las rutas legacy `ACA-HIS-FOLIO`/`ACA-HIS-VALIDAR` de
   `frontend/src/presentation/modules/academico/historial/routes.jsx` (sus
   permisos ya fueron retirados del seed 59 en el backend). El export Excel ya
   genera: página de firmas de docentes por paralelo (no incrementa folio),
   logo del Ministerio de Educación (asset ya existía en
   `backend/src/infrastructure/external/templates/ministerio.png`) y márgenes
   de encuadernado — el frontend solo dispara la descarga, no repite esa
   lógica. Lanzar con agente `frontend`.

3. **Planificar las 3 funcionalidades nuevas de Tutorías** (ver
   especificación completa en §4 — el intento anterior de planificación fue
   interrumpido por cierre de sesión, sin producir ningún archivo; hay que
   lanzarlo de cero). Usar agente `planificador` (y `arquitecto` si hace
   falta decidir si el ítem 3 necesita tabla nueva). Entregable: un documento
   nuevo `docs/plan/tutorias-avance-y-modalidad-plan-desarrollo.md` con el
   mismo formato que `supervision-docente-plan-desarrollo.md` (iteración 1
   backend / iteración 2 frontend, bloques con letras, contrato de
   endpoints). Recién con ese plan escrito, implementar backend-first como
   las fases anteriores.

4. **Fase 5 — Títulos y certificados**: sigue **gated**. Antes de retomarla,
   preguntar al usuario si ya consiguió los formatos reales del título físico
   y los certificados de calificaciones/egreso (se buscó en
   `/Users/miguel/Documents/incos/` el 2026-07-29 y NO existían — solo estaba
   la documentación de pasantías). Si ya los tiene, validar/ajustar el schema
   26 (`26-titulos-certificados.sql`, hoy solo con FKs de integridad, sin base
   documental) contra esos formatos antes de construir nada.

## 4. Especificación completa de las 3 funcionalidades nuevas de Tutorías

> Estos requisitos los dio el usuario **verbatim** en esta sesión y NO están
> escritos en ningún otro documento — es la única fuente de verdad hasta que
> se planifiquen. Contexto general: el módulo TUT (Titulación/Tutorías) ya
> está completo en código y BD (backend `tutorias/` con ~35 use cases, schema
> 22/23, seed 65, vistas 156-163) — estas son extensiones nuevas sobre él.

### 4.1 Formulario de elección de modalidad de graduación (solo 3er año, imprimible)

Cita textual: *"Para el Módulo de TUTORIAS Y MODALIDAD DE GRADUACIÓN tendría
que habilitarse ÚNICAMENTE para estudiantes de 3er año para que se genere
desde Dirección Académica este formulario con los datos del estudiante y se
elija la modalidad de graduación por dirección académica y luego se pueda
imprimir — formulario de elección de estudiantes de modalidad de grado."*

Interpretación a validar en la planificación:
- Restringir la creación de `proyectos_grado` (elección de modalidad) a
  estudiantes de **3er año** únicamente (INCOS tiene grano académico anual,
  3 años por carrera — ver memoria `incos-grano-anual-tres-carreras`;
  investigar cómo se determina el año de un estudiante en el modelo actual).
- Flujo: **Dirección Académica** (no el estudiante) elige un estudiante de
  3er año + la modalidad (catálogo `modalidades_grado`: PSP/PG/PE/TD, seed
  67) y el sistema genera un **PDF imprimible** con los datos del estudiante
  prellenados.
- Documento fuente real: `/Users/miguel/Documents/incos/pasantia/FORMULARIO 01
  DE MODALIDAD DE GRADUACION OK.docx` (FMDG-1) — usarlo como espejo del PDF,
  igual que se hizo con la ficha de supervisión docente.
- Investigar: ¿ya existe algún PDF generator en TUT reutilizable como patrón
  (dictámenes, designación de tutor)? ¿El alta de proyecto hoy la inicia el
  estudiante o Dirección Académica? Ajustar según corresponda.

### 4.2 Reporte de avance de tutorías por carrera (Dirección Académica)

Cita textual: *"Luego los docentes puedan registrar el AVANCE TUTORIAS con
sus usuarios, y Dirección Académica pueda generar un REPORTE por carrera de
las tutorias porcentaje de avance y observaciones."*

Interpretación a validar: el registro de avance/bitácora **ya existe**
(tabla `bitacora_proyecto`, use cases `CreateBitacoraEntradaUseCase` etc.,
vista 163 "bitácora agregada por tutor+carrera+gestión+mes"). Falta el
**reporte agregado por carrera** (no por tutor) con % de avance y
observaciones, para que Dirección Académica lo consuma. Investigar si la
vista 163 alcanza como base o si hace falta una vista nueva agrupando por
carrera en vez de por tutor.

### 4.3 Planilla de avance de tutorías "10 en 10" (NUEVA — distinta del Libro de registro de la Fase 4)

Cita textual completa: *"esto es centralizador de 10 en 10 las hojas.
Colocar en el área académica para hacer seguimiento a docentes. Tendria que
generarse 10 estudiantes por cada hoja o FOLIO como se le llama, y en la
última hoja del curso en la parte posterior las firmas de docentes y el
cuadro de porcentaje total de aprobados, reprobados y abandonos. Esta
planilla es para que el docente suba las tutorías que realiza en el bimestre
por estudiantes de 3er año."*

Interpretación a validar: es un artefacto **nuevo**, que replica el patrón
visual/paginado del Libro de registro (10 estudiantes por folio, página de
firmas al final que NO incrementa el folio, cuadro de % aprobados/
reprobados/abandonos) pero para **tracking de tutorías de 3er año por
bimestre** — NO para calificaciones finales. Es distinto del Libro de
registro académico (Fase 4, ya implementado — solo citarlo como referencia
de patrón de paginación/Excel, no tocar sus archivos).

**Punto crítico a resolver en la planificación — puede requerir aprobación
de schema:** decidir si esto se puede derivar 100% de tablas ya existentes
(`bitacora_proyecto`, `integrantes_proyecto`, `proyectos_grado`) con una
vista de agregación + un export Excel nuevo (patrón
`LibroRegistroExcelBuilder` de la Fase 4, sin tocar sus archivos), o si
necesita una **tabla nueva**. Si necesita tabla nueva: **detenerse y pedir
aprobación explícita del usuario para el DDL antes de escribirlo** — no
asumir la autorización general de §0 para esto en particular.

Documentos fuente reales a revisar:
`/Users/miguel/Documents/incos/pasantia/PLANILLA DE SEGUIMIENTO DE TUTORIA
2026.xlsx` y `PLANILLA PARA REPORTE DE TUTORIA 2026.xlsx`.

## 5. Documentos relacionados (no duplicar contenido, solo referenciar)

- `docs/plan/auditoria-modelo-datos.md` — auditoría original, Fase 0 (ya
  ejecutada antes de esta sesión).
- `docs/plan/titulacion-y-dominios-pendientes.md` — plan maestro de fases
  2-5 + mapa de dueños de menú; tiene el contrato completo P1-P19 de
  Pasantías.
- `docs/plan/supervision-docente-plan-desarrollo.md` — Fase 3 completa
  (iteración 1 hecha, bloques D/F/G pendientes).
- `docs/plan/libros-registro-plan-desarrollo.md` — Fase 4 completa
  (iteración 1 hecha + corrección de negocio de folio-por-gestión aplicada;
  bloque D pendiente).
- `docs/plan/reportes-rep-diagnostico.md` — disolución de REP, ambas
  iteraciones hechas.
- `docs/plan/capacitacion-plan-desarrollo.md` — módulo CAP, ya completo
  (código + BD), sin relación con el trabajo pendiente de arriba.
- `docs/referencia/matriz-permisos-sistema.md` — changelog acumulado de
  todos los permisos tocados esta sesión.

## 6. Cómo debe empezar la sesión nueva

1. Leer este documento completo.
2. Correr `TaskList` — si no hay tareas (las tareas no persisten entre
   sesiones), recrear las de §3 con `TaskCreate`.
3. Lanzar en paralelo (son áreas de archivo disjuntas, sin riesgo de
   colisión): agente `frontend` para Supervisión docente + agente `frontend`
   para Libros de registro.
4. En paralelo con lo anterior, lanzar agente `planificador` para las 3
   funcionalidades de §4.
5. Verificar cada entrega (lint/build, dataKey==dataFieldName, prueba con rol
   sin permiso) antes de marcarla completa.
6. Preguntar por Fase 5 solo si el usuario la menciona o si ya no queda nada
   más pendiente arriba.
