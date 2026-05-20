/**
 * Estado en memoria que simula la BD del cuaderno (se reinicia al recargar la app).
 */

const ESTUDIANTES_ASIG_101 = [
  { id: 'est-1', nombre: 'Ana María Quispe Flores', orden: 1 },
  { id: 'est-2', nombre: 'Carlos Eduardo Mamani', orden: 2 },
  { id: 'est-3', nombre: 'Lucía Fernanda Vargas', orden: 3 },
  { id: 'est-4', nombre: 'José Luis Rojas Condori', orden: 4 },
  { id: 'est-5', nombre: 'Patricia Soliz Uriona', orden: 5 },
  { id: 'est-6', nombre: 'Roberto Choque Apaza', orden: 6 },
  { id: 'est-7', nombre: 'Sandra Méndez Luna', orden: 7 },
  { id: 'est-8', nombre: 'Fernando Gutierrez Soto', orden: 8 },
  { id: 'est-9', nombre: 'Gabriela Torrez Poma', orden: 9 },
  { id: 'est-10', nombre: 'Héctor Villca Mamani', orden: 10 },
  { id: 'est-11', nombre: 'Ingrid Flores Castro', orden: 11 },
  { id: 'est-12', nombre: 'Jorge Condori Quispe', orden: 12 },
  { id: 'est-13', nombre: 'Karen Apaza Rojas', orden: 13 },
  { id: 'est-14', nombre: 'Luis Fernando Vega', orden: 14 },
  { id: 'est-15', nombre: 'Mónica Salazar Ortiz', orden: 15 },
];

const notaKey = (estudianteId, evaluacionId) => `${estudianteId}::${evaluacionId}`;

const buildNotasBimestre1 = () => {
  const notas = {};
  const puntajes = [88, 76, 92, 65, 71, 83, 90, 58, 74, 86, 69, 95, 62, 80, 77];
  ESTUDIANTES_ASIG_101.forEach((est, i) => {
    notas[notaKey(est.id, 'eval-b1-1')] = puntajes[i];
  });
  return notas;
};

const buildNotasBimestre2 = () => ({
  'est-1::eval-1': 85,
  'est-1::eval-2': 72,
  'est-2::eval-1': 91,
  'est-2::eval-3': 88,
  'est-3::eval-2': 65,
  'est-3::eval-3': 70,
  'est-4::eval-1': 78,
  'est-4::eval-2': 80,
  'est-4::eval-3': 82,
  'est-5::eval-1': 55,
  'est-6::eval-1': 67,
  'est-6::eval-2': 74,
  'est-7::eval-3': 81,
  'est-8::eval-1': 62,
  'est-9::eval-2': 88,
  'est-10::eval-1': 73,
  'est-11::eval-3': 59,
  'est-12::eval-2': 91,
  'est-13::eval-1': 84,
  'est-14::eval-2': 66,
  'est-15::eval-3': 77,
});

const TIPOS_EVALUACION = [
  { id: 1, codigo: 'EXAMEN_PARCIAL', nombre: 'Examen parcial', ambito: 'BIMESTRE' },
  { id: 2, codigo: 'PRACTICO', nombre: 'Práctico', ambito: 'BIMESTRE' },
  { id: 3, codigo: 'PROYECTO', nombre: 'Proyecto', ambito: 'BIMESTRE' },
  { id: 4, codigo: 'EXPOSICION', nombre: 'Exposición', ambito: 'BIMESTRE' },
  { id: 5, codigo: 'TALLER', nombre: 'Taller', ambito: 'BIMESTRE' },
  { id: 6, codigo: 'CUESTIONARIO', nombre: 'Cuestionario', ambito: 'BIMESTRE' },
  { id: 7, codigo: 'ACTIVIDAD_EXTRACURRICULAR', nombre: 'Actividad extracurricular', ambito: 'BIMESTRE' },
];

const EVALUACIONES_FINALES_INSTITUCIONALES = [
  {
    codigo: 'PROYECTO_FINAL_ANUAL',
    nombre: 'Proyecto integrador',
    habilitadaInstitucional: true,
  },
  {
    codigo: 'EXAMEN_FINAL_ANUAL',
    nombre: 'Examen final anual',
    habilitadaInstitucional: true,
  },
  {
    codigo: 'FERIA_PRODUCTIVA',
    nombre: 'Feria productiva',
    habilitadaInstitucional: false,
  },
];

