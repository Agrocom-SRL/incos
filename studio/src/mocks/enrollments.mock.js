/**
 * Datos mock de inscripciones — shape = vista_base_matricula_resumen_inscripcion (101),
 * expuesta por el API GET /v1/inscripciones (camelCase anidado).
 *
 * GUARD-RAIL: respetar estas formas/claves para que la integración futura del backend
 * sea cambiar el cuerpo de la api (mock → http), no reescribir adaptadores.
 *
 * FIDELIDAD A DATOS REALES (backend/database):
 * - carreras: 10-seed-carreras.sql — solo 3 (id/codigo/nombre EXACTOS): 1 SIS-INF
 *   "Sistemas Informáticos", 2 ADM-EMP "Administración de Empresas", 3 CON-GEN
 *   "Contaduría General".
 * - gestion: 16-seed-gestiones.sql — vigente id=1, 2026, "Gestión Regular 2026".
 * - periodos: 12-seed-periodos.sql — el grano es ANUAL (numero 1-3 = Primer/Segundo/
 *   Tercer Año), no semestres. periodo.nombre usa el nombre real del seeder.
 * - cantidadMaterias: cuenta real de 14-seed-asignaturas-plan.sql por carrera+periodo:
 *     SIS-INF(1): Año1=7, Año2=8, Año3=8
 *     ADM-EMP(2): Año1=7, Año2=8, Año3=7
 *     CON-GEN(3): Año1=9, Año2=7, Año3=8
 * - paralelos: 25-seed-paralelos.sql (nombre "PRIMERO/SEGUNDO/TERCERO X") +
 *   27-seed-paralelos-gestion.sql. Combinaciones VÁLIDAS carrera+periodo+paralelo+turno
 *   (canónicas del seeder 25, NO inventar otras):
 *     SIS-INF(1): P1 → A/B NOCHE · P2 → A NOCHE · P3 → A NOCHE
 *     ADM-EMP(2): P1 → A TARDE, B TARDE, C NOCHE · P2 → A TARDE, B NOCHE · P3 → A NOCHE
 *     CON-GEN(3): P1 → A TARDE, B TARDE, C NOCHE, D NOCHE · P2 → A TARDE, B NOCHE ·
 *                 P3 → A TARDE, B TARDE
 * - estudiantes: PII REAL del dump migrado (05-migrations/11-migrate-estudiantes.sql +
 *   12-datos-academicos + 19-inscripciones): código real "20260001" (año de ingreso +
 *   secuencia, NO "GESTION-CARRERA-NNNN"), CI real, nombres/apellidos reales, expedicion
 *   casi siempre NULL (rara 'SC'). El prefijo del código refleja el año de ingreso:
 *   2026xxxx = ingreso 2026 (NUEVO/TRASPASO/TRANSITABILIDAD), 2025xxxx = ingreso 2025
 *   (ANTIGUO a 2° año), 2024xxxx = ingreso 2024 (ANTIGUO a 3° año).
 * - tipoInscripcion: ENUM real de 13-inscripciones.sql → NUEVO | ANTIGUO | TRASPASO |
 *   TRANSITABILIDAD. Proporción real del dump (383 vivos): NUEVO 277, ANTIGUO 100,
 *   TRASPASO 3, TRANSITABILIDAD 3 → este mock toma ~1/4 conservando esa proporción.
 * - historialPrevioEstado: NO es un ENUM de tabla; es un CASE DERIVADO en la vista 101
 *   con SOLO 3 valores → 'NO_APLICA' (cuando tipo=NUEVO), 'REGISTRADO' (ANTIGUO/TRASPASO/
 *   TRANSITABILIDAD con historial cargado) o 'PENDIENTE' (esos tipos aún sin historial).
 * - estadoPago / promedio: NO existen en la vista 101 (campos extra que consume el
 *   adapter/columnas). El consumidor (config/pagoStatus.js) espera el texto display
 *   'Al día' | 'Pendiente'; el ENUM crudo subyacente de pago_aporte (14-pagos-academicos.sql)
 *   es PENDIENTE|PARCIAL|CANCELADO. promedio: null en NUEVO y en la gestión vigente (sin
 *   notas aún); valores plausibles (60-90) solo en años YA cursados (ANTIGUO/traspaso/
 *   transitabilidad con historial).
 *
 * CAMPOS NUEVOS (este mock los añade; ojo al integrar backend):
 * - cantidadHistorialPrevio (number): nº de materias del historial académico PREVIO =
 *   SUMA del conteo de asignaturas_plan de los años YA cursados antes del periodo actual.
 *     NUEVO → 0.
 *     periodo 2 → conteo del Año 1 de esa carrera (CON=9, ADM=7, SIS=7).
 *     periodo 3 → Año1 + Año2 (CON=9+7=16, ADM=7+8=15, SIS=7+8=15).
 *     TRASPASO/TRANSITABILIDAD (entran a 2° año por convalidación) → Año 1 de la carrera
 *     destino (todas CON-GEN → 9).
 *   Derivado de asignaturas_plan; reproducible con un COUNT por carrera+periodos previos.
 * - origen (object|null): SOLO para TRASPASO y TRANSITABILIDAD; null en el resto. Valores
 *   REALES de 05-migrations/23-migrate-traspasos.sql, 24-migrate-transitabilidades.sql y
 *   10-migrate-instituciones.sql. NO viene en la vista 101 — al integrar el backend
 *   requeriría un JOIN a traspasos/transitabilidades + instituciones (no es una columna
 *   de la vista actual).
 *     TRASPASO: { institucion (institucion_origen, tipo ITT), carreraOrigen, anioLabel
 *       (anio_cursado PRIMERO/SEGUNDO → '1° año'/'2° año'), estado }.
 *     TRANSITABILIDAD: { institucion (institucion_origen, tipo UETHP), carreraOrigen,
 *       anioLabel (anio_conclusion → '2025'), estado }.
 */
