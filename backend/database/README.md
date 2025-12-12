# Database Scripts

Estructura organizada de scripts SQL para el Sistema de Gestión Académica INCOS.

## 📊 Estadísticas Actuales

- **Total de Tablas**: 49 tablas
- **Total de Foreign Keys**: ~80+ relaciones
- **Total de Índices**: ~120+ índices
- **Motor**: InnoDB
- **Charset**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

## 📋 Orden de Ejecución (Instalación Fresh)

1. **00-config/** - Configuración inicial de MySQL
2. **01-schemas/** - Creación de tablas (DDL) - **49 tablas**
3. **02-seeders/** - Datos iniciales
4. **03-views/** - Vistas de consulta
5. **04-stored-procedures/** - Procedimientos almacenados
6. **05-triggers/** - Triggers automáticos
7. **06-functions/** - Funciones reutilizables

## 🔧 Scripts de Utilidad

- **07-migrations/** - Cambios versionados del esquema
- **08-rollback/** - Revertir migraciones
- **99-utilities/** - Herramientas de mantenimiento

## 📝 Scripts de Schema (01-schemas/)

Los scripts principales están organizados en módulos y deben ejecutarse en este orden:

1. **`01-base.sql`** - Configuración inicial y estándares de tablas
2. **`02-catalogos-geograficos.sql`** - Catálogos geográficos (países, departamentos, provincias, municipios)
3. **`03-catalogos-referencia.sql`** - Catálogos de referencia (estados civiles, idiomas, tipos de discapacidad, etc.)
4. **`04-sistema-seguridad.sql`** - Sistema de autenticación y autorización (usuarios, roles, permisos, sesiones)
5. **`05-estructura-academica-parte1.sql`** - Carreras, gestiones, periodos, materias, plan de estudios, prerrequisitos
6. **`05-estructura-academica-parte2.sql`** - Docentes, asignaciones, horarios, aulas, turnos
7. **`06-estudiantes-parte1.sql`** - Estudiantes, datos académicos, documentos
8. **`06-estudiantes-parte2.sql`** - Datos económicos, becas, descuentos, contactos de emergencia, licencias
9. **`07-inscripciones-parte1.sql`** - Inscripciones principales por gestión
10. **`07-inscripciones-parte2.sql`** - Inscripciones a materias, calificaciones, asistencias, nivelaciones
11. **`10-pagos.sql`** - Sistema de pagos (aranceles, detalle de pagos)
12. **`11-modulos-operativos-parte1.sql`** - Pasantías (empresas, asignaciones, evaluaciones), Supervisión docente
13. **`11-modulos-operativos-parte2.sql`** - Historial académico oficial (libros, folios)
14. **`12-indices.sql`** - Índices de optimización
15. **`12-sincronizacion.sql`** - Sistema de sincronización con sistema nacional
16. **`13-indices-optimizacion.sql`** - Índices adicionales de optimización

## 🚀 Ejecutar Todo

```bash
# Desde la raíz del proyecto
npm run db:setup
```

## 📚 Documentación

- **[Modelo de Datos](../../docs/05-modelo-datos.md)** - Documentación completa de todas las tablas
- **[CHANGELOG.md](./CHANGELOG.md)** - Registro histórico de cambios en la estructura de BD

## 🔄 Mantenimiento de Documentación

Cuando se realicen cambios en la estructura de la base de datos:

1. **Actualizar el script SQL** correspondiente en `01-schemas/`
2. **Registrar el cambio** en `CHANGELOG.md`
3. **Actualizar la documentación** en `docs/05-modelo-datos.md` si es necesario
4. **Actualizar este README** si cambian las estadísticas o el orden de ejecución

Ver **[CHANGELOG.md](./CHANGELOG.md)** para más detalles sobre cómo registrar cambios.
