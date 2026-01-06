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
  const camposRequeridos = [
    { field: 'ci', message: 'CI es requerido' },
    { field: 'expedicionId', message: 'Expedición es requerida' },
    { field: 'nombres', message: 'Nombres son requeridos' },
    { field: 'apellidoPaterno', message: 'Apellido paterno es requerido' },
    { field: 'fechaNacimiento', message: 'Fecha de nacimiento es requerida' },
  ];

  camposRequeridos.forEach(({ field, message }) => {
    if (!datosEstudiante[field]) {
      errors.push({ field, message });
    }
  });

  // 3. Validar formato básico de campos (si están presentes)
  if (datosEstudiante.ci && typeof datosEstudiante.ci !== 'string' && typeof datosEstudiante.ci !== 'number') {
    errors.push({
      field: 'ci',
      message: 'CI debe ser un texto o número',
    });
  }

  if (datosEstudiante.email && typeof datosEstudiante.email !== 'string') {
    errors.push({
      field: 'email',
      message: 'Email debe ser un texto',
    });
  }

  if (datosEstudiante.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datosEstudiante.email)) {
    errors.push({
      field: 'email',
      message: 'Email debe tener un formato válido',
    });
  }

  if (datosEstudiante.fechaNacimiento && !(datosEstudiante.fechaNacimiento instanceof Date) && typeof datosEstudiante.fechaNacimiento !== 'string') {
    errors.push({
      field: 'fechaNacimiento',
      message: 'Fecha de nacimiento debe ser una fecha válida',
    });
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
      datosEstudiante.contactosEmergencia.forEach((contacto, index) => {
        if (!contacto.nombres) {
          errors.push({
            field: `contactosEmergencia[${index}].nombres`,
            message: 'Nombres del contacto son requeridos',
          });
        }
        if (!contacto.telefono) {
          errors.push({
            field: `contactosEmergencia[${index}].telefono`,
            message: 'Teléfono del contacto es requerido',
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

