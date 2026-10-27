import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import { findColumn, renderCell, renderCells } from '@/test/renderColumns';
import DocenteAsignacionesColorSection from '../components/organisms/DocenteAsignacionesColorSection';
import DocenteAsignacionesResumenTable from '../components/organisms/DocenteAsignacionesResumenTable';
import OfertaDashboardKpiStrip from '../components/organisms/OfertaDashboardKpiStrip';
import OfertaDashboardQuickAccess from '../components/organisms/OfertaDashboardQuickAccess';
import OfertaGestionPlanTabPanel from '../components/organisms/OfertaGestionPlanTabPanel';
import OfertaKpiStrip from '../components/organisms/OfertaKpiStrip';
import OfertaParaleloDetalleCursosSection from '../components/organisms/OfertaParaleloDetalleCursosSection';
import OfertaParalelosCardsGrid from '../components/organisms/OfertaParalelosCardsGrid';
import OfertaSidebarResumen from '../components/organisms/OfertaSidebarResumen';
import OfertaStepGestionSection from '../components/organisms/OfertaStepGestionSection';
import OfertaStepPlanesSection from '../components/organisms/OfertaStepPlanesSection';
import { buildOfertaParaleloDetalleCursosColumns } from '../config/ofertaParaleloDetalleCursosColumns';
import { buildOfertaParalelosTableColumns } from '../config/ofertaParalelosTableColumns';
import { buildOfertaPlanesTableColumns } from '../config/ofertaPlanesTableColumns';
import { buildRenovarPlanesColumns, buildRenovarResumenColumns } from '../config/renovarOfertaTableColumns';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

describe('DocenteAsignacionesColorSection', () => {
  const Montar = ({ onSave }) => {
    const [form] = Form.useForm();
    return <DocenteAsignacionesColorSection form={form} onSave={onSave} />;
  };

  it('solo quien puede asignar (EDITAR) ve el guardado del color', async () => {
    const onSave = vi.fn();
    const { unmount } = renderWithProviders(<Montar onSave={onSave} />);
    expect(screen.queryByRole('button', { name: 'Guardar color' })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<Montar onSave={onSave} />, { auth: { permisos: [permiso('docentes.asignar', 'EDITAR')] } });
    await userEvent.click(screen.getByRole('button', { name: 'Guardar color' }));
    expect(onSave).toHaveBeenCalled();
  });
});

