/**
 * Datos mock de inscripciones — shape = vista_base_matricula_resumen_inscripcion (101),
 * expuesta por el API GET /v1/inscripciones (camelCase anidado).
 *
 * GUARD-RAIL: respetar estas formas/claves para que la integración futura del backend
 * sea cambiar el cuerpo de la api (mock → http), no reescribir adaptadores.
 */
const carreras = {
  CG: { id: 1, nombre: 'Contaduría General', codigo: 'CG' },
  SI: { id: 2, nombre: 'Sistemas Informáticos', codigo: 'SI' },
  AE: { id: 3, nombre: 'Administración de Empresas', codigo: 'AE' },
  MP: { id: 4, nombre: 'Marketing y Publicidad', codigo: 'MP' },
  SE: { id: 5, nombre: 'Secretariado Ejecutivo', codigo: 'SE' },
  EI: { id: 6, nombre: 'Electrónica Industrial', codigo: 'EI' },
};

const gestion = { anio: 2026, nombre: 'Gestión 2026' };

function row(id, codigo, ap, am, nom, ci, carrera, tipo, materias, historial, periodoNum, fecha, estadoPago, promedio) {
  return {
    id,
    estudiante: {
      codigoEstudiante: codigo,
      ci,
      expedicion: 'SC',
      nombre: nom,
      apellidoPaterno: ap,
      apellidoMaterno: am,
    },
    carrera: carreras[carrera],
    gestion,
    periodo: { numero: periodoNum, nombre: `${periodoNum}° Semestre` },
    paralelo: { nombre: `${carrera}-${periodoNum}A`, turno: 'MAÑANA' },
    tipoInscripcion: tipo,
    fechaInscripcion: fecha,
    cantidadMaterias: materias,
    historialPrevioEstado: historial,
    // Campos planos (camelCase) del resumen de inscripción.
    estadoPago,
    promedio,
    activo: true,
  };
}

export const enrollmentsMock = [
  row(1, '2026-CG-0012', 'Mamani', 'Quispe', 'Lucía Fernanda', '8123456', 'CG', 'ANTIGUO', 6, 'REGISTRADO', 3, '2026-02-03', 'Al día', 86),
  row(2, '2026-SI-0048', 'Vargas', 'Rojas', 'Diego Andrés', '9234567', 'SI', 'NUEVO', 5, 'NO_APLICA', 1, '2026-02-05', 'Pendiente', null),
  row(3, '2026-AE-0021', 'Flores', 'Gutiérrez', 'María José', '7345678', 'AE', 'ANTIGUO', 7, 'PENDIENTE', 5, '2026-02-02', 'Pendiente', 72),
  row(4, '2026-MP-0009', 'Choque', 'Apaza', 'Carlos Alberto', '6456789', 'MP', 'TRASPASO', 4, 'PENDIENTE', 4, '2026-02-07', 'Pendiente', 65),
  row(5, '2026-SI-0051', 'Pérez', 'Loayza', 'Ana Gabriela', '9567890', 'SI', 'NUEVO', 5, 'NO_APLICA', 1, '2026-02-06', 'Al día', null),
  row(6, '2026-SE-0033', 'Condori', 'Mamani', 'Rosa Elena', '5678901', 'SE', 'ANTIGUO', 6, 'REGISTRADO', 3, '2026-02-01', 'Al día', 91),
  row(7, '2026-CG-0015', 'Gutiérrez', 'Salazar', 'Pedro Luis', '8789012', 'CG', 'ANTIGUO', 6, 'REGISTRADO', 5, '2026-02-04', 'Al día', 78),
  row(8, '2026-EI-0007', 'Aruquipa', 'Ticona', 'Jorge Daniel', '4890123', 'EI', 'NUEVO', 5, 'NO_APLICA', 1, '2026-02-08', 'Pendiente', null),
  row(9, '2026-AE-0024', 'Sánchez', 'Cruz', 'Valeria Nicole', '7901234', 'AE', 'ANTIGUO', 7, 'REGISTRADO', 5, '2026-02-03', 'Al día', 83),
  row(10, '2026-MP-0011', 'Ramírez', 'Fernández', 'Sofía Belén', '6012345', 'MP', 'NUEVO', 4, 'NO_APLICA', 1, '2026-02-09', 'Pendiente', null),
  row(11, '2026-SI-0055', 'Torrez', 'Villca', 'Mateo Ignacio', '9123450', 'SI', 'ANTIGUO', 6, 'PENDIENTE', 3, '2026-02-05', 'Pendiente', 69),
  row(12, '2026-SE-0036', 'Huanca', 'Poma', 'Camila Antonella', '5234561', 'SE', 'ANTIGUO', 6, 'REGISTRADO', 5, '2026-02-02', 'Al día', 88),
  row(13, '2026-CG-0018', 'Calle', 'Mendoza', 'Sebastián David', '8345672', 'CG', 'TRANSITABILIDAD', 5, 'PENDIENTE', 4, '2026-02-06', 'Pendiente', 74),
  row(14, '2026-EI-0010', 'Quisbert', 'Laura', 'Daniela Paz', '4456783', 'EI', 'ANTIGUO', 6, 'REGISTRADO', 3, '2026-02-04', 'Al día', 80),
];

export default enrollmentsMock;
