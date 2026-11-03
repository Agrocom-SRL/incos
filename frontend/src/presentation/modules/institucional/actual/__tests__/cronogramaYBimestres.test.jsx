import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import { findColumn, renderCell, renderCells } from '@/test/renderColumns';
import BimestresAperturaSection from '../components/organisms/BimestresAperturaSection';
import BimestresCalendarBoard from '../components/organisms/BimestresCalendarBoard';
import BimestresConfigAside from '../components/organisms/BimestresConfigAside';
import CronogramaActividadFormSections from '../components/organisms/CronogramaActividadFormSections';
import CronogramaActividadSelectorModal from '../components/organisms/CronogramaActividadSelectorModal';
import CronogramaGestion from '../components/organisms/CronogramaGestion';
import { createCronogramaTableColumns } from '../config/cronogramaTableColumns';
import GestionActualPage from '../pages/GestionActualPage';
import ControlBimestresPage from '../pages/ControlBimestresPage';
import CronogramaAdminPage from '../pages/CronogramaAdminPage';
import CronogramaActividadDetailPage from '../pages/CronogramaActividadDetailPage';
import CronogramaActividadFormPage from '../pages/CronogramaActividadFormPage';

const mocks = vi.hoisted(() => ({ gestion: vi.fn(), control: vi.fn(), admin: vi.fn(), detalle: vi.fn(), form: vi.fn() }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('@application-institucional/actual', async (orig) => ({
  ...(await orig()),
  useGestionActualState: mocks.gestion,
  useControlBimestresState: mocks.control,
  useCronogramaAdminState: mocks.admin,
  useCronogramaActividadDetail: mocks.detalle,
  useCronogramaActividadForm: mocks.form,
}));

const editar = { auth: { permisos: [permiso('institucional.gestion.actual', 'EDITAR')] } };
const bc = [{ title: 'Institucional' }];

describe('BimestresAperturaSection', () => {
  const bimestre = (extra = {}) => ({ numero: 1, nombre: 'Primer bimestre', institucional: 'EN_CURSO', calendario: 'abierto', fechaInicio: '2026-03-01', fechaFin: '2026-04-30', abrirHabilitado: false, cerrarHabilitado: true, abrirTooltip: 'Aún no es la fecha', ...extra });

  it('sin bimestres y sin gestión iniciada', () => {
    renderWithProviders(<BimestresAperturaSection iniciada={false} bimestres={[]} />);
    expect(screen.getByText('Disponible una vez iniciada la gestión académica.')).toBeInTheDocument();
    expect(screen.getByText('No hay bimestres configurados para la gestión vigente')).toBeInTheDocument();
  });

  it('cada bimestre abre/cierra solo si está habilitado y valida el cierre', async () => {
    const onAbrir = vi.fn();
    const onCerrar = vi.fn();
    const onValidarCierre = vi.fn();
    renderWithProviders(
      <BimestresAperturaSection
        iniciada
        bimestres={[bimestre(), bimestre({ numero: 2, nombre: 'Segundo bimestre', institucional: 'PENDIENTE', calendario: 'futuro', abrirHabilitado: true, cerrarHabilitado: false })]}
        validacionPorBimestre={{ 1: { puedeCerrar: true } }}
        onAbrir={onAbrir}
        onCerrar={onCerrar}
        onValidarCierre={onValidarCierre}
      />,
      editar,
    );
    expect(screen.getByText('Primer bimestre')).toBeInTheDocument();
    expect(screen.getByText('El bimestre puede cerrarse')).toBeInTheDocument();
    const abrir = screen.getAllByRole('button', { name: /Abrir/ });
    const cerrar = screen.getAllByRole('button', { name: /Cerrar/ });
    expect(abrir[0]).toBeDisabled();
    expect(cerrar[1]).toBeDisabled();
    await userEvent.click(abrir[1]);
    await userEvent.click(cerrar[0]);
    await userEvent.click(screen.getAllByRole('button', { name: /Validar cierre/ })[0]);
    expect(onAbrir).toHaveBeenCalledWith(2);
    expect(onCerrar).toHaveBeenCalledWith(1);
    expect(onValidarCierre).toHaveBeenCalledWith(1);
  });

  it('una acción en curso sobre un bimestre bloquea sus botones', () => {
    renderWithProviders(<BimestresAperturaSection iniciada bimestres={[bimestre({ abrirHabilitado: true })]} bimestreEnAccion={1} abriendo />, editar);
    expect(screen.getAllByRole('button', { name: /Validar cierre/ })[0]).toBeDisabled();
  });
});

describe('BimestresCalendarBoard', () => {
  it('sin periodos', () => {
    renderWithProviders(<BimestresCalendarBoard periodos={[]} anio={2026} />);
    expect(screen.getByText('Sin periodos para la gestión vigente')).toBeInTheDocument();
  });

  it('muestra los doce meses y la leyenda de periodos', () => {
    renderWithProviders(<BimestresCalendarBoard anio={2026} periodos={[{ id: 1, nombre: 'Primer bimestre', fechaInicio: '2026-03-01', fechaFin: '2026-04-30', division: 'BIMESTRE', numero: 1 }]} />);
    expect(screen.getByText('Marzo')).toBeInTheDocument();
    expect(screen.getByText('Primer bimestre')).toBeInTheDocument();
  });
});

describe('BimestresConfigAside', () => {
  const periodos = [
    { id: 1, nombre: 'Primer bimestre', division: 'BIMESTRE', fechaInicio: '2026-03-01', fechaFin: '2026-04-30' },
    { id: 2, nombre: 'Receso', division: 'ETAPA', fechaInicio: '2026-07-01', fechaFin: '2026-07-15' },
  ];
  const props = (extra = {}) => ({ iniciada: false, fase: { fase: 'EN_CURSO' }, iniciando: false, onIniciarGestion: vi.fn(), periodos, dirtyCount: 0, guardando: false, creando: false, setRangoPeriodo: vi.fn(), guardarFechas: vi.fn(), crearEtapa: vi.fn(), eliminarEtapa: vi.fn(), ...extra });

  it('solo las etapas no estructurales se pueden eliminar', () => {
    renderWithProviders(<BimestresConfigAside {...props()} />, { auth: { permisos: [permiso('institucional.gestion.actual', 'EDITAR')] } });
    expect(screen.getByText('Primer bimestre')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'delete' })).toHaveLength(1);
  });

  it('guardar cambios muestra el contador y se habilita con cambios', async () => {
    const p = props({ dirtyCount: 2 });
    renderWithProviders(<BimestresConfigAside {...p} />, editar);
    await userEvent.click(screen.getByRole('button', { name: /Guardar cambios \(2\)/ }));
    expect(p.guardarFechas).toHaveBeenCalled();
  });

  it('sin cambios el guardado está deshabilitado', () => {
    renderWithProviders(<BimestresConfigAside {...props()} />, editar);
    expect(screen.getByRole('button', { name: /Guardar cambios/ })).toBeDisabled();
  });

  it('"Agregar etapa" abre el modal', async () => {
    renderWithProviders(<BimestresConfigAside {...props()} />, editar);
    await userEvent.click(screen.getByRole('button', { name: /Agregar etapa/ }));
    expect(await screen.findByText('Nueva etapa')).toBeInTheDocument();
  });
});

