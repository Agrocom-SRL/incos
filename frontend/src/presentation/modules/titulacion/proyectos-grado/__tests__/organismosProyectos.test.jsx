import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import ProyectoActaDefensaSection from '../components/organisms/ProyectoActaDefensaSection';
import ProyectoAvancesSection from '../components/organisms/ProyectoAvancesSection';
import ProyectoBitacoraSection from '../components/organisms/ProyectoBitacoraSection';
import ProyectoDatosSection from '../components/organisms/ProyectoDatosSection';
import ProyectoDictamenesSection from '../components/organisms/ProyectoDictamenesSection';
import ProyectoGradoFichaHeader from '../components/organisms/ProyectoGradoFichaHeader';
import ProyectoGradoTimeline from '../components/organisms/ProyectoGradoTimeline';
import ProyectoIntegrantesSection from '../components/organisms/ProyectoIntegrantesSection';
import { createAvancesTableColumns } from '../config/avancesTableColumns';
import { createBitacoraTableColumns } from '../config/bitacoraTableColumns';
import { createDictamenesTableColumns } from '../config/dictamenesTableColumns';
import { createIntegrantesTableColumns } from '../config/integrantesTableColumns';
import { createMisTutoradosTableColumns } from '../config/misTutoradosTableColumns';
import { createProyectosGradoTableColumns } from '../config/proyectosGradoTableColumns';
import { findColumn, renderCell, renderCells } from '@/test/renderColumns';
import { TITULACION_PERMISOS } from '@application-titulacion/utils/titulacionPermisos';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

const proyecto = {
  id: 5,
  titulo: 'Sistema de inventarios',
  estado: 'DESARROLLO',
  modalidadCodigo: 'PSP',
  modalidadNombre: 'Proyecto de Sistema',
  carreraNombre: 'Sistemas',
  tutorId: 3,
  tutorNombre: 'Ing. Luna',
  cantidadIntegrantes: 2,
  porcentajeAvance: 45,
  observacionesPendientes: 1,
  bitacoraTotal: 4,
  activo: true,
  integrantes: [
    { id: 1, estudianteId: 11, nombreCompleto: 'Pérez Ana', ci: '123', rol: 'TITULAR', estado: 'ACTIVO' },
    { id: 2, estudianteId: 12, nombreCompleto: 'Soto Luis', ci: '456', rol: 'INTEGRANTE', estado: 'RETIRADO' },
  ],
};

describe('ProyectoDatosSection y ficha', () => {
  it('muestra datos, objetivos y la tutoría solo si hay tutor', () => {
    const { unmount } = renderWithProviders(<ProyectoDatosSection proyecto={{ ...proyecto, objetivos: 'Controlar stock', metodologia: 'Scrum', observacionesTutor: 'Avanzar' }} />);
    expect(screen.getByText('Sistema de inventarios')).toBeInTheDocument();
    expect(screen.getByText('Controlar stock')).toBeInTheDocument();
    expect(screen.getByText('Scrum')).toBeInTheDocument();
    expect(screen.getByText('Ing. Luna')).toBeInTheDocument();
    expect(screen.getByText('Sin registros')).toBeInTheDocument();
    unmount();
    renderWithProviders(<ProyectoDatosSection proyecto={{ titulo: 'X' }} />);
    expect(screen.queryByText('Tutoría')).not.toBeInTheDocument();
  });

  it('ficha: estadísticas, nota final opcional y edición', async () => {
    const onEditar = vi.fn();
    const { unmount } = renderWithProviders(<ProyectoGradoFichaHeader proyecto={{ ...proyecto, notaFinal: 88 }} puedeEditar onEditar={onEditar} />);
    expect(screen.getByText('45%')).toBeInTheDocument();
    expect(screen.getByText('88')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Editar datos del proyecto de grado' }));
    expect(onEditar).toHaveBeenCalled();
    unmount();
    renderWithProviders(<ProyectoGradoFichaHeader proyecto={{ ...proyecto, tutorNombre: null }} />);
    expect(screen.getByText('Sin tutor asignado')).toBeInTheDocument();
    expect(screen.queryByText('Nota final')).not.toBeInTheDocument();
  });

  it('timeline con acción', () => {
    renderWithProviders(<ProyectoGradoTimeline proyecto={proyecto} action={<button>Aprobar etapa</button>} />);
    expect(screen.getByText('Etapas del proyecto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Aprobar etapa' })).toBeInTheDocument();
  });
});

