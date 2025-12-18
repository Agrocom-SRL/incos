-- ============================================
-- SEEDER: LIBROS DE REGISTRO
-- Sistema de Gestión Académica - Instituto INCOS
-- ============================================

USE instituto_incos;

-- ============================================
-- INSERTAR LIBROS DE REGISTRO INICIALES
-- ============================================
-- Crea un libro de registro inicial para cada carrera
-- Solo si no existe ya un libro para esa carrera
-- ============================================

INSERT INTO libros_registro (numero_libro, carrera_id, gestion_inicio, folio_inicio, folio_actual, activo)
SELECT 
    COALESCE((SELECT MAX(numero_libro) FROM libros_registro), 0) + ROW_NUMBER() OVER (ORDER BY c.id) as numero_libro,
    c.id as carrera_id,
    YEAR(CURDATE()) as gestion_inicio,
    1 as folio_inicio,
    1 as folio_actual,
    TRUE as activo
FROM carreras c
WHERE NOT EXISTS (
    SELECT 1 
    FROM libros_registro lr 
    WHERE lr.carrera_id = c.id 
    AND lr.activo = TRUE
    AND lr.deleted_at IS NULL
)
AND c.activo = TRUE
AND c.deleted_at IS NULL;

-- ============================================
-- VERIFICACIÓN
-- ============================================

SELECT '✅ Libros de registro insertados exitosamente' as mensaje;
SELECT 
    lr.numero_libro,
    c.nombre as carrera,
    lr.gestion_inicio,
    lr.folio_actual
FROM libros_registro lr
INNER JOIN carreras c ON lr.carrera_id = c.id
WHERE lr.activo = TRUE
AND lr.deleted_at IS NULL
ORDER BY lr.numero_libro;
