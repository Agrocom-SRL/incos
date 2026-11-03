import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import BecasResumenCards from '../components/organisms/BecasResumenCards';
import BecasCatalogoCobertura from '../components/organisms/BecasCatalogoCobertura';
import BecasDistribucionTipo from '../components/organisms/BecasDistribucionTipo';
import BecasCoberturaNivel from '../components/organisms/BecasCoberturaNivel';
import BecasCarreraSection from '../components/organisms/BecasCarreraSection';
import CuentasPorCobrarCarreraSection from '../components/organisms/CuentasPorCobrarCarreraSection';
import CuentasPorCobrarPendientePorCarrera from '../components/organisms/CuentasPorCobrarPendientePorCarrera';
import CuentasPorCobrarPage from '../pages/CuentasPorCobrarPage';
import BecasReportePage from '../pages/BecasReportePage';
import { createCuentasPorCobrarColumns } from '../config/cuentasPorCobrarColumns';
import { createBecasEstudianteColumns } from '../config/becasEstudianteColumns';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';

const mocks = vi.hoisted(() => ({
  cobrar: vi.fn(),
  becas: vi.fn(),
  exportCobrar: vi.fn(),
  exportBecas: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mocks.navigate }));
vi.mock('@application-finanzas/hooks/state/useCuentasPorCobrarPage', () => ({ useCuentasPorCobrarPage: mocks.cobrar }));
vi.mock('@application-finanzas/hooks/state/useBecasReportePage', () => ({ useBecasReportePage: mocks.becas }));
vi.mock('@application-finanzas/hooks/api/useExportCuentasPorCobrarExcel', () => ({ useExportCuentasPorCobrarExcel: mocks.exportCobrar }));
vi.mock('@application-finanzas/hooks/api/useExportBecasReporteExcel', () => ({ useExportBecasReporteExcel: mocks.exportBecas }));

describe('BecasResumenCards', () => {
  it('KPIs y destacados singular/plural', () => {
    render(
      <BecasResumenCards
        resumen={{ totalMatriculados: 100, totalConBeca: 20, porcentajeConBeca: 20, porcentajeSinBeca: 80 }}
        destacados={{
          carreraTopBecados: { label: 'Sistemas', valor: 1 },
          periodoMayorCobertura: { label: 'Primer año', valor: 45.4 },
          paraleloTopBecados: { label: 'A', valor: 3 },
        }}
      />,
    );
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('20%', { selector: '.fin-kpi__valor' })).toBeInTheDocument();
    expect(screen.getByText('1 becado')).toBeInTheDocument();
    expect(screen.getByText('45% de cobertura')).toBeInTheDocument();
    expect(screen.getByText('3 becados')).toBeInTheDocument();
  });

  it('sin destacados no pinta el bloque', () => {
    const { container } = render(<BecasResumenCards />);
    expect(container.querySelector('.becas-destacados')).toBeNull();
    expect(screen.getAllByText('0%').length).toBe(2);
  });
});

describe('BecasCatalogoCobertura', () => {
  it('vacío', () => {
    render(<BecasCatalogoCobertura catalogo={[]} />);
    expect(screen.getByText('Sin catálogo de becas configurado')).toBeInTheDocument();
  });

  it('lista tramos usados y sin uso con conteo en uso', () => {
    render(
      <BecasCatalogoCobertura
        catalogo={[
          { porcentaje: 25, etiqueta: '25 %', tipos: 1, usado: true, beneficiados: 1, porcentajeDelTotalConBeca: 50 },
          { porcentaje: 50, etiqueta: '50 %', tipos: 2, usado: false, beneficiados: 0 },
        ]}
        resumen={{ tramosUsados: 1, tramosTotales: 2, totalTipos: 3 }}
      />,
    );
    expect(screen.getByText('1/2 en uso')).toBeInTheDocument();
    expect(screen.getByText('1 tipo')).toBeInTheDocument();
    expect(screen.getByText('2 tipos')).toBeInTheDocument();
    expect(screen.getByText('Sin uso')).toBeInTheDocument();
    expect(screen.getByText(/1 beneficiado ·/)).toBeInTheDocument();
  });
});

