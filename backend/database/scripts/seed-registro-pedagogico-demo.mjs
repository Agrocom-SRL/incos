/**
 * Seeder DEMO — Notas del PRIMER BIMESTRE (consolidado) para un curso real al azar.
 *
 * Objetivo: poblar el cuaderno (evaluaciones + bimestres_matricula + evaluaciones_notas)
 * de un `asignaciones_docentes` existente con estudiantes matriculados, para verificar
 * cómo se ve el Registro Pedagógico (.xlsx) con datos reales (materia / docente / curso
 * tomados de los seeders 31–39 y de las matrículas migradas).
 *
 * Replica el cierre oficial del bimestre: además de las notas crudas, consolida
 * `bimestres_matricula` (nota_teorico/practico/bimestre, estado CERRADO) y calcula la
 * nota global de la gestión `matriculas_materia.nota_final` (ponderada por bimestres),
 * usando las mismas utilidades de cálculo del backend. Así la nota global aparece en
 * MisCursosPage y el consolidado.
 *
 * Es idempotente: las evaluaciones que crea quedan marcadas con descripcion = MARCA_DEMO,
 * y cada corrida borra primero sus notas/columnas previas antes de re-sembrar. No borra
 * bimestres_matricula ni toca evaluaciones reales.
 *
 * Uso:  node database/scripts/seed-registro-pedagogico-demo.mjs [asignacionDocenteId]
 *   - Sin argumento: elige al azar un curso con al menos MIN_ESTUDIANTES matriculados.
 *   - Con argumento: usa ese asignacion_docente_id.
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RegistroPedagogicoExcelBuilder } from '../../src/infrastructure/external/excel/RegistroPedagogicoExcelBuilder.js';
import { construirRegistroPedagogicoExcelPayload } from '../../src/application/mappers/academico/registroPedagogicoExcelMapper.js';
import {
  mergePoliticaExtra,
  parsePoliticaFromRow
} from '../../src/application/utils/politicaInstitucionalPayload.js';
import { obtenerCuotasDesdePolitica } from '../../src/application/utils/obtenerCuotasDesdePolitica.js';
import {
  calcularNotaBimestre,
  calcularNotaFinalPonderada
} from '../../src/application/utils/cuadernoNotasCalculo.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const BIMESTRE = 1;
const MIN_ESTUDIANTES = 8;
const MARCA_DEMO = 'SEED_DEMO_REGISTRO_PEDAGOGICO';

// Esquema de evaluaciones del bimestre (los puntos suman la cuota de cada componente).
const EVALUACIONES_PRACTICAS = [
  { nombre: 'Práctico Lab 1', puntos: 15 },
  { nombre: 'Práctico Lab 2', puntos: 15 },
  { nombre: 'Trabajo Grupal', puntos: 20 },
  { nombre: 'Exposición', puntos: 20 }
]; // suma 70
const EVALUACIONES_TEORICAS = [
  { nombre: 'Examen Parcial 1', puntos: 15 },
  { nombre: 'Investigación', puntos: 15 }
]; // suma 30

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const pick = (arr) => arr[rnd(0, arr.length - 1)];

/** Perfil de rendimiento por estudiante para que el consolidado muestre variedad. */
const perfilEstudiante = () => {
  const r = Math.random();
  if (r < 0.15) return { tipo: 'NO_PRESENTADO', ratio: 0 };
  if (r < 0.4) return { tipo: 'REPROBADO', ratio: 0.3 + Math.random() * 0.25 }; // ~0.30–0.55
  return { tipo: 'APROBADO', ratio: 0.7 + Math.random() * 0.28 }; // ~0.70–0.98
};

