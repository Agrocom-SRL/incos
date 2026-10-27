import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { permiso } from '@/test/renderWithProviders';
import { findColumn, renderCell, renderCells } from '@/test/renderColumns';
import { createEstudiantesTableColumns } from '../admision/config/tableColumns';
import { createPagosTableColumns } from '../aportes/config/tableColumns';
import { createPagosSeleccionEstudianteTableColumns } from '../aportes/config/pagosSeleccionEstudianteTableColumns';
import { buildConceptoNombre, resolveConceptoNombre } from '../aportes/config/aporteConcepto';
import { createBecasTableColumns } from '../becas/config/becasTableColumns';
import { createInscripcionesAnularTableColumns, createInscripcionesTableColumns } from '../registro/config/tableColumns';
import { createHistorialPrevioColumns, createMateriasInscritasColumns } from '../registro/config/inscripcionDetailColumns';
import { createMisEstudiantesDocenteColumns } from '../registro/config/misEstudiantesDocenteColumns';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

const botones = () => screen.queryAllByRole('button').map((b) => b.querySelector('[aria-label]')?.getAttribute('aria-label') ?? b.textContent);

describe('columnas de estudiantes (admisión)', () => {
  const estudiante = {
    id: 3, codigoEstudiante: 'E-001', apellidoPaterno: 'Pérez', apellidoMaterno: 'Luna', nombres: 'Ana', ci: '123', expedicion: 'LP', genero: 'F',
    celular: '70000000', emailPersonal: 'ana@x.bo', carreraNombre: 'Sistemas', carreraColorHex: '#336699', gestionIngresoNombre: '2025',
    estadoAcademico: 'ACTIVO', tipoAdmision: 'REGULAR', trabaja: true, empresaInstitucion: 'ACME', cargo: 'Dev',
  };

  it('numera con offset y muestra identidad, contacto, carrera y estado', () => {
    const cols = createEstudiantesTableColumns(vi.fn());
    expect(cols[0].render(null, null, 1, 20)).toBe(22);
    const textos = renderCells(cols.slice(1, 5), estudiante);
    expect(textos.estudiante).toContain('PÉREZ LUNA ANA');
    expect(textos.estudiante).toContain('E-001');
    expect(textos.contacto).toContain('Femenino');
    expect(textos.contacto).toContain('CI 123 LP');
    expect(textos.contacto).toContain('ana@x.bo');
    expect(textos.carrera).toContain('Sistemas');
    expect(textos.carrera).toContain('2025');
    expect(textos.estado).toContain('ACTIVO');
    expect(textos.estado).toContain('REGULAR');
  });

  it('con datos vacíos usa valores de respaldo', () => {
    const cols = createEstudiantesTableColumns(vi.fn());
    const textos = renderCells(cols.slice(1, 5), { id: 1 });
    expect(textos.estudiante).toContain('SIN NOMBRE');
    expect(textos.estado).toContain('—');
  });

  it.each([
    ['ACTIVO', 'success'], ['EGRESADO', 'info'], ['RETIRADO', 'danger'], ['MORA', 'warning'], ['OTRO', 'default'],
  ])('el estado %s usa el tono %s', (estado, tono) => {
    const col = findColumn(createEstudiantesTableColumns(vi.fn()), 'estado');
    const { container } = renderCell(col, { estadoAcademico: estado });
    expect(container.querySelector(`.cfg-materia-pill--${tono}`)).not.toBeNull();
  });

  it('los géneros masculino, otro y vacío generan su etiqueta', () => {
    const col = findColumn(createEstudiantesTableColumns(vi.fn()), 'contacto');
    expect(renderCell(col, { genero: 'M' }).text).toContain('Masculino');
    expect(renderCell(col, { genero: 'NB' }).text).toContain('NB');
    expect(renderCell(col, {}).text).not.toContain('Masculino');
  });

  it('los ordenamientos comparan por nombre, género/CI, gestión/carrera y tipo/estado', () => {
    const cols = createEstudiantesTableColumns(vi.fn());
    const get = (k) => findColumn(cols, k).sorter;
    expect(get('estudiante')({ nombres: 'A' }, { nombres: 'B' })).toBeLessThan(0);
    expect(get('contacto')({ genero: 'F', ci: '1' }, { genero: 'M', ci: '1' })).toBeLessThan(0);
    expect(get('contacto')({ genero: 'F', ci: '2' }, { genero: 'F', ci: '10' })).toBeLessThan(0);
    expect(get('carrera')({ gestionIngresoNombre: '2024' }, { gestionIngresoNombre: '2025' })).toBeLessThan(0);
    expect(get('carrera')({ gestionIngresoNombre: '2024', carreraNombre: 'A' }, { gestionIngresoNombre: '2024', carreraNombre: 'B' })).toBeLessThan(0);
    expect(get('estado')({ tipoAdmision: 'A' }, { tipoAdmision: 'B' })).toBeLessThan(0);
    expect(get('estado')({ tipoAdmision: 'A', estadoAcademico: 'X' }, { tipoAdmision: 'A', estadoAcademico: 'Y' })).toBeLessThan(0);
  });

  it('acciones: ver/editar/pago/eliminar según permisos y navegación correcta', async () => {
    const navigate = vi.fn();
    const deleteStudent = vi.fn().mockResolvedValue({ success: true });
    const cols = createEstudiantesTableColumns(navigate, vi.fn(), deleteStudent);
    const acciones = findColumn(cols, 'acciones');
    const permisos = [
      permiso('matricula.admision.ver', 'DETALLE'), permiso('matricula.admision.editar', 'EDITAR', 'ELIMINAR'), permiso('finanzas.pago.registrar', 'CREAR'),
    ];
    const { unmount } = renderCell(acciones, estudiante, { auth: { permisos } });
    expect(botones()).toEqual(['eye', 'edit', 'dollar', 'delete']);
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(navigate).toHaveBeenLastCalledWith('/estudiantes/3', undefined);
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(navigate).toHaveBeenLastCalledWith('/estudiantes/3/editar', { state: { initialStep: 2 } });
    await userEvent.click(screen.getByRole('button', { name: 'dollar' }));
    expect(navigate).toHaveBeenLastCalledWith('/pagos/registrar', expect.objectContaining({ state: expect.objectContaining({ studentId: 3 }) }));
    unmount();
    renderCell(acciones, estudiante);
    expect(botones()).toEqual([]);
  });

  it('registrar pago: si ya existe un pago del estudiante abre el más reciente', async () => {
    const navigate = vi.fn();
    const pagos = [
      { id: 5, estudiante: { id: 3 } }, { id: 9, estudianteId: 3 }, { id: 11, student_id: 4 }, { id: 2, studentId: 3 },
    ];
    const acciones = findColumn(createEstudiantesTableColumns(navigate, null, null, { pagos }), 'acciones');
    renderCell(acciones, estudiante, { auth: { permisos: [permiso('finanzas.pago.registrar', 'CREAR')] } });
    await userEvent.click(screen.getByRole('button', { name: 'dollar' }));
    expect(navigate).toHaveBeenCalledWith('/pagos/9', expect.anything());
  });

  it('registrar pago sin id de estudiante navega igualmente al registro', async () => {
    const navigate = vi.fn();
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const acciones = findColumn(createEstudiantesTableColumns(navigate), 'acciones');
    renderCell(acciones, { codigoEstudiante: 'E-9' }, { auth: { permisos: [permiso('finanzas.pago.registrar', 'CREAR')] } });
    await userEvent.click(screen.getByRole('button', { name: 'dollar' }));
    expect(navigate).toHaveBeenCalledWith('/pagos/registrar', expect.anything());
    warn.mockRestore();
  });
});

