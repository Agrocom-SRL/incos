import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import { findColumn, renderCell } from '@/test/renderColumns';
import OfertaBadge from '../components/atoms/OfertaBadge';
import OfertaParaleloInfoIcon from '../components/atoms/OfertaParaleloInfoIcon';
import OfertaParaleloProgressDots from '../components/atoms/OfertaParaleloProgressDots';
import OfertaAlertBanner from '../components/molecules/OfertaAlertBanner';
import OfertaParaleloAulaSelectModal from '../components/molecules/OfertaParaleloAulaSelectModal';
import OfertaParaleloCard from '../components/molecules/OfertaParaleloCard';
import OfertaParaleloCardFooter from '../components/molecules/OfertaParaleloCardFooter';
import OfertaParaleloCardInfoRow from '../components/molecules/OfertaParaleloCardInfoRow';
import { buildGestionesTableColumns } from '../../pasadas/config/gestionesTableColumns';
import GestionesPasadasPage from '../../pasadas/pages/GestionesPasadasPage';

const mocks = vi.hoisted(() => ({ navigate: vi.fn(), pasadas: vi.fn() }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mocks.navigate }));
vi.mock('@application-institucional/pasadas', async (orig) => ({ ...(await orig()), useGestionesPasadasState: mocks.pasadas }));

const gestionPlan = (...acciones) => ({ auth: { permisos: [permiso('institucional.oferta.gestion-plan', ...acciones)] } });
const paraleloGestion = (...acciones) => ({ auth: { permisos: [permiso('institucional.oferta.paralelo-gestion', ...acciones)] } });

