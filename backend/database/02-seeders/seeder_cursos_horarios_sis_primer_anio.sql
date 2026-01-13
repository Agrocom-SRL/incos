-- ============================================
-- SEEDER: cursos_horarios - SISTEMAS INFORMÁTICOS PRIMER AÑO
-- Sistema de Gestión Académica - Instituto INCOS
-- Asignación de horarios y aulas - PARALELOS: PRIMERO A (NOCHE), PRIMERO B (NOCHE)
-- ============================================

USE instituto_incos;

-- Deshabilitar foreign key checks temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- OBTENER IDs DE CURSOS - PRIMERO A (NOCHE)
-- ============================================

SET @curso_1a_mpi101 = (SELECT id FROM cursos WHERE codigo = 'SIS-1A-NOCHE-MPI101' LIMIT 1);
SET @curso_1a_prg102 = (SELECT id FROM cursos WHERE codigo = 'SIS-1A-NOCHE-PRG102' LIMIT 1);
SET @curso_1a_int103 = (SELECT id FROM cursos WHERE codigo = 'SIS-1A-NOCHE-INT103' LIMIT 1);
SET @curso_1a_hdc104 = (SELECT id FROM cursos WHERE codigo = 'SIS-1A-NOCHE-HDC104' LIMIT 1);
SET @curso_1a_tso105 = (SELECT id FROM cursos WHERE codigo = 'SIS-1A-NOCHE-TSO105' LIMIT 1);
SET @curso_1a_otm106 = (SELECT id FROM cursos WHERE codigo = 'SIS-1A-NOCHE-OTM106' LIMIT 1);
SET @curso_1a_dpw107 = (SELECT id FROM cursos WHERE codigo = 'SIS-1A-NOCHE-DPW107' LIMIT 1);

-- ============================================
-- OBTENER IDs DE CURSOS - PRIMERO B (NOCHE)
-- ============================================

SET @curso_1b_mpi101 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-MPI101' LIMIT 1);
SET @curso_1b_prg102 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-PRG102' LIMIT 1);
SET @curso_1b_int103 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-INT103' LIMIT 1);
SET @curso_1b_hdc104 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-HDC104' LIMIT 1);
SET @curso_1b_tso105 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-TSO105' LIMIT 1);
SET @curso_1b_otm106 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-OTM106' LIMIT 1);
SET @curso_1b_dpw107 = (SELECT id FROM cursos WHERE codigo = 'SIS-1B-NOCHE-DPW107' LIMIT 1);

-- ============================================
-- OBTENER IDs DE AULAS
-- ============================================

SET @aula_lab1 = (SELECT id FROM aulas WHERE codigo = 'LAB-1' LIMIT 1);
SET @aula_lab4 = (SELECT id FROM aulas WHERE codigo = 'LAB-4' LIMIT 1);
SET @aula_8 = (SELECT id FROM aulas WHERE codigo = 'AULA-8' LIMIT 1);

-- ============================================
-- PRIMERO A - NOCHE
-- ============================================

-- PROGRAMACIÓN I (8 horas/semana)
-- MARTES (5 bloques) + JUEVES (1 bloque) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_prg102, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 1),
(@curso_1a_prg102, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 2),
(@curso_1a_prg102, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 3),
(@curso_1a_prg102, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 4),
(@curso_1a_prg102, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 5),
(@curso_1a_prg102, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 6),
(@curso_1a_prg102, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:00:00' LIMIT 1), @aula_lab4, 7),
(@curso_1a_prg102, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:45:00' LIMIT 1), @aula_lab4, 8);

-- MATEMÁTICA PARA LA INFORMÁTICA (4 horas/semana)
-- MIÉRCOLES (2 bloques) + JUEVES (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_mpi101, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 1),
(@curso_1a_mpi101, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 2),
(@curso_1a_mpi101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 3),
(@curso_1a_mpi101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 4);

-- INGLÉS TÉCNICO (2 horas/semana)
-- SÁBADO (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_int103, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '17:30:00' LIMIT 1), NULL, 1),
(@curso_1a_int103, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '18:15:00' LIMIT 1), NULL, 2);

-- HARDWARE DE COMPUTADORAS (4 horas/semana)
-- VIERNES (4 bloques) AULA 8
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_hdc104, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_8, 1),
(@curso_1a_hdc104, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_8, 2),
(@curso_1a_hdc104, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_8, 3),
(@curso_1a_hdc104, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_8, 4);

-- TALLER DE SISTEMAS OPERATIVOS (4 horas/semana)
-- LUNES (3 bloques) + VIERNES (1 bloque) LAB 4
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_tso105, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 1),
(@curso_1a_tso105, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 2),
(@curso_1a_tso105, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 3),
(@curso_1a_tso105, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_8, 4);

-- OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA (4 horas/semana)
-- JUEVES (2 bloques) + MIÉRCOLES (1 bloque) + SÁBADO (1 bloque) LAB 4 y LAB 1
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_otm106, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 1),
(@curso_1a_otm106, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 2),
(@curso_1a_otm106, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 3),
(@curso_1a_otm106, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '16:30:00' LIMIT 1), @aula_lab1, 4);

-- DISEÑO Y PROGRAMACIÓN WEB I (4 horas/semana)
-- LUNES (2 bloques) + MIÉRCOLES (2 bloques) LAB 4 y LAB 1
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1a_dpw107, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 1),
(@curso_1a_dpw107, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 2),
(@curso_1a_dpw107, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 3),
(@curso_1a_dpw107, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 4);

-- ============================================
-- PRIMERO B - NOCHE
-- ============================================

-- PROGRAMACIÓN I (8 horas/semana)
-- LUNES (2 bloques) + MIÉRCOLES (1 bloque) + JUEVES (2 bloques) + VIERNES (1 bloque) + SÁBADO (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_prg102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1b_prg102, (SELECT id FROM horarios WHERE dia = 'LUNES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1b_prg102, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 3),
(@curso_1b_prg102, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 4),
(@curso_1b_prg102, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 5),
(@curso_1b_prg102, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 6),
(@curso_1b_prg102, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:00:00' LIMIT 1), NULL, 7),
(@curso_1b_prg102, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:45:00' LIMIT 1), NULL, 8);

-- MATEMÁTICA PARA LA INFORMÁTICA (4 horas/semana)
-- JUEVES (2 bloques) + MIÉRCOLES (2 bloques) LAB 1 y LAB 4
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_mpi101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 1),
(@curso_1b_mpi101, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), NULL, 2),
(@curso_1b_mpi101, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 3),
(@curso_1b_mpi101, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab4, 4);

-- INGLÉS TÉCNICO (2 horas/semana)
-- SÁBADO (2 bloques)
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_int103, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:00:00' LIMIT 1), NULL, 1),
(@curso_1b_int103, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '15:45:00' LIMIT 1), NULL, 2);

-- HARDWARE DE COMPUTADORAS (4 horas/semana)
-- MIÉRCOLES (2 bloques) + VIERNES (2 bloques) AULA 8 y LAB 1
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_hdc104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_8, 1),
(@curso_1b_hdc104, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_8, 2),
(@curso_1b_hdc104, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 3),
(@curso_1b_hdc104, (SELECT id FROM horarios WHERE dia = 'VIERNES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 4);

-- TALLER DE SISTEMAS OPERATIVOS (4 horas/semana)
-- JUEVES (1 bloque) + SÁBADO (3 bloques) LAB 4
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_tso105, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), NULL, 1),
(@curso_1b_tso105, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '16:30:00' LIMIT 1), @aula_lab4, 2),
(@curso_1b_tso105, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '17:30:00' LIMIT 1), @aula_lab4, 3),
(@curso_1b_tso105, (SELECT id FROM horarios WHERE dia = 'SABADO' AND hora_inicio = '18:15:00' LIMIT 1), @aula_lab4, 4);

-- OFIMÁTICA Y TECNOLOGÍA MULTIMEDIA (4 horas/semana)
-- MARTES (3 bloques) + MIÉRCOLES (1 bloque) LAB 1 y AULA 8
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_otm106, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '18:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 1),
(@curso_1b_otm106, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:00:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 2),
(@curso_1b_otm106, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 3),
(@curso_1b_otm106, (SELECT id FROM horarios WHERE dia = 'MIERCOLES' AND hora_inicio = '19:45:00' AND turno = 'NOCHE' LIMIT 1), @aula_8, 4);

-- DISEÑO Y PROGRAMACIÓN WEB I (4 horas/semana)
-- MARTES (2 bloques) + JUEVES (2 bloques) LAB 1
INSERT INTO cursos_horarios (curso_id, horario_id, aula_id, orden_secuencia) VALUES
(@curso_1b_dpw107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 1),
(@curso_1b_dpw107, (SELECT id FROM horarios WHERE dia = 'MARTES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 2),
(@curso_1b_dpw107, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '20:30:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 3),
(@curso_1b_dpw107, (SELECT id FROM horarios WHERE dia = 'JUEVES' AND hora_inicio = '21:15:00' AND turno = 'NOCHE' LIMIT 1), @aula_lab1, 4);

-- Rehabilitar foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- RESUMEN
-- ============================================
-- PARALELO A (NOCHE): 7 cursos × ~4 bloques = ~30 registros
-- PARALELO B (NOCHE): 7 cursos × ~4 bloques = ~30 registros
-- TOTAL: ~60 registros
-- ============================================
-- FIN DEL SEEDER
-- ============================================