const carreras = {
  SIS: { id: 1, nombre: 'Sistemas Informáticos', codigo: 'SIS-INF' },
  ADM: { id: 2, nombre: 'Administración de Empresas', codigo: 'ADM-EMP' },
  CON: { id: 3, nombre: 'Contaduría General', codigo: 'CON-GEN' },
};

const gestion = { anio: 2026, nombre: 'Gestión Regular 2026' };

const PERIODO_NOMBRE = { 1: 'Primer Año', 2: 'Segundo Año', 3: 'Tercer Año' };

/**
 * row — arma una fila con la forma exacta de la vista 101 (camelCase anidado) más los
 * dos campos derivados (cantidadHistorialPrevio, origen).
 * @param ci/expedicion: del dump real (expedicion null salvo excepción).
 * @param periodoNum/paraleloNombre/turno: combinación VÁLIDA carrera+periodo+paralelo
 *   según el seeder 25 (ver cabecera).
 * @param materias: conteo real de asignaturas_plan de ese carrera+periodo (año actual).
 * @param histPrevio: suma de asignaturas_plan de los años previos (0 en NUEVO).
 * @param origen: institución/carrera de procedencia real (solo traspaso/transitabilidad).
 */
function row({
  id,
  codigo,
  ap,
  am,
  nom,
  ci,
  expedicion = null,
  carrera,
  periodoNum,
  paraleloNombre,
  turno,
  tipo,
  materias,
  histPrevio,
  historial,
  fecha,
  estadoPago,
  promedio = null,
  origen = null,
}) {
  return {
    id,
    estudiante: {
      codigoEstudiante: codigo,
      ci,
      expedicion,
      nombre: nom,
      apellidoPaterno: ap,
      apellidoMaterno: am,
    },
    carrera: carreras[carrera],
    gestion,
    periodo: { numero: periodoNum, nombre: PERIODO_NOMBRE[periodoNum] },
    paralelo: { nombre: paraleloNombre, turno },
    tipoInscripcion: tipo,
    fechaInscripcion: fecha,
    cantidadMaterias: materias,
    cantidadHistorialPrevio: histPrevio,
    historialPrevioEstado: historial,
    origen,
    // Campos planos (camelCase) que el adapter/columnas leen pero NO vienen en la vista 101.
    estadoPago,
    promedio,
    activo: true,
  };
}

