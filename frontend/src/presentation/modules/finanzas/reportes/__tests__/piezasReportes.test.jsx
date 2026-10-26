import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import BecasDonutChart from '../components/atoms/BecasDonutChart';
import CobranzaEstudianteCell from '../components/atoms/CobranzaEstudianteCell';
import BecasScopeSegmented from '../components/molecules/BecasScopeSegmented';
import ReporteHubCard from '../components/molecules/ReporteHubCard';
import CuentasPorCobrarLeyenda from '../components/organisms/CuentasPorCobrarLeyenda';
import CuentasPorCobrarResumen from '../components/organisms/CuentasPorCobrarResumen';
import ReportesHubPage from '../pages/ReportesHubPage';
import { createBecasEstudianteColumns } from '../config/becasEstudianteColumns';
import { formatPorcentaje as formatPorcentajeBecas } from '../config/becasTableColumns';
import { buildTramoPalette, getEntidadColor, getTramoColor } from '../config/becasTramoColors';
import {
  createCuentasPorCobrarColumns,
  formatBs,
  formatFecha,
  formatPorcentaje,
} from '../config/cuentasPorCobrarColumns';
import { FINANZAS_PERMISOS } from '@application-finanzas/utils/finanzasPermisos';

const mocks = vi.hoisted(() => ({ navigate: vi.fn() }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => mocks.navigate }));

describe('formateadores y paletas', () => {
  it('formatBs / formatPorcentaje / formatFecha toleran valores inválidos', () => {
    expect(formatBs('x')).toBe('0');
    expect(formatBs(1234.6)).toMatch(/1\.?235/);
    expect(formatPorcentaje(12.34)).toBe('12,3%');
    expect(formatPorcentaje(null)).toBe('0,0%');
    expect(formatFecha(null)).toBe('—');
    expect(formatFecha('no-fecha')).toBe('no-fecha');
    expect(formatFecha('2026-03-05T12:00:00')).toMatch(/05\/03\/2026/);
    expect(formatPorcentajeBecas(49.6)).toBe('50%');
  });

  it('getTramoColor usa la paleta por porcentaje y rota si es desconocido', () => {
    const token = { colorSuccess: 's', colorWarning: 'w', colorAccent: 'a', colorError: 'e', colorInfo: 'i', colorPrimary: 'p' };
    expect(buildTramoPalette(token)[25]).toBe('s');
    expect(getTramoColor(token, 100)).toBe('e');
    expect(getTramoColor(token, 33, 0)).toBe('s');
    expect(getTramoColor(token, 33, 7)).toBe('w');
    expect(getEntidadColor(token, 0)).toBe('p');
    expect(getEntidadColor(token, 6)).toBe('p');
  });
});

