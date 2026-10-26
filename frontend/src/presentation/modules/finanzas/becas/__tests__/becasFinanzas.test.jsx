import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import BecaReglasCell from '../components/atoms/BecaReglasCell';
import { getPorcentajePill } from '../config/becaPorcentajePill';
import { createBecaDescuentoCatalogoColumns } from '../config/becaDescuentoCatalogoColumns';
import { BECA_DESCUENTO_PERMISO } from '../config/becaDescuentoPermisos';
import BecasDescuentosPage from '../pages/BecasDescuentosPage';
import BecaDescuentoDetailPage from '../pages/BecaDescuentoDetailPage';
import BecaDescuentoFormPage from '../pages/BecaDescuentoFormPage';

const mocks = vi.hoisted(() => ({ lista: vi.fn(), detalle: vi.fn(), form: vi.fn(), navigate: vi.fn() }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mocks.navigate }));
vi.mock('@application-finanzas/becas-descuentos/hooks/state/useBecaDescuentoListPage', () => ({ useBecaDescuentoListPage: mocks.lista }));
vi.mock('@application-finanzas/becas-descuentos/hooks/state/useBecaDescuentoDetallePage', () => ({ useBecaDescuentoDetallePage: mocks.detalle }));
vi.mock('@application-finanzas/becas-descuentos/hooks/state/useBecaDescuentoForm', () => ({ useBecaDescuentoForm: mocks.form }));

const beca = {
  id: 3,
  codigo: 'EXC',
  nombre: 'Excelencia',
  porcentaje: 60,
  descripcion: 'Por promedio',
  esAutomatica: true,
  promedioMinimo: 90,
  requiereDocumentacion: true,
  requiereAprobacionRector: true,
  cantidadAsignaciones: 4,
  activo: true,
};

describe('getPorcentajePill', () => {
  it('categoriza por tramos y devuelve null sin porcentaje', () => {
    expect(getPorcentajePill(null)).toBeNull();
    expect(getPorcentajePill(25).className).toContain('--default');
    expect(getPorcentajePill(50).className).toContain('--info');
    expect(getPorcentajePill(75).className).toContain('--warning');
    expect(getPorcentajePill(100)).toEqual({ label: '100%', className: 'cfg-materia-pill cfg-materia-pill--success' });
  });
});

describe('BecaReglasCell', () => {
  it('automática con promedio, documentación y aval', () => {
    renderWithProviders(<BecaReglasCell esAutomatica promedioMinimo={90} requiereDocumentacion requiereAprobacionRector />);
    expect(screen.getByText('Automática · promedio ≥ 90')).toBeInTheDocument();
    expect(screen.getByText('Requiere documentación')).toBeInTheDocument();
    expect(screen.getByText('Requiere aval de Rectorado')).toBeInTheDocument();
  });

  it('manual y automática sin promedio', () => {
    const { unmount } = renderWithProviders(<BecaReglasCell esAutomatica={false} />);
    expect(screen.getByText('Asignación manual')).toBeInTheDocument();
    unmount();
    renderWithProviders(<BecaReglasCell esAutomatica tipoAutomatica="MANUAL" />);
    expect(screen.getByText('Automática · MANUAL')).toBeInTheDocument();
  });
});