describe('CronogramaGestion', () => {
  it('vacío con botón de gestión por permiso', async () => {
    const onGestionar = vi.fn();
    renderWithProviders(<CronogramaGestion periodos={[]} onGestionar={onGestionar} />, { auth: { permisos: [permiso('institucional.gestion.cronograma', 'LISTAR')] } });
    expect(screen.getByText('No hay actividades de calendario para la gestión vigente')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Gestionar/ }));
    expect(onGestionar).toHaveBeenCalled();
  });

  it('abre el periodo con la actividad vigente y lista las próximas fechas', () => {
    renderWithProviders(
      <CronogramaGestion
        proximas={[{ id: 1, rango: '10/03', nombre: 'Inscripciones', tipo: 'ACADEMICA', icono: 'CalendarOutlined' }]}
        periodos={[
          { periodoAcademicoId: 1, nombre: 'Primer bimestre', rango: '01/03 – 30/04', totalActividades: 1, actividades: [{ id: 5, nombre: 'Clases', tipo: 'ACADEMICA', estado: 'vigente', rango: '01/03', esDestacada: true }] },
          { periodoAcademicoId: 2, nombre: 'Segundo bimestre', rango: '01/05', totalActividades: 1, actividades: [{ id: 6, nombre: 'Exámenes', tipo: 'ACADEMICA', estado: 'futura', rango: '10/06' }] },
        ]}
      />,
    );
    expect(screen.getByText('Próximas fechas clave')).toBeInTheDocument();
    expect(screen.getByText('Periodo actual')).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Gestionar/ })).not.toBeInTheDocument();
  });
});