describe('secciones de tablas del proyecto', () => {
  it('avances: error, vacío personalizable y con datos', () => {
    const { unmount } = renderWithProviders(<ProyectoAvancesSection avances={[]} error="Falla" />);
    expect(screen.getByText('No se pudieron cargar los avances')).toBeInTheDocument();
    unmount();
    const { unmount: u2 } = renderWithProviders(<ProyectoAvancesSection avances={[]} loading={false} />);
    expect(screen.getByText('El proyecto aún no tiene avances subidos.')).toBeInTheDocument();
    u2();
    renderWithProviders(<ProyectoAvancesSection avances={[{ id: 1, numeroAvance: 2, titulo: 'Cap. 1', nombreArchivo: 'cap1.pdf', extension: 'pdf', estadoRevision: 'OBSERVADO' }]} extra={<span>extra</span>} />);
    expect(screen.getByText('Cap. 1')).toBeInTheDocument();
    expect(screen.getByText('Observado')).toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
  });

  it('bitácora: "Nueva entrada" depende del permiso y del callback', async () => {
    const onNueva = vi.fn();
    const { unmount } = renderWithProviders(<ProyectoBitacoraSection entradas={[]} onNuevaEntrada={onNueva} />, {
      auth: { permisos: [permiso(TITULACION_PERMISOS.bitacora, 'CREAR')] },
    });
    expect(screen.getByText(/aún no tiene entradas/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Nueva entrada/ }));
    expect(onNueva).toHaveBeenCalled();
    unmount();
    renderWithProviders(<ProyectoBitacoraSection entradas={[]} onNuevaEntrada={onNueva} />);
    expect(screen.queryByRole('button', { name: /Nueva entrada/ })).not.toBeInTheDocument();
  });

  it('dictámenes: error, vacío y listado', () => {
    const { unmount } = renderWithProviders(<ProyectoDictamenesSection dictamenes={[]} error="Falla" />);
    expect(screen.getByText('Falla')).toBeInTheDocument();
    unmount();
    const { unmount: u2 } = renderWithProviders(<ProyectoDictamenesSection dictamenes={[]} />);
    expect(screen.getByText(/aún no tiene dictámenes emitidos/)).toBeInTheDocument();
    u2();
    renderWithProviders(<ProyectoDictamenesSection dictamenes={[{ id: 1, tipo: 'ASIGNACION_TUTOR', numeroInforme: 'INF-1', tieneArchivo: false }]} onDescargar={vi.fn()} />);
    expect(screen.getByText('INF-1')).toBeInTheDocument();
    expect(screen.getByText('Sin archivo generado')).toBeInTheDocument();
  });

  it('integrantes: "Agregar integrante" solo en modalidad grupal con permiso', async () => {
    const onAgregar = vi.fn();
    const auth = { permisos: [permiso(TITULACION_PERMISOS.proyecto, 'EDITAR')] };
    const { unmount } = renderWithProviders(<ProyectoIntegrantesSection proyecto={proyecto} onAgregar={onAgregar} />, { auth });
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Agregar integrante/ }));
    expect(onAgregar).toHaveBeenCalled();
    unmount();
    const { unmount: u2 } = renderWithProviders(<ProyectoIntegrantesSection proyecto={{ ...proyecto, modalidadCodigo: 'TESIS' }} onAgregar={onAgregar} />, { auth });
    expect(screen.queryByRole('button', { name: /Agregar integrante/ })).not.toBeInTheDocument();
    u2();
    renderWithProviders(<ProyectoIntegrantesSection proyecto={{ ...proyecto, integrantes: [] }} />);
    expect(screen.getByText('El proyecto aún no tiene integrantes registrados.')).toBeInTheDocument();
  });
});

