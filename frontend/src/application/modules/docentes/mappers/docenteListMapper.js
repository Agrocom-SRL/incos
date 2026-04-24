/**
 * Mapper: filas del API de docentes → forma de lista en UI (+ campos para búsqueda en cliente).
 */

import { buildPersonDisplayData } from '@application/utils/formatters';

const toSearchStr = (v) => {
  if (v == null || v === '') return null;
  if (typeof v === 'object' && v instanceof Date) {
    return v.toISOString();
  }
  return String(v);
};

export const docenteListMapper = (row) => {
  if (!row) return null;

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
    civilStatusId: row.civilStatusId ?? null,
    createdAt: row.createdAt ?? null,
  };
};

export const mapDocentesList = (rows) => {
  if (!Array.isArray(rows)) return [];
  return rows.map(docenteListMapper).filter(Boolean);
};
