# Database Scripts

Estructura organizada de scripts SQL para el Sistema de Gestión Académica INCOS.

## Orden de Ejecución (Instalación Fresh)

1. **00-config/** - Configuración inicial de MySQL
2. **01-schemas/** - Creación de tablas (DDL)
3. **02-seeders/** - Datos iniciales
4. **03-views/** - Vistas de consulta
5. **04-stored-procedures/** - Procedimientos almacenados
6. **05-triggers/** - Triggers automáticos
7. **06-functions/** - Funciones reutilizables

## Scripts de Utilidad

- **07-migrations/** - Cambios versionados del esquema
- **08-rollback/** - Revertir migraciones
- **99-utilities/** - Herramientas de mantenimiento

## Ejecutar Todo

```bash
# Desde la raíz del proyecto
npm run db:setup
```