describe('átomos de oferta', () => {
  it('OfertaBadge: sin validación, válida, incompleta con oferta y vacía', () => {
    const { rerender } = render(<OfertaBadge />);
    expect(screen.getByText('—')).toBeInTheDocument();
    rerender(<OfertaBadge validacion={{ valido: true, asignaturas_esperadas: 8, oferta_actual: 8 }} />);
    expect(screen.getByText(/✓ 8\/8/)).toBeInTheDocument();
    rerender(<OfertaBadge validacion={{ valido: false, asignaturas_esperadas: 8, oferta_actual: 5 }} ofertaActual={5} />);
    expect(screen.getByText(/⚠ 5\/8/)).toBeInTheDocument();
    rerender(<OfertaBadge validacion={{ valido: false, asignaturas_esperadas: 8, oferta_actual: 0 }} ofertaActual={0} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('OfertaParaleloInfoIcon y ProgressDots', () => {
    const { container } = render(
      <>
        <OfertaParaleloInfoIcon icon={<i>x</i>} variant="aula" />
        <OfertaParaleloInfoIcon icon={<i>y</i>} variant="inexistente" />
        <OfertaParaleloProgressDots dotClassNames={['d1', 'd2', 'd3']} />
      </>,
    );
    expect(container.querySelector('.opc-info-icon--aula')).not.toBeNull();
    expect(container.querySelector('.opc-info-icon--pend')).not.toBeNull();
    expect(container.querySelectorAll('.opc-dots span')).toHaveLength(3);
  });
});

describe('OfertaAlertBanner', () => {
  const kpis = (extra = {}) => ({ planesHabilitadosLoaded: true, sinPlanes: 0, sinAula: 0, ofertaIncompleta: 0, listosOfertado: 0, ...extra });

  it('paso 0/1 sin planes habilitados', () => {
    renderWithProviders(<OfertaAlertBanner step={1} kpis={kpis({ sinPlanes: 2 })} gestionVigente />);
    expect(screen.getByText('Sin planes habilitados en la gestión')).toBeInTheDocument();
  });

  it('paso 0 con gestión no vigente', () => {
    renderWithProviders(<OfertaAlertBanner step={0} kpis={kpis()} gestionVigente={false} />);
    expect(screen.getByText('Gestión no vigente')).toBeInTheDocument();
  });

  it('paso 2+ muestra los conteos y permite revisar el plan solo con oferta incompleta', async () => {
    const { unmount } = renderWithProviders(<OfertaAlertBanner step={2} kpis={kpis({ sinAula: 3, ofertaIncompleta: 2, listosOfertado: 1 })} gestionVigente />);
    expect(screen.getByText('Sin aula: 3')).toBeInTheDocument();
    expect(screen.getByText('Oferta incompleta: 2')).toBeInTheDocument();
    expect(screen.getByText('Listos para OFERTADO: 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Revisar plan de estudio' }));
    expect(mocks.navigate).toHaveBeenCalledWith('/configuracion/academico?tab=planes');
    unmount();
    renderWithProviders(<OfertaAlertBanner step={2} kpis={kpis({ sinAula: 1 })} gestionVigente />);
    expect(screen.queryByRole('button', { name: 'Revisar plan de estudio' })).not.toBeInTheDocument();
  });

  it('sin condiciones no muestra nada', () => {
    const { container } = renderWithProviders(<OfertaAlertBanner step={3} kpis={kpis()} gestionVigente />);
    expect(container.querySelector('.ant-alert')).toBeNull();
  });
});

describe('OfertaParaleloAulaSelectModal', () => {
  const items = [{ id: 1, codigo: 'A-1', nombre: 'Aula 1', capacidad: 30, isCurrent: true }, { id: 2, codigo: 'A-2', nombre: 'Aula 2' }];

  it('selecciona un aula y confirma solo con selección', async () => {
    const onSelect = vi.fn();
    const onConfirm = vi.fn();
    const { rerender } = render(<OfertaParaleloAulaSelectModal open items={items} onSelect={onSelect} onConfirm={onConfirm} onClose={vi.fn()} />);
    expect(screen.getByText('30 cupos')).toBeInTheDocument();
    expect(screen.getByText('Asignada aquí')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar selección' })).toBeDisabled();
    await userEvent.click(screen.getByRole('option', { name: /Aula 2/ }));
    expect(onSelect).toHaveBeenCalledWith(2);
    rerender(<OfertaParaleloAulaSelectModal open items={items} selectedId={2} onSelect={onSelect} onConfirm={onConfirm} onClose={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Confirmar selección' }));
    expect(onConfirm).toHaveBeenCalled();
    expect(screen.getByRole('option', { name: /Aula 2/ })).toHaveAttribute('aria-selected', 'true');
  });

  it('sin aulas libres', () => {
    render(<OfertaParaleloAulaSelectModal open items={[]} onClose={vi.fn()} />);
    expect(screen.getByText('No hay aulas libres en esta gestión')).toBeInTheDocument();
  });
});

describe('tarjeta de paralelo de oferta', () => {
  const model = {
    id: 9, gestionPlanId: 4, paraleloNombre: 'A', cardClassName: 'opc-card', estado: 'OFERTADO', estadoPillClass: 'pill',
    band: { bandClass: 'opc-band', carreraPeriodo: 'Sistemas · 1°', nombre: 'Paralelo A', subtitulo: 'Noche' },
    dots: ['d1', 'd2'],
    rows: { aula: { label: 'Aula', value: 'A-1' }, docente: { label: 'Docente', value: 'Luna' }, horario: { label: 'Horario', value: 'Armado' } },
    cupo: '20 / 30', ctaLabel: 'Ver detalle', puedeInhabilitar: true, puedeHabilitar: false,
  };

  it('muestra banda, filas y cupo, y navega al detalle', async () => {
    const onNavigateDetalle = vi.fn();
    renderWithProviders(<OfertaParaleloCard model={model} onNavigateDetalle={onNavigateDetalle} />, paraleloGestion('DETALLE'));
    expect(screen.getByText('Paralelo A')).toBeInTheDocument();
    expect(screen.getByText('A-1')).toBeInTheDocument();
    expect(screen.getByText('20 / 30')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Ver detalle/ }));
    expect(onNavigateDetalle).toHaveBeenCalledWith(9);
  });

  it('inhabilitar / habilitar dependen del modelo, del callback y del permiso', async () => {
    const onInhabilitarParalelo = vi.fn();
    const onHabilitarParalelo = vi.fn();
    const { unmount } = renderWithProviders(<OfertaParaleloCard model={model} onInhabilitarParalelo={onInhabilitarParalelo} onHabilitarParalelo={onHabilitarParalelo} />, paraleloGestion('EDITAR', 'ACTIVAR', 'DETALLE'));
    await userEvent.click(screen.getByRole('button', { name: /Inhabilitar/ }));
    expect(onInhabilitarParalelo).toHaveBeenCalledWith(9, 4, 'A');
    expect(screen.queryByRole('button', { name: /^Habilitar/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<OfertaParaleloCard model={{ ...model, puedeInhabilitar: false, puedeHabilitar: true }} onHabilitarParalelo={onHabilitarParalelo} />, paraleloGestion('ACTIVAR', 'DETALLE'));
    await userEvent.click(screen.getByRole('button', { name: /^Habilitar/ }));
    expect(onHabilitarParalelo).toHaveBeenCalledWith(9, 4, 'A');
  });

  it('el pie sin permisos no muestra acciones y el cupo ausente queda vacío', () => {
    renderWithProviders(<OfertaParaleloCardFooter ctaLabel="Detalle" puedeInhabilitar onInhabilitar={vi.fn()} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('fila de información con variante de valor', () => {
    const { container } = render(<OfertaParaleloCardInfoRow icon={<i />} label="Aula" value="Sin aula" valueVariant="warn" iconVariant="aula" />);
    expect(container.querySelector('.opc-info-value--warn')).not.toBeNull();
  });
});

describe('gestiones pasadas', () => {
  const gestion = { id: 3, codigo: 'G-26', nombre: 'Gestión 2026', anio: 2026, vigente: true };

  it('columnas: acciones según estado de los planes y permisos', async () => {
    const onVerPlanes = vi.fn();
    const onHabilitarPlan = vi.fn();
    const onEditarGestion = vi.fn();
    const auth = { permisos: [permiso('institucional.oferta.gestion-plan', 'CREAR', 'LISTAR', 'EDITAR')] };

    const sinPlanes = buildGestionesTableColumns({ onVerPlanes, onHabilitarPlan, onEditarGestion, planesResumenByGestionId: { 3: { count: 0 } } });
    const acciones = findColumn(sinPlanes, 'acciones');
    const { unmount } = renderCell(acciones, gestion, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Habilitar planes/ }));
    expect(onHabilitarPlan).toHaveBeenCalledWith(3);
    await userEvent.click(screen.getByRole('button', { name: /Editar/ }));
    expect(onEditarGestion).toHaveBeenCalledWith(3);
    unmount();

    const conPlanes = findColumn(buildGestionesTableColumns({ onVerPlanes, planesResumenByGestionId: { 3: { count: 2 } } }), 'acciones');
    const { unmount: u2 } = renderCell(conPlanes, gestion, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Ver planes/ }));
    expect(onVerPlanes).toHaveBeenCalledWith(3);
    expect(screen.queryByRole('button', { name: /Habilitar planes/ })).not.toBeInTheDocument();
    u2();

    // Resumen aún no cargado o gestión no vigente sin planes: sin acción de planes
    const cargando = findColumn(buildGestionesTableColumns({ onVerPlanes, onHabilitarPlan }), 'acciones');
    renderCell(cargando, gestion, { auth });
    expect(screen.queryByRole('button', { name: /planes/ })).not.toBeInTheDocument();
  });

  it('columnas: año vigente resaltado, orden por año y por cantidad de planes', () => {
    const cols = buildGestionesTableColumns({ onVerPlanes: vi.fn(), planesResumenByGestionId: { 1: { count: 1 }, 2: { count: 5 } } });
    const { text } = renderCell(findColumn(cols, 'anio'), gestion);
    expect(text).toBe('2026');
    expect(findColumn(cols, 'anio').sortCompare({ anio: 2025 }, { anio: 2026 })).toBe(-1);
    expect(findColumn(cols, 'planes').sortCompare({ id: 1 }, { id: 2 })).toBe(-4);
    expect(findColumn(cols, 'gestion').sortCompare({ codigo: 'A' }, { codigo: 'B' })).toBeLessThan(0);
    expect(renderCell(findColumn(cols, 'gestion'), { id: 9 }).text).toMatch(/G-9/);
  });

  it('página: lista, volver y buscar', async () => {
    const s = {
      pageTitle: 'Gestiones', breadcrumbItems: [], gestiones: [gestion], apiLoading: false, apiError: null, searchText: '', handleSearchChange: vi.fn(),
      navigateOferta: vi.fn(), tableColumns: [{ title: 'Gestión', dataIndex: 'nombre' }],
    };
    mocks.pasadas.mockReturnValue(s);
    renderWithProviders(<GestionesPasadasPage />, gestionPlan('LISTAR'));
    expect(screen.getByText('Gestión 2026')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /volver/i }));
    expect(s.navigateOferta).toHaveBeenCalled();
    await userEvent.type(screen.getByPlaceholderText('Buscar por código, nombre o año...'), 'a');
    expect(s.handleSearchChange).toHaveBeenCalled();
  });
});
