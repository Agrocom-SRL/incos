# Sincronización BD servidor → schema local (`01-schemas`)

> **Estado: pendiente — verificado 2026-10-20.** Comprobado contra el código: el propio documento indica que ningún paso se ha ejecutado; la BD local con datos del servidor es un trabajo operativo que no se puede comprobar en el repo (el dump `instituto_incos.sql` está en `.gitignore`). Falta: ejecutar el plan paso a paso.


> Objetivo: tener una base de datos local con **los datos reales del servidor**
> (dump del 2026-10-19) pero con la **estructura de `backend/database/01-schemas/`**,
> que es la fuente de verdad limpia. Este documento es el plan paso a paso; ningún paso
> se ha ejecutado todavía sobre una base de datos.

## 1. Qué se encontró (comparación dump vs `01-schemas`)

El dump (`backend/database/instituto_incos.sql`) se separó en
`backend/database/instituto_incos/tablas/<tabla>.sql` (estructura + índices + FK + INSERT
de cada tabla; las vistas se descartaron porque se reconstruyen desde `03-views/`).

| Concepto | Resultado |
|----------|-----------|
| Tablas en el servidor | **80** (63 con datos, 17 vacías) |
| Tablas en `01-schemas` | **100** |
| Tablas solo en el servidor (candidatas a eliminar) | **0** |
| Tablas solo en local (nuevas) | **20** |
| Tablas comunes con columnas añadidas/eliminadas | **0** de 80 |
| Tablas comunes con tipo, enum o nulabilidad distintos | **0** de 80 (ver nota) |
| Claves foráneas distintas en tablas comunes | **0** (114 en el servidor; las 51 restantes del local son de las 20 tablas nuevas) |
| Datos con diferencias reales | **RBAC** (ver §3) |

Nota sobre falsos positivos descartados al comparar: `id` sin `NOT NULL` explícito en local
(el `PRIMARY KEY` ya lo implica), `CHECK (json_valid(...))` que MariaDB agrega solo a las
columnas JSON, y 6 índices que MariaDB crea automáticamente por una FK (nombrados como la
columna) y que en local se llaman distinto. Lo **no** comparado: `COMMENT` de columnas y
defaults de texto (diferencias solo de documentación; ver paso 2).

**Conclusión:** la estructura de las 80 tablas existentes ya coincide con `01-schemas`
(probablemente `05-migrations/26` ya se aplicó en el servidor: `historial_matricula` ya
tiene `REINCORPORACION` y `configuracion_evaluacion` ya tiene `ACOMPANAMIENTO_PEDAGOGICO`).
El delta estructural real son las **20 tablas nuevas**; el trabajo pesado está en los
**datos** (qué se importa y qué se siembra).

### 20 tablas nuevas (solo local, sin datos en el servidor)

- Titulación: `modalidades_grado`, `proyectos_grado`, `integrantes_proyecto`,
  `avances_proyecto`, `bitacora_proyecto`, `dictamenes_proyecto`, `actas_defensa`,
  `tribunal_acta_defensa`
- Pasantías: `pasantias`, `pasantias_empresas`, `pasantias_informes`, `pasantias_seguimientos`
- Libros y títulos: `libros_registro`, `folios_libro`, `folio_estudiantes`, `titulos`, `certificados`
- Supervisión / refuerzo: `fichas_seguimiento_clase`, `sesiones_refuerzo`,
  `sesion_refuerzo_estudiantes`

## 2. Decisión de estrategia

**Reconstruir una BD local limpia** (no alterar la del servidor) en este orden:
`01-schemas` (estructura) → datos del servidor (INSERT por tabla) → seeders solo donde el
servidor no tiene datos → vistas `03-views`.

Reglas:

1. **Se conservan los `id` del servidor** en todas las tablas con datos: las matrículas,
   notas y pagos (5.836 `bimestres_matricula`, 4.372 `matriculas_materia`, …) los referencian.
2. **No se ejecutan los seeders 01–54** sobre tablas que el servidor ya tiene pobladas
   (catálogos, carreras, planes, ofertas, asignaciones, horarios…): los seeders no son
   idempotentes (sin `ON DUPLICATE`) y duplicarían filas con otros `id`.
