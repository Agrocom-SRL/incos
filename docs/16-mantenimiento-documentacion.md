# 16 - MANTENIMIENTO DE DOCUMENTACIÓN
## Sistema de Gestión Académica - Instituto INCOS Santa Cruz

**Versión:** 1.0  
**Fecha:** Enero 2025  
**Estado:** Guía de Mantenimiento

---

## 1. INTRODUCCIÓN

Este documento proporciona una guía para mantener actualizada la documentación del sistema, especialmente cuando se realizan cambios en la estructura de la base de datos.

### 1.1 Propósito

Mantener la documentación sincronizada con el código y la estructura de la base de datos es crucial para:
- Facilitar el onboarding de nuevos desarrolladores
- Evitar confusiones y errores
- Mantener la trazabilidad de cambios
- Facilitar el mantenimiento futuro

### 1.2 Alcance

Esta guía cubre:
- Actualización de documentación de base de datos
- Registro de cambios en CHANGELOG
- Actualización de estadísticas y referencias
- Buenas prácticas de documentación

---

## 2. ESTRUCTURA DE DOCUMENTACIÓN

### 2.1 Archivos Clave

```
docs/
├── 00-INDICE-MAESTRO.md          # Índice general con estadísticas
├── 05-modelo-datos.md            # Documentación completa de BD
└── ...

backend/database/
├── README.md                     # README del módulo de BD
├── CHANGELOG.md                  # Registro histórico de cambios
└── 01-schemas/                   # Scripts SQL de definición
```

### 2.2 Responsabilidades

| Archivo | Responsabilidad | Cuándo Actualizar |
|---------|----------------|-------------------|
| `CHANGELOG.md` | Registrar TODOS los cambios en BD | Cada vez que se modifique un schema |
| `05-modelo-datos.md` | Documentar estructura completa | Cuando se agreguen/modifiquen tablas importantes |
| `00-INDICE-MAESTRO.md` | Estadísticas generales | Cuando cambien números (tablas, endpoints, etc.) |
| `database/README.md` | Información del módulo BD | Cuando cambien scripts o estadísticas |

---

## 3. PROCESO DE ACTUALIZACIÓN

### 3.1 Cambios en la Base de Datos

Cuando realices cambios en la estructura de la base de datos:

#### Paso 1: Modificar el Script SQL
```sql
-- En el archivo correspondiente de 01-schemas/
-- Ejemplo: 06-estudiantes-parte1.sql
ALTER TABLE estudiantes ADD COLUMN nuevo_campo VARCHAR(100);
```

#### Paso 2: Registrar en CHANGELOG.md
```markdown
## [Sin Versión] - 2025-01-XX

### [MODIFICADO] - Tabla: estudiantes
- **Descripción**: Agregado campo nuevo_campo para almacenar información adicional
- **Archivo**: `06-estudiantes-parte1.sql`
- **Impacto**: BAJO
- **Detalles**: 
  - Campo agregado: `nuevo_campo VARCHAR(100)`
  - No afecta funcionalidad existente
```

#### Paso 3: Actualizar Documentación (si es necesario)
- Si agregaste una nueva tabla: Actualizar `05-modelo-datos.md`
- Si cambiaste estadísticas: Actualizar `00-INDICE-MAESTRO.md` y `database/README.md`

### 3.2 Agregar Nueva Tabla

#### Ejemplo: Agregar tabla `nueva_tabla`

1. **Crear script SQL** en `01-schemas/`:
```sql
CREATE TABLE nueva_tabla (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    -- ... otros campos
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT,
    updated_by INT,
    deleted_by INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

2. **Registrar en CHANGELOG.md**:
```markdown
### [AGREGADO] - Nueva Tabla: nueva_tabla
- **Descripción**: Tabla para almacenar información de...
- **Archivo**: `XX-nombre-archivo.sql`
- **Impacto**: MEDIO
- **Detalles**: 
  - Campos principales: id, nombre, ...
  - Relaciones: FK a tabla_xyz
