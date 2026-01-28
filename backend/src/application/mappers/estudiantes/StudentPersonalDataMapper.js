/**
 * Mapper de aplicación: StudentPersonalData
 * Convierte una fila de vista_estudiante_datos_personales a formato de presentación (API)
 *
 * Clean Architecture:
 * - Application Layer: Convierte fila de vista → Presentation Format
 * - Usado por GetStudentByIdUseCase cuando los datos vienen de la vista
 * - Usa BaseMapper para mapeo condicional de campos (mismo enfoque que ContributionPaymentMapper)
 *
 * Responsabilidades:
 * - Mapear fila de vista (snake_case) a { student, guardians, disabilities, origins }
 * - Formato de student compatible con API (camelCase, mismo que entidad Student.toPlainObject)
 * - Parsear JSON de apoderados, origenes, discapacidades y mapear a arrays en formato API
 */

import { BaseMapper } from '../base/index.js';
import { parseJsonArray } from '../../../domain/utils/mapUtils.js';

/**
 * Convierte una fila de vista_estudiante_datos_personales a formato de presentación.
 * Retorna { student, guardians, disabilities, origins } en el mismo formato que la API actual.
 * Usa BaseMapper.mapFieldIfExists para incluir solo campos que existen en la fila.
 *
 * @param {Object} row - Fila de la vista (snake_case)
 * @returns {Object} { student, guardians, disabilities, origins }
 */
export function entityToPresentation(row) {
  if (!row) {
    return { student: null, guardians: [], disabilities: [], origins: [] };
  }

  // Estudiante: vista (snake_case) → API (camelCase), solo campos que existen
  const student = {};
  BaseMapper.mapFieldIfExists(row, 'id', 'id', student);
  BaseMapper.mapFieldIfExists(row, 'codigo_estudiante', 'studentCode', student);
  BaseMapper.mapFieldIfExists(row, 'ci', 'ci', student);
  BaseMapper.mapFieldIfExists(row, 'expedicion', 'expedition', student);
  BaseMapper.mapFieldIfExists(row, 'nombres', 'firstName', student);
  BaseMapper.mapFieldIfExists(row, 'apellido_paterno', 'lastName', student);
  BaseMapper.mapFieldIfExists(row, 'apellido_materno', 'motherLastName', student);
  BaseMapper.mapFieldIfExists(row, 'fecha_nacimiento', 'birthDate', student);
  BaseMapper.mapFieldIfExists(row, 'genero', 'gender', student);
  BaseMapper.mapFieldIfExists(row, 'estado_civil_id', 'civilStatusId', student);
  BaseMapper.mapFieldIfExists(row, 'tipo_sangre', 'bloodType', student);
  BaseMapper.mapFieldIfExists(row, 'tiene_discapacidad', 'hasDisability', student);
  BaseMapper.mapFieldIfExists(row, 'email_personal', 'personalEmail', student);
  BaseMapper.mapFieldIfExists(row, 'celular', 'mobilePhone', student);
  BaseMapper.mapFieldIfExists(row, 'telefono_fijo', 'landlinePhone', student);
  BaseMapper.mapFieldIfExists(row, 'direccion', 'address', student);
  BaseMapper.mapFieldIfExists(row, 'municipio_residencia_id', 'residenceMunicipalityId', student);
  BaseMapper.mapFieldIfExists(row, 'zona', 'zone', student);
  BaseMapper.mapFieldIfExists(row, 'observaciones', 'observations', student);
  BaseMapper.mapFieldIfExists(row, 'activo', 'activo', student);
  BaseMapper.mapFieldIfExists(row, 'created_at', 'createdAt', student);
  BaseMapper.mapFieldIfExists(row, 'updated_at', 'updatedAt', student);
  BaseMapper.mapFieldIfExists(row, 'estado_civil_nombre', 'estadoCivilNombre', student);
  BaseMapper.mapFieldIfExists(row, 'residencia_municipio_nombre', 'residenceMunicipalityName', student);
  BaseMapper.mapFieldIfExists(row, 'residencia_provincia_nombre', 'residenceProvinceName', student);
  BaseMapper.mapFieldIfExists(row, 'residencia_departamento_nombre', 'residenceDepartmentName', student);

  // Apoderados: JSON → array en formato API (BaseMapper por ítem)
  const apoderadosRaw = parseJsonArray(row.apoderados);
  const guardians = apoderadosRaw.map((a) => {
    const g = {};
    BaseMapper.mapFieldIfExists(a, 'apoderado_id', 'id', g);
    g.studentId = row.id;
    BaseMapper.mapFieldIfExists(a, 'tipo_parentesco_id', 'relationshipTypeId', g);
    BaseMapper.mapFieldIfExists(a, 'tipo_parentesco_nombre', 'relationshipTypeName', g);
    BaseMapper.mapFieldIfExists(a, 'apoderado_nombres', 'firstName', g);
    BaseMapper.mapFieldIfExists(a, 'apoderado_apellidos', 'lastName', g);
    BaseMapper.mapFieldIfExists(a, 'celular_1', 'phone1', g);
    BaseMapper.mapFieldIfExists(a, 'celular_2', 'phone2', g);
    BaseMapper.mapFieldIfExists(a, 'vive_con_estudiante', 'livesWithStudent', g);
    return g;
  });

  // Discapacidades: JSON → array en formato API (BaseMapper por ítem)
  const discapacidadesRaw = parseJsonArray(row.discapacidades);
  const disabilities = discapacidadesRaw.map((d) => {
    const disp = {};
    BaseMapper.mapFieldIfExists(d, 'discapacidad_id', 'id', disp);
    disp.studentId = row.id;
    BaseMapper.mapFieldIfExists(d, 'tipo_discapacidad_id', 'disabilityTypeId', disp);
    BaseMapper.mapFieldIfExists(d, 'tipo_discapacidad_nombre', 'disabilityTypeName', disp);
    BaseMapper.mapFieldIfExists(d, 'discapacidad_descripcion', 'description', disp);
    BaseMapper.mapFieldIfExists(d, 'grado_discapacidad', 'degree', disp);
    BaseMapper.mapFieldIfExists(d, 'discapacidad_causa', 'cause', disp);
    return disp;
  });

  // Orígenes: JSON → array en formato API (BaseMapper por ítem)
  const origenesRaw = parseJsonArray(row.origenes);
  const origins = origenesRaw.map((o) => {
    const originPresentation = {};
    BaseMapper.mapFieldIfExists(o, 'origen_id', 'id', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'pais_id_efectivo', 'countryId', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'pais_nombre', 'countryName', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'ciudad', 'birthCity', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'tipo_origen', 'originType', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'es_principal', 'isPrincipal', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'nacimiento_municipio_nombre', 'birthMunicipalityName', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'nacimiento_provincia_nombre', 'birthProvinceName', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'nacimiento_departamento_nombre', 'birthDepartmentName', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'idioma_materno_nombre', 'motherTongueName', originPresentation);
    BaseMapper.mapFieldIfExists(o, 'idioma_secundario_nombre', 'secondaryLanguageName', originPresentation);
    return originPresentation;
  });

  return { student, guardians, disabilities, origins };
}

/**
 * Clase mapper para StudentPersonalData (exportada por compatibilidad)
 */
export class StudentPersonalDataMapper {
  static entityToPresentation(row) {
    return entityToPresentation(row);
  }
}