describe('createBecaDescuentoCatalogoColumns', () => {
  it('estado (toggle) solo si se entrega onToggleEstado', () => {
    expect(createBecaDescuentoCatalogoColumns({}).map((c) => c.title)).not.toContain('Estado');
    expect(createBecaDescuentoCatalogoColumns({ onToggleEstado: vi.fn() }).length).toBe(
      createBecaDescuentoCatalogoColumns({}).length + 1,
    );
  });

  it('ordena por nombre, porcentaje y asignaciones', () => {
    const cols = createBecaDescuentoCatalogoColumns({});
    const por = (key) => cols.find((c) => c.key === key);
    expect(por('identidad').sortCompare({ nombre: 'A' }, { nombre: 'B' })).toBeLessThan(0);
    expect(por('porcentaje').sortCompare({ porcentaje: 50 }, { porcentaje: null })).toBe(50);
    expect(por('asignaciones').sortCompare({ cantidadAsignaciones: '2' }, {})).toBe(2);
  });

  it('la celda de nombre y porcentaje muestra mayúsculas, pill y descripción', () => {
    const cols = createBecaDescuentoCatalogoColumns({});
    renderWithProviders(
      <>
        {cols[1].render(beca.nombre, beca)}
        {cols[2].render(beca.porcentaje, beca)}
        {cols[3].render(null, beca)}
      </>,
    );
    expect(screen.getByText('EXCELENCIA')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('acciones por permiso: ver/editar/eliminar', async () => {
    const onVer = vi.fn();
    const onEditar = vi.fn();
    const cols = createBecaDescuentoCatalogoColumns({ onVer, onEditar });
    const acciones = cols[cols.length - 1];
    const { unmount } = renderWithProviders(acciones.render(null, beca), {
      auth: { permisos: [permiso(BECA_DESCUENTO_PERMISO, 'DETALLE', 'EDITAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(onVer).toHaveBeenCalledWith(beca);
    expect(onEditar).toHaveBeenCalledWith(beca);
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(acciones.render(null, beca));
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

describe('BecasDescuentosPage', () => {
  const state = (extra = {}) => ({
    becasDescuentos: [beca],
    loading: false,
    error: null,
    refetch: vi.fn(),
    eliminar: vi.fn(),
    searchText: '',
    setSearchText: vi.fn(),
    toggleEstado: vi.fn(),
    breadcrumbItems: [{ title: 'Finanzas' }],
    ...extra,
  });
  beforeEach(() => mocks.navigate.mockReset());

  it('lista el catálogo y navega a la ficha', async () => {
    mocks.lista.mockReturnValue(state());
    renderWithProviders(<BecasDescuentosPage />, { auth: { permisos: [permiso(BECA_DESCUENTO_PERMISO, 'DETALLE')] } });
    expect(screen.getByText('EXCELENCIA')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'eye' }));
    expect(mocks.navigate).toHaveBeenCalledWith(expect.stringContaining('3'));
  });

  it('"Nueva beca" exige CREAR', async () => {
    mocks.lista.mockReturnValue(state());
    const { unmount } = renderWithProviders(<BecasDescuentosPage />);
    expect(screen.queryByRole('button', { name: /Nueva beca o descuento/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<BecasDescuentosPage />, { auth: { permisos: [permiso(BECA_DESCUENTO_PERMISO, 'CREAR')] } });
    await userEvent.click(screen.getByRole('button', { name: /Nueva beca o descuento/ }));
    expect(mocks.navigate).toHaveBeenCalled();
  });

  it('vacío y error', () => {
    mocks.lista.mockReturnValue(state({ becasDescuentos: [], error: 'Falla' }));
    renderWithProviders(<BecasDescuentosPage />);
    expect(screen.getByText(/Falla/)).toBeInTheDocument();
  });
});

describe('BecaDescuentoDetailPage', () => {
  const state = (extra = {}) => ({
    beca,
    loading: false,
    error: null,
    isInvalidId: false,
    avatarInitials: 'EX',
    breadcrumbItems: [{ title: 'Finanzas' }],
    eliminando: false,
    handleVolver: vi.fn(),
    handleEditar: vi.fn(),
    handleEliminar: vi.fn(),
    handleVerAsignaciones: vi.fn(),
    refetch: vi.fn(),
    ...extra,
  });

  it('id inválido', () => {
    mocks.detalle.mockReturnValue(state({ isInvalidId: true }));
    renderWithProviders(<BecaDescuentoDetailPage />);
    expect(screen.getByText('Identificador de beca o descuento inválido')).toBeInTheDocument();
  });

  it('ficha con reglas y estudiantes; acciones por permiso', async () => {
    const s = state();
    mocks.detalle.mockReturnValue(s);
    const permisos = [
      permiso(BECA_DESCUENTO_PERMISO, 'EDITAR', 'ELIMINAR'),
      permiso('matricula.beca.ver', 'LISTAR'),
    ];
    renderWithProviders(<BecaDescuentoDetailPage />, { auth: { permisos } });
    expect(screen.getByText('EXCELENCIA')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('Tipo de asignación automática')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver asignaciones/ }));
    expect(s.handleVerAsignaciones).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }));
    expect(s.handleEliminar).toHaveBeenCalled();
  });

  it('sin permisos no ofrece eliminar ni asignaciones', () => {
    mocks.detalle.mockReturnValue(state());
    renderWithProviders(<BecaDescuentoDetailPage />);
    expect(screen.queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Ver asignaciones/ })).not.toBeInTheDocument();
  });

  it('error con reintento y no encontrado', async () => {
    const s = state({ beca: null, error: 'Falla API' });
    mocks.detalle.mockReturnValue(s);
    const { unmount } = renderWithProviders(<BecaDescuentoDetailPage />);
    expect(screen.getByText(/Falla API/)).toBeInTheDocument();
    unmount();
    mocks.detalle.mockReturnValue(state({ beca: null }));
    renderWithProviders(<BecaDescuentoDetailPage />);
    expect(screen.getByText('No se encontró la beca o descuento solicitada')).toBeInTheDocument();
  });
});

describe('BecaDescuentoFormPage', () => {
  const Montar = ({ mode, ...props }) => {
    const [form] = Form.useForm();
    mocks.form.mockReturnValue({
      form,
      pageTitle: 'Nueva beca o descuento',
      breadcrumbItems: [{ title: 'Finanzas' }],
      permisoAccion: 'CREAR',
      loading: false,
      submitLoading: false,
      error: null,
      initialValues: {},
      formSections: {
        datosBeca: { title: 'Datos', description: 'Datos generales', fields: [{ name: 'nombre', label: 'Nombre', type: 'text' }] },
        reglasAplicacion: { title: 'Reglas', description: 'Reglas', fields: [{ name: 'codigo', label: 'Código', type: 'text' }] },
      },
      handleVolver: vi.fn(),
      handleSubmit: vi.fn(),
      isInvalidEditId: false,
      ...props,
    });
    return <BecaDescuentoFormPage mode={mode} />;
  };

  it('muestra ambas secciones y guarda solo con el permiso de la acción', async () => {
    const handleSubmit = vi.fn();
    const { unmount } = renderWithProviders(<Montar handleSubmit={handleSubmit} />, {
      auth: { permisos: [permiso(BECA_DESCUENTO_PERMISO, 'CREAR')] },
    });
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Código')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Guardar beca o descuento' }));
    expect(handleSubmit).toHaveBeenCalled();
    unmount();
    renderWithProviders(<Montar />);
    expect(screen.queryByRole('button', { name: 'Guardar beca o descuento' })).not.toBeInTheDocument();
  });

  it('id de edición inválido y error de carga', () => {
    const { unmount } = renderWithProviders(<Montar isInvalidEditId />);
    expect(screen.getByText('Identificador de beca o descuento inválido')).toBeInTheDocument();
    unmount();
    renderWithProviders(<Montar error="No se pudo cargar" />);
    expect(screen.getByText('No se pudo cargar')).toBeInTheDocument();
  });
});