```

3. **Actualizar `05-modelo-datos.md`**:
```markdown
### X.X nueva_tabla
**Descripción:** Descripción de la tabla.

**Campos Principales:**
- `nombre`, `campo2`, ...

**Relaciones:**
- Relación con otra tabla
```

4. **Actualizar estadísticas**:
   - `00-INDICE-MAESTRO.md`: Incrementar contador de tablas
   - `database/README.md`: Actualizar estadísticas si es necesario

### 3.3 Modificar Tabla Existente

#### Ejemplo: Agregar campo a tabla existente

1. **Modificar script SQL**:
```sql
ALTER TABLE estudiantes ADD COLUMN nuevo_campo VARCHAR(100);
```

2. **Registrar en CHANGELOG.md**:
```markdown
### [MODIFICADO] - Tabla: estudiantes
- **Descripción**: Agregado campo nuevo_campo
- **Archivo**: `06-estudiantes-parte1.sql`
- **Impacto**: BAJO
- **Detalles**: 
  - Campo agregado: `nuevo_campo VARCHAR(100)`
```

3. **Actualizar `05-modelo-datos.md`** (si el campo es importante):
```markdown
### 6.1 estudiantes
**Campos Principales:**
- `nuevo_campo` - Descripción del campo
- ... (campos existentes)
```

### 3.4 Eliminar Tabla

⚠️ **ADVERTENCIA**: La eliminación de tablas es un cambio de ALTO impacto.

1. **Registrar en CHANGELOG.md**:
```markdown
### [ELIMINADO] - Tabla: tabla_antigua
- **Descripción**: Tabla eliminada por refactorización
- **Archivo**: `XX-nombre-archivo.sql`
- **Impacto**: ALTO
- **Migración**: Datos migrados a `nueva_tabla`
- **Detalles**: 
  - Razón: Consolidación de funcionalidad
  - Datos migrados: Sí, a nueva_tabla
```

2. **Actualizar `05-modelo-datos.md`**:
   - Eliminar sección de la tabla
   - Actualizar referencias

3. **Actualizar estadísticas**:
   - Decrementar contador de tablas

---

## 4. FORMATO DEL CHANGELOG

### 4.1 Estructura

```markdown
## [Versión o Fecha] - YYYY-MM-DD

### [TIPO] - Descripción Breve
- **Descripción**: Descripción detallada
- **Archivo**: `ruta/archivo.sql`
- **Impacto**: BAJO | MEDIO | ALTO
- **Detalles**: 
  - Lista de cambios específicos
  - Relaciones afectadas
  - Migraciones necesarias
