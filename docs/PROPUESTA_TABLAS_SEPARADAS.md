# PROPUESTA: TABLAS SEPARADAS - INSCRIPCIONES vs CALIFICACIONES

## 📋 RESUMEN

Separar el concepto de **INSCRIPCIÓN** (proceso administrativo) del **HISTORIAL ACADÉMICO** (resultado permanente).

---

## 1. INSCRIPCIONES (Proceso Administrativo)

### `inscripciones` (MAESTRO)
```sql
-- Ya existe, solo ajustar comentarios
-- Estudiante + Gestión + Carrera
-- Es la "boleta de inscripción" de esa gestión
```

### `inscripciones_materias` (DETALLE - SIMPLIFICADO)
```sql
CREATE TABLE inscripciones_materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    inscripcion_id INT NOT NULL COMMENT 'Inscripción del estudiante',
    materia_id INT NOT NULL COMMENT 'Materia inscrita',
    curso_id INT NOT NULL COMMENT 'Curso/paralelo específico',
    docente_id INT COMMENT 'Docente asignado al curso',
    
    -- Estado de inscripción (NO resultado académico)
    estado ENUM(
        'INSCRITO',      -- Inscrito pero aún no inicia clases
        'CURSANDO',      -- Actualmente cursando
        'ABANDONO',      -- Abandonó la materia
        'RETIRADO'       -- Se retiró de la materia
    ) DEFAULT 'INSCRITO',
    
    -- Observaciones de inscripción
    observaciones TEXT,
    
    -- Campos de auditoría estándar
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT,
    updated_by INT,
    deleted_by INT,
    
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_inscripcion_id (inscripcion_id),
    INDEX idx_materia_id (materia_id),
    INDEX idx_curso_id (curso_id),
    INDEX idx_estado (estado)
    
) COMMENT='Detalle de materias inscritas en una inscripción. Solo información de inscripción, NO contiene notas.';
```

---

## 2. CALIFICACIONES (Historial Académico)