const createInitialDatabase = () => ({
  tiposEvaluacion: TIPOS_EVALUACION,
  configuracionInstitucional: {
    gestionId: 1,
    gestionNombre: '2025',
    cuotaTeorico: 30,
    cuotaPractico: 70,
    pesosBimestres: [25, 25, 25, 25],
    evaluacionesFinalesDisponibles: EVALUACIONES_FINALES_INSTITUCIONALES.map((t) => ({
      ...t,
    })),
    politicaAsistenciaDefault: {
      politica: 'NO_AFECTA',
      pesoAsistencia: null,
      minimoAsistencia: 75,
      notaReprobada: 51,
    },
    ultimaModificacion: {
      updatedAt: '2025-01-15T10:00:00.000Z',
      updatedByNombre: 'Coordinación Académica',
      resumen: 'Configuración inicial de la gestión 2025',
    },
    historial: [],
  },
  ajustesCurso: {
    'asig-101': {
      usarCuotaInstitucional: false,
      teoricoOverride: 20,
      practicoOverride: 80,
      evaluacionesFinales: [
        { codigo: 'PROYECTO_FINAL_ANUAL', activo: true, peso: 15 },
        { codigo: 'EXAMEN_FINAL_ANUAL', activo: false, peso: null },
        { codigo: 'FERIA_PRODUCTIVA', activo: false, peso: null },
      ],
      politicaAsistencia: 'COMPUTA_NOTA',
      pesoAsistencia: 10,
      minimoAsistencia: null,
      notaReprobada: null,
      historial: [
        {
          updatedAt: '2025-03-10T14:30:00.000Z',
          updatedBy: 1,
          updatedByNombre: 'María Fernández López',
          resumen: 'Cuota 20/80 y asistencia como componente (10%)',
        },
      ],
    },
  },
  tablero: {
    gestion: { id: 1, nombre: '2025' },
    bimestreVigente: 2,
    gestionIniciada: true,
    bimestres: [
      {
        numero: 1,
        estado: 'CERRADO',
        fechaInicio: '2025-02-03',
        fechaCierre: '2025-04-18',
        matriculasTransicionadas: 486,
      },
      {
        numero: 2,
        estado: 'EN_CURSO',
        fechaInicio: '2025-04-21',
        fechaCierre: null,
        matriculasTransicionadas: null,
      },
      {
        numero: 3,
        estado: 'BLOQUEADO',
        fechaInicio: null,
        fechaCierre: null,
        matriculasTransicionadas: null,
      },
      {
        numero: 4,
        estado: 'BLOQUEADO',
        fechaInicio: null,
        fechaCierre: null,
        matriculasTransicionadas: null,
      },
    ],
    metricas: {
      cursosCompletos: 14,
      cursosConPendientes: 4,
      cursosTotal: 18,
      planesSinDefinir: 3,
      notasFaltantes: 127,
      docentesActivos: 16,
    },
  },
  docenteActual: {
    id: 1,
    nombre: 'María Fernández López',
    gestionVigente: '2025',
    bimestreVigente: 2,
  },
  adminActual: {
    id: 99,
    nombre: 'Coordinación Académica',
  },
  docentesCatalog: [
    {
      id: 1,
      nombre: 'María Fernández López',
      especialidad: 'Sistemas Informáticos',
      gestionVigente: '2025',
      bimestreVigente: 2,
    },
    {
      id: 2,
      nombre: 'Juan Carlos Pérez Ruiz',
      especialidad: 'Contaduría General',
      gestionVigente: '2025',
      bimestreVigente: 2,
    },
    {
      id: 3,
      nombre: 'Ana Lucía Torres Vega',
      especialidad: 'Administración de Empresas',
      gestionVigente: '2025',
      bimestreVigente: 2,
    },
    {
      id: 4,
      nombre: 'Roberto Choque Mamani',
      especialidad: 'Sistemas Informáticos',
      gestionVigente: '2025',
      bimestreVigente: 2,
    },
  ],
  docenteCursosMap: {
    1: ['asig-101', 'asig-102', 'asig-103', 'asig-104'],
    2: ['asig-102', 'asig-104'],
    3: ['asig-101', 'asig-103'],
    4: ['asig-103'],
  },
  impersonacion: {
    activa: false,
    docenteId: null,
    docenteNombre: null,
    adminId: null,
    adminNombre: null,
    iniciadaEn: null,
  },
  auditoriaAdmin: [],
  cursos: [
    {
      id: 'asig-101',
      materia: 'Programación Web I',
      paralelo: 'A',
      turno: 'Mañana',
      horasSemana: 6,
      cantidadEstudiantes: 15,
      estadoBimestreVigente: 'en_curso',
      notasPendientes: 18,
    },
    {
      id: 'asig-102',
      materia: 'Bases de datos',
      paralelo: 'B',
      turno: 'Tarde',
      horasSemana: 4,
      cantidadEstudiantes: 8,
      estadoBimestreVigente: 'en_curso',
      notasPendientes: 5,
    },
    {
      id: 'asig-103',
      materia: 'Redes de computadoras',
      paralelo: 'Único',
      turno: 'Noche',
      horasSemana: 5,
      cantidadEstudiantes: 6,
      estadoBimestreVigente: 'cerrado',
      notasPendientes: null,
    },
    {
      id: 'asig-104',
      materia: 'Ética profesional',
      paralelo: 'A',
      turno: 'Mañana',
      horasSemana: 2,
      cantidadEstudiantes: 10,
      estadoBimestreVigente: 'sin_evaluaciones',
      notasPendientes: 12,
    },
  ],
  cuadernos: {
    'asig-101': {
      bimestres: [
        { numero: 1, estado: 'cerrado' },
        { numero: 2, estado: 'vigente' },
        { numero: 3, estado: 'bloqueado' },
        { numero: 4, estado: 'bloqueado' },
      ],
      estudiantes: ESTUDIANTES_ASIG_101,
      evaluaciones: {
        1: [
          {
            id: 'eval-b1-1',
            nombre: 'Evaluación integradora',
            tipoEvaluacionId: 1,
            componente: 'TEORICO',
            peso: 100,
          },
        ],
        2: [
          {
            id: 'eval-1',
            nombre: 'Examen parcial',
            tipoEvaluacionId: 1,
            componente: 'TEORICO',
            peso: 60,
          },
          {
            id: 'eval-2',
            nombre: 'Trabajo práctico',
            tipoEvaluacionId: 2,
            componente: 'PRACTICO',
            peso: 50,
          },
          {
            id: 'eval-3',
            nombre: 'Cuestionario',
            tipoEvaluacionId: 6,
            componente: 'PRACTICO',
            peso: 50,
          },
        ],
        3: [],
        4: [],
      },
      notas: {
        ...buildNotasBimestre1(),
        ...buildNotasBimestre2(),
      },
    },
    'asig-102': {
      bimestres: [
        { numero: 1, estado: 'cerrado' },
        { numero: 2, estado: 'vigente' },
        { numero: 3, estado: 'bloqueado' },
        { numero: 4, estado: 'bloqueado' },
      ],
      estudiantes: [
        { id: 'est-b1', nombre: 'Diego Arce Pérez', orden: 1 },
        { id: 'est-b2', nombre: 'Elena Vargas Cruz', orden: 2 },
        { id: 'est-b3', nombre: 'Felipe Núñez Ríos', orden: 3 },
        { id: 'est-b4', nombre: 'Gloria Mamani Soto', orden: 4 },
        { id: 'est-b5', nombre: 'Hugo Quispe Luna', orden: 5 },
        { id: 'est-b6', nombre: 'Irene Choque Vega', orden: 6 },
        { id: 'est-b7', nombre: 'Julio Torrez Apaza', orden: 7 },
        { id: 'est-b8', nombre: 'Karina Flores Rojas', orden: 8 },
      ],
      evaluaciones: {
        1: [
          {
            id: 'eval-b2-b1',
            nombre: 'Parcial teórico',
            tipoEvaluacionId: 1,
            componente: 'TEORICO',
            peso: 100,
          },
        ],
        2: [
          {
            id: 'eval-b2-1',
            nombre: 'Modelo ER',
            tipoEvaluacionId: 3,
            componente: 'PRACTICO',
            peso: 50,
          },
          {
            id: 'eval-b2-2',
            nombre: 'Consultas SQL',
            tipoEvaluacionId: 6,
            componente: 'PRACTICO',
            peso: 50,
          },
        ],
        3: [],
        4: [],
      },
      notas: {
        'est-b1::eval-b2-b1': 82,
        'est-b2::eval-b2-b1': 75,
        'est-b3::eval-b2-b1': 68,
        'est-b4::eval-b2-b1': 90,
        'est-b5::eval-b2-b1': 71,
        'est-b6::eval-b2-b1': 88,
        'est-b7::eval-b2-b1': 64,
        'est-b8::eval-b2-b1': 79,
        'est-b1::eval-b2-1': 70,
        'est-b2::eval-b2-2': 85,
      },
    },
    'asig-103': {
      bimestres: [
        { numero: 1, estado: 'cerrado' },
        { numero: 2, estado: 'cerrado' },
        { numero: 3, estado: 'bloqueado' },
        { numero: 4, estado: 'bloqueado' },
      ],
      estudiantes: [
        { id: 'est-r1', nombre: 'Laura Mendoza', orden: 1 },
        { id: 'est-r2', nombre: 'Mario Sánchez', orden: 2 },
        { id: 'est-r3', nombre: 'Natalia Cruz', orden: 3 },
        { id: 'est-r4', nombre: 'Oscar Paredes', orden: 4 },
        { id: 'est-r5', nombre: 'Paula Ríos', orden: 5 },
        { id: 'est-r6', nombre: 'Raúl Vega', orden: 6 },
      ],
      evaluaciones: {
        1: [
          {
            id: 'eval-r-b1',
            nombre: 'Laboratorio 1',
            tipoEvaluacionId: 5,
            componente: 'PRACTICO',
            peso: 100,
          },
        ],
        2: [
          {
            id: 'eval-r-b2',
            nombre: 'Examen bimestral',
            tipoEvaluacionId: 1,
            componente: 'TEORICO',
            peso: 100,
          },
        ],
        3: [],
        4: [],
      },
      notas: {
        'est-r1::eval-r-b1': 72,
        'est-r2::eval-r-b1': 81,
        'est-r3::eval-r-b1': 69,
        'est-r4::eval-r-b1': 88,
        'est-r5::eval-r-b1': 74,
        'est-r6::eval-r-b1': 77,
        'est-r1::eval-r-b2': 70,
        'est-r2::eval-r-b2': 78,
        'est-r3::eval-r-b2': 65,
        'est-r4::eval-r-b2': 82,
        'est-r5::eval-r-b2': 71,
        'est-r6::eval-r-b2': 76,
      },
    },
    'asig-104': {
      bimestres: [
        { numero: 1, estado: 'cerrado' },
        { numero: 2, estado: 'vigente' },
        { numero: 3, estado: 'bloqueado' },
        { numero: 4, estado: 'bloqueado' },
      ],
      estudiantes: Array.from({ length: 10 }, (_, i) => ({
        id: `est-e${i + 1}`,
        nombre: `Estudiante ética ${i + 1}`,
        orden: i + 1,
      })),
      evaluaciones: {
        1: [
          {
            id: 'eval-e-b1',
            nombre: 'Ensayo',
            tipoEvaluacionId: 1,
            componente: 'TEORICO',
            peso: 100,
          },
        ],
        2: [
          {
            id: 'eval-e-1',
            nombre: 'Debate',
            tipoEvaluacionId: 4,
            componente: 'PRACTICO',
            peso: 50,
          },
          {
            id: 'eval-e-2',
            nombre: 'Caso práctico',
            tipoEvaluacionId: 3,
            componente: 'PRACTICO',
            peso: 50,
          },
        ],
        3: [],
        4: [],
      },
      notas: {
        'est-e1::eval-e-b1': 80,
      },
    },
  },
});

export const fakeDatabase = createInitialDatabase();

export { notaKey };
