-- ============================================
-- SEEDER: tipos_evaluacion
-- Catálogo bimestral alineado al centralizador INCOS y educación técnica en Bolivia
--
-- Nota: teórico / práctico NO va en esta tabla. Al crear una columna en el
-- cuaderno, el docente elige componente (TEORICO | PRACTICO) en evaluaciones.
-- La columna "sugerido" en comentarios es solo referencia pedagógica.
-- ============================================

USE instituto_incos;

SET FOREIGN_KEY_CHECKS = 0;

-- TRUNCATE TABLE tipos_evaluacion;

INSERT INTO tipos_evaluacion (id, codigo, nombre, descripcion, es_recuperatorio, activo) VALUES
-- Evaluaciones continuas habituales
(1, 'EXAMEN_PARCIAL', 'Examen parcial', 'Prueba escrita o oral de mitad de bimestre. Suele ir a componente TEORICO.', FALSE, TRUE),
(2, 'PRACTICO', 'Práctico', 'Evaluación práctica genérica del bimestre (cuaderno, taller aplicado, etc.).', FALSE, TRUE),
(3, 'PROYECTO', 'Proyecto', 'Entrega o defensa de proyecto bimestral. Componente según enfoque (aplicado → PRACTICO).', FALSE, TRUE),
(4, 'EXPOSICION', 'Exposición', 'Exposición oral individual o grupal. Puede ser TEORICO o PRACTICO según el contenido.', FALSE, TRUE),
(5, 'TALLER', 'Taller', 'Trabajo en taller o laboratorio de aula. Suele ir a componente PRACTICO.', FALSE, TRUE),
(6, 'ACTIVIDAD_EXTRACURRICULAR', 'Actividad extracurricular', 'Ferias, concursos, eventos o actividades fuera del aula regular.', FALSE, TRUE),

-- Prácticas y aplicación (como en el centralizador: "Práctica de…", "Ejercicio de…", "Evaluación de…")
(8, 'PRACTICA', 'Práctica', 'Práctica de aplicación por tema (ej. práctica de pólizas, de seguros). Típico PRACTICO.', FALSE, TRUE),
(9, 'EJERCICIO', 'Ejercicio', 'Ejercicio resuelto en clase o domiciliario sobre un caso concreto. Típico PRACTICO.', FALSE, TRUE),
(10, 'EVALUACION_APLICACION', 'Evaluación de aplicación', 'Desempeño aplicado: formularios, simulaciones, casos reales del oficio. Típico PRACTICO.', FALSE, TRUE),
(11, 'LABORATORIO', 'Laboratorio', 'Práctica de laboratorio o taller técnico con registro de resultados. Típico PRACTICO.', FALSE, TRUE),
(12, 'ESTUDIO_CASO', 'Estudio de caso', 'Análisis y resolución de un caso. En técnico superior suele ser PRACTICO.', FALSE, TRUE),
(13, 'INFORME', 'Informe', 'Informe escrito de práctica, visita o investigación breve. Suele PRACTICO.', FALSE, TRUE),
(14, 'VISITA_CAMPO', 'Visita técnica', 'Salida de campo, visita a empresa o institución con informe. Suele PRACTICO.', FALSE, TRUE),

-- Teóricas (como en el centralizador: cuestionarios, temas conceptuales, principios)
(15, 'CUESTIONARIO', 'Cuestionario', 'Cuestionario o guía de preguntas sobre contenidos teóricos. Típico TEORICO.', FALSE, TRUE),
(16, 'CONTROL_LECTURA', 'Control de lectura', 'Ficha de lectura, resumen o comprensión de material bibliográfico. Típico TEORICO.', FALSE, TRUE),
(17, 'CONCEPTUAL', 'Control conceptual', 'Evaluación por tema o unidad conceptual (ej. entidades aseguradoras, contrato). Típico TEORICO.', FALSE, TRUE),
(18, 'PRUEBA_OBJETIVA', 'Prueba objetiva', 'Test de opción múltiple, verdadero/falso o respuesta corta. Típico TEORICO.', FALSE, TRUE),
(19, 'TRABAJO_DIRIGIDO', 'Trabajo dirigido', 'Trabajo guiado en aula o domicilio con preguntas teóricas. Típico TEORICO.', FALSE, TRUE),
(20, 'SEMINARIO', 'Seminario', 'Participación en seminario con lecturas y debate. Suele TEORICO.', FALSE, TRUE),

-- Recuperación bimestral (no se promedia; reemplaza nota del bimestre)
(7, 'HABILITACION', 'Habilitación bimestral', 'Reemplaza la nota del bimestre si el estudiante reprueba solo ese bimestre.', TRUE, TRUE);

SET FOREIGN_KEY_CHECKS = 1;
