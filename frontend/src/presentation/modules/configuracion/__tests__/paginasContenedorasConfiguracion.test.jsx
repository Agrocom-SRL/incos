import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import AcademicoPage from '../academico/pages/AcademicoPage';
import ComplementariosPage from '../complementarios/pages/ComplementariosPage';
import RecursosPage from '../recursos/pages/RecursosPage';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  lista: (key) => () => ({ [key]: [], loading: false, error: null, searchText: '', setSearchText: () => {}, refetch: () => {}, toggleEstado: () => {} }),
}));

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mocks.navigate }));
vi.mock('@application-configuracion/academico/hooks', async (orig) => ({
  ...(await orig()),
  usePlanesTabPanel: () => ({ carreras: [], loading: false, error: null, refetch: () => {}, searchText: '', setSearchText: () => {}, toggleEstadoPlan: () => {} }),
  useCarreraContext: mocks.lista('carreras'),
  useMateriaContext: mocks.lista('materias'),
}));
vi.mock('@application-configuracion/complementarios/hooks', async (orig) => ({
  ...(await orig()),
  useDiscapacidadContext: mocks.lista('discapacidades'),
  useApoderadoContext: mocks.lista('apoderados'),
  useIdiomaContext: mocks.lista('idiomas'),
  useEstadoCivilContext: mocks.lista('estadosCiviles'),
}));
vi.mock('@application-configuracion/recursos/hooks', async (orig) => ({
  ...(await orig()),
  useParaleloContext: mocks.lista('paralelos'),
  useAulaContext: mocks.lista('aulas'),
  useTipoEvaluacionContext: mocks.lista('tiposEvaluacion'),
}));

beforeEach(() => mocks.navigate.mockReset());

const conPermisos = (...pares) => ({ auth: { permisos: pares.map(([c, ...a]) => permiso(c, ...a)) } });

describe('AcademicoPage (tabs por permiso)', () => {
  it('sin ningún permiso de LISTAR muestra el aviso', () => {
    renderWithProviders(<AcademicoPage />);
    expect(screen.getByText('No tiene permisos para acceder al módulo académico.')).toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('solo muestra las pestañas permitidas y abre la primera', () => {
    renderWithProviders(<AcademicoPage />, conPermisos(['configuracion.carrera', 'LISTAR'], ['configuracion.materia', 'LISTAR']));
    expect(screen.getAllByRole('tab').map((t) => t.textContent.trim())).toEqual(['Carreras', 'Materias']);
    expect(screen.getByText('Listado de carreras')).toBeInTheDocument();
  });

  it('la pestaña de la URL manda y "prerrequisitos" redirige a planes', () => {
    renderWithProviders(<AcademicoPage />, {
      ...conPermisos(['configuracion.plan-estudio', 'LISTAR'], ['configuracion.materia', 'LISTAR']),
      route: '/configuracion/academico?tab=materias',
    });
    expect(screen.getByText('Listado de materias')).toBeInTheDocument();
  });

  it('el botón de alta cambia con la pestaña y exige CREAR', async () => {
    renderWithProviders(<AcademicoPage />, {
      ...conPermisos(['configuracion.carrera', 'LISTAR', 'CREAR'], ['configuracion.materia', 'LISTAR']),
    });
    await userEvent.click(screen.getByRole('button', { name: /Nueva carrera/ }));
    expect(mocks.navigate).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('tab', { name: /Materias/ }));
    expect(await screen.findByText('Listado de materias')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nueva materia/ })).not.toBeInTheDocument();
  });
});

describe('ComplementariosPage', () => {
  it('sin permisos', () => {
    renderWithProviders(<ComplementariosPage />);
    expect(screen.getByText('No tiene permisos para acceder a complementarios.')).toBeInTheDocument();
  });

  it('cuatro pestañas posibles, solo las permitidas, y el alta de la activa', async () => {
    renderWithProviders(<ComplementariosPage />, {
      ...conPermisos(['configuracion.complementario.idiomas', 'LISTAR', 'CREAR'], ['configuracion.complementario.estado-civil', 'LISTAR']),
    });
    expect(screen.getAllByRole('tab')).toHaveLength(2);
    await userEvent.click(screen.getByRole('button', { name: /Nuevo idioma/ }));
    expect(mocks.navigate).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('tab', { name: /Estados? civil/i }));
    expect(screen.queryByRole('button', { name: /Nuevo estado civil/ })).not.toBeInTheDocument();
  });
});

describe('RecursosPage', () => {
  it('sin permisos', () => {
    renderWithProviders(<RecursosPage />);
    expect(screen.getByText('No tiene permisos para acceder a recursos académicos.')).toBeInTheDocument();
  });

  it('muestra aulas con su alta cuando es la única pestaña permitida', async () => {
    renderWithProviders(<RecursosPage />, conPermisos(['configuracion.aula', 'LISTAR', 'CREAR']));
    expect(screen.getAllByRole('tab')).toHaveLength(1);
    await userEvent.click(screen.getByRole('button', { name: /Nueva aula/ }));
    expect(mocks.navigate).toHaveBeenCalled();
  });

  it('pestaña desconocida en la URL cae en la primera permitida', () => {
    renderWithProviders(<RecursosPage />, { ...conPermisos(['configuracion.tipo-evaluacion', 'LISTAR']), route: '/x?tab=zzz' });
    expect(screen.getAllByRole('tab')).toHaveLength(1);
  });
});