describe('CronogramaActividadSelectorModal', () => {
  const catalogo = [
    { id: 1, nombre: 'Inscripciones', tipo: 'ACADEMICA', icono: 'CalendarOutlined', esDestacada: true },
    { id: 2, nombre: 'Feriado nacional', tipo: 'FERIADO' },
  ];

  it('filtra por nombre, marca la seleccionada y las ya programadas', async () => {
    const onSelect = vi.fn();
    renderWithProviders(<CronogramaActividadSelectorModal open catalogo={catalogo} selectedId={2} usadas={new Map([[1, ['2026-03-10']]])} onSelect={onSelect} />);
    expect(screen.getByText('Seleccionada')).toBeInTheDocument();
    expect(screen.getByText(/Ya programada: /)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Buscar actividad por nombre o tipo…'), 'feriado');
    await waitFor(() => expect(screen.queryByText('Inscripciones')).not.toBeInTheDocument());
    await userEvent.click(screen.getByText('Feriado nacional'));
    expect(onSelect).toHaveBeenCalledWith(catalogo[1]);
  });

  it('no usa props obsoletas de AntD 6 (Space direction)', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithProviders(<CronogramaActividadSelectorModal open catalogo={catalogo} />);
    expect(screen.getByText('Inscripciones')).toBeInTheDocument();
    const avisosAntd = error.mock.calls.map((c) => String(c[0])).filter((m) => m.includes('[antd: Space]'));
    error.mockRestore();
    expect(avisosAntd).toEqual([]);
  });

  it('catálogo vacío y alta deshabilitada sin callback', () => {
    renderWithProviders(<CronogramaActividadSelectorModal open catalogo={[]} />);
    expect(screen.getByText('Sin actividades en el catálogo')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Nueva actividad/ })).toBeDisabled();
  });
});

describe('CronogramaActividadFormSections', () => {
  const Montar = (props) => {
    const [form] = Form.useForm();
    return (
      <Form form={form}>
        <CronogramaActividadFormSections
          periodos={[{ periodoAcademicoId: 1, nombre: 'Primer bimestre' }]}
          onOpenSelector={vi.fn()}
          onClearActividad={vi.fn()}
          onToggleSobrescribir={vi.fn()}
          onToggleEventoUnDia={vi.fn()}
          eventoUnDia={false}
          {...props}
        />
      </Form>
    );
  };

  it('sin actividad el nombre no se puede personalizar y pide fecha de fin si no es de un día', () => {
    renderWithProviders(<Montar actividadId={null} />);
    expect(screen.getByText('Seleccione una actividad para poder personalizar su nombre')).toBeInTheDocument();
    expect(screen.getByText('Fecha de fin')).toBeInTheDocument();
    expect(screen.getByText('No, tiene fecha de fin')).toBeInTheDocument();
  });

  it('evento de un día oculta la fecha de fin; con actividad y sobrescritura pide nombre', () => {
    const { unmount } = renderWithProviders(<Montar eventoUnDia />);
    expect(screen.queryByText('Fecha de fin')).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<Montar actividadId={4} sobrescribirNombre selectedActividad={{ nombre: 'Inscripciones' }} />);
    expect(screen.getByText('Nombre personalizado')).toBeInTheDocument();
  });
});

describe('columnas del cronograma', () => {
  const c = () => ({ navigate: vi.fn(), onVer: vi.fn(), onEditar: vi.fn(), eliminar: vi.fn(), refetch: vi.fn() });
  const act = { id: 3, nombre: 'Inscripciones', codigo: 'INS', tipo: 'ACADEMICA', periodoNombre: 'Primer bimestre', periodoNumeroOrden: 1, fechaInicio: '2026-03-05', fechaFin: null, estado: 'vigente' };

  it('celdas, orden y acciones por permiso', async () => {
    const cols = createCronogramaTableColumns(c());
    const textos = Object.values(renderCells(cols, act)).join(' | ');
    expect(textos).toMatch(/INSCRIPCIONES/);
    expect(textos).toMatch(/Todo el día/);
    expect(cols[1].sortCompare({ periodoNumeroOrden: 2 }, { periodoNumeroOrden: 1 })).toBeGreaterThan(0);
    expect(cols[2].sortCompare({ nombre: 'A' }, { nombre: 'B' })).toBeLessThan(0);
    const handlers = c();
    const acciones = findColumn(createCronogramaTableColumns(handlers), 'acciones');
    const { unmount } = renderCell(acciones, act, { auth: { permisos: [permiso('institucional.gestion.cronograma', 'DETALLE', 'EDITAR')] } });
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(handlers.onVer).toHaveBeenCalledWith(act);
    expect(handlers.onEditar).toHaveBeenCalledWith(act);
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
    unmount();
  });
});