### `calificaciones` (NUEVA TABLA)
```sql
CREATE TABLE calificaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Relación con inscripción
    inscripcion_materia_id INT NOT NULL COMMENT 'Materia inscrita de la que proviene esta calificación',
    estudiante_id INT NOT NULL COMMENT 'Estudiante',
    materia_id INT NOT NULL COMMENT 'Materia cursada',
    gestion_id INT NOT NULL COMMENT 'Gestión en que se cursó',
    docente_id INT COMMENT 'Docente que evaluó',
    
    -- Control de intentos
    numero_intento INT DEFAULT 1 COMMENT 'Número de intento (1, 2, 3, ...)',
    
    -- Asistencia
    asistencias INT DEFAULT 0,
    faltas INT DEFAULT 0,
    total_clases INT DEFAULT 0,
    asistencia_porcentaje DECIMAL(5,2) DEFAULT 0,
    
    -- Sistema de calificaciones (máximo 4 parciales, flexibles)
    nota_1er_parcial DECIMAL(5,2),
    fecha_1er_parcial DATE,
    nota_2do_parcial DECIMAL(5,2),
    fecha_2do_parcial DATE,
    nota_3er_parcial DECIMAL(5,2),
    fecha_3er_parcial DATE,
    nota_4to_parcial DECIMAL(5,2),
    fecha_4to_parcial DATE,
    nota_practico DECIMAL(5,2),
    fecha_practico DATE,
    
    -- Cálculo de suma total
    suma_total DECIMAL(5,2) GENERATED ALWAYS AS (
        COALESCE(nota_1er_parcial, 0) + 
        COALESCE(nota_2do_parcial, 0) + 
        COALESCE(nota_3er_parcial, 0) + 
        COALESCE(nota_4to_parcial, 0) + 
        COALESCE(nota_practico, 0)
    ) STORED,
    
    -- Contador de componentes evaluados
    componentes_evaluados INT GENERATED ALWAYS AS (
        (CASE WHEN nota_1er_parcial IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN nota_2do_parcial IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN nota_3er_parcial IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN nota_4to_parcial IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN nota_practico IS NOT NULL THEN 1 ELSE 0 END)
    ) STORED,
    
    -- Nota final
    nota_final DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN componentes_evaluados > 0 THEN suma_total / componentes_evaluados
            ELSE NULL
        END
    ) STORED,
    
    -- Recuperatorio/Habilitación
    nota_recuperatorio DECIMAL(5,2),
    fecha_recuperatorio DATE,
    intento_recuperatorio INT DEFAULT 0,
    tipo_recuperatorio ENUM('RECUPERATORIO', 'HABILITACION', 'PRUEBA_EXCEPCIONAL'),
    
    -- Nota definitiva
    nota_definitiva DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN nota_recuperatorio IS NOT NULL AND nota_recuperatorio >= 60 THEN 60.00
            ELSE nota_final
        END
    ) STORED,
    
    -- Estado final (resultado académico)
    estado ENUM(
        'APROBADO', 
        'REPROBADO', 
        'NIVELACION_1RA_INSTANCIA',
        'NIVELACION_2DA_INSTANCIA',
        'PRUEBA_EXCEPCIONAL',
        'HOMOLOGACION',
        'VENCIDA_GESTION_ANTERIOR'
    ) COMMENT 'Estado final del resultado académico',
    
    -- Control de registro de notas
    notas_cerradas BOOLEAN DEFAULT FALSE,
    fecha_cierre_notas DATE,
    cerradas_por INT,
    
    -- Observaciones
    observaciones TEXT,
    observaciones_docente TEXT,
    
    -- Campos de auditoría estándar
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_by INT,
    updated_by INT,
    deleted_by INT,
    
    FOREIGN KEY (inscripcion_materia_id) REFERENCES inscripciones_materias(id) ON DELETE SET NULL,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE SET NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE SET NULL,
    FOREIGN KEY (gestion_id) REFERENCES gestiones(id) ON DELETE SET NULL,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL,
    FOREIGN KEY (cerradas_por) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices
    INDEX idx_inscripcion_materia_id (inscripcion_materia_id),
    INDEX idx_estudiante_id (estudiante_id),
    INDEX idx_materia_id (materia_id),
    INDEX idx_gestion_id (gestion_id),
    INDEX idx_estado (estado),
    INDEX idx_nota_definitiva (nota_definitiva),
    INDEX idx_estudiante_materia_intento (estudiante_id, materia_id, numero_intento),
    
    CHECK (nota_1er_parcial IS NULL OR (nota_1er_parcial >= 0 AND nota_1er_parcial <= 100)),
    CHECK (nota_2do_parcial IS NULL OR (nota_2do_parcial >= 0 AND nota_2do_parcial <= 100)),
    CHECK (nota_3er_parcial IS NULL OR (nota_3er_parcial >= 0 AND nota_3er_parcial <= 100)),
    CHECK (nota_4to_parcial IS NULL OR (nota_4to_parcial >= 0 AND nota_4to_parcial <= 100)),
    CHECK (nota_practico IS NULL OR (nota_practico >= 0 AND nota_practico <= 100)),
    CHECK (nota_recuperatorio IS NULL OR (nota_recuperatorio >= 0 AND nota_recuperatorio <= 100)),
    CHECK (intento_recuperatorio >= 0 AND intento_recuperatorio <= 3),
    CHECK (asistencia_porcentaje >= 0 AND asistencia_porcentaje <= 100),
    CHECK (numero_intento >= 1)
    
) COMMENT='Calificaciones y resultados académicos permanentes. Historial académico del estudiante.';
```

---

## 3. ACTUALIZAR `historial_nivelaciones`

```sql
-- Cambiar referencia de inscripcion_materia_id a calificacion_id
CREATE TABLE historial_nivelaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    estudiante_id INT NOT NULL,
    calificacion_id INT NOT NULL COMMENT 'Calificación reprobada original', -- CAMBIO
    materia_id INT NOT NULL,
    gestion_nivelacion_id INT NOT NULL,
    numero_intento INT NOT NULL DEFAULT 1,
    -- ... resto igual
    FOREIGN KEY (calificacion_id) REFERENCES calificaciones(id) ON DELETE SET NULL, -- CAMBIO
    -- ...
);
```

---

## ✅ VENTAJAS DE ESTA ESTRUCTURA

1. **Separación clara**: Inscripción vs. Resultado académico
2. **Boleta de inscripción**: Fácil de generar (inscripciones + inscripciones_materias)
3. **Historial académico**: Fácil de consultar (calificaciones)
4. **Flexibilidad**: Un estudiante puede inscribirse pero no cursar (no hay calificación)
5. **Trazabilidad**: Se puede rastrear de dónde viene cada calificación
6. **Permanencia**: Las calificaciones son permanentes, las inscripciones son temporales

---

## 🔄 FLUJO DE USO

1. **Inscripción**: Se crea `inscripciones` + `inscripciones_materias` (estado: INSCRITO)
2. **Cursado**: Se crea `calificaciones` (referencia a `inscripcion_materia_id`)
3. **Cierre**: Se cierra `calificaciones` (estado: APROBADO/REPROBADO)
4. **Historial**: Se consulta `calificaciones` para ver avance académico
5. **Boleta**: Se consulta `inscripciones` + `inscripciones_materias` para ver inscripción de una gestión