3. **RBAC se siembra desde el repo, no se importa** (ver §3).
   **Horarios 2026 también domina el seeder** (decisión del 2026-10-19): el seeder ya
   tiene todas las combinaciones con los horarios reales de la gestión 2026, así que
   `horarios` (seed 24) y `asignacion_horarios` (seeds 40–48) salen del repo y **no** del
   servidor. Esto obliga a revisar en la fase de seeders qué más debe venir del seeder para
   que los `id` sean coherentes (`asignaciones_docentes` 31–39, `oferta_cursos` 28–30,
   `paralelos_gestion` 27): `asignacion_horarios` referencia a `asignaciones_docentes` y a
   `horarios`. Ver §4, Fase B.
4. Las 20 tablas nuevas se crean vacías; solo `modalidades_grado` tiene seeder (57).
5. `05-migrations/10-28` quedan **obsoletas como fuente de datos**: son un volcado
   generado de un dump anterior (384 estudiantes; hoy hay 578) y el ALTER 26 / 28 ya no
   aplica porque la BD se recrea con `01-schemas`. No borrarlas hasta terminar el paso 9.

## 3. Datos que NO se importan tal cual: RBAC

Servidor: 126 `permisos`, 341 `permiso_acciones`, 755 `roles_permisos`, 69 `grupos_ui`.
Repo: seeds `58–67` (105 códigos, **sin ids**, refs por código).

- **21 códigos del servidor ya no existen en los seeds** (comparación por código, ver [conflictos](sincronizacion-conflictos-seeders.md)) (p. ej. `configuracion.plan-estudio`,
  `finanzas.beca-descuento`, `docentes.supervision.*`, `academico.historial.folio`).
- **13 códigos nuevos** solo en los seeds (5 `academico.*`, 1 `docentes.*`, 7 `titulacion.*`).
  (El 105/34 de la primera pasada contaba solo códigos con punto; el repo define 118.)

Por eso: se importan `roles` y `usuarios` del servidor (2 usuarios reales con su hash; los
`rol_id` se conservan) y **se ejecutan los seeds 58–67** para `grupos_ui`, `permisos`,
`permiso_acciones` y `roles_permisos`. Se omiten el seed 55 (roles) y 56 (admin), porque ya
vienen del servidor. `usuarios_permisos` tiene 0 filas: nada que preservar.

> Antes de descartar los 21 códigos viejos, confirmar con el paso 6 que ningún rol del
> servidor dependía de uno que no tenga equivalente en los seeds (permisos perdidos).

## 4. Pasos

### Estado de las fases
- **Fase A — `instituto_incos/tablas/` completo (HECHA):** 100 archivos, uno por tabla. Las 80
  del servidor llevan estructura + índices + FK + INSERT (sintaxis MariaDB del dump); las
  20 nuevas llevan solo la estructura tomada de `01-schemas/` (cabecera
  "Tabla nueva: no existe en el servidor").
- **Fase B — comparar `02-seeders` y `05-migrations` contra el servidor (HECHA):** ver
  [conflictos](sincronizacion-conflictos-seeders.md) e [histórico](sincronizacion-historico-migraciones.md). Aplicado en `tablas/`: RBAC sin datos, fila nueva en `configuracion_evaluacion`, datos de `modalidades_grado`. Criterio original: prioridad
  servidor, salvo roles/permisos (RBAC) y horarios/`asignacion_horarios` 2026, donde manda
  el seeder.
- **Fase C — carga en MAMP (PREPARADA y probada en una BD de prueba):** en
  `backend/database/instituto_incos/` (no versionado) se ejecutan los propios `tablas/*.sql`
  (estructura + índices + FK + datos; cada archivo desactiva/reactiva `FOREIGN_KEY_CHECKS`) en el
  orden del prefijo numérico `NNN-` de cada archivo (001 = sin dependencias … 100 = las que más dependen), y después los seeders RBAC 58–67. Apoyan `filas-esperadas.tsv`,
  `verificar-fks.sql` y `cargar.sh`.
  MAMP corre **MySQL 8.0.40** (cliente `/Applications/MAMP/Library/bin/mysql80/bin/mysql`,
  socket `/Applications/MAMP/tmp/mysql/mysql.sock`, root/root), no MariaDB.
  Uso: `cd backend/database/instituto_incos && ./cargar.sh --reset --vistas`
  (`--reset` pide confirmar el nombre antes de borrar; `DB=otra_bd` para cargar en otra).
  Prueba en `incos_fasec_test` (ya eliminada): 100 tablas, filas = esperado, 0 FK huérfanas,
  `permisos`=118, `roles_permisos`=863, 185 vistas. Sesión en modo no estricto
  (`NO_AUTO_VALUE_ON_ZERO`, como el dump). `instituto_incos` no se tocó.