export const enrollmentsMock = [
  // ===========================================================================
  // NUEVO — ingreso 2026, periodo 1 (1° año), historial NO_APLICA, histPrevio 0.
  // ===========================================================================

  // --- CONTADURÍA GENERAL (carrera 3) · 1° año cantMat=9 · paralelos A/B TARDE, C/D NOCHE ---
  row({ id: 1, codigo: '20260001', ap: 'AGREDA', am: 'ROCA', nom: 'MARCO ANTONIO', ci: '13081716', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Al día' }),
  row({ id: 2, codigo: '20260002', ap: 'AGUILERA', am: 'MENACHO', nom: 'RODRIGO', ci: '13207482', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Pendiente' }),
  row({ id: 3, codigo: '20260003', ap: 'ALPIRE', am: 'ARANCIBIA', nom: 'PRISCILA', ci: '14727359', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Al día' }),
  row({ id: 4, codigo: '20260004', ap: 'ALVAREZ', am: 'ANTEZANA', nom: 'STEPHANNIE', ci: '12631714', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO D', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Al día' }),
  row({ id: 5, codigo: '20260005', ap: 'CHAMO', am: 'MASABI', nom: 'INES', ci: '9646066', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Pendiente' }),
  row({ id: 6, codigo: '20260006', ap: 'CONDORI', am: 'GALARZA', nom: 'YURI ISABEL', ci: '8524727', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Al día' }),
  row({ id: 10, codigo: '20260009', ap: 'FERNANDEZ', am: 'SULLKA', nom: 'JENNYFER', ci: '13335795', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Al día' }),
  row({ id: 12, codigo: '20260011', ap: 'GUALASUA', am: 'RODAS', nom: 'MARGARET ADRIANE', ci: '13775089', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO D', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Pendiente' }),
  row({ id: 18, codigo: '20260016', ap: 'MAMANI', am: 'FLORES', nom: 'GABRIELA', ci: '13981613', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 20, codigo: '20260018', ap: 'MAMANI', am: 'MAMANI', nom: 'VALERIE', ci: '14621501', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Pendiente' }),
  row({ id: 21, codigo: '20260019', ap: 'MENDOZA', am: 'ESTRADA', nom: 'SISSY ANGELINA', ci: '15874090', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 23, codigo: '20260020', ap: 'MIRANDA', am: 'RUEDA', nom: 'CAMILA LIZBETH', ci: '15338504', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO D', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 24, codigo: '20260021', ap: 'PADILLA', am: 'GARCIA', nom: 'GABRIELA GISSEL', ci: '12633276', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Pendiente' }),
  row({ id: 25, codigo: '20260022', ap: 'PEIS', am: 'YOPIE', nom: 'CELIA ESTHER', ci: '9820821', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 26, codigo: '20260023', ap: 'PRUDENCIO', am: 'VELEZ', nom: 'LIZETH BELEN', ci: '9717023', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 37, codigo: '20260034', ap: 'ROCA', am: 'FLORES', nom: 'JEISHA MARINA', ci: '14387927', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO D', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Pendiente' }),
  row({ id: 45, codigo: '20260041', ap: 'ROSEL', am: 'YEPEZ', nom: 'DELIA', ci: '11302641', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 46, codigo: '20260042', ap: 'RUIZ', am: 'PADILLA', nom: 'OSCAR JAVIER', ci: '12594928', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-11', estadoPago: 'Al día' }),
  row({ id: 47, codigo: '20260043', ap: 'URANDABA', am: 'POÑEZ', nom: 'FELIX', ci: '9614993', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-11', estadoPago: 'Pendiente' }),
  row({ id: 48, codigo: '20260044', ap: 'VARGAS', am: 'SENZANO', nom: 'JEREMIAS', ci: '15098014', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO D', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-11', estadoPago: 'Al día' }),
  row({ id: 49, codigo: '20260045', ap: 'VARGAS', am: 'VACA', nom: 'JOSE RODRIGO', ci: '14662410', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-11', estadoPago: 'Al día' }),
  row({ id: 50, codigo: '20260046', ap: 'VENTURA', am: 'ARRAYA', nom: 'KERSTI ELEANOR', ci: '9795499', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-11', estadoPago: 'Pendiente' }),
  row({ id: 71, codigo: '20260066', ap: 'MACHICAO', am: 'ABACAY', nom: 'ALEJANDRO', ci: '14412486', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-23', estadoPago: 'Al día' }),
  row({ id: 72, codigo: '20260067', ap: 'AGUILAR', am: 'GARCIA', nom: 'ROMINA ELIZABETH', ci: '8188563', carrera: 'CON', periodoNum: 1, paraleloNombre: 'PRIMERO D', turno: 'NOCHE', tipo: 'NUEVO', materias: 9, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-25', estadoPago: 'Al día' }),

  // --- ADMINISTRACIÓN DE EMPRESAS (carrera 2) · 1° año cantMat=7 · paralelos A/B TARDE, C NOCHE ---
  row({ id: 8, codigo: '20260007', ap: 'AGUILAR', am: 'MAMANI', nom: 'EDUARDO MIGUEL', ci: '13694776', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Al día' }),
  row({ id: 9, codigo: '20260008', ap: '', am: 'ALVARADO', nom: 'HEIDY LILIANA', ci: '8256665', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Pendiente' }),
  row({ id: 11, codigo: '20260010', ap: 'ANTELO', am: 'AVILA', nom: 'JORGE HUGO', ci: '4624854', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Al día' }),
  row({ id: 13, codigo: '20260012', ap: 'APARICIO', am: 'PEREZ', nom: 'ANDREA', ci: '15045796', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-09', estadoPago: 'Al día' }),
  row({ id: 16, codigo: '20260014', ap: 'BAZAN', am: 'CUELLAR', nom: 'MAURO JHORDAN', ci: '14455143', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Pendiente' }),
  row({ id: 17, codigo: '20260015', ap: 'CALLE', am: 'FLORES', nom: 'JORGE ADRIAN', ci: '13093079', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 19, codigo: '20260017', ap: 'CARI', am: 'CALLE', nom: 'JHERSON JHOAN', ci: '9181036', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 27, codigo: '20260024', ap: 'CASTILLO', am: 'CONCHA', nom: 'ADELY KATERIN', ci: '14011693', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 28, codigo: '20260025', ap: 'CEJAS', am: 'CONDORI', nom: 'CARLOS HUGO', ci: '15077322', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Pendiente' }),
  row({ id: 29, codigo: '20260026', ap: 'CHURQUI', am: 'ROMERO', nom: 'YANINA WENDY', ci: '13482029', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 30, codigo: '20260027', ap: 'ENRRIQUES', am: 'MORALES', nom: 'NAIDELIN', ci: '13612863', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 31, codigo: '20260028', ap: 'GOMEZ', am: 'SARAVIA', nom: 'MASSIEL YHADIRA', ci: '14331058', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Pendiente' }),
  row({ id: 32, codigo: '20260029', ap: 'GUTIERREZ', am: 'ZUAZO', nom: 'YERKO', ci: '10564920', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 34, codigo: '20260031', ap: 'HUANCA', am: 'CHAMBI', nom: 'MARCO ANTONIO', ci: '13832883', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Al día' }),
  row({ id: 36, codigo: '20260033', ap: 'LARICO', am: 'MARQUEZ', nom: 'LUZ DAYSY', ci: '10934203', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-10', estadoPago: 'Pendiente' }),
  row({ id: 53, codigo: '20260049', ap: 'OTTA', am: 'MOLE', nom: 'JUSTO ELHID', ci: '11343943', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-16', estadoPago: 'Al día' }),
  row({ id: 54, codigo: '20260050', ap: 'PACHECO', am: 'LANDIVAR', nom: 'MARIA JOSE', ci: '9758728', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-16', estadoPago: 'Al día' }),
  row({ id: 55, codigo: '20260051', ap: 'PARADA', am: 'URAPOGUI', nom: 'FLOR YANINE', ci: '16939648', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-16', estadoPago: 'Pendiente' }),
  row({ id: 56, codigo: '20260052', ap: 'PARRA', am: 'APAZA', nom: 'NICOL', ci: '14903660', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-16', estadoPago: 'Al día' }),
  row({ id: 57, codigo: '20260053', ap: 'PUMA', am: 'CASTRO', nom: 'MARIA JOSEFINA', ci: '11316255', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-16', estadoPago: 'Al día' }),
  row({ id: 58, codigo: '20260054', ap: 'ROMERO', am: 'PEDDRAZA', nom: 'HERMAN', ci: '13674448', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-16', estadoPago: 'Pendiente' }),
  row({ id: 59, codigo: '20260055', ap: 'SANTOS', am: 'QUENAYA', nom: 'KATHERINE', ci: '12414677', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO C', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-17', estadoPago: 'Al día' }),
  row({ id: 60, codigo: '20260056', ap: 'SEGUNDO', am: 'PADILLA', nom: 'JHAN CARLA', ci: '11382011', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-17', estadoPago: 'Al día' }),
  row({ id: 61, codigo: '20260057', ap: 'SULLCA', am: 'DAVILA', nom: 'NAYELI', ci: '13272055', carrera: 'ADM', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'TARDE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-03-17', estadoPago: 'Pendiente' }),

  // --- SISTEMAS INFORMÁTICOS (carrera 1) · 1° año cantMat=7 · paralelos A/B NOCHE ---
  row({ id: 204, codigo: '20260190', ap: 'ALDABA', am: 'PINTO', nom: 'ANTONY', ci: '14419032', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-06', estadoPago: 'Al día' }),
  row({ id: 208, codigo: '20260194', ap: 'ARCE', am: 'MARTINEZ', nom: 'MELINA ELBA', ci: '5248350', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-06', estadoPago: 'Pendiente' }),
  row({ id: 212, codigo: '20260198', ap: 'AVILA', am: 'CHACOLLO', nom: 'ANDRES SEBASTIAN', ci: '11376755', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-06', estadoPago: 'Al día' }),
  row({ id: 214, codigo: '20260199', ap: 'CARBALLO', am: 'DURAN', nom: 'GUSTAVO', ci: '9031700', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-06', estadoPago: 'Al día' }),
  row({ id: 216, codigo: '20260201', ap: 'CHALLGUA', am: 'CAYO', nom: 'ALAN RODRIGO', ci: '129649637', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-06', estadoPago: 'Pendiente' }),
  row({ id: 217, codigo: '20260202', ap: 'CHOQUE', am: 'QUISBERT', nom: 'DANNA KATHERINE', ci: '14621637', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-06', estadoPago: 'Al día' }),
  row({ id: 218, codigo: '20260203', ap: 'CORONADO', am: 'MELENDRES', nom: 'FAVIO RICK', ci: '13333891', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-06', estadoPago: 'Al día' }),
  row({ id: 219, codigo: '20260204', ap: 'CORTEZ', am: 'MOLINA', nom: 'HAROL LEANDRO', ci: '6212011', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-07', estadoPago: 'Pendiente' }),
  row({ id: 220, codigo: '20260205', ap: 'CRUZ', am: 'ALANES', nom: 'AIDE', ci: '5328453', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-07', estadoPago: 'Al día' }),
  row({ id: 223, codigo: '20260207', ap: 'HUANCA', am: 'QUISPE', nom: 'RUFINO', ci: '6783599', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-07', estadoPago: 'Al día' }),
  row({ id: 224, codigo: '20260208', ap: 'ARIAS', am: 'YARHUI', nom: 'CINTIA JIMENA', ci: '7835533', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO A', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-07', estadoPago: 'Pendiente' }),
  row({ id: 227, codigo: '20260211', ap: 'JAROL', am: 'CHAVEZ', nom: 'JEFSIBETH', ci: '14663979', carrera: 'SIS', periodoNum: 1, paraleloNombre: 'PRIMERO B', turno: 'NOCHE', tipo: 'NUEVO', materias: 7, histPrevio: 0, historial: 'NO_APLICA', fecha: '2026-04-07', estadoPago: 'Al día' }),

  // ===========================================================================
  // ANTIGUO — la mayoría ingreso 2025 (periodo 2 = 2° año); pocos ingreso 2024
  // (periodo 3 = 3° año). historial REGISTRADO (cargado) o PENDIENTE (sin cargar).
  // promedio plausible solo cuando el historial previo está REGISTRADO.
  // ===========================================================================

  // --- CONTADURÍA GENERAL · 2° año cantMat=7, histPrevio=9 (A TARDE, B NOCHE) ---
  row({ id: 7, codigo: '20250001', ap: 'EGUEZ', am: 'CESPEDEZ', nom: 'LUIS CARLOS', ci: '13684530', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-03-09', estadoPago: 'Al día', promedio: 74 }),
  row({ id: 14, codigo: '20250002', ap: 'GUZMAN', am: 'ANTEZANA', nom: 'ALONDRA SCARLET', ci: '12631941', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-03-09', estadoPago: 'Pendiente', promedio: 68 }),
  row({ id: 40, codigo: '20250004', ap: 'ROCA', am: 'ROJAS', nom: 'MARIA KATHERINE', ci: '11400806', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-03-10', estadoPago: 'Al día', promedio: 81 }),
  row({ id: 121, codigo: '20250006', ap: 'ALEJANDRO', am: 'MELGAR', nom: 'DANIELA', ci: '12448979', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-03-30', estadoPago: 'Pendiente', promedio: 66 }),
  row({ id: 184, codigo: '20250012', ap: 'ROCA', am: 'TRIGO', nom: 'ERICK ALEXANDER', ci: '11338710', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'PENDIENTE', fecha: '2026-04-04', estadoPago: 'Pendiente' }),
  row({ id: 187, codigo: '20250013', ap: 'TARDIO', am: 'YAMUANI', nom: 'MARITZA SARAI', ci: '9783809', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-04-04', estadoPago: 'Al día', promedio: 72 }),
  row({ id: 309, codigo: '20250018', ap: 'AGUIRRE', am: 'PACO', nom: 'CINDY ANAHI', ci: '9039368', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-04-30', estadoPago: 'Al día', promedio: 77 }),
  row({ id: 310, codigo: '20250019', ap: 'ARIAS', am: 'QUISPE', nom: 'LUIS FERNANDO', ci: '11332434', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-04-30', estadoPago: 'Pendiente', promedio: 70 }),
  row({ id: 312, codigo: '20250020', ap: 'CARRILLO', am: 'ZEBALLOS', nom: 'MELIZA PETRONA', ci: '14765162', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'PENDIENTE', fecha: '2026-04-30', estadoPago: 'Pendiente' }),
  row({ id: 313, codigo: '20250021', ap: 'CARY', am: 'AYALA', nom: 'BRAYAN MOISES', ci: '12414704', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-04-30', estadoPago: 'Al día', promedio: 63 }),
  row({ id: 315, codigo: '20250023', ap: 'CATORCENO', am: 'SIBAUTE', nom: 'NICOL', ci: '12354648', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-04-30', estadoPago: 'Al día', promedio: 84 }),
  row({ id: 319, codigo: '20250026', ap: 'COPATITI', am: 'ALI', nom: 'HELEN DAYANA', ci: '12729366', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-04-30', estadoPago: 'Pendiente', promedio: 69 }),
  row({ id: 320, codigo: '20250027', ap: 'FERNANDEZ', am: 'ABREGO', nom: 'JUAN DE DIOS', ci: '14471951', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 7, histPrevio: 9, historial: 'PENDIENTE', fecha: '2026-04-30', estadoPago: 'Pendiente' }),

  // --- CONTADURÍA GENERAL · 3° año cantMat=8, histPrevio=16 (A/B TARDE) ---
  row({ id: 22, codigo: '20250003', ap: 'MILLARES', am: 'VALLEJOS', nom: 'JOHN ROSO', ci: '13431171', carrera: 'CON', periodoNum: 3, paraleloNombre: 'TERCERO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 8, histPrevio: 16, historial: 'REGISTRADO', fecha: '2026-03-10', estadoPago: 'Pendiente', promedio: 71 }),
  row({ id: 352, codigo: '20240003', ap: 'ARTEAGA', am: 'CUELLAR', nom: 'MARIA PATRICIA', ci: '5401224', carrera: 'CON', periodoNum: 3, paraleloNombre: 'TERCERO B', turno: 'TARDE', tipo: 'ANTIGUO', materias: 8, histPrevio: 16, historial: 'REGISTRADO', fecha: '2026-05-15', estadoPago: 'Al día', promedio: 78 }),

  // --- ADMINISTRACIÓN DE EMPRESAS · 2° año cantMat=8, histPrevio=7 (A TARDE, B NOCHE) ---
  row({ id: 62, codigo: '20250005', ap: 'TASEO', am: 'SURUBÍ', nom: 'YUMARA', ci: '9815184', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-03-17', estadoPago: 'Al día', promedio: 73 }),
  row({ id: 138, codigo: '20250007', ap: 'CALIZAYA', am: 'GUTIERREZ', nom: 'CARMEN ROSA', ci: '9603903', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-04-01', estadoPago: 'Pendiente', promedio: 80 }),
  row({ id: 140, codigo: '20250008', ap: 'AGUILAR', am: 'TORREZ', nom: 'KEVIN CRISTIAN', ci: '4202501', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'PENDIENTE', fecha: '2026-04-01', estadoPago: 'Pendiente' }),
  row({ id: 157, codigo: '20250009', ap: 'CHIPANA', am: 'MANZANEDA', nom: 'DIANA', ci: '6794309', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-04-02', estadoPago: 'Al día', promedio: 67 }),
  row({ id: 160, codigo: '20250010', ap: 'CUSIKANKI', am: 'OROPEZA', nom: 'JUAN CARLOS', ci: '13545709', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-04-02', estadoPago: 'Al día', promedio: 75 }),
  row({ id: 173, codigo: '20250011', ap: 'PADILLA', am: 'GONZALES', nom: 'ESTHER', ci: '15795174', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'PENDIENTE', fecha: '2026-04-04', estadoPago: 'Pendiente' }),
  row({ id: 384, codigo: '20250079', ap: 'ARUQUIPA', am: 'QUISBERT', nom: 'LEANDRO BENJAMIN', ci: '15155699', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-05-25', estadoPago: 'Al día', promedio: 64 }),
  row({ id: 385, codigo: '20250080', ap: 'BALLON', am: 'BERAMENDY', nom: 'ARIANELA', ci: '14991416', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-05-25', estadoPago: 'Pendiente', promedio: 82 }),
  row({ id: 386, codigo: '20250081', ap: 'CARRASCO', am: 'FLORES', nom: 'DAVID', ci: '15573907', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-05-25', estadoPago: 'Al día', promedio: 70 }),
  row({ id: 387, codigo: '20250082', ap: 'CHOQUE', am: 'CAMACHO', nom: 'ALFREDO', ci: '14467452', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'PENDIENTE', fecha: '2026-05-25', estadoPago: 'Pendiente' }),
  row({ id: 388, codigo: '20250083', ap: 'CLAROS', am: 'ROCHA', nom: 'MARIA ALEJANDRA', ci: '9748948', carrera: 'ADM', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-05-25', estadoPago: 'Al día', promedio: 86 }),

  // --- ADMINISTRACIÓN DE EMPRESAS · 3° año cantMat=7, histPrevio=15 (A NOCHE) ---
  row({ id: 193, codigo: '20240001', ap: 'TERRAZAS', am: 'PADILLA', nom: 'JOSE ERNESTO', ci: '9605186', carrera: 'ADM', periodoNum: 3, paraleloNombre: 'TERCERO A', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 7, histPrevio: 15, historial: 'REGISTRADO', fecha: '2026-04-06', estadoPago: 'Al día', promedio: 76 }),
  row({ id: 392, codigo: '20240004', ap: 'MIRANDA', am: 'MASSI', nom: 'JOSE LIMBERTH', ci: '13935360', carrera: 'ADM', periodoNum: 3, paraleloNombre: 'TERCERO A', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 7, histPrevio: 15, historial: 'PENDIENTE', fecha: '2026-05-29', estadoPago: 'Pendiente' }),

  // --- SISTEMAS INFORMÁTICOS · 2° año cantMat=8, histPrevio=7 (A NOCHE) ---
  row({ id: 222, codigo: '20250014', ap: 'ESCOBAR', am: 'DOMINGUEZ', nom: 'ANGEL TAURINO', ci: '16693024', carrera: 'SIS', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-04-07', estadoPago: 'Al día', promedio: 79 }),
  row({ id: 249, codigo: '20250015', ap: 'SANCHEZ', am: 'CUELLAR', nom: 'REGINIO', ci: '8090277', carrera: 'SIS', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-04-08', estadoPago: 'Pendiente', promedio: 65 }),
  row({ id: 279, codigo: '20250016', ap: 'FLORES', am: 'CERDA', nom: 'MARIO ROBERT', ci: '14558253', carrera: 'SIS', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'PENDIENTE', fecha: '2026-04-23', estadoPago: 'Pendiente' }),
  row({ id: 301, codigo: '20250017', ap: 'ZARATE', am: 'FARELL', nom: 'FIDEL', ci: '11304754', carrera: 'SIS', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 7, historial: 'REGISTRADO', fecha: '2026-04-23', estadoPago: 'Al día', promedio: 72 }),

  // --- SISTEMAS INFORMÁTICOS · 3° año cantMat=8, histPrevio=15 (A NOCHE) ---
  row({ id: 213, codigo: '20240002', ap: 'BEJARANO', am: 'DAMASCO', nom: 'MIGUEL ANGEL', ci: '10855741', carrera: 'SIS', periodoNum: 3, paraleloNombre: 'TERCERO A', turno: 'NOCHE', tipo: 'ANTIGUO', materias: 8, histPrevio: 15, historial: 'REGISTRADO', fecha: '2026-04-06', estadoPago: 'Al día', promedio: 83 }),

  // ===========================================================================
  // TRASPASO / TRANSITABILIDAD — las 6 filas REALES del dump (todas destino CON-GEN,
  // convalidadas a 2° año: cantMat=7, histPrevio=9). origen = institución real de
  // procedencia (instituciones 1-6) + carrera_origen del dump.
  // ===========================================================================

  // --- TRASPASOS (estudiantes 311/318/323; 23-migrate-traspasos.sql; anio_cursado PRIMERO → '1° año') ---
  row({ id: 311, codigo: '20260290', ap: 'BANEGAS', am: 'ORELLANA', nom: 'SAMUEL', ci: '1253860', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'TRASPASO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-04-30', estadoPago: 'Pendiente', promedio: 70,
    origen: { institucion: 'INSTITUTO TECNOLOGICO INCOS BENI', carreraOrigen: 'Contaduría General', anioLabel: '1° año', estado: 'SOLICITADO' } }),
  row({ id: 318, codigo: '20260291', ap: 'CONTRERAS', am: 'PANIQUE', nom: 'CIRIAN', ci: '12674735', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'TRASPASO', materias: 7, histPrevio: 9, historial: 'PENDIENTE', fecha: '2026-04-30', estadoPago: 'Pendiente',
    origen: { institucion: 'INSTITUTO TECNOLOGICO SUPERIOR VILLA MONTES', carreraOrigen: 'Contaduría General', anioLabel: '1° año', estado: 'SOLICITADO' } }),
  row({ id: 323, codigo: '20260293', ap: 'HUANCA', am: 'VIDAURRE', nom: 'JHONNY ROBERT', ci: '9928323', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'TRASPASO', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-05-06', estadoPago: 'Al día', promedio: 68,
    origen: { institucion: 'INSTITUTO COMERCIAL INCOS EL ALTO', carreraOrigen: 'Contaduría General', anioLabel: '1° año', estado: 'SOLICITADO' } }),

  // --- TRANSITABILIDADES (estudiantes 332/333/378; 24-migrate-transitabilidades.sql; anio_conclusion 2025) ---
  row({ id: 332, codigo: '20260297', ap: 'MIRANDA', am: 'ROSAS', nom: 'LUIS ALEJANDRO', ci: '12884869', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'TRANSITABILIDAD', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-05-07', estadoPago: 'Al día', promedio: 65,
    origen: { institucion: 'MARIA GORETTI I -SANTA CRUZ', carreraOrigen: 'Contaduría General', anioLabel: '2025', estado: 'SOLICITADO' } }),
  row({ id: 333, codigo: '20260298', ap: 'SALAZAR', am: 'HERBAS', nom: 'FACUNDO', ci: '13930246', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO A', turno: 'TARDE', tipo: 'TRANSITABILIDAD', materias: 7, histPrevio: 9, historial: 'PENDIENTE', fecha: '2026-05-07', estadoPago: 'Pendiente',
    origen: { institucion: 'AMERICA C- SANTA CRUZ', carreraOrigen: 'Contaduría General', anioLabel: '2025', estado: 'SOLICITADO' } }),
  row({ id: 378, codigo: '20260300', ap: 'CORTEZ', am: 'POÑE', nom: 'JOSE IGNACIO', ci: '8963242', carrera: 'CON', periodoNum: 2, paraleloNombre: 'SEGUNDO B', turno: 'NOCHE', tipo: 'TRANSITABILIDAD', materias: 7, histPrevio: 9, historial: 'REGISTRADO', fecha: '2026-05-22', estadoPago: 'Al día', promedio: 73,
    origen: { institucion: 'MARIA TERESA PULIDO - SANTA CRUZ', carreraOrigen: 'Contaduría General', anioLabel: '2025', estado: 'SOLICITADO' } }),
];

export default enrollmentsMock;
