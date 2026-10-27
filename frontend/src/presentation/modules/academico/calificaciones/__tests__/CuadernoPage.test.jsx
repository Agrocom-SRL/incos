/**
 * CuadernoPage: grilla de notas del bimestre, guardado en lote, RBAC de acciones y cierre de bimestre.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from 'antd';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';

const mocks = vi.hoisted(() => ({
  cuaderno: vi.fn(),
  politica: vi.fn(),
  navegacion: vi.fn(),
  teclado: vi.fn(),
  viewMode: vi.fn(),
  guardarNotas: vi.fn(),
  cerrarBimestre: vi.fn(),
  drawerProps: vi.fn(),
}));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@application-academico/calificaciones/hooks/useCuadernoCurso.js', () => ({
  useCuadernoCurso: mocks.cuaderno,
}));
vi.mock('@application-academico/calificaciones/hooks/usePoliticaInstitucional.js', () => ({
  usePoliticaInstitucional: mocks.politica,
}));
vi.mock('@application-academico/calificaciones/hooks/useNavegacionBimestres.js', () => ({
  useNavegacionBimestres: () => mocks.navegacion(),
}));
vi.mock('@application-academico/calificaciones/hooks/useBimestrePagerTeclado.js', () => ({
  useBimestrePagerTeclado: (a) => mocks.teclado(a),
}));
vi.mock('@application-academico/calificaciones/hooks/useTiposEvaluacion.js', () => ({
  useTiposEvaluacion: () => ({ tipos: [], isLoading: false }),
}));
vi.mock('@navigation/hooks/useRouteViewMode.js', () => ({ useRouteViewMode: () => mocks.viewMode() }));
vi.mock('@infrastructure/repositories/CalificacionRepository.js', () => ({
  default: {
    guardarNotasCuadernoBimestre: (...a) => mocks.guardarNotas(...a),
    cerrarBimestreCurso: (...a) => mocks.cerrarBimestre(...a),
  },
}));
vi.mock('../components/EvaluacionDrawer.jsx', () => ({
  default: (props) => {
    mocks.drawerProps(props);
    return (
      <div data-testid="drawer-evaluacion">
        <span>{props.modo}</span>
        <button type="button" onClick={() => props.onGuardado({ id: 99 }, { recalcular: true })}>
          simular guardado
        </button>
        <button type="button" onClick={props.onCerrar}>
          cerrar drawer
        </button>
      </div>
    );
  },
}));

import CuadernoPage from '../pages/CuadernoPage.jsx';
import CuadernoConnector from '../connectors/CuadernoConnector.jsx';

const evaluaciones = [
  { id: 10, nombre: 'Parcial 1', puntos: 20, componente: 'TEORICO' },
  { id: 11, nombre: 'Taller', puntos: 30, componente: 'PRACTICO' },
];

const estado = (extra = {}) => ({
  curso: { materia: 'Matemática', carrera: 'Sistemas', paralelo: 'A' },
  docente: { nombre: 'Ana', gestionVigente: '2026' },
  evaluaciones,
  estudiantes: [
    { id: 1, nro: 1, nombre: 'PEREZ JUAN', codigo: 'E-1', notas: { 10: 15 } },
    { id: 2, nro: 2, nombre: 'ROJAS ANA', codigo: 'E-2', notas: { 10: 8, 11: 20 } },
  ],
  bimestreActivo: 2,
  bimestreVigente: 2,
  bimestreTitulo: 'Bimestre 2',
  periodoBimestreActivo: { fechaInicio: '2026-04-01', fechaFin: '2026-06-01' },
  gestionFechaFin: '2026-11-30',
  reabierto: false,
  modoEdicion: true,
  puedeCrearEvaluacion: true,
  puedeEditarEvaluacion: true,
  puedeEliminarEvaluacion: true,
  puedeEditarNotas: true,
  puedeGuardarBimestre: true,
  isLoading: false,
  isRefetching: false,
  error: null,
  refetch: vi.fn(),
  breadcrumbItems: [{ title: 'Calificaciones' }],
  tituloPagina: 'Cuaderno de notas',
  cursoId: 9,
  volverPath: '/registro',
  esVistaCoordinacion: false,
  bimestresCalendario: [],
  crearEvaluacion: vi.fn(),
  editarEvaluacion: vi.fn(),
  eliminarEvaluacion: vi.fn().mockResolvedValue(undefined),
  resetearNotasEvaluacion: vi.fn().mockResolvedValue(undefined),
  ...extra,
});

const matchMediaOriginal = window.matchMedia;
beforeEach(() => {
  navigate.mockClear();
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.politica.mockReturnValue({ politica: { cuotaTeorico: 30, cuotaPractico: 70 } });
  mocks.viewMode.mockReturnValue({ contextName: null });
  mocks.navegacion.mockReturnValue({
    puedeAnterior: true,
    puedeSiguiente: true,
    irAnterior: vi.fn(),
    irSiguiente: vi.fn(),
  });
  window.matchMedia = (query) => ({
    matches: true,
    media: query,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});
afterEach(() => {
  window.matchMedia = matchMediaOriginal;
  Modal.destroyAll();
});

const editar = (etiqueta, valor) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: String(valor) } });

describe('CuadernoPage', () => {
  it('muestra título, contexto, grilla y pie sin cambios', () => {
    mocks.cuaderno.mockReturnValue(estado());
    renderWithProviders(<CuadernoPage />);
    expect(screen.getByText('Cuaderno de notas')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Datos del curso y bimestre' })).toBeInTheDocument();
    expect(screen.getByText('Vigente · En edición')).toBeInTheDocument();
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
    expect(screen.getByLabelText('15 de 20 puntos')).toBeInTheDocument();
    expect(screen.getByText('Sin cambios pendientes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar notas/ })).not.toBeInTheDocument();
    expect(mocks.teclado).toHaveBeenCalledWith(expect.objectContaining({ habilitado: true }));
  });

  it('editar una nota marca cambios pendientes y ofrece Guardar notas', async () => {
    mocks.cuaderno.mockReturnValue(estado());
    renderWithProviders(<CuadernoPage />);
    editar('15 de 20 puntos', 17);
    expect(await screen.findByText(/1 cambio sin guardar/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Guardar notas/ })).toBeInTheDocument();
  });

  it('guarda solo las notas modificadas, recalcula y refresca', async () => {
    const s = estado();
    mocks.cuaderno.mockReturnValue(s);
    mocks.guardarNotas.mockResolvedValue({
      success: true,
      data: { notasGuardadas: 1, notas: [{ estudianteId: 1, evaluacionId: 10, nota: 17 }] },
    });
    renderWithProviders(<CuadernoPage />);
    editar('15 de 20 puntos', 17);
    await userEvent.click(await screen.findByRole('button', { name: /Guardar notas/ }));
    await waitFor(() => expect(mocks.guardarNotas).toHaveBeenCalled());
    expect(mocks.guardarNotas).toHaveBeenCalledWith(9, 2, [{ estudianteId: 1, evaluacionId: 10, nota: 17 }]);
    expect(await screen.findByText('Notas guardadas')).toBeInTheDocument();
    expect(screen.getByText(/Se guardaron 1 nota\(s\)/)).toBeInTheDocument();
    expect(s.refetch).toHaveBeenCalled();
    expect(await screen.findByText(/Notas guardadas · hace/)).toBeInTheDocument();
  });

  it('notas que superan el máximo no se envían', async () => {
    mocks.cuaderno.mockReturnValue(estado());
    renderWithProviders(<CuadernoPage />);
    editar('15 de 20 puntos', 50);
    await userEvent.click(await screen.findByRole('button', { name: /Guardar notas/ }));
    expect(await screen.findByText('Notas fuera de rango')).toBeInTheDocument();
    expect(mocks.guardarNotas).not.toHaveBeenCalled();
  });

  it('un fallo del servicio se notifica y conserva los cambios', async () => {
    mocks.cuaderno.mockReturnValue(estado());
    mocks.guardarNotas.mockResolvedValue({ success: false, error: 'Bimestre cerrado' });
    renderWithProviders(<CuadernoPage />);
    editar('15 de 20 puntos', 17);
    await userEvent.click(await screen.findByRole('button', { name: /Guardar notas/ }));
    expect(await screen.findByText('Error al guardar')).toBeInTheDocument();
    expect(screen.getByText('Bimestre cerrado')).toBeInTheDocument();
    expect(screen.getByText(/1 cambio sin guardar/)).toBeInTheDocument();
  });

  it('RBAC: sin permisos de columna ni de notas la grilla es solo lectura', () => {
    mocks.cuaderno.mockReturnValue(
      estado({
        puedeCrearEvaluacion: false,
        puedeEditarEvaluacion: false,
        puedeEliminarEvaluacion: false,
        puedeEditarNotas: false,
        puedeGuardarBimestre: false,
        modoEdicion: false,
      }),
    );
    renderWithProviders(<CuadernoPage />);
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Agregar actividad' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Opciones de/ })).not.toBeInTheDocument();
    expect(screen.getByText('Vigente · Solo lectura')).toBeInTheDocument();
  });

  it('buscar filtra estudiantes', async () => {
    mocks.cuaderno.mockReturnValue(estado());
    renderWithProviders(<CuadernoPage />);
    await userEvent.type(screen.getByLabelText('Buscar estudiante'), 'E-2');
    expect(screen.queryByText('PEREZ JUAN')).not.toBeInTheDocument();
    expect(screen.getByText('ROJAS ANA')).toBeInTheDocument();
  });

  it('agregar actividad abre el drawer de creación y un guardado de asistencia recarga', async () => {
    const s = estado();
    mocks.cuaderno.mockReturnValue(s);
    renderWithProviders(<CuadernoPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Agregar actividad' }));
    const drawer = await screen.findByTestId('drawer-evaluacion');
    expect(within(drawer).getByText('crear')).toBeInTheDocument();
    expect(mocks.drawerProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursoId: 9, bimestre: 2, cuotaTeorico: 30, cuotaPractico: 70 }),
    );
    await userEvent.click(within(drawer).getByText('simular guardado'));
    expect(s.refetch).toHaveBeenCalled();
    await userEvent.click(within(drawer).getByText('cerrar drawer'));
    expect(screen.queryByTestId('drawer-evaluacion')).not.toBeInTheDocument();
  });

  it('editar actividad abre el drawer en modo editar', async () => {
    mocks.cuaderno.mockReturnValue(estado());
    renderWithProviders(<CuadernoPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones de Parcial 1' }));
    await userEvent.click(await screen.findByText('Editar actividad'));
    const drawer = await screen.findByTestId('drawer-evaluacion');
    expect(within(drawer).getByText('editar')).toBeInTheDocument();
    expect(mocks.drawerProps.mock.calls.at(-1)[0].evaluacion).toEqual(evaluaciones[0]);
  });

  it('restablecer notas confirma con el conteo y delega en el hook', async () => {
    const s = estado();
    mocks.cuaderno.mockReturnValue(s);
    renderWithProviders(<CuadernoPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones de Parcial 1' }));
    await userEvent.click(await screen.findByText('Restablecer notas'));
    expect(await screen.findByText(/Se recalcularán los componentes del bimestre/)).toBeInTheDocument();
    const botones = [...document.querySelectorAll('.ant-modal-confirm-btns')].at(-1);
    await userEvent.click(within(botones).getByRole('button', { name: 'Restablecer' }));
    await waitFor(() => expect(s.resetearNotasEvaluacion).toHaveBeenCalledWith(10));
  });

  it('eliminar actividad confirma y la quita del cuaderno', async () => {
    const s = estado();
    mocks.cuaderno.mockReturnValue(s);
    renderWithProviders(<CuadernoPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Opciones de Taller' }));
    await userEvent.click(await screen.findByText('Eliminar actividad', { selector: '.ant-dropdown-menu-title-content' }));
    expect(await screen.findByText(/Esta acción no se puede deshacer/)).toBeInTheDocument();
    const botones = [...document.querySelectorAll('.ant-modal-confirm-btns')].at(-1);
    await userEvent.click(within(botones).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(s.eliminarEvaluacion).toHaveBeenCalledWith(11), { timeout: 2000 });
  });

  it('RBAC: cerrar y consolidar solo en bimestre reabierto con EDITAR de ajuste admin', async () => {
    mocks.cuaderno.mockReturnValue(estado({ reabierto: true }));
    const a = renderWithProviders(<CuadernoPage />);
    expect(screen.queryByRole('button', { name: /Cerrar y consolidar bimestre/ })).not.toBeInTheDocument();
    a.unmount();

    mocks.cuaderno.mockReturnValue(estado({ reabierto: false }));
    const b = renderWithProviders(<CuadernoPage />, {
      auth: { permisos: [permiso('academico.calificacion.bimestre.ajuste_admin', 'EDITAR')] },
    });
    expect(screen.queryByRole('button', { name: /Cerrar y consolidar bimestre/ })).not.toBeInTheDocument();
    b.unmount();

    mocks.cuaderno.mockReturnValue(estado({ reabierto: true }));
    mocks.cerrarBimestre.mockResolvedValue({ success: true });
    renderWithProviders(<CuadernoPage />, {
      auth: { permisos: [permiso('academico.calificacion.bimestre.ajuste_admin', 'EDITAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: /Cerrar y consolidar bimestre/ }));
    const botones = [...(await waitFor(() => document.querySelectorAll('.ant-modal-confirm-btns')))].at(-1);
    await userEvent.click(within(botones).getByRole('button', { name: 'Cerrar bimestre' }));
    await waitFor(() => expect(mocks.cerrarBimestre).toHaveBeenCalledWith(9, 2));
    expect(await screen.findByText('Bimestre cerrado')).toBeInTheDocument();
    expect(navigate).toHaveBeenCalledWith('/registro');
  });

  it('un fallo al cerrar el bimestre se notifica y no navega', async () => {
    mocks.cuaderno.mockReturnValue(estado({ reabierto: true }));
    mocks.cerrarBimestre.mockResolvedValue({ success: false, error: 'Faltan notas' });
    renderWithProviders(<CuadernoPage />, {
      auth: { permisos: [permiso('academico.calificacion.bimestre.ajuste_admin', 'EDITAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: /Cerrar y consolidar bimestre/ }));
    const botones = [...(await waitFor(() => document.querySelectorAll('.ant-modal-confirm-btns')))].at(-1);
    await userEvent.click(within(botones).getByRole('button', { name: 'Cerrar bimestre' }));
    expect(await screen.findByText('No se pudo cerrar el bimestre')).toBeInTheDocument();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('volver usa la ruta del hook', async () => {
    mocks.cuaderno.mockReturnValue(estado());
    renderWithProviders(<CuadernoPage />);
    await userEvent.click(screen.getByRole('button', { name: 'Volver al registro académico' }));
    expect(navigate).toHaveBeenCalledWith('/registro');
  });

  it('carga inicial: skeleton; error sin datos: reintento', async () => {
    mocks.cuaderno.mockReturnValue(estado({ estudiantes: [], isLoading: true }));
    const a = renderWithProviders(<CuadernoPage />);
    expect(screen.getByLabelText('Cargando cuaderno')).toBeInTheDocument();
    expect(mocks.teclado).toHaveBeenLastCalledWith(expect.objectContaining({ habilitado: false }));
    a.unmount();
    const s = estado({ estudiantes: [], error: 'Falla' });
    mocks.cuaderno.mockReturnValue(s);
    renderWithProviders(<CuadernoPage />);
    expect(screen.getByText('No se pudo cargar el cuaderno')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(s.refetch).toHaveBeenCalled();
  });

  it('error al refrescar con datos no oculta la grilla', () => {
    mocks.cuaderno.mockReturnValue(estado({ error: 'Se perdió la conexión' }));
    renderWithProviders(<CuadernoPage />);
    expect(screen.getByText('Error al actualizar el cuaderno')).toBeInTheDocument();
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
  });

  it('vista coordinación muestra al docente consultado', () => {
    mocks.viewMode.mockReturnValue({ contextName: 'Luis Rojas' });
    mocks.cuaderno.mockReturnValue(estado({ esVistaCoordinacion: true }));
    renderWithProviders(<CuadernoPage />);
    expect(screen.getByText('Luis Rojas (vista coordinación)')).toBeInTheDocument();
  });

  it('el conector monta la página', () => {
    mocks.cuaderno.mockReturnValue(estado({ estudiantes: [], isLoading: true }));
    renderWithProviders(<CuadernoConnector />);
    expect(screen.getByLabelText('Cargando cuaderno')).toBeInTheDocument();
  });
});