describe('columnas de pagos de aportes', () => {
  const pago = {
    id: 8, estudiante: { nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1' }, gestion: { nombre: '2026' }, monto_base: 500, descuento_beca: 100, monto_obligatorio: 400,
    total_pagado: 150, cantidad_pagos: 2, saldo_pendiente: 250, compromiso: { fechaCompromiso: '2099-01-01' },
  };

  it('muestra montos, beca, cuotas, saldo y estado derivado', () => {
    const textos = renderCells(createPagosTableColumns(vi.fn()), pago);
    const valores = Object.values(textos).join(' | ');
    expect(valores).toContain('PÉREZ ANA');
    expect(valores).toContain('Pago parcial');
    expect(valores).toContain('Bs. 500.00');
    expect(valores).toContain('Beca 20%');
    expect(valores).toContain('Bs. 400.00');
    expect(valores).toContain('2 cuotas');
    expect(valores).toContain('Bs. 250.00');
  });

  it('estados: cancelado, sin pagos y cubierto por beca', () => {
    const cols = createPagosTableColumns(vi.fn());
    const resumen = renderCells(cols, { id: 1, estudiante: { nombreCompleto: 'X' }, monto_base: 100, descuento_beca: 100, monto_obligatorio: 0, total_pagado: 0, cantidad_pagos: 0, saldo_pendiente: 0 });
    const texto = Object.values(resumen).join(' | ');
    expect(texto).toContain('Cancelado');
    expect(texto).toContain('Cubierto por beca');
    expect(texto).toContain('Sin pagos');
    const sinPagos = renderCells(cols, { id: 2, monto_base: 100, monto_obligatorio: 100, saldo_pendiente: 100, cantidad_pagos: 0 });
    expect(Object.values(sinPagos).join(' | ')).toContain('Sin pagos');
    const unaCuota = renderCells(cols, { id: 3, monto_base: 100, monto_obligatorio: 100, saldo_pendiente: 100, cantidad_pagos: 1, total_pagado: 0 });
    expect(Object.values(unaCuota).join(' | ')).toContain('1 cuota');
  });

  it('compromiso ausente muestra guion; con compromiso muestra pill', () => {
    const col = findColumn(createPagosTableColumns(vi.fn()), 'compromiso');
    expect(renderCell(col, {}).text).toBe('—');
    expect(renderCell(col, { compromiso: { fechaCompromiso: null } }).text).toContain('Sin fecha');
  });

  it('ordenamientos numéricos y por nombre', () => {
    const cols = createPagosTableColumns(vi.fn());
    const orden = (k) => findColumn(cols, k).sorter;
    expect(orden('monto_base')({ monto_base: 1 }, { monto_base: 2 })).toBeLessThan(0);
    expect(orden('monto_obligatorio')({ monto_obligatorio: 5 }, { monto_obligatorio: 2 })).toBeGreaterThan(0);
    expect(orden('total_pagado')({}, { total_pagado: 1 })).toBeLessThan(0);
    expect(orden('saldo_pendiente')({ saldo_pendiente: 3 }, {})).toBeGreaterThan(0);
    expect(orden('compromiso')({ compromiso: null }, { compromiso: null })).toBe(0);
    expect(cols[1].sorter({ estudiante: { nombreCompleto: 'A' } }, { estudiante: { codigoEstudiante: 'B' } })).toBeLessThan(0);
  });

  it('acciones: ver, editar y eliminar por permiso (alternativo de matrícula incluido)', async () => {
    const navigate = vi.fn();
    const deletePago = vi.fn();
    const acciones = findColumn(createPagosTableColumns(navigate, vi.fn(), deletePago, { viewNavigateState: { a: 1 }, returnListPath: '/pagos' }), 'acciones');
    renderCell(acciones, pago, { auth: { permisos: [permiso('matricula.pago.aporte.ver', 'DETALLE', 'EDITAR', 'ELIMINAR')] } });
    expect(botones()).toEqual(['eye', 'edit', 'delete']);
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(navigate).toHaveBeenLastCalledWith('/pagos/8', { state: { a: 1 } });
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(navigate).toHaveBeenLastCalledWith('/pagos/8/editar', { state: { a: 1, returnListPath: '/pagos' } });
  });

  it('acciones: sin permisos no hay botones y el recibo da nombre al elemento', () => {
    const acciones = findColumn(createPagosTableColumns(vi.fn()), 'acciones');
    renderCell(acciones, { ...pago, numeroRecibo: 'R-1' });
    expect(botones()).toEqual([]);
  });
});

describe('columnas de selección de estudiante para registrar pago', () => {
  const alta = permiso('finanzas.pago.registrar', 'CREAR');
  const base = { id: 6, codigoEstudiante: 'E-6', nombreCompleto: 'Luna Ana', ci: '55', emailPersonal: 'a@x', celular: '7', carreraNombre: 'Contaduría', createdAt: '2026-03-02T10:30:00' };

  it('muestra identidad, contacto, carrera y fecha formateada', () => {
    const textos = renderCells(createPagosSeleccionEstudianteTableColumns({ onRegistrarPago: vi.fn() }), base);
    expect(textos.created_at).toContain('02/03/2026');
    expect(textos.nombre).toContain('LUNA ANA');
    expect(textos.contacto).toContain('CI 55');
    expect(textos.carrera).toContain('Contaduría');
    expect(textos.aporte).toBe('Primera cuota');
  });

  it('aporte: con saldo, cubierto y fecha inválida o ausente', () => {
    const cols = createPagosSeleccionEstudianteTableColumns({ onRegistrarPago: vi.fn() });
    const aporte = findColumn(cols, 'aporte');
    expect(renderCell(aporte, { aporteRegistro: { tieneCabeceraAporte: true, saldoPendienteTotal: 120 } }).text).toMatch(/Con saldo.*Saldo: Bs\.\s?120/);
    expect(renderCell(aporte, { aporteRegistro: { aporteTotalmenteCubierto: true } }).text).toContain('Sin saldo pendiente');
    const fecha = findColumn(cols, 'created_at');
    expect(renderCell(fecha, {}).text).toContain('—');
    expect(renderCell(fecha, { createdAt: 'no-es-fecha' }).text).toBeTruthy();
    expect(findColumn(cols, 'nombre').sorter({ nombreCompleto: 'A' }, { nombreCompleto: 'B' })).toBeLessThan(0);
  });

  it('el botón registra el pago del estudiante, exige CREAR y desaparece si está cubierto', async () => {
    const onRegistrarPago = vi.fn();
    const accion = findColumn(createPagosSeleccionEstudianteTableColumns({ onRegistrarPago }), 'accion');
    const { unmount } = renderCell(accion, base, { auth: { permisos: [alta] } });
    await userEvent.click(screen.getByRole('button', { name: /Registrar pago/ }));
    expect(onRegistrarPago).toHaveBeenCalledWith(6);
    unmount();
    renderCell(accion, base);
    expect(screen.queryByRole('button', { name: /Registrar pago/ })).not.toBeInTheDocument();
    renderCell(accion, { ...base, aporteRegistro: { aporteTotalmenteCubierto: true } }, { auth: { permisos: [alta] } });
    expect(screen.queryByRole('button', { name: /Registrar pago/ })).not.toBeInTheDocument();
  });
});

describe('concepto del aporte', () => {
  it('no duplica el prefijo "Gestión" y usa respaldo', () => {
    expect(buildConceptoNombre('2026')).toBe('Aporte académico - Gestión 2026');
    expect(buildConceptoNombre('Gestión Regular 2026')).toBe('Aporte académico - Gestión Regular 2026');
    expect(buildConceptoNombre('gestion 2027')).toBe('Aporte académico - gestion 2027');
    expect(buildConceptoNombre(null)).toBe('Aporte académico');
  });

  it('prioriza el estado actual del aporte sobre la configuración', () => {
    expect(resolveConceptoNombre({ gestion: { nombre: '2026' } }, { gestionName: '2025' })).toBe('Aporte académico - Gestión 2026');
    expect(resolveConceptoNombre({ gestion: { anio: 2027 } }, null)).toBe('Aporte académico - Gestión 2027');
    expect(resolveConceptoNombre(null, { gestionName: '2025' })).toBe('Aporte académico - Gestión 2025');
    expect(resolveConceptoNombre(null, { gestion: { year: 2024 } })).toBe('Aporte académico - Gestión 2024');
    expect(resolveConceptoNombre(null, null)).toBe('Aporte académico');
  });
});

describe('columnas de becas asignadas', () => {
  const beca = {
    id: 4, studentId: 3, student: { nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1' }, scholarship: { id: 2, nombre: 'Excelencia', porcentaje: 50, descripcion: 'Mejores promedios' },
    management: { codigo: 'G-2026' }, impacto: { descuentoAplicado: 250 }, carrera: { nombre: 'Sistemas', colorHex: '#123456' }, state: 'ACTIVA', observations: 'obs',
  };

  it('muestra estudiante, beca, gestión con descuento y carrera', () => {
    const textos = renderCells(createBecasTableColumns(vi.fn()), beca);
    const todo = Object.values(textos).join(' | ');
    expect(todo).toContain('PÉREZ ANA');
    expect(todo).toContain('Excelencia');
    expect(todo).toContain('Mejores promedios');
    expect(todo).toContain('G-2026');
    expect(todo).toContain('50%');
    expect(todo).toContain('Bs. 250.00');
    expect(todo).toContain('Sistemas');
  });

  it('valores ausentes caen a textos de respaldo', () => {
    const todo = Object.values(renderCells(createBecasTableColumns(vi.fn()), { id: 1 })).join(' | ');
    expect(todo).toContain('SIN NOMBRE');
    expect(todo).toContain('Sin beca');
  });

  it('ordenamientos por estudiante, beca, porcentaje y carrera', () => {
    const cols = createBecasTableColumns(vi.fn());
    const s = (i) => cols[i].sorter;
    expect(s(1)({ student: { nombreCompleto: 'A' } }, { student: { nombreCompleto: 'B' } })).toBeLessThan(0);
    expect(s(2)({ scholarship: { nombre: 'A' } }, { scholarship: { nombre: 'B' } })).toBeLessThan(0);
    expect(s(3)({ scholarship: { porcentaje: 10 } }, {})).toBe(10);
    expect(s(4)({ carrera: { nombre: 'A' } }, { carrera: { nombre: 'B' } })).toBeLessThan(0);
  });

  it('acciones: ver navega a la asignación, editar abre la asignación con su estado y eliminar usa deleteBeca', async () => {
    const navigate = vi.fn();
    const acciones = findColumn(createBecasTableColumns(navigate, vi.fn(), vi.fn(), { viewNavigateState: { returnListPath: '/volver' } }), 'acciones');
    renderCell(acciones, beca, { auth: { permisos: [permiso('matricula.beca.ver', 'DETALLE'), permiso('matricula.beca.asignar', 'EDITAR', 'ELIMINAR')] } });
    expect(botones()).toEqual(['eye', 'edit', 'delete']);
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(navigate).toHaveBeenLastCalledWith('/estudiantes/becas/asignacion/4', { state: { returnListPath: '/volver' } });
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(navigate).toHaveBeenLastCalledWith('/estudiantes/becas/asignar', {
      state: expect.objectContaining({ studentId: 3, returnListPath: '/volver', editBecaAsignada: { id: 4, scholarshipId: 2, observations: 'obs' } }),
    });
  });

  it('editar sin estudiante o id no navega; sin permisos no hay acciones', async () => {
    const navigate = vi.fn();
    const acciones = findColumn(createBecasTableColumns(navigate), 'acciones');
    const { unmount } = renderCell(acciones, { id: 4 }, { auth: { permisos: [permiso('matricula.beca.asignar', 'CREAR')] } });
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(navigate).not.toHaveBeenCalled();
    unmount();
    renderCell(acciones, beca);
    expect(botones()).toEqual([]);
  });
});

describe('columnas de inscripciones', () => {
  const insc = {
    id: 12, estudiante: { nombreCompleto: 'Pérez Ana', codigoEstudiante: 'E-1' }, carrera: { nombre: 'Sistemas', colorHex: '#111111' }, gestion: { anio: 2026 }, periodo: { nombre: '1° año' },
    paralelo: { nombre: 'A', turno: 'NOCHE' }, cantidadMaterias: 5, tipoInscripcion: 'REGULAR',
  };

  it('muestra estudiante, carrera, gestión y periodo, paralelo y tipo', () => {
    const textos = renderCells(createInscripcionesTableColumns(vi.fn()), insc);
    expect(textos.estudiante ?? textos[Object.keys(textos)[1]]).toContain('PÉREZ ANA');
    const todo = Object.values(textos).join(' | ');
    expect(todo).toContain('Gestión 2026');
    expect(todo).toContain('1° año');
    expect(todo).toContain('Paralelo A · NOCHE');
    expect(todo).toContain('5 materias');
    expect(todo).toContain('REGULAR');
  });

  it('usa los datos de enrollment, el código INS- y "1 materia"; sin tipo muestra guion', () => {
    const cols = createInscripcionesTableColumns(vi.fn());
    const todo = Object.values(renderCells(cols, { id: 3, enrollment: { student: { nombre: 'Luis' }, carrera: { nombre: 'Contaduría' }, anioCarrera: 2025, paralelo: { nombre: 'B' } }, subjectEnrollments: [{}] })).join(' | ');
    expect(todo).toContain('LUIS');
    expect(todo).toContain('INS-3');
    expect(todo).toContain('Contaduría');
    expect(todo).toContain('Gestión 2025');
    expect(todo).toContain('1 materia');
    expect(findColumn(cols, 'tipo').sorter({}, {})).toBe(0);
  });

  it('ordenamientos por estudiante, carrera, cantidad de materias y tipo', () => {
    const cols = createInscripcionesTableColumns(vi.fn());
    expect(cols[1].sorter({ estudiante: { nombre: 'A' } }, { student: { nombreCompleto: 'B' } })).toBeLessThan(0);
    expect(findColumn(cols, 'carrera').sorter({ carrera: { nombre: 'A' } }, { enrollment: { carrera: { nombre: 'B' } } })).toBeLessThan(0);
    expect(findColumn(cols, 'paraleloMaterias').sorter({ cantidadMaterias: 2 }, { subjectEnrollments: [1] })).toBe(1);
    expect(findColumn(cols, 'tipo').sorter({ tipoInscripcion: 'A' }, { enrollment: { tipoInscripcion: 'B' } })).toBeLessThan(0);
  });

  it('historial previo pendiente se avisa bajo el nombre solo cuando aplica', () => {
    const col = createInscripcionesTableColumns(vi.fn())[1];
    expect(renderCell(col, { ...insc, tipoInscripcion: 'ANTIGUO' }).text).toContain('Historial previo pendiente');
    expect(renderCell(col, { ...insc, tipoInscripcion: 'ANTIGUO', cantidadHistorialPrevio: 3 }).text).not.toContain('Historial previo pendiente');
    expect(renderCell(col, insc).text).not.toContain('Historial previo pendiente');
  });

  it('acciones: ver/editar/anular por permisos, editar navega a la edición', async () => {
    const navigate = vi.fn();
    const acciones = findColumn(createInscripcionesTableColumns(navigate, vi.fn(), vi.fn()), 'acciones');
    renderCell(acciones, insc, { auth: { permisos: [permiso('matricula.inscribir', 'DETALLE'), permiso('matricula.inscripcion.editar', 'EDITAR', 'ELIMINAR')] } });
    expect(botones()).toEqual(['eye', 'edit', 'delete']);
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(navigate).toHaveBeenLastCalledWith('/inscripciones/12', undefined);
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(navigate).toHaveBeenLastCalledWith('/inscripciones/12/editar');
  });

  it('variante de anulación: una sola acción (eliminar) con permiso', () => {
    const cols = createInscripcionesAnularTableColumns(vi.fn(), vi.fn(), vi.fn());
    const acciones = cols.find((c) => c.key === 'acciones');
    expect(acciones.title).toBe('Acción');
    renderCell(acciones, insc, { auth: { permisos: [permiso('matricula.inscripcion.editar', 'DETALLE', 'EDITAR', 'ELIMINAR')] } });
    expect(botones()).toEqual(['delete']);
  });
});

describe('columnas de la ficha de matrícula', () => {
  it('materias inscritas: estado, paralelo, docente y bloques', () => {
    const cols = createMateriasInscritasColumns();
    const textos = renderCells(cols, { materiaSigla: 'MAT-1', materiaNombre: 'Matemática', status: 'CURSANDO', paralelo: { nombre: 'A', turno: 'NOCHE' }, docente: { nombreCompleto: 'Luna' }, horarios: [{}, {}] });
    expect(textos.materiaSigla).toBe('MAT-1');
    expect(textos.paralelo).toBe('A');
    expect(textos.turno).toBe('NOCHE');
    expect(textos.docente).toBe('Luna');
    expect(textos.horarios).toBe('2 bloque(s)');
    const vacio = renderCells(cols, {});
    expect(vacio.materiaSigla).toBe('—');
    expect(vacio.status).toBe('—');
    expect(vacio.docente).toBe('Sin docente asignado');
    expect(vacio.horarios).toBe('Sin bloques');
  });

  it('historial previo: gestión, materia, estado y nota (convalidado sin nota)', () => {
    const cols = createHistorialPrevioColumns();
    const aprobado = renderCells(cols, { periodoNombre: '1° año', materiaSigla: 'MAT-1', materiaNombre: 'Matemática', estado: 'APROBADO', notaFinal: 71 });
    expect(aprobado).toMatchObject({ gestionAcademica: '1° año', materiaSigla: 'MAT-1', materia: 'Matemática', estado: 'Aprobado', nota: '71' });
    const convalidado = renderCells(cols, { periodoNumero: 2, materia: { sigla: 'FIS', nombre: 'Física' }, status: 'CONVALIDADO', final_grade: 80 });
    expect(convalidado).toMatchObject({ gestionAcademica: 'Periodo 2', materiaSigla: 'FIS', materia: 'Física', estado: 'Convalidado', nota: '—' });
    const otro = renderCells(cols, { periodo: { nombre: 'P' }, estado: 'REPROBADO' });
    expect(otro).toMatchObject({ gestionAcademica: 'P', estado: 'REPROBADO', nota: '—' });
    expect(renderCells(cols, {})).toMatchObject({ gestionAcademica: '—', estado: '—' });
  });
});

describe('columnas de "Mis estudiantes" del docente', () => {
  const fila = { id: 9, codigoEstudiante: 'E-9', nombreCompleto: 'Rojas Beto', ci: '99', expedicion: 'CB', estadoMatricula: 'INSCRITO' };

  it.each([['INSCRITO', 'success'], ['EGRESADO', 'info'], ['BAJA', 'danger'], ['CONGELADO', 'warning'], ['X', 'default']])('estado %s → %s', (estado, tono) => {
    const col = findColumn(createMisEstudiantesDocenteColumns(vi.fn()), 'estadoMatricula');
    expect(renderCell(col, { estadoMatricula: estado }).container.querySelector(`.cfg-materia-pill--${tono}`)).not.toBeNull();
  });

  it('muestra identidad y C.I.; sin CI muestra guion', () => {
    const cols = createMisEstudiantesDocenteColumns(vi.fn());
    const textos = renderCells(cols, fila);
    expect(textos.estudiante).toContain('ROJAS BETO');
    expect(textos.ci).toContain('99 CB');
    expect(renderCells(cols, {}).ci).toContain('—');
  });

  it('ordenamientos y acción única de ver con permiso DETALLE', async () => {
    const navigate = vi.fn();
    const cols = createMisEstudiantesDocenteColumns(navigate);
    expect(cols[1].sorter({ nombreCompleto: 'A' }, { nombreCompleto: 'B' })).toBeLessThan(0);
    expect(findColumn(cols, 'ci').sorter({ ci: '2' }, { ci: '10' })).toBeLessThan(0);
    expect(findColumn(cols, 'estadoMatricula').sorter({ estadoMatricula: 'A' }, { estadoMatricula: 'B' })).toBeLessThan(0);
    const acciones = findColumn(cols, 'acciones');
    const { unmount } = renderCell(acciones, fila, { auth: { permisos: [permiso('matricula.admision.ver', 'DETALLE')] } });
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(navigate).toHaveBeenCalledWith('/estudiantes/9', undefined);
    unmount();
    renderCell(acciones, fila);
    expect(botones()).toEqual([]);
  });
});