```

### 4.2 Tipos de Cambio

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `[AGREGADO]` | Nueva tabla, campo, índice | Nueva tabla `nueva_tabla` |
| `[MODIFICADO]` | Cambio en tabla existente | Agregado campo `nuevo_campo` |
| `[ELIMINADO]` | Eliminación de tabla/campo | Eliminada tabla `tabla_antigua` |
| `[RENOMBRADO]` | Cambio de nombre | `tabla_vieja` → `tabla_nueva` |
| `[OPTIMIZACIÓN]` | Mejoras de rendimiento | Agregado índice compuesto |

### 4.3 Niveles de Impacto

| Nivel | Descripción | Ejemplos |
|-------|-------------|----------|
| **BAJO** | No afecta funcionalidad existente | Agregar campo opcional, nuevo índice |
| **MEDIO** | Requiere actualización de código | Agregar campo NOT NULL, modificar FK |
| **ALTO** | Requiere migración de datos | Eliminar tabla, cambiar tipo de dato |

---

## 5. CHECKLIST DE ACTUALIZACIÓN

### Al Modificar Estructura de BD

- [ ] Script SQL modificado/creado
- [ ] Cambio registrado en `CHANGELOG.md`
- [ ] `05-modelo-datos.md` actualizado (si aplica)
- [ ] Estadísticas actualizadas en `00-INDICE-MAESTRO.md`
- [ ] `database/README.md` actualizado (si aplica)
- [ ] Referencias cruzadas verificadas
- [ ] Documentación revisada por otro desarrollador

### Al Agregar Nueva Tabla

- [ ] Script SQL creado con estándares (campos de auditoría)
- [ ] Foreign keys definidas correctamente
- [ ] Índices agregados para campos de búsqueda
- [ ] Registrado en `CHANGELOG.md`
- [ ] Documentada en `05-modelo-datos.md`
- [ ] Estadísticas actualizadas

### Al Modificar Tabla Existente

- [ ] Script SQL actualizado
- [ ] Cambio registrado en `CHANGELOG.md`
- [ ] `05-modelo-datos.md` actualizado (si el cambio es significativo)
- [ ] Código de aplicación actualizado (si aplica)
- [ ] Tests actualizados (si aplica)

---

## 6. BUENAS PRÁCTICAS

### 6.1 Documentación

1. **Sé específico**: No uses "varios cambios", lista cada cambio
2. **Explica el porqué**: Si es posible, explica la razón del cambio
3. **Mantén consistencia**: Usa el mismo formato en todo el CHANGELOG
4. **Actualiza referencias**: Si cambias algo, actualiza todas las referencias

### 6.2 Orden de Actualización

1. Primero: Modificar código/SQL
2. Segundo: Registrar en CHANGELOG
3. Tercero: Actualizar documentación
4. Cuarto: Actualizar estadísticas
5. Quinto: Revisar referencias cruzadas

### 6.3 Revisión

- Siempre revisa la documentación después de cambios importantes
- Pide a otro desarrollador que revise los cambios
- Verifica que las estadísticas sean consistentes

---

## 7. HERRAMIENTAS ÚTILES

### 7.1 Contar Tablas

```bash
# Contar tablas en scripts SQL
cd backend/database/01-schemas
grep -h "^CREATE TABLE" *.sql | wc -l
```

### 7.2 Buscar Referencias

```bash
# Buscar referencias a una tabla en documentación
grep -r "nombre_tabla" docs/
```

### 7.3 Verificar Consistencia

```bash
# Verificar que todas las tablas mencionadas en docs existen en SQL
# (requiere script personalizado)
```

---

## 8. EJEMPLOS COMPLETOS

### Ejemplo 1: Agregar Nueva Tabla

**1. Script SQL** (`01-schemas/XX-nueva-tabla.sql`):
```sql
CREATE TABLE nueva_tabla (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL,
    created_by INT,
    updated_by INT,
    deleted_by INT,
    FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**2. CHANGELOG.md**:
```markdown
## [Sin Versión] - 2025-01-15

### [AGREGADO] - Nueva Tabla: nueva_tabla
- **Descripción**: Tabla para almacenar información de ejemplo
- **Archivo**: `XX-nueva-tabla.sql`
- **Impacto**: MEDIO
- **Detalles**: 
  - Campos principales: id, nombre
  - Campos de auditoría estándar incluidos
  - Foreign keys a usuarios para auditoría
```

**3. 05-modelo-datos.md**:
```markdown
### X.X nueva_tabla
**Descripción:** Tabla para almacenar información de ejemplo.

**Campos Principales:**
- `nombre` - Nombre del registro

**Relaciones:**
- Auditoría: created_by, updated_by, deleted_by → usuarios
```

**4. Actualizar estadísticas**:
- `00-INDICE-MAESTRO.md`: Incrementar de 49 a 50 tablas
- `database/README.md`: Actualizar estadísticas

---

## 9. REFERENCIAS

- **[CHANGELOG.md](../../backend/database/CHANGELOG.md)** - Registro histórico de cambios
- **[Modelo de Datos](05-modelo-datos.md)** - Documentación completa de BD
- **[Índice Maestro](00-INDICE-MAESTRO.md)** - Estadísticas generales

---

## 10. CONTACTO

Para dudas sobre el mantenimiento de documentación, contactar al equipo de desarrollo.

---

**FIN DEL DOCUMENTO - 16 MANTENIMIENTO DE DOCUMENTACIÓN**