describe('ProyectoActaDefensaSection', () => {
  const acta = { id: 7, estudianteId: 11, estado: 'EMITIDA', numeroActaFormateado: 'N° 003/2026', fechaDefensaLabel: '05/03/2026', horaInicio: '09:00', horaConclusion: '10:00', calificacionFinal: 85, resultado: 'APRUEBA', tribunal: [{ id: 1, nombreCompleto: 'Dr. Luna', cargo: 'Presidente' }] };
  const permisos = { auth: { permisos: [permiso(TITULACION_PERMISOS.proyecto, 'EXPORTAR', 'APROBAR')] } };

  it('error y vacío según la etapa del proyecto', async () => {
    const { unmount } = renderWithProviders(<ProyectoActaDefensaSection proyecto={proyecto} error="Falla" />);
    expect(screen.getByText('Falla')).toBeInTheDocument();
    unmount();
    const { unmount: u2 } = renderWithProviders(<ProyectoActaDefensaSection proyecto={proyecto} />);
    expect(screen.getByText(/se habilita cuando el proyecto llega a la etapa de Defensa/)).toBeInTheDocument();
    u2();
    const onRegistrar = vi.fn();
    const { unmount: u3 } = renderWithProviders(<ProyectoActaDefensaSection proyecto={{ ...proyecto, estado: 'DEFENSA' }} puedeRegistrar onRegistrar={onRegistrar} />, permisos);
    await userEvent.click(screen.getByRole('button', { name: /Registrar acta de defensa/ }));
    expect(onRegistrar).toHaveBeenCalled();
    u3();
    renderWithProviders(<ProyectoActaDefensaSection proyecto={{ ...proyecto, estado: 'DEFENSA' }} onRegistrar={onRegistrar} />, permisos);
    expect(screen.queryByRole('button', { name: /Registrar acta de defensa/ })).not.toBeInTheDocument();
  });

  it('acta emitida: datos, tribunal, exportar y anular con permiso', async () => {
    const onExportarPdf = vi.fn();
    const onAnular = vi.fn();
    const { unmount } = renderWithProviders(
      <ProyectoActaDefensaSection proyecto={proyecto} actas={[acta]} onExportarPdf={onExportarPdf} onAnular={onAnular} />,
      permisos,
    );
    expect(screen.getByText('N° 003/2026')).toBeInTheDocument();
    expect(screen.getByText('09:00 – 10:00')).toBeInTheDocument();
    expect(screen.getByText('85 / 100')).toBeInTheDocument();
    expect(screen.getByText('Dr. Luna')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Exportar acta/ }));
    await userEvent.click(screen.getByRole('button', { name: /Anular acta/ }));
    expect(onExportarPdf).toHaveBeenCalledWith(expect.objectContaining({ id: 7, estudianteNombre: 'Pérez Ana' }));
    expect(onAnular).toHaveBeenCalled();
    unmount();

    renderWithProviders(<ProyectoActaDefensaSection proyecto={proyecto} actas={[{ ...acta, estado: 'ANULADA' }]} onExportarPdf={onExportarPdf} onAnular={onAnular} />, permisos);
    expect(screen.getByText('Anulada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Anular acta/ })).not.toBeInTheDocument();
  });
});