describe('BecasDonutChart', () => {
  it('dibuja un arco por tramo y el valor central', () => {
    const { container } = render(
      <BecasDonutChart tramos={[{ porcentaje: 25, beneficiados: 3, color: '#0a0' }, { porcentaje: 50, beneficiados: 1, color: '#fa0' }]} centerValue={4} />,
    );
    expect(screen.getByRole('img', { name: 'Distribución de becas por tipo' })).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(3);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('sin beneficiados no divide por cero', () => {
    const { container } = render(<BecasDonutChart tramos={[{ porcentaje: 25, beneficiados: 0 }]} size="sm" />);
    expect(container.querySelector('svg')).toHaveClass('becas-donut__svg--sm');
  });
});

describe('moléculas de reportes', () => {
  it('CobranzaEstudianteCell muestra carnet y nombre con fallback', () => {
    const { rerender } = render(<CobranzaEstudianteCell carnet="E-1" nombreCompleto="Pérez Ana" />);
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    rerender(<CobranzaEstudianteCell />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('BecasScopeSegmented notifica la opción elegida', async () => {
    const onChange = vi.fn();
    render(<BecasScopeSegmented options={['Todas', 'Sistemas']} value="Todas" onChange={onChange} ariaLabel="Alcance" />);
    await userEvent.click(screen.getByText('Sistemas'));
    expect(onChange).toHaveBeenCalledWith('Sistemas');
  });

  it('ReporteHubCard: disponible es un botón accesible por teclado; si no, está deshabilitada', async () => {
    const onClick = vi.fn();
    const { unmount } = render(<ReporteHubCard icon={<i />} title="Cobranza" description="desc" disponible onClick={onClick} />);
    const tarjeta = screen.getByRole('button');
    tarjeta.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(tarjeta);
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(screen.getByText(/Abrir reporte/)).toBeInTheDocument();
    unmount();

    render(<ReporteHubCard icon={<i />} title="Pronto" description="desc" onClick={onClick} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText(/En construcción/)).toBeInTheDocument();
  });
});

describe('organismos de cuentas por cobrar', () => {
  it('Leyenda lista alertas y observaciones', () => {
    render(
      <CuentasPorCobrarLeyenda leyenda={[{ key: 'a', estado: 'VENCIDO', descripcion: 'Pasó la fecha' }]} observaciones={['Revisar mensualmente']} />,
    );
    expect(screen.getByText('Pasó la fecha')).toBeInTheDocument();
    expect(screen.getByText('Revisar mensualmente')).toBeInTheDocument();
  });

  it('Resumen muestra KPIs y destacado; sin datos usa ceros', () => {
    const { unmount } = render(
      <CuentasPorCobrarResumen resumen={{ totalMatriculados: 12, montoMaximoTotal: 5000, totalCancelado: 2000, porcentajePendiente: 60, totalPendientePorCobrar: 3000 }} />,
    );
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('60,0%')).toBeInTheDocument();
    expect(screen.getByText(/3\.?000 Bs/)).toBeInTheDocument();
    unmount();
    render(<CuentasPorCobrarResumen />);
    expect(screen.getByText('0 Bs')).toBeInTheDocument();
  });
});

describe('createCuentasPorCobrarColumns', () => {
  const registro = { carnet: 'E-1', nombreCompleto: 'Pérez Ana', montoTotal: 1000, fechaUltimoPago: '2026-03-05T12:00:00', totalPagado: 400, saldoPendiente: 600, porcentajeSaldo: 60, diasAtraso: 5, estado: 'VENCIDO', observacion: null, estudianteId: 3, pagoAporteId: 8 };

  it('sin callbacks no hay columna de acción', () => {
    const cols = createCuentasPorCobrarColumns();
    expect(cols.at(-1).key).toBe('observacion');
    expect(cols[0].render(null, null, 4)).toBe(5);
  });

  it('celdas numéricas y de texto', () => {
    const cols = createCuentasPorCobrarColumns();
    const por = (key) => cols.find((c) => c.key === key);
    expect(por('porcentajeSaldo').render(null, registro)).toBe('60,0%');
    expect(por('montoTotal').render(null, registro)).toMatch(/1\.?000/);
    renderWithProviders(<>{por('observacion').render(null, registro)}</>);
    expect(screen.getByText('—')).toHaveClass('cobranza-obs--vacio');
  });

  it('acciones "Ver ficha" y "Saldar" según permiso y datos del registro', async () => {
    const onRegistrarPago = vi.fn();
    const onVerFicha = vi.fn();
    const cols = createCuentasPorCobrarColumns(onRegistrarPago, onVerFicha);
    const accion = cols.at(-1);
    const auth = { permisos: [permiso(FINANZAS_PERMISOS.pagoVer, 'DETALLE'), permiso(FINANZAS_PERMISOS.pagoRegistrar, 'CREAR')] };
    const { unmount } = renderWithProviders(accion.render(null, registro), { auth });
    await userEvent.click(screen.getByRole('button', { name: /Ver ficha/ }));
    await userEvent.click(screen.getByRole('button', { name: /Saldar/ }));
    expect(onVerFicha).toHaveBeenCalledWith(8, registro);
    expect(onRegistrarPago).toHaveBeenCalledWith(3, registro);
    unmount();

    renderWithProviders(accion.render(null, registro));
    expect(screen.queryByRole('button', { name: /Saldar/ })).not.toBeInTheDocument();
    expect(accion.render(null, { ...registro, estudianteId: null, pagoAporteId: null })).toBe('—');
  });
});

describe('createBecasEstudianteColumns', () => {
  it('una columna por porcentaje y descuento solo en el tramo del estudiante', () => {
    const cols = createBecasEstudianteColumns([25, 50]);
    expect(cols.map((c) => c.title)).toEqual(['Nº', 'Estudiante', 'CI', 'Tipo de beca', '25%', '50%', 'Aporte base (Bs)']);
    const registro = { nombres: 'Ana', apellidoPaterno: 'Pérez', apellidoMaterno: 'Soto', ci: '123', becaNombre: 'Excelencia', becaPorcentaje: 50, montoDescuento: 100, montoBase: 400 };
    expect(cols[4].render(null, registro)).toBe('—');
    expect(cols[5].render(null, registro)).toMatch(/100 Bs/);
    expect(cols[6].render(null, registro)).toMatch(/300 Bs/);
    expect(cols[2].render(null, {})).toBe('—');
    expect(cols[1].render(null, registro)).toMatch(/Pérez/);
  });
});

describe('ReportesHubPage', () => {
  it('muestra solo los reportes con permiso LISTAR y navega al abrir', async () => {
    renderWithProviders(<ReportesHubPage />, { auth: { permisos: [permiso(FINANZAS_PERMISOS.becaReporte, 'LISTAR')] } });
    expect(screen.getByText('Becas por carrera')).toBeInTheDocument();
    expect(screen.queryByText('Cuentas por cobrar')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button'));
    expect(mocks.navigate).toHaveBeenCalledWith('/finanzas/reportes/becas');
  });

  it('sin permisos no hay tarjetas', () => {
    renderWithProviders(<ReportesHubPage />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