describe('GestionActualPage', () => {
  const estado = (extra = {}) => ({
    pageTitle: 'Gestión actual', breadcrumbItems: bc, loading: false, error: null, iniciada: true,
    gestionVigente: { nombre: 'Gestión 2026', anio: 2026, codigo: 'G-26' }, kpis: { matriculasCursando: 10, totalCursos: 4, totalDocentes: 3, bimestreVigente: 1 },
    cronograma: [], proximasActividades: [], timeline: [], estadoLabel: 'En curso', estadoColor: 'processing',
    goToCronograma: vi.fn(), goToControl: vi.fn(), ...extra,
  });

  it('cargando, error, sin gestión y con gestión', () => {
    mocks.gestion.mockReturnValue(estado({ loading: true }));
    const { unmount } = renderWithProviders(<GestionActualPage />);
    expect(screen.getByText('Cargando gestión vigente…')).toBeInTheDocument();
    unmount();
    mocks.gestion.mockReturnValue(estado({ error: 'Falla' }));
    const { unmount: u2 } = renderWithProviders(<GestionActualPage />);
    expect(screen.getByText('Error al cargar la gestión actual')).toBeInTheDocument();
    u2();
    mocks.gestion.mockReturnValue(estado({ gestionVigente: null }));
    const { unmount: u3 } = renderWithProviders(<GestionActualPage />);
    expect(screen.getByText('No hay una gestión vigente configurada')).toBeInTheDocument();
    u3();
    mocks.gestion.mockReturnValue(estado());
    renderWithProviders(<GestionActualPage />);
    expect(screen.getByText('Gestión 2026 (2026)')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});

describe('ControlBimestresPage', () => {
  const estado = (extra = {}) => ({
    pageTitle: 'Control de bimestres', breadcrumbItems: bc, goToPanel: vi.fn(), gestion: { nombre: 'Gestión 2026' }, estadoColor: 'processing', estadoLabel: 'En curso', loading: false,
    periodos: [{ id: 1, nombre: 'Primer bimestre', division: 'BIMESTRE', fechaInicio: '2026-03-01', fechaFin: '2026-04-30' }], anioCalendario: 2026,
    iniciada: true, fase: {}, iniciando: false, handleIniciarGestion: vi.fn(), dirtyCount: 0, guardando: false, creando: false, setRangoPeriodo: vi.fn(), guardarFechas: vi.fn(), crearEtapa: vi.fn(), eliminarEtapa: vi.fn(),
    bimestresApertura: [], validacionPorBimestre: {}, bimestreEnAccion: null, cerrando: false, abriendo: false, handleValidarCierre: vi.fn(), handleAbrirBimestre: vi.fn(), handleCerrarBimestre: vi.fn(), ...extra,
  });

  it('muestra calendario, panel de fechas y apertura de bimestres; volver', async () => {
    const s = estado();
    mocks.control.mockReturnValue(s);
    renderWithProviders(<ControlBimestresPage />, editar);
    expect(screen.getByText('Configuración de bimestres — Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText('Apertura y cierre de bimestres')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Volver/ }));
    expect(s.goToPanel).toHaveBeenCalled();
  });

  it('cargando oculta la apertura', () => {
    mocks.control.mockReturnValue(estado({ loading: true }));
    renderWithProviders(<ControlBimestresPage />);
    expect(screen.getByText('Cargando configuración de la gestión…')).toBeInTheDocument();
    expect(screen.queryByText('Apertura y cierre de bimestres')).not.toBeInTheDocument();
  });
});

describe('CronogramaAdminPage', () => {
  const acts = [
    { id: 1, nombre: 'Inscripciones', tipo: 'ACADEMICA', periodoNombre: 'Primer bimestre', fechaInicio: '2026-03-05' },
    { id: 2, nombre: 'Examen final', tipo: 'EVALUACION', periodoNombre: 'Segundo bimestre', fechaInicio: '2026-06-05' },
  ];
  const estado = (extra = {}) => ({ pageTitle: 'Cronograma', breadcrumbItems: bc, actividades: acts, loading: false, error: null, gestion: { nombre: 'Gestión 2026' }, goToDetalle: vi.fn(), goToEditar: vi.fn(), eliminar: vi.fn(), refetch: vi.fn(), goToNueva: vi.fn(), goToPanel: vi.fn(), ...extra });

  it('filtra por texto en etapa o actividad y la alta exige CREAR', async () => {
    const s = estado();
    mocks.admin.mockReturnValue(s);
    const { unmount } = renderWithProviders(<CronogramaAdminPage />);
    expect(screen.queryByRole('button', { name: /Nueva actividad/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<CronogramaAdminPage />, { auth: { permisos: [permiso('institucional.gestion.cronograma', 'CREAR')] } });
    expect(screen.getByText('Cronograma — Gestión 2026')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Buscar por actividad, etapa, código o tipo…'), 'segundo');
    await waitFor(() => expect(screen.queryByText('INSCRIPCIONES')).not.toBeInTheDocument());
    expect(screen.getByText('EXAMEN FINAL')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Nueva actividad/ }));
    expect(s.goToNueva).toHaveBeenCalled();
  });
});

describe('páginas de actividad del cronograma', () => {
  beforeEach(() => { mocks.detalle.mockReset(); mocks.form.mockReset(); });

  it('detalle: datos y origen del nombre; error', () => {
    mocks.detalle.mockReturnValue({ pageTitle: 'Detalle', breadcrumbItems: bc, loading: false, error: null, handleVolver: vi.fn(), goToEditar: vi.fn(), actividad: { nombre: 'Inscripciones', codigo: 'INS', tipo: 'ACADEMICA', estado: 'vigente', periodoNombre: 'Primer bimestre', nombrePersonalizado: true, catalogoNombre: 'Catálogo', esDestacada: true, fechaInicio: '2026-03-05' } });
    const { unmount } = renderWithProviders(<CronogramaActividadDetailPage />, { auth: { permisos: [permiso('institucional.gestion.cronograma', 'EDITAR')] } });
    expect(screen.getByText('Personalizado (catálogo: Catálogo)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar/ })).toBeInTheDocument();
    unmount();
    mocks.detalle.mockReturnValue({ pageTitle: 'Detalle', breadcrumbItems: bc, loading: false, error: 'No existe', handleVolver: vi.fn(), goToEditar: vi.fn(), actividad: null });
    renderWithProviders(<CronogramaActividadDetailPage />);
    expect(screen.getByText('No existe')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
  });

  it('formulario: botón según modo y permiso', async () => {
    const Montar = ({ isEdit }) => {
      const [form] = Form.useForm();
      mocks.form.mockReturnValue({ form, pageTitle: 'Actividad', breadcrumbItems: bc, handleVolver: vi.fn(), permisoAccion: isEdit ? 'EDITAR' : 'CREAR', isEdit, saving: false, loading: false, error: null, periodos: [], actividadId: null, selectedActividad: null, openSelector: vi.fn(), closeSelector: vi.fn(), handleClearActividad: vi.fn(), sobrescribirNombre: false, toggleSobrescribir: vi.fn(), eventoUnDia: false, toggleEventoUnDia: vi.fn(), modalOpen: false, catalogo: [], actividadesUsadas: new Map(), handleSelectActividad: vi.fn(), handleSubmit: vi.fn() });
      return <CronogramaActividadFormPage />;
    };
    const { unmount } = renderWithProviders(<Montar isEdit={false} />, { auth: { permisos: [permiso('institucional.gestion.cronograma', 'CREAR')] } });
    expect(screen.getByRole('button', { name: 'Crear actividad' })).toBeInTheDocument();
    unmount();
    renderWithProviders(<Montar isEdit />, { auth: { permisos: [permiso('institucional.gestion.cronograma', 'CREAR')] } });
    expect(screen.queryByRole('button', { name: 'Guardar cambios' })).not.toBeInTheDocument();
  });
});