describe('BecasDistribucionTipo', () => {
  const dist = {
    gestion: [{ porcentaje: 25, etiqueta: '25 %', beneficiados: 2, porcentajeDelTotalConBeca: 100 }],
    carrera: [{ id: 1, label: 'Sistemas', totalConBeca: 1, tramos: [{ porcentaje: 25, beneficiados: 1 }] }],
    periodo: [],
  };

  it('sin becas en la gestión muestra vacío', () => {
    render(<BecasDistribucionTipo />);
    expect(screen.getByText('Sin becas otorgadas en la gestión')).toBeInTheDocument();
  });

  it('gestión muestra el donut y cambiar de alcance pasa a mini donuts o vacío', async () => {
    render(<BecasDistribucionTipo distribucionTramosPorScope={dist} totalConBeca={2} porcentajeConBeca={10} />);
    expect(screen.getByText('2 estudiantes con beca')).toBeInTheDocument();
    expect(screen.getByText('2 beneficiados · 100%')).toBeInTheDocument();

    await userEvent.click(screen.getByText('Carrera'));
    expect(await screen.findByText('1 becado')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Distribución de becas — Sistemas' })).toBeInTheDocument();

    await userEvent.click(screen.getByText('Periodo'));
    expect(await screen.findByText('Sin datos para este nivel')).toBeInTheDocument();
  });
});

describe('BecasCoberturaNivel', () => {
  it('muestra entidades por nivel y cambia de nivel', async () => {
    render(
      <BecasCoberturaNivel
        coberturaPorNivelAgrupado={{
          carrera: [{ id: 1, label: 'Sistemas', porcentajeCobertura: 40, totalConBeca: 4, totalMatriculados: 10 }],
          periodo: [],
          paralelo: [],
        }}
      />,
    );
    expect(screen.getByText('Cobertura por nivel')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Paralelo'));
    expect(screen.queryByText('Sistemas')).not.toBeInTheDocument();
  });
});

describe('planillas por carrera', () => {
  it('CuentasPorCobrarCarreraSection: fila de grupo, estudiantes y total', () => {
    const carrera = {
      carreraId: 1,
      carreraNombre: 'Sistemas',
      carreraCodigo: 'SIS',
      totalMatriculados: 30,
      montoMaximoTotal: 30000,
      totalCancelado: 10000,
      totalPendiente: 20000,
      porcentajePendiente: 66.7,
      paralelos: [
        {
          paraleloId: 1,
          paralelo: 'A',
          turno: 'NOCHE',
          totalMatriculados: 15,
          montoMaximoTotal: 15000,
          estudiantes: [{ estudianteId: 1, pagoAporteId: 11, carnet: 'E-1', nombreCompleto: 'Pérez Ana', montoTotal: 1000, totalPagado: 400, saldoPendiente: 600, porcentajeSaldo: 60, diasAtraso: 3, estado: 'VENCIDO' }],
        },
      ],
    };
    renderWithProviders(<CuentasPorCobrarCarreraSection carrera={carrera} columns={createCuentasPorCobrarColumns()} />);
    expect(screen.getByText('SIS')).toBeInTheDocument();
    expect(screen.getByText(/Paralelo A/)).toBeInTheDocument();
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    expect(screen.getByText(/RESUMEN TOTAL — Sistemas/)).toBeInTheDocument();
  });

  it('BecasCarreraSection suma por tramo en la fila total', () => {
    const carrera = {
      carreraId: 1,
      carreraNombre: 'Sistemas',
      totalMatriculados: 2,
      totalConBeca: 1,
      porcentajeCobertura: 50,
      children: [
        {
          children: [
            {
              paraleloId: 1,
              paraleloNombre: 'A',
              totalMatriculados: 2,
              totalConBeca: 1,
              porcentajeCobertura: 50,
              estudiantes: [{ estudianteId: 1, nombres: 'Ana', apellidoPaterno: 'Pérez', ci: '123', becaNombre: 'Excelencia', becaPorcentaje: 25, montoDescuento: 100, montoBase: 400 }],
            },
          ],
        },
      ],
    };
    renderWithProviders(<BecasCarreraSection carrera={carrera} columns={createBecasEstudianteColumns([25]).map((c) => (c.title === '25%' ? { ...c, key: 'beca_25' } : c.key === 'montoBase' ? c : c))} />);
    expect(screen.getByText(/RESUMEN TOTAL — Sistemas/)).toBeInTheDocument();
    expect(screen.getByText(/Paralelo A/)).toBeInTheDocument();
    const fila = screen.getByText(/RESUMEN TOTAL/).closest('tr');
    expect(within(fila).getAllByText(/100 Bs|300 Bs/).length).toBeGreaterThan(0);
  });

  it('secciones sin carrera no renderizan', () => {
    const { container } = render(<BecasCarreraSection columns={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('PendientePorCarrera ordena por monto y muestra vacío sin saldos', () => {
    const { unmount } = render(
      <CuentasPorCobrarPendientePorCarrera
        carreras={[{ carreraId: 1, carreraNombre: 'Contaduría', totalPendiente: 100 }, { carreraId: 2, carreraNombre: 'Sistemas', totalPendiente: 300 }, { carreraId: 3, carreraNombre: 'Saldada', totalPendiente: 0 }]}
        totalPendiente={400}
      />,
    );
    const nombres = screen.getAllByText(/Contaduría|Sistemas/).map((n) => n.textContent);
    expect(nombres).toEqual(['Sistemas', 'Contaduría']);
    expect(screen.queryByText('Saldada')).not.toBeInTheDocument();
    expect(screen.getByText(/75,0%/)).toBeInTheDocument();
    unmount();
    render(<CuentasPorCobrarPendientePorCarrera carreras={[]} />);
    expect(screen.getByText('Sin saldos pendientes por cobrar en la gestión')).toBeInTheDocument();
  });
});

describe('CuentasPorCobrarPage', () => {
  const carreraConDeuda = {
    carreraId: 1,
    carreraNombre: 'Sistemas',
    totalPendiente: 600,
    paralelos: [{ paraleloId: 1, paralelo: 'A', estudiantes: [{ estudianteId: 5, pagoAporteId: 9, nombreCompleto: 'Pérez Ana', saldoPendiente: 600, estado: 'VENCIDO' }, { estudianteId: 6, nombreCompleto: 'Al Día', saldoPendiente: 0 }] }],
  };
  const state = (extra = {}) => ({
    loading: false,
    error: null,
    isEmpty: false,
    gestion: { nombre: '2026' },
    gestionId: 7,
    montoMaximoPorEstudiante: 1000,
    fechaEmision: '2026-03-05T12:00:00',
    carreras: [carreraConDeuda],
    resumen: { totalMatriculados: 2, totalPendientePorCobrar: 600 },
    leyenda: [],
    observacionesGenerales: [],
    ...extra,
  });
  const permisos = [permiso(FINANZAS_PERMISOS.cuentaCobrarReporte, 'EXPORTAR'), permiso(FINANZAS_PERMISOS.pagoRegistrar, 'CREAR'), permiso(FINANZAS_PERMISOS.pagoVer, 'DETALLE')];

  beforeEach(() => {
    mocks.navigate.mockReset();
    mocks.exportCobrar.mockReturnValue({ exportar: vi.fn().mockResolvedValue({ success: true }), loading: false });
  });

  it('cargando y error', () => {
    mocks.cobrar.mockReturnValue(state({ loading: true }));
    const { unmount } = renderWithProviders(<CuentasPorCobrarPage />);
    expect(screen.getByText('Cargando cuentas por cobrar...')).toBeInTheDocument();
    unmount();
    mocks.cobrar.mockReturnValue(state({ error: 'Falla del servidor' }));
    renderWithProviders(<CuentasPorCobrarPage />);
    expect(screen.getByText('No se pudo cargar el reporte')).toBeInTheDocument();
  });

  it('vacío', () => {
    mocks.cobrar.mockReturnValue(state({ isEmpty: true }));
    renderWithProviders(<CuentasPorCobrarPage />);
    expect(screen.getByText('No hay carreras con cuentas por cobrar en la gestión')).toBeInTheDocument();
  });

  it('solo lista deudores y desde la fila navega a registrar pago y a la ficha', async () => {
    mocks.cobrar.mockReturnValue(state());
    renderWithProviders(<CuentasPorCobrarPage />, { auth: { permisos } });
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    expect(screen.queryByText('Al Día')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Saldar/ }));
    expect(mocks.navigate).toHaveBeenCalledWith('/pagos/registrar', { state: expect.objectContaining({ studentId: 5 }) });
    await userEvent.click(screen.getByRole('button', { name: /Ver ficha/ }));
    expect(mocks.navigate).toHaveBeenLastCalledWith(expect.stringContaining('9'), { state: expect.objectContaining({ returnListPath: expect.any(String) }) });
  });

  it('todos al día: aviso en lugar de pestañas', () => {
    mocks.cobrar.mockReturnValue(state({ carreras: [{ ...carreraConDeuda, paralelos: [{ paraleloId: 1, paralelo: 'A', estudiantes: [{ estudianteId: 6, saldoPendiente: 0 }] }] }] }));
    renderWithProviders(<CuentasPorCobrarPage />);
    expect(screen.getByText(/todos los estudiantes están al día/)).toBeInTheDocument();
  });

  it('exportar: éxito y fallo, solo con permiso', async () => {
    const exportar = vi.fn().mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ success: false, error: 'Sin datos' });
    mocks.exportCobrar.mockReturnValue({ exportar, loading: false });
    mocks.cobrar.mockReturnValue(state());
    const { unmount } = renderWithProviders(<CuentasPorCobrarPage />);
    expect(screen.queryByRole('button', { name: /Exportar Excel/ })).not.toBeInTheDocument();
    unmount();

    renderWithProviders(<CuentasPorCobrarPage />, { auth: { permisos } });
    await userEvent.click(screen.getByRole('button', { name: /Exportar Excel/ }));
    expect(exportar).toHaveBeenCalledWith(7);
    expect(await screen.findByText('Reporte exportado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Exportar Excel/ }));
    expect(await screen.findByText('No se pudo exportar')).toBeInTheDocument();
    expect(screen.getByText('Sin datos')).toBeInTheDocument();
  });
});

describe('BecasReportePage', () => {
  const state = (extra = {}) => ({
    loading: false,
    error: null,
    isEmpty: false,
    breadcrumbItems: [{ title: 'Finanzas' }],
    gestion: { anio: 2026 },
    gestionId: 7,
    carreras: [{ carreraId: 1, carreraNombre: 'Sistemas', children: [] }],
    distribucionTramosPorScope: { gestion: [], carrera: [], periodo: [] },
    coberturaPorNivelAgrupado: { carrera: [], periodo: [], paralelo: [] },
    destacados: {},
    resumen: { totalMatriculados: 10, totalConBeca: 2 },
    catalogo: [{ porcentaje: 25, etiqueta: '25 %', tipos: 1, usado: false }],
    catalogoResumen: { tramosUsados: 0, tramosTotales: 1, totalTipos: 1 },
    ...extra,
  });
  const auth = { permisos: [permiso(FINANZAS_PERMISOS.becaReporte, 'EXPORTAR')] };

  beforeEach(() => {
    mocks.exportBecas.mockReturnValue({ exportar: vi.fn().mockResolvedValue({ success: true }), loading: false });
  });

  it('muestra gestión, resumen, catálogo y la pestaña de cada carrera', () => {
    mocks.becas.mockReturnValue(state());
    renderWithProviders(<BecasReportePage />);
    expect(screen.getByText('Gestión 2026')).toBeInTheDocument();
    expect(screen.getByText('Resumen general por tipo de beca')).toBeInTheDocument();
    expect(screen.getByText('Catálogo de descuentos')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sistemas/ })).toBeInTheDocument();
  });

  it('carga, error y vacío', () => {
    mocks.becas.mockReturnValue(state({ loading: true }));
    const { unmount } = renderWithProviders(<BecasReportePage />);
    expect(screen.getByText('Cargando reporte de becas...')).toBeInTheDocument();
    unmount();
    mocks.becas.mockReturnValue(state({ error: 'Falla' }));
    const { unmount: u2 } = renderWithProviders(<BecasReportePage />);
    expect(screen.getByText('No se pudo cargar el reporte')).toBeInTheDocument();
    u2();
    mocks.becas.mockReturnValue(state({ isEmpty: true }));
    renderWithProviders(<BecasReportePage />);
    expect(screen.getByText('No hay carreras con matriculados en la gestión')).toBeInTheDocument();
  });

  it('exportar exige permiso, llama con la gestión y avisa el resultado', async () => {
    const exportar = vi.fn().mockResolvedValue({ success: true });
    mocks.exportBecas.mockReturnValue({ exportar, loading: false });
    mocks.becas.mockReturnValue(state());
    const { unmount } = renderWithProviders(<BecasReportePage />);
    expect(screen.queryByRole('button', { name: /Exportar Excel/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<BecasReportePage />, { auth });
    await userEvent.click(screen.getByRole('button', { name: /Exportar Excel/ }));
    expect(exportar).toHaveBeenCalledWith(7);
    expect(await screen.findByText('Reporte exportado')).toBeInTheDocument();
  });

  it('el botón Observaciones abre el popover informativo', async () => {
    mocks.becas.mockReturnValue(state());
    renderWithProviders(<BecasReportePage />);
    await userEvent.click(screen.getByRole('button', { name: /Observaciones/ }));
    expect(await screen.findByText(/Reporte de solo lectura para la gestión vigente/)).toBeInTheDocument();
  });
});