const notaEvaluacion = (puntos, ratio) => {
  if (ratio <= 0) return 0;
  const jitter = (Math.random() - 0.5) * 0.2;
  return clamp(Math.round(puntos * (ratio + jitter)), 0, puntos);
};

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  const q = async (sql, params = []) => {
    const [rows] = await conn.query(sql, params);
    return rows;
  };

  try {
    // 1) Contexto: gestión vigente + periodo del bimestre 1
    const [ctx] = await q(
      `SELECT gestion_id, gestion_anio, gestion_nombre, bimestre_vigente
         FROM vista_calificacion_contexto_vigente`
    );
    if (!ctx) throw new Error('No hay gestión vigente (vista_calificacion_contexto_vigente vacía).');
    const gestionId = ctx.gestion_id;

    const [periodo] = await q(
      `SELECT periodo_academico_id, fecha_inicio, fecha_fin, estado_calendario
         FROM vista_base_calificacion_periodos_bimestre
        WHERE gestion_id = ? AND numero_orden = ? LIMIT 1`,
      [gestionId, BIMESTRE]
    );
    if (!periodo) throw new Error(`No existe periodo del bimestre ${BIMESTRE} para la gestión ${gestionId}.`);
    const periodoId = periodo.periodo_academico_id;
    const cerrado = periodo.estado_calendario === 'cerrado' || BIMESTRE < ctx.bimestre_vigente;

    // 2) Elegir curso (asignacion_docente) con estudiantes matriculados
    const argId = Number(process.argv[2]);
    let asignacionId = Number.isFinite(argId) && argId > 0 ? argId : null;
    if (!asignacionId) {
      const candidatos = await q(
        `SELECT asignacion_docente_id, COUNT(*) AS estudiantes
           FROM vista_base_calificacion_estudiante_matricula_curso
          GROUP BY asignacion_docente_id
         HAVING estudiantes >= ?
          ORDER BY estudiantes DESC`,
        [MIN_ESTUDIANTES]
      );
      if (!candidatos.length) throw new Error('Ningún curso tiene estudiantes matriculados suficientes.');
      asignacionId = pick(candidatos).asignacion_docente_id;
    }

    const [curso] = await q(
      `SELECT docente_id, materia_nombre, materia_sigla, carrera_nombre,
              paralelo_nombre, asignatura_periodo_nombre
         FROM vista_calificacion_cursos_docente
        WHERE asignacion_docente_id = ? LIMIT 1`,
      [asignacionId]
    );
    if (!curso) throw new Error(`No se encontró el curso de asignacion_docente_id=${asignacionId}.`);

    const estudiantes = await q(
      `SELECT matricula_materia_id, estudiante_id, nombre
         FROM vista_base_calificacion_estudiante_matricula_curso
        WHERE asignacion_docente_id = ?
        ORDER BY estudiante_id`,
      [asignacionId]
    );

    console.log('═══════════════════════════════════════════════════════════');
    console.log('CURSO ELEGIDO');
    console.log('  asignacion_docente_id :', asignacionId);
    console.log('  Carrera              :', curso.carrera_nombre);
    console.log('  Materia              :', `${curso.materia_nombre} (${curso.materia_sigla})`);
    console.log('  Curso / Paralelo     :', `${curso.asignatura_periodo_nombre} · ${curso.paralelo_nombre}`);
    console.log('  Estudiantes          :', estudiantes.length);
    console.log('  Bimestre / periodo   :', `${BIMESTRE} · periodo_id=${periodoId} · ${periodo.estado_calendario}${cerrado ? ' (exportable)' : ' (NO cerrado)'}`);
    console.log('═══════════════════════════════════════════════════════════');

    // Política institucional vigente (cuotas + pesos de bimestres + nota mínima)
    const [cfgRow] = await q(
      `SELECT id, gestion_id, clave, valor, tipo, vigente, descripcion
         FROM configuracion_evaluacion
        WHERE gestion_id = ? AND clave = 'POLITICA_INSTITUCIONAL' AND vigente = TRUE AND activo = TRUE AND deleted_at IS NULL
        ORDER BY id DESC LIMIT 1`,
      [gestionId]
    );
    const politica = obtenerCuotasDesdePolitica(mergePoliticaExtra(parsePoliticaFromRow(cfgRow)));

    // 3) Limpieza idempotente de la siembra DEMO previa de este curso/bimestre
    await q(
      `DELETE en FROM evaluaciones_notas en
         INNER JOIN evaluaciones e ON e.id = en.evaluacion_id
        WHERE e.asignacion_docente_id = ? AND e.periodo_academico_id = ? AND e.descripcion = ?`,
      [asignacionId, periodoId, MARCA_DEMO]
    );
    await q(
      `DELETE FROM evaluaciones
        WHERE asignacion_docente_id = ? AND periodo_academico_id = ? AND descripcion = ?`,
      [asignacionId, periodoId, MARCA_DEMO]
    );

    // 4) Insertar columnas (evaluaciones) prácticas y teóricas
    const fInicio = new Date(periodo.fecha_inicio);
    const fechaEval = (i, total) => {
      const d = new Date(fInicio);
      d.setDate(d.getDate() + Math.round(((i + 1) / (total + 1)) * 50));
      return d.toISOString().slice(0, 10);
    };
    const columnas = [];
    const insertarColumna = async (ev, componente, idx, total) => {
      const res = await q(
        `INSERT INTO evaluaciones
           (asignacion_docente_id, periodo_academico_id, tipo_evaluacion_id, componente,
            nombre_evaluacion, descripcion, puntos, fecha, notas_cerradas, activo)
         VALUES (?, ?, NULL, ?, ?, ?, ?, ?, 1, 1)`,
        [asignacionId, periodoId, componente, ev.nombre, MARCA_DEMO, ev.puntos, fechaEval(idx, total)]
      );
      columnas.push({ id: res.insertId, puntos: ev.puntos, componente });
    };
    for (let i = 0; i < EVALUACIONES_PRACTICAS.length; i += 1) {
      await insertarColumna(EVALUACIONES_PRACTICAS[i], 'PRACTICO', i, EVALUACIONES_PRACTICAS.length);
    }
    for (let i = 0; i < EVALUACIONES_TEORICAS.length; i += 1) {
      await insertarColumna(EVALUACIONES_TEORICAS[i], 'TEORICO', i, EVALUACIONES_TEORICAS.length);
    }

    // 5) Asegurar bimestre_matricula (bimestre 1), sembrar notas y consolidar
    let celdas = 0;
    const conteo = { APROBADO: 0, REPROBADO: 0, NO_PRESENTADO: 0 };
    for (const est of estudiantes) {
      let [bm] = await q(
        `SELECT id FROM bimestres_matricula
          WHERE matricula_materia_id = ? AND bimestre = ? AND deleted_at IS NULL LIMIT 1`,
        [est.matricula_materia_id, BIMESTRE]
      );
      if (!bm) {
        const res = await q(
          `INSERT INTO bimestres_matricula (matricula_materia_id, bimestre, estado, activo)
           VALUES (?, ?, 'EN_CURSO', 1)`,
          [est.matricula_materia_id, BIMESTRE]
        );
        bm = { id: res.insertId };
      }

      const perfil = perfilEstudiante();
      conteo[perfil.tipo] += 1;
      let sumaPractico = 0;
      let sumaTeorico = 0;
      for (const col of columnas) {
        const nota = notaEvaluacion(col.puntos, perfil.ratio);
        await q(
          `INSERT INTO evaluaciones_notas (evaluacion_id, bimestre_matricula_id, nota, intento, activo)
           VALUES (?, ?, ?, 1, 1)`,
          [col.id, bm.id, nota]
        );
        celdas += 1;
        if (col.componente === 'PRACTICO') sumaPractico += nota;
        else sumaTeorico += nota;
      }

      // Consolidar el bimestre: componentes + nota cerrada (replica el flujo oficial de cierre)
      const notaBim = calcularNotaBimestre(sumaTeorico, sumaPractico);
      await q(
        `UPDATE bimestres_matricula
            SET nota_teorico = ?, nota_practico = ?, nota_bimestre = ?, estado = 'CERRADO', updated_at = NOW()
          WHERE id = ?`,
        [sumaTeorico, sumaPractico, notaBim, bm.id]
      );

      // Nota global de la gestión = ponderado de los bimestres con nota (matriculas_materia.nota_final)
      const bims = await q(
        `SELECT bimestre AS numero, nota_bimestre AS nota
           FROM bimestres_matricula
          WHERE matricula_materia_id = ? AND deleted_at IS NULL AND activo = TRUE`,
        [est.matricula_materia_id]
      );
      const notaFinal = calcularNotaFinalPonderada(bims, politica.pesosBimestres);
      // Solo el bimestre 1 está cerrado (el año sigue en curso) → estado CURSANDO.
      await q(
        `UPDATE matriculas_materia SET nota_final = ?, estado = 'CURSANDO', updated_at = NOW() WHERE id = ?`,
        [notaFinal, est.matricula_materia_id]
      );
    }

    console.log('SIEMBRA OK →',
      `${columnas.length} columnas (${EVALUACIONES_PRACTICAS.length} práct. + ${EVALUACIONES_TEORICAS.length} teór.),`,
      `${celdas} celdas de nota.`);
    console.log('  Perfiles:', `Aprobados≈${conteo.APROBADO} · Reprobados≈${conteo.REPROBADO} · No presentados≈${conteo.NO_PRESENTADO}`);

    // 6) Generar el .xlsx con el mismo mapper + builder del export real
    const [docente] = await q(
      `SELECT docente_nombre FROM vista_calificacion_docente_encabezado WHERE docente_id = ? LIMIT 1`,
      [curso.docente_id]
    );
    const filasEvaluaciones = await q(
      `SELECT id, tipo_evaluacion_id, componente, nombre_evaluacion, puntos, fecha, notas_cerradas
         FROM vista_base_cuaderno_evaluacion_columna
        WHERE asignacion_docente_id = ? AND periodo_academico_id = ? ORDER BY id ASC`,
      [asignacionId, periodoId]
    );
    const filasEstudiantes = await q(
      `SELECT emc.estudiante_id, emc.codigo, emc.nombre, est.ci, est.genero,
              TRIM(CONCAT_WS(' ', est.apellido_paterno, est.apellido_materno, est.nombres)) AS nombre_export
         FROM vista_base_calificacion_estudiante_matricula_curso emc
         INNER JOIN estudiantes est ON est.id = emc.estudiante_id AND est.deleted_at IS NULL AND est.activo = TRUE
        WHERE emc.asignacion_docente_id = ?
        ORDER BY nombre_export ASC, emc.estudiante_id ASC`,
      [asignacionId]
    );
    const filasNotas = await q(
      `SELECT estudiante_id, evaluacion_id, nota FROM vista_base_cuaderno_nota_celda
        WHERE asignacion_docente_id = ? AND bimestre = ?`,
      [asignacionId, BIMESTRE]
    );

    const payload = construirRegistroPedagogicoExcelPayload({
      bimestreNum: BIMESTRE,
      periodoId,
      asignacionId,
      cursoRow: { ...curso },
      docenteRow: docente,
      contexto: ctx,
      filasEvaluaciones,
      filasEstudiantes,
      filasNotas,
      politica
    });

    const buffer = await new RegistroPedagogicoExcelBuilder().generarRegistroPedagogicoBimestre(payload);
    const safe = (v) => String(v ?? '').replace(/[^\dA-Za-z._-]/g, '_').replace(/_+/g, '_').slice(0, 40);
    const fileName = `registro_pedagogico_DEMO_${safe(payload.codigo_asignatura)}_${safe(payload.bimestre)}_${safe(payload.gestion)}.xlsx`;
    const outPath = path.join(os.homedir(), 'Downloads', fileName);
    fs.writeFileSync(outPath, buffer);

    console.log('XLSX GENERADO →', outPath);
    console.log('Ponderación:', `práctico ${politica.cuotaPractico} · teórico ${politica.cuotaTeorico} · aprobación ≥ ${politica.notaMinimaAprobacion}`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('ERROR:', err.message);
  process.exitCode = 1;
});
