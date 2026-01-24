/**
 * Validador: RegisterStudentValidator
 * 
 * Single Responsibility: Validar datos de registro de estudiante antes de enviar al backend
 * 
 * Clean Architecture:
 * - Application Layer: Validación de datos de aplicación (no lógica de negocio)
 * - Se ejecuta ANTES del Use Case para evitar llamadas innecesarias al backend
 * 
 * Este validador:
 * - Valida estructura de datos (tipos, campos requeridos)
 * - Valida formato básico (no reglas de negocio complejas)
 * - Retorna errores estructurados para mostrar en UI
 * 
 * NOTA: Las reglas de negocio complejas (CI duplicado, etc.) están en el backend.
 * Este validador solo verifica que los datos estén presentes y tengan formato básico.
 */

/**
 * Valida los datos de registro de estudiante
 * 
 * @param {Object} datosEstudiante - Datos del estudiante a validar
 * @returns {{isValid: boolean, errors?: Array<{field: string, message: string}>}}
 * 
 * errors: Array con errores de validación
 * Formato: [{ field: 'campo', message: 'mensaje' }, ...]
 */
export function validateRegisterStudent(datosEstudiante) {
  // 1. Validar que datosEstudiante sea un objeto
  if (!datosEstudiante || typeof datosEstudiante !== 'object') {
    return {
      isValid: false,
      errors: [{
        field: 'general',
        message: 'Los datos del estudiante son requeridos',
      }],
    };
  }

  const errors = [];

  // 2. Validar campos mínimos requeridos (basado en SQL schema NOT NULL)
  // Según schema: ci, nombres, fecha_nacimiento, genero, celular son NOT NULL
  // Expedición y apellido_paterno son opcionales (NULL permitido)
  const camposRequeridos = [
    { field: 'ci', message: 'CI es requerido' },
    { field: 'nombres', message: 'Nombres son requeridos' },
    { field: 'fechaNacimiento', message: 'Fecha de nacimiento es requerida' },
    { field: 'generoId', message: 'Género es requerido' },
    { field: 'celular', message: 'Celular es requerido' },
  ];

  camposRequeridos.forEach(({ field, message }) => {
    if (!datosEstudiante[field]) {
      errors.push({ field, message });
    }
  });

  // 3. Validar formato básico de campos (solo si están presentes, permitir nulos/vacíos para opcionales)
  if (datosEstudiante.ci && datosEstudiante.ci !== null && datosEstudiante.ci !== '') {
    if (typeof datosEstudiante.ci !== 'string' && typeof datosEstudiante.ci !== 'number') {
      errors.push({
        field: 'ci',
        message: 'CI debe ser un texto o número',
      });
    }
  }

  // Validar email personal solo si está presente (es opcional según schema)
  if (datosEstudiante.emailPersonal && datosEstudiante.emailPersonal !== null && datosEstudiante.emailPersonal !== '') {
    if (typeof datosEstudiante.emailPersonal !== 'string') {
      errors.push({
        field: 'emailPersonal',
        message: 'Email personal debe ser un texto',
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosEstudiante.emailPersonal)) {
      errors.push({
        field: 'emailPersonal',
        message: 'Email personal debe tener un formato válido',
      });
    }
  }

  // Validar celular solo si está presente (es requerido pero puede venir vacío antes de validar)
  if (datosEstudiante.celular && datosEstudiante.celular !== null && datosEstudiante.celular !== '') {
    if (typeof datosEstudiante.celular !== 'string' && typeof datosEstudiante.celular !== 'number') {
      errors.push({
        field: 'celular',
        message: 'Celular debe ser un texto o número',
      });
    }
  }

  if (datosEstudiante.fechaNacimiento && datosEstudiante.fechaNacimiento !== null && datosEstudiante.fechaNacimiento !== '') {
    if (!(datosEstudiante.fechaNacimiento instanceof Date) && typeof datosEstudiante.fechaNacimiento !== 'string') {
      errors.push({
        field: 'fechaNacimiento',
        message: 'Fecha de nacimiento debe ser una fecha válida',
      });
    }
  }

  // 4. Validar estructura de contactos de emergencia (si están presentes)
  if (datosEstudiante.contactosEmergencia) {
    if (!Array.isArray(datosEstudiante.contactosEmergencia)) {
      errors.push({
        field: 'contactosEmergencia',
        message: 'Contactos de emergencia debe ser un array',
      });
    } else {
      // Validar cada contacto
      // Todos los campos son opcionales según el nuevo schema
      datosEstudiante.contactosEmergencia.forEach((contacto, index) => {
        // Validaciones opcionales: si se proporcionan, deben cumplir formato
        if (contacto.celular1 && (contacto.celular1.length < 7 || contacto.celular1.length > 20)) {
          errors.push({
            field: `contactosEmergencia[${index}].celular1`,
            message: 'Celular 1 debe tener entre 7 y 20 caracteres',
          });
        }
        if (contacto.celular2 && (contacto.celular2.length < 7 || contacto.celular2.length > 20)) {
          errors.push({
            field: `contactosEmergencia[${index}].celular2`,
            message: 'Celular 2 debe tener entre 7 y 20 caracteres',
          });
        }
        if (contacto.nombres && (contacto.nombres.length < 2 || contacto.nombres.length > 150)) {
          errors.push({
            field: `contactosEmergencia[${index}].nombres`,
            message: 'Nombres debe tener entre 2 y 150 caracteres',
          });
        }
        if (contacto.apellidos && (contacto.apellidos.length < 2 || contacto.apellidos.length > 150)) {
          errors.push({
            field: `contactosEmergencia[${index}].apellidos`,
            message: 'Apellidos debe tener entre 2 y 150 caracteres',
          });
        }
      });
    }
  }

  // 5. Validar estructura de documentación (si está presente)
  if (datosEstudiante.documentacion) {
    if (typeof datosEstudiante.documentacion !== 'object' || Array.isArray(datosEstudiante.documentacion)) {
      errors.push({
        field: 'documentacion',
        message: 'Documentación debe ser un objeto',
      });
    }
  }

  // Retornar resultado
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Valida y retorna mensaje de error formateado
 * 
 * @param {Object} datosEstudiante - Datos del estudiante a validar
 * @returns {string|null} Mensaje de error formateado o null si es válido
 */
export function validateRegisterStudentMessage(datosEstudiante) {
  const result = validateRegisterStudent(datosEstudiante);

  if (!result.isValid && result.errors) {
    const messages = result.errors.map(err => err.message);
    return messages.join('. ');
  }

  return null;
}