describe('columnas de proyectos de grado', () => {
  it('listado: celdas, "Al día", orden y acciones por permiso', async () => {
    const navigate = vi.fn();
    const cols = createProyectosGradoTableColumns({ navigate, listNavState: { a: 1 }, refetch: vi.fn(), deleteFn: vi.fn() });
    const textos = Object.values(renderCells(cols, { ...proyecto, observacionesPendientes: 0 })).join(' | ');
    expect(textos).toMatch(/SISTEMA DE INVENTARIOS/);
    expect(textos).toMatch(/Al día/);
    expect(textos).toMatch(/2 integrantes/);
    expect(Object.values(renderCells(cols, { observacionesPendientes: 1 })).join(' ')).toMatch(/1 pendiente/);
    expect(cols[1].sortCompare({ titulo: 'A' }, { titulo: 'B' })).toBeLessThan(0);

    const auth = { permisos: [permiso(TITULACION_PERMISOS.proyecto, 'DETALLE', 'EDITAR')] };
    const { unmount } = renderCell(findColumn(cols, 'acciones'), proyecto, { auth });
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('5'), { state: { a: 1 } });
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
    unmount();
  });

  it('mis tutorados: la aprobación final solo en etapas habilitadas y se bloquea mientras aprueba', async () => {
    const onAprobacionFinal = vi.fn();
    const cols = createMisTutoradosTableColumns({ onVerProyecto: vi.fn(), onRegistrarBitacora: vi.fn(), onAprobacionFinal, aprobandoId: 5 });
    const auth = { permisos: [permiso(TITULACION_PERMISOS.proyecto, 'APROBAR', 'DETALLE'), permiso(TITULACION_PERMISOS.bitacora, 'CREAR')] };
    const accion = cols[cols.length - 1];
    const { unmount } = renderCell(accion, { ...proyecto, estado: 'DEFENSA' }, { auth });
    expect(screen.getByRole('button', { name: 'check-circle' })).toBeDisabled();
    unmount();
    renderCell(accion, { ...proyecto, estado: 'PERFIL' }, { auth });
    expect(screen.queryByRole('button', { name: 'check-circle' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'file-add' })).toBeInTheDocument();
  });

  it('mis tutorados: celdas con pluralización de observaciones', () => {
    const cols = createMisTutoradosTableColumns({ onVerProyecto: vi.fn(), onRegistrarBitacora: vi.fn(), onAprobacionFinal: vi.fn() });
    const juntos = Object.values(renderCells(cols, { ...proyecto, cantidadIntegrantes: 1, observacionesPendientes: 2 })).join(' | ');
    expect(juntos).toMatch(/1 integrante\b/);
    expect(juntos).toMatch(/2 observaciones pendientes/);
    expect(Object.values(renderCells(cols, { ...proyecto, observacionesPendientes: 1 })).join(' | ')).toMatch(/1 observación pendiente\b/);
  });

  it('avances: columna de acciones según callbacks; descarga bloqueada mientras descarga', async () => {
    expect(createAvancesTableColumns()).toHaveLength(5);
    expect(createAvancesTableColumns({ onDescargar: vi.fn() })).toHaveLength(6);
    const cols = createAvancesTableColumns({ onDescargar: vi.fn(), onRevisar: vi.fn(), descargandoId: 3 });
    const auth = { permisos: [permiso(TITULACION_PERMISOS.avance, 'DETALLE'), permiso(TITULACION_PERMISOS.bitacora, 'CREAR')] };
    renderCell(cols[cols.length - 1], { id: 3 }, { auth });
    expect(screen.getByRole('button', { name: 'download' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'audit' })).toBeEnabled();
    expect(cols[1].sortCompare({ numeroAvance: 1 }, { numeroAvance: 3 })).toBe(-2);
  });

  it('bitácora: confirmación del estudiante con Popconfirm y estados', async () => {
    const onConfirmar = vi.fn();
    const cols = createBitacoraTableColumns({ modoEstudiante: true, onConfirmar });
    const auth = { permisos: [permiso(TITULACION_PERMISOS.bitacora, 'LISTAR')] };
    const celda = cols[5];
    const { unmount } = renderCell(celda, { id: 1, confirmadoEstudiante: false }, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Confirmar/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Confirmar', exact: true, hidden: false }).catch(() => screen.getAllByRole('button', { name: 'Confirmar' }).at(-1)));
    expect(onConfirmar).toHaveBeenCalled();
    unmount();

    const { text, unmount: u2 } = renderCell(celda, { confirmadoEstudiante: true, fechaConfirmacionLabel: '05/03' });
    expect(text).toContain('Confirmada');
    u2();
    expect(renderCell(createBitacoraTableColumns({})[5], { confirmadoEstudiante: false }).text).toBe('Sin confirmar');
    expect(createBitacoraTableColumns({ onEditar: vi.fn() })).toHaveLength(7);
  });

  it('dictámenes e integrantes: acciones según callbacks y estado', async () => {
    expect(createDictamenesTableColumns()).toHaveLength(4);
    const cols = createDictamenesTableColumns({ onDescargar: vi.fn() });
    renderCell(cols[cols.length - 1], { id: 1, tieneArchivo: false }, { auth: { permisos: [permiso(TITULACION_PERMISOS.proyecto, 'EXPORTAR')] } });
    expect(screen.getByRole('button', { name: 'download' })).toBeDisabled();

    const onToggleEstado = vi.fn();
    const intCols = createIntegrantesTableColumns({ onToggleEstado });
    const auth = { permisos: [permiso(TITULACION_PERMISOS.proyecto, 'EDITAR')] };
    const { unmount } = renderCell(intCols[intCols.length - 1], { id: 1, estado: 'RETIRADO' }, { auth });
    await userEvent.click(screen.getByRole('button', { name: 'user-add' }));
    expect(onToggleEstado).toHaveBeenCalledWith({ id: 1, estado: 'RETIRADO' });
    unmount();
    renderCell(intCols[intCols.length - 1], { id: 2, estado: 'ACTIVO' }, { auth });
    expect(screen.getByRole('button', { name: 'user-delete' })).toBeInTheDocument();
    expect(createIntegrantesTableColumns()).toHaveLength(5);
  });
});