- Las vistas no se tocan en este proceso: se reconstruyen con `03-views/` al final.

### Paso 0 — Respaldo y base de pruebas (MAMP)
- Crear una BD **vacía y separada** (`instituto_incos_sync`) para no tocar la local de trabajo.
- El dump original `instituto_incos.sql` se eliminó (2026-10-19): sus tablas y datos ya
  están completos en `instituto_incos/tablas/` (24.100 filas verificadas) y las vistas se
  reconstruyen desde `03-views/`. El respaldo real es el propio servidor (volver a exportar si hace falta).
- El dump y `instituto_incos/` son **datos temporales** con datos personales y hashes: ya
  están en `.gitignore` (no se commitean).
- MAMP/phpMyAdmin: los archivos grandes (`bimestres_matricula` ≈ 744 KB, `matriculas_materia`
  ≈ 639 KB) pueden toparse con el límite de subida de phpMyAdmin; cargar con el cliente de
  MAMP: `/Applications/MAMP/Library/bin/mysql -u root -p -h 127.0.0.1 -P 8889 instituto_incos_sync < archivo.sql`
  (el puerto por defecto de MAMP es 8889; verificar el tuyo).

### Paso 1 — Generar los archivos de solo datos
Los archivos de `instituto_incos/tablas/` incluyen `CREATE TABLE`; para cargar sobre el
schema local hacen falta solo los `INSERT`. Generar `instituto_incos/datos/<tabla>.sql`
con: cabecera (`USE`, `SET FOREIGN_KEY_CHECKS=0`, `SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO'`),
los `INSERT` y `SET FOREIGN_KEY_CHECKS=1`. Criterio de aceptación: la suma de filas por
tabla coincide con la columna "Filas" del §5.

### Paso 2 — Crear la estructura local
`00-config/database-config.sql` → `01-schemas/01…27` en orden. Aceptación: 100 tablas,
sin errores. (Las diferencias de `COMMENT` del servidor desaparecen al recrear: no hay
nada que migrar.)

### Paso 3 — Cargar datos del servidor, por niveles de dependencia FK
Orden de §5, con `FOREIGN_KEY_CHECKS=0`. Excluir: `permisos`, `permiso_acciones`,
`roles_permisos`, `grupos_ui` (los siembra el paso 4). Aceptación: conteo de filas
por tabla = dump.

### Paso 4 — Sembrar lo que el servidor no tiene
Sobre la BD ya cargada, en este orden: `57-seed-titulacion-modalidades` →
`58`…`67` (permisos por módulo). No ejecutar 01–56.

### Paso 5 — Reconstruir vistas
`03-views/` completo, en orden numérico (el servidor tenía 154 vistas; con DEFINER `root`).
Aceptación: todas se crean y un `SELECT … LIMIT 1` a cada una no falla.

### Paso 6 — Verificar integridad y RBAC
- `FOREIGN_KEY_CHECKS=1` y chequeo de huérfanos por cada FK de las tablas con datos.
- `AUTO_INCREMENT` de cada tabla = `MAX(id)+1`.
- Para cada rol del servidor, comparar el conjunto de permisos que tenía contra el que
  tiene tras el seed; documentar los códigos perdidos/nuevos (los 21 y 13 de §3).
- Probar login `admin` y `secretaria` con los hashes del servidor y un rol sin permiso
  (regla de proceso del proyecto).

### Paso 7 — Verificar contra el backend
Levantar el backend contra `instituto_incos_sync`; probar los listados que leen las vistas
base (matrícula, horarios, calificaciones) y confirmar que `dataKey` ↔ `dataFieldName`
siguen coincidiendo.

### Paso 8 — Decidir las 17 tablas vacías del servidor
`capacitaciones` (y sus 4 hijas), `participantes`, `directores`, `rectores`, `evaluaciones`,
`evaluaciones_notas`, `sesiones_clase`, `asistencias`, `clases_no_dictadas`, `licencias`,
`historial_matricula`, `nivelaciones`, `usuarios_permisos`: existen en ambos lados y se
cargan vacías; no hay migración que hacer, solo confirmar que es esperado.

