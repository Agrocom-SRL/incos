/**
 * Mapper: filas del API de docentes → forma de lista en UI (+ campos para búsqueda en cliente).
 */

import { buildPersonDisplayData } from '@application/utils/formatters';
import { sanitizeDocenteColorHex } from '@docentes/utils/docenteColor';

const toSearchStr = (v) => {
  if (v == null || v === '') return null;
  if (typeof v === 'object' && v instanceof Date) {
    return v.toISOString();
  }
  return String(v);
};

export const docenteListMapper = (row) => {
  if (!row) return null;

  const rawStats = row.teachingStats || {};
  const rawConflicts = rawStats.conflictos || {};
  const totalAsignaciones = Number(rawStats.totalAsignaciones) || 0;
  const totalMaterias = Number(rawStats.totalMaterias) || 0;
  const totalParalelos = Number(rawStats.totalParalelos) || 0;
  const conflictoCurso = Number(rawConflicts.curso) || 0;
  const conflictoHorario = Number(rawConflicts.horario) || 0;
  const conflictoAula = Number(rawConflicts.aula) || 0;
  const totalConflictos = Number(rawConflicts.total) || (conflictoCurso + conflictoHorario + conflictoAula);
  const hasAsignaciones = Boolean(rawStats.hasAsignaciones) || totalAsignaciones > 0;
  const hasConflictos = Boolean(rawConflicts.hasConflictos) || totalConflictos > 0;

  const fromParts = buildPersonDisplayData({
    ci: row.ci,
    expedicion: row.expedition,
    nombres: row.firstName,
    apellidoPaterno: row.lastName,
    apellidoMaterno: row.motherLastName,
  });

  return {
    id: row.id,
    nombreCompleto: row.nombreCompleto || fromParts.nombreCompleto,
    ciCompleto: row.ciCompleto || fromParts.ciCompleto,
    nombres: row.firstName ?? null,
    apellidoPaterno: row.lastName ?? null,
    apellidoMaterno: row.motherLastName ?? null,
    ci: row.ci ?? null,
    expedicion: row.expedition ?? null,
    celular: row.mobilePhone ?? null,
    telefono: row.phone ?? null,
    emailPersonal: row.personalEmail ?? null,
    tituloProfesional: row.professionalTitle ?? null,
    especialidad: row.specialty ?? null,
    nivelAcademico: row.academicLevel ?? null,
    tipoContrato: row.contractType ?? null,
    estadoLaboral: row.laborState ?? null,
    genero: row.gender ?? null,
    nacionalidad: row.nationality ?? null,
    direccion: row.address ?? null,
    zona: row.zone ?? null,
    observaciones: row.observations ?? null,
    institucionEgreso: row.graduationInstitution ?? null,
    anioEgreso: row.graduationYear ?? null,
    aniosExperiencia: row.yearsOfExperience ?? null,
    fechaContratacion: toSearchStr(row.hireDate),
    fechaRetiro: toSearchStr(row.retirementDate),
    userId: row.userId ?? null,
    colorHex: sanitizeDocenteColorHex(row.colorHex ?? row.color_hex),
    maxHorasSemana: row.maxHorasSemana ?? row.max_horas_semana ?? null,
    maxHorasMes: row.maxHorasMes ?? row.max_horas_mes ?? null,
    civilStatusId: row.civilStatusId ?? null,
    createdAt: row.createdAt ?? null,
    teachingStats: {
      totalAsignaciones,
      totalMaterias,
      totalParalelos,
      hasAsignaciones,
      conflictos: {
        curso: conflictoCurso,
        horario: conflictoHorario,
        aula: conflictoAula,
        total: totalConflictos,
        hasConflictos,
      },
    },
  };
};

export const mapDocentesList = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(docenteListMapper).filter(Boolean);
};