describe('DocenteAsignacionesResumenTable', () => {
  it('sin filas muestra el vacío', () => {
    render(<DocenteAsignacionesResumenTable tabla={{ filas: [] }} />);
    expect(screen.getByText('Sin asignaciones vigentes en la gestión actual')).toBeInTheDocument();
  });

  it('agrupa por carrera y muestra totales', () => {
    const tabla = {
      perfil: 'Docente',
      numeroItem: '1234',
      filas: [
        { codigo: 'MAT-101', asignatura: 'Álgebra', anio: 1, horasSemana: 4, horasMes: 16 },
        { codigo: 'MAT-102', asignatura: 'Cálculo', anio: 1, horasSemana: 4, horasMes: 16 },
      ],
      carreraGroups: [{ startIdx: 0, rowSpan: 2, carrera: 'Sistemas' }],
      totales: { horasSemana: 8, horasMes: 32 },
    };
    render(<DocenteAsignacionesResumenTable tabla={tabla} gestionLabel="2026" />);
    expect(screen.getByText('GESTIÓN 2026')).toBeInTheDocument();
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
    expect(screen.getByText('Álgebra')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
  });
});

describe('KPIs y accesos del dashboard de oferta', () => {
  it('OfertaDashboardKpiStrip', () => {
    render(<OfertaDashboardKpiStrip kpis={{ gestionesActivas: 2, planesHabilitados: 3, ofertados: 5, publicados: 1 }} />);
    ['Gestiones', 'Planes', 'OFERTADO', 'PUBLICADO'].forEach((t) => expect(screen.getAllByText(t).length).toBeGreaterThan(0));
  });

  it('OfertaDashboardQuickAccess: sin planes ofrece "Habilitar planes" y con planes lista el acceso por plan', async () => {
    const onHabilitarTodosPlanes = vi.fn();
    const onHabilitarPlanesVigentes = vi.fn();
    const onParalelosPlan = vi.fn();
    const auth = { permisos: [permiso('institucional.oferta.gestion-plan', 'CREAR', 'LISTAR')] };
    const { unmount } = renderWithProviders(<OfertaDashboardQuickAccess gestionVigente sinPlanesHabilitados planesHabilitados={[]} onHabilitarTodosPlanes={onHabilitarTodosPlanes} />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Habilitar planes/ }));
    expect(onHabilitarTodosPlanes).toHaveBeenCalled();
    expect(screen.getByText(/Vincule todos los planes activos/)).toBeInTheDocument();
    unmount();

    renderWithProviders(
      <OfertaDashboardQuickAccess gestionVigente planesPendientesCount={1} planesHabilitados={[{ id: 7, carreraNombre: 'Sistemas', nombre: 'Plan 2026' }, { id: 8, planEstudioId: 3 }]} onHabilitarPlanesVigentes={onHabilitarPlanesVigentes} onParalelosPlan={onParalelosPlan} />,
      { auth },
    );
    expect(screen.getByText('Todavía tiene 1 plan por habilitar.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Sistemas · Plan 2026/ }));
    expect(onParalelosPlan).toHaveBeenCalledWith(7);
    expect(screen.getByRole('button', { name: /Plan #3/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Habilitar planes vigentes/ }));
    expect(onHabilitarPlanesVigentes).toHaveBeenCalled();
  });

  it('sin gestión vigente no se puede habilitar', () => {
    renderWithProviders(<OfertaDashboardQuickAccess gestionVigente={false} sinPlanesHabilitados planesHabilitados={[]} />, { auth: { permisos: [permiso('institucional.oferta.gestion-plan', 'CREAR')] } });
    expect(screen.getByRole('button', { name: /Habilitar planes/ })).toBeDisabled();
  });
});

describe('OfertaKpiStrip', () => {
  it('fase de preparación: variantes total/detalle y planes pendientes', () => {
    const kpis = { phase: 'setup', planesHabilitados: 0, gestionVigente: false, planesHabilitadosLoaded: true, sinPlanes: 2 };
    const { unmount } = render(<OfertaKpiStrip kpis={kpis} variant="total" />);
    expect(screen.getByText('Planes habilitados')).toBeInTheDocument();
    expect(screen.queryByText('Sin planes')).not.toBeInTheDocument();
    unmount();
    const { unmount: u2 } = render(<OfertaKpiStrip kpis={kpis} />);
    expect(screen.getByText('Requiere habilitar plan en la gestión')).toBeInTheDocument();
    u2();
    const { unmount: u3 } = render(<OfertaKpiStrip kpis={{ ...kpis, planesHabilitadosLoaded: false }} variant="all" />);
    expect(screen.getByText('Consultando planes habilitados…')).toBeInTheDocument();
    u3();
  });

  it('fase de oferta: totales y PUBLICADOS solo si hay', () => {
    const kpis = { phase: 'oferta', total: 10, completosPct: 40, ofertaIncompleta: 2, sinAula: 3, listosOfertado: 4, ofertados: 5, publicados: 0 };
    const { unmount } = render(<OfertaKpiStrip kpis={kpis} variant="all" />);
    expect(screen.getByText('Total paralelos')).toBeInTheDocument();
    expect(screen.getByText('Listos para OFERTADO')).toBeInTheDocument();
    expect(screen.queryByText('PUBLICADOS')).not.toBeInTheDocument();
    unmount();
    render(<OfertaKpiStrip kpis={{ ...kpis, publicados: 2 }} />);
    expect(screen.getByText('PUBLICADOS')).toBeInTheDocument();
  });
});

describe('OfertaSidebarResumen', () => {
  const gestion = { codigo: 'G-26', anio: 2026, vigente: true };

  it('flujo: según el paso muestra plan y avance', () => {
    const kpis = { planesHabilitados: 2, listosOfertado: 1, ofertados: 2, publicados: 0 };
    const { unmount } = render(<OfertaSidebarResumen gestionSeleccionada={gestion} planSeleccionado={{ carreraNombre: 'Sistemas', nombre: 'Plan 2026' }} kpis={kpis} step={2} />);
    expect(screen.getByText('G-26')).toBeInTheDocument();
    expect(screen.getByText('Sistemas — Plan 2026')).toBeInTheDocument();
    expect(screen.getByText('Paralelos listos')).toBeInTheDocument();
    unmount();
    render(<OfertaSidebarResumen kpis={kpis} step={0} />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
    expect(screen.queryByText('Plan habilitado')).not.toBeInTheDocument();
  });

  it('dashboard: oferta y pendientes', () => {
    render(<OfertaSidebarResumen variant="dashboard" gestionSeleccionada={gestion} dashboardStats={{ planesCount: 3, paralelosTotal: 12, ofertados: 4, publicados: 2, borrador: 6 }} kpis={{}} step={0} />);
    expect(screen.getByText('3 planes')).toBeInTheDocument();
    expect(screen.getByText('4 OFERTADO · 2 PUBLICADO')).toBeInTheDocument();
    expect(screen.getByText('6 en borrador')).toBeInTheDocument();
  });
});

describe('pasos de oferta', () => {
  it('OfertaStepGestionSection: selecciona, marca vigente y continúa', async () => {
    const onMarcarVigente = vi.fn();
    const onContinuar = vi.fn();
    const gestiones = [{ id: 1, codigo: 'G-25', anio: 2025 }, { id: 2, codigo: 'G-26', anio: 2026, vigente: true }];
    const { unmount } = renderWithProviders(<OfertaStepGestionSection gestiones={gestiones} onMarcarVigente={onMarcarVigente} onContinuar={onContinuar} />, { auth: { permisos: [permiso('institucional.oferta.gestion-plan', 'ACTIVAR')] } });
    expect(screen.getByRole('button', { name: 'Marcar vigente' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Continuar a planes' })).toBeDisabled();
    unmount();
    renderWithProviders(<OfertaStepGestionSection gestiones={gestiones} selectedGestionId={2} gestionSeleccionada={gestiones[1]} onMarcarVigente={onMarcarVigente} onContinuar={onContinuar} />, { auth: { permisos: [permiso('institucional.oferta.gestion-plan', 'ACTIVAR')] } });
    expect(screen.getByText('Vigente')).toBeInTheDocument();
    expect(screen.getByText('Código: G-26')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Marcar vigente' }));
    await userEvent.click(screen.getByRole('button', { name: 'Continuar a planes' }));
    expect(onMarcarVigente).toHaveBeenCalled();
    expect(onContinuar).toHaveBeenCalled();
  });

  it('OfertaStepPlanesSection: lista y selecciona; vacío', async () => {
    const onSelectPlan = vi.fn();
    const { unmount } = render(<OfertaStepPlanesSection planesHabilitados={[{ id: 4, carreraNombre: 'Sistemas', nombre: 'Plan 2026', estado: 'VIGENTE' }]} onSelectPlan={onSelectPlan} />);
    await userEvent.click(screen.getByRole('button', { name: /Configurar oferta/ }));
    expect(onSelectPlan).toHaveBeenCalledWith(4);
    unmount();
    render(<OfertaStepPlanesSection planesHabilitados={[]} onSelectPlan={onSelectPlan} />);
    expect(screen.getByText(/No hay planes habilitados/)).toBeInTheDocument();
  });
});

describe('tarjetas de paralelos', () => {
  const pg = { id: 5, paraleloNombre: 'A', turno: 'NOCHE', estado: 'BORRADOR', carreraCodigo: 'SIS', periodoNumero: 1, aulaId: null };

  it('cargando muestra esqueletos, vacío muestra la descripción', () => {
    const { container, unmount } = renderWithProviders(<OfertaParalelosCardsGrid loading />);
    expect(container.querySelectorAll('.opc-band--skeleton')).toHaveLength(4);
    unmount();
    renderWithProviders(<OfertaParalelosCardsGrid emptyDescription="Nada por mostrar" />);
    expect(screen.getByText('Nada por mostrar')).toBeInTheDocument();
  });

  it('lista tarjetas con la barra de herramientas', () => {
    renderWithProviders(<OfertaParalelosCardsGrid paralelos={[pg]} toolbar={<span>filtros</span>} />, { auth: { permisos: [permiso('institucional.oferta.paralelo-gestion', 'DETALLE')] } });
    expect(screen.getByRole('heading', { name: 'A' })).toBeInTheDocument();
    expect(screen.getByText('filtros')).toBeInTheDocument();
  });

  it('panel del plan: descripción según solo consulta y mensajes vacíos', () => {
    const { unmount } = renderWithProviders(<OfertaGestionPlanTabPanel paralelos={[]} />);
    expect(screen.getByText('Seleccione un plan habilitado.')).toBeInTheDocument();
    unmount();
    const plan = { carreraNombre: 'Sistemas', nombre: 'Plan 2026' };
    const { unmount: u2 } = renderWithProviders(<OfertaGestionPlanTabPanel plan={plan} paralelos={[]} />);
    expect(screen.getByText(/No hay paralelos\. Use «Generar paralelos»/)).toBeInTheDocument();
    u2();
    renderWithProviders(<OfertaGestionPlanTabPanel plan={plan} paralelos={[]} soloConsulta />);
    expect(screen.getByText('No hay paralelos en este plan para la gestión.')).toBeInTheDocument();
    expect(screen.getByText(/gestión histórica/)).toBeInTheDocument();
  });
});

describe('detalle de cursos del paralelo', () => {
  const cursos = [{ id: 1, materiaNombre: 'Álgebra', materiaCodigo: 'MAT-101', horasSemanales: 4, docenteId: 3, docenteNombre: 'Luna', colorHex: '#112233', estado: 'ACTIVA' }, { id: 2, materiaNombre: 'Cálculo', horasSemanales: 4, estado: 'PROGRAMADA' }];

  it('sin cursos muestra el mensaje y con cursos el total y los pendientes', () => {
    const { unmount } = renderWithProviders(<OfertaParaleloDetalleCursosSection faltantesDocenteIds={new Set()} cargaHorariaResumen={{ horasOfertadas: 0 }} />);
    expect(screen.getByText(/Sin cursos en la oferta/)).toBeInTheDocument();
    unmount();
    renderWithProviders(<OfertaParaleloDetalleCursosSection ofertaCursos={cursos} faltantesDocenteIds={new Set([2])} cargaHorariaResumen={{ horasOfertadas: 8 }} onAsignarDocente={vi.fn()} />, { auth: { permisos: [permiso('docentes.asignar', 'EDITAR')] } });
    expect(screen.getByText('Total horas semanales ofertadas')).toBeInTheDocument();
    expect(screen.getByText('1 sin docente')).toBeInTheDocument();
    expect(screen.getAllByText('Sin docente').length).toBeGreaterThan(0);
  });

  it('asignar docente exige EDITAR en docentes.asignar', async () => {
    const onAsignarDocente = vi.fn();
    const columnas = buildOfertaParaleloDetalleCursosColumns({ faltantesDocenteIds: new Set(), onAsignarDocente });
    const { unmount } = renderCell(findColumn(columnas, 'acciones'), cursos[0], { auth: { permisos: [permiso('docentes.asignar', 'EDITAR')] } });
    await userEvent.click(screen.getByRole('button', { name: /Asignar docente/ }));
    expect(onAsignarDocente).toHaveBeenCalledWith(cursos[0]);
    unmount();
    renderCell(findColumn(columnas, 'acciones'), cursos[0]);
    expect(screen.queryByRole('button', { name: /Asignar docente/ })).not.toBeInTheDocument();
    expect(renderCell(findColumn(columnas, 'sigla'), {}).text).toBe('—');
    expect(renderCell(findColumn(columnas, 'materia'), { asignaturaPlanId: 9 }).text).toBe('Asignatura #9');
  });
});

describe('columnas de oferta', () => {
  const row = { id: 5, paraleloNombre: 'A', turno: 'NOCHE', estado: 'BORRADOR', aulaId: 1, cupoMaximo: 30, ofertaActual: 8 };

  it('paralelos: acciones por permiso y "→ OFERTADO" solo si cumple los requisitos', async () => {
    const handlers = { onCambiarTurno: vi.fn(), onUpdateAula: vi.fn(), onGenerarOferta: vi.fn(), onOpenDrawer: vi.fn(), onNavigateDetalle: vi.fn(), onPasarOfertado: vi.fn() };
    const cols = buildOfertaParalelosTableColumns({ turnos: ['NOCHE', 'TARDE'], aulas: [{ id: 1, codigo: 'A-1', nombre: 'Aula 1' }], validacionPorId: { 5: { valido: true, asignaturas_esperadas: 8, oferta_actual: 8 } }, ...handlers });
    const auth = { permisos: [permiso('institucional.oferta.cursos', 'CREAR'), permiso('institucional.oferta.paralelo-gestion', 'EDITAR', 'DETALLE')] };
    const { unmount } = renderCell(findColumn(cols, 'acciones'), row, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Generar oferta/ }));
    await userEvent.click(screen.getByRole('button', { name: /Detalle/ }));
    await userEvent.click(screen.getByRole('button', { name: /Aula\/cupos/ }));
    await userEvent.click(screen.getByRole('button', { name: /OFERTADO/ }));
    expect(handlers.onGenerarOferta).toHaveBeenCalledWith(5);
    expect(handlers.onNavigateDetalle).toHaveBeenCalledWith(5);
    expect(handlers.onOpenDrawer).toHaveBeenCalledWith(5);
    expect(handlers.onPasarOfertado).toHaveBeenCalledWith(5);
    unmount();

    renderCell(findColumn(cols, 'acciones'), { ...row, aulaId: null }, { auth });
    expect(screen.queryByRole('button', { name: /OFERTADO/ })).not.toBeInTheDocument();
    expect(renderCells(cols, row).cupos).toBe('30');
  });

  it('planes: etiqueta con o sin carrera y selección', async () => {
    const onSelectPlan = vi.fn();
    const cols = buildOfertaPlanesTableColumns({ onSelectPlan });
    expect(renderCell(cols[0], { carreraNombre: 'Sistemas', nombre: 'Plan 2026' }).text).toBe('Sistemas — Plan 2026');
    expect(renderCell(cols[0], { planEstudioId: 4 }).text).toBe('Plan #4');
    renderCell(cols[2], { id: 4 });
    await userEvent.click(screen.getByRole('button', { name: /Configurar oferta/ }));
    expect(onSelectPlan).toHaveBeenCalledWith(4);
  });

  it('renovar oferta: planes y resumen con contadores', () => {
    const planes = buildRenovarPlanesColumns();
    expect(renderCell(planes[2], { estado: 'VIGENTE' }).text).toBe('VIGENTE');
    expect(renderCell(planes[2], {}).text).toBe('—');
    const resumen = buildRenovarResumenColumns();
    const textos = Object.values(renderCells(resumen, { label: 'Sistemas', carreraCodigo: 'SIS', creado: true, paralelos: 2, ofertas: 10, asignaciones: 8, bloques: 20, advertencias: ['a', 'b'] })).join(' | ');
    expect(textos).toMatch(/CREADO/);
    expect(textos).toMatch(/\| 2 \|/);
    expect(Object.values(renderCells(resumen, { label: 'X', creado: false })).join(' ')).toMatch(/OMITIDO/);
  });
});