### Paso 9 — Aplicar al servidor (cuando 1–7 estén verificados)
Como las 80 tablas existentes ya coinciden, el servidor solo necesita:
1. Backup (`mysqldump`).
2. Crear las 20 tablas nuevas (`01-schemas/21` … `27`, en ese orden por dependencias FK).
3. Seeds `57` y los permisos nuevos/cambiados (reemplazo de RBAC: decidir si se hace con
   `DELETE` previo de las 4 tablas RBAC dentro de una transacción).
4. Recrear vistas `03-views/`.
Después, retirar `05-migrations/10–28` o dejar solo un README que indique que se
reemplazaron por este proceso.

## 5. Orden de carga y filas del servidor

`NUEVA` = tabla que solo existe en local (se crea vacía). Filas contadas por línea de
`INSERT` en `instituto_incos/tablas/`.

| Nivel | Tablas (filas) |
|-------|----------------|
| 0 | estados_civiles (6), gestiones (6), aulas (13), carreras (3), metodos_pago (4), configuracion_sistema (7), idiomas (16), paises (31), documentacion (9), becas_descuentos (12), tipos_parentesco (16), roles (8), horarios (60), tipos_discapacidad (9), actividades (48), sesiones (100), materias (69), tipos_evaluacion (21), participantes (0), pasantias_empresas (NUEVA), modalidades_grado (NUEVA) |
| 1 | periodos_academicos (6), configuracion_aportes (1), configuracion_evaluacion (3), planes_estudios (3), bancos_autorizados (2), departamentos (9), usuarios (2), capacitaciones (0), libros_registro (NUEVA) |
| 2 | actividades_calendario (79), periodos (9), gestiones_planes (3), cuentas_pago (4), instituciones (16), provincias (112), capacitacion_inscritos (0), capacitacion_horarios (0), usuarios_permisos (0) |
| 3 | paralelos (18), asignaturas_plan (69), municipios (365), capacitacion_compromisos (0), capacitacion_pagos (0) |
| 4 | paralelos_gestion (18), prerrequisitos (12), estudiantes (578), docentes (33), personal (4) |
| 5 | oferta_cursos (140), estudiantes_datos_academicos (578), estudiantes_origenes (608), estudiantes_apoderados (391), estudiantes_discapacidades (24), estudiantes_becas (128), estudiantes_documentos_entrega (2.920), documentos_estudiante (1.220), traspasos (10), transitabilidades (6), secretarias (1), directores (0), rectores (0), pasantias (NUEVA), folios_libro (NUEVA) |
| 6 | asignaciones_docentes (140), inscripciones (578), pago_aporte (582), proyectos_grado (NUEVA), certificados (NUEVA), pasantias_seguimientos (NUEVA), pasantias_informes (NUEVA) |
| 7 | matriculas_materia (4.372), historial_previo (2.304), asignacion_horarios (540), pago_cuotas (617), compromisos_pago (30), sesiones_clase (0), evaluaciones (0), clases_no_dictadas (0), licencias (0), fichas_seguimiento_clase (NUEVA), sesiones_refuerzo (NUEVA), actas_defensa (NUEVA), avances_proyecto (NUEVA), dictamenes_proyecto (NUEVA), integrantes_proyecto (NUEVA), folio_estudiantes (NUEVA) |
| 8 | bimestres_matricula (5.836), historial_matricula (0), asistencias (0), tribunal_acta_defensa (NUEVA), bitacora_proyecto (NUEVA), sesion_refuerzo_estudiantes (NUEVA), titulos (NUEVA) |
| 9 | evaluaciones_notas (0), nivelaciones (0) |

Excluidas de la carga (se siembran, paso 4): `permisos` (126), `permiso_acciones` (341),
`roles_permisos` (755), `grupos_ui` (69).

## 6. Riesgos abiertos

- **Datos personales en el repo**: ver paso 0.
- **Seeders no idempotentes**: ejecutar un seed dos veces duplica filas; por eso el paso 4
  se hace una sola vez sobre una BD recién cargada.
- **Pérdida de permisos** al sustituir los 21 códigos antiguos: se detecta en el paso 6.
- **Cambios de esquema entre este dump y el siguiente**: si el servidor recibe nuevos
  cambios, volver a ejecutar `split.py` y repetir la comparación (el análisis de columnas
  es un script, no un proceso manual).
