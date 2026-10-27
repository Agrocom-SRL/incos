/**
 * Grillas de Calificaciones (cuaderno, consolidado, bimestre cerrado), NotaCell,
 * resumen de política y drawer de vista previa.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../../../test/renderWithProviders.jsx';

const { tiposState, vistaPrevia } = vi.hoisted(() => ({
  tiposState: { current: { tipos: [] } },
  vistaPrevia: { current: {} },
}));

vi.mock('@application-academico/calificaciones/hooks/useTiposEvaluacion.js', () => ({
  useTiposEvaluacion: () => tiposState.current,
}));
vi.mock('@application-academico/calificaciones/hooks/useVistaPreviaNotas.js', () => ({
  useVistaPreviaNotas: () => vistaPrevia.current,
}));

import { CuadernoRegistryContext } from '@application-academico/calificaciones/context/cuadernoAutosaveContexts';
import NotaCell from '../components/NotaCell.jsx';
import NotasGrid from '../components/NotasGrid.jsx';
import ConsolidadoGrid from '../components/ConsolidadoGrid.jsx';
import BimestreConsolidadoGrid from '../components/BimestreConsolidadoGrid.jsx';
import PoliticaConfiguracionResumenCard from '../components/PoliticaConfiguracionResumenCard.jsx';
import VistaPreviaDrawer from '../components/VistaPreviaDrawer.jsx';

const mockMatchMedia = () => {
  window.matchMedia = (query) => ({
    matches: true,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    onchange: null,
    dispatchEvent: () => false,
  });
};

const conRegistro = (ui, registro) => (
  <CuadernoRegistryContext.Provider value={registro}>{ui}</CuadernoRegistryContext.Provider>
);

const estudiantes = [
  { id: 1, nro: 1, nombre: 'PEREZ GOMEZ JUAN', codigo: 'E-1', notas: { 10: 15, 11: 90 } },
  { id: 2, nro: 2, nombre: 'ROJAS LUNA ANA', codigo: 'E-2', notas: {} },
];
const evaluaciones = [
  { id: 10, nombre: 'Parcial 1', puntos: 20, componente: 'TEORICO' },
  { id: 11, nombre: 'Taller', puntos: 30, componente: 'PRACTICO', tipoEvaluacionId: 7 },
];

describe('NotaCell', () => {
  let registro;
  beforeEach(() => {
    registro = { registerCell: vi.fn(), unregisterCell: vi.fn() };
  });

  it('registra la celda en el cuaderno y la libera al desmontar', () => {
    const { unmount } = render(
      conRegistro(<NotaCell estudianteId={1} evaluacionId={10} valorInicial={5} />, registro),
    );
    expect(registro.registerCell).toHaveBeenCalledWith(
      '1::10',
      expect.objectContaining({ estudianteId: 1, evaluacionId: 10 }),
    );
    unmount();
    expect(registro.unregisterCell).toHaveBeenCalledWith('1::10');
  });

  it('editable: etiqueta accesible, edición marca la celda pendiente', () => {
    const { container } = render(
      conRegistro(<NotaCell estudianteId={1} evaluacionId={10} puntosMaximos={20} valorInicial={5} />, registro),
    );
    expect(screen.getByLabelText('5 de 20 puntos')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '8' } });
    expect(container.querySelector('.cal-nota-cell--pendiente')).not.toBeNull();
  });

  it('supera el máximo: error y aria-invalid', () => {
    render(
      conRegistro(<NotaCell estudianteId={1} evaluacionId={10} puntosMaximos={20} valorInicial={50} />, registro),
    );
    expect(screen.getByLabelText(/supera el máximo de 20/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('vacío editable pide cargar puntos', () => {
    render(conRegistro(<NotaCell estudianteId={1} evaluacionId={10} />, registro));
    expect(screen.getByLabelText('Puntos sin cargar')).toBeInTheDocument();
  });

  it('solo lectura sin nota: guion o ícono de cálculo si es automática', () => {
    const { rerender } = render(
      conRegistro(<NotaCell estudianteId={1} evaluacionId={10} soloLectura />, registro),
    );
    expect(screen.getByLabelText('Sin nota')).toHaveTextContent('—');
    rerender(
      conRegistro(<NotaCell estudianteId={1} evaluacionId={10} soloLectura autoCalculada />, registro),
    );
    expect(screen.getByLabelText(/Sin nota\. Nota calculada automáticamente/)).toBeInTheDocument();
  });

  it('solo lectura con nota la muestra tal cual', () => {
    render(conRegistro(<NotaCell estudianteId={1} evaluacionId={10} soloLectura valorInicial={12} />, registro));
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });
});

describe('NotasGrid', () => {
  let registro;
  beforeEach(() => {
    mockMatchMedia();
    tiposState.current = { tipos: [{ id: 7, codigo: 'ASISTENCIA' }] };
    registro = { registerCell: vi.fn(), unregisterCell: vi.fn() };
  });

  const renderGrid = (props) =>
    renderWithProviders(
      conRegistro(
        <NotasGrid
          bimestreTitulo="Bimestre 2"
          estudiantes={estudiantes}
          evaluaciones={evaluaciones}
          soloLectura={false}
          {...props}
        />,
        registro,
      ),
    );

  it('lista estudiantes con código y una celda por evaluación', () => {
    renderGrid();
    expect(screen.getByText('PEREZ GOMEZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('E-2')).toBeInTheDocument();
    expect(screen.getByText('Bimestre 2')).toBeInTheDocument();
    expect(screen.getAllByText('20 pts').length).toBeGreaterThan(0);
    expect(registro.registerCell).toHaveBeenCalledTimes(4);
  });

  it('la columna de asistencia es de solo lectura y automática', () => {
    renderGrid();
    // Fila 1: parcial editable (15) + taller (asistencia, solo lectura con 90)
    expect(screen.getByLabelText('15 de 20 puntos')).toBeInTheDocument();
    expect(screen.getAllByRole('spinbutton')).toHaveLength(2);
    expect(screen.getByText('90')).toBeInTheDocument();
  });

  it('sin estudiantes muestra el vacío', () => {
    renderGrid({ estudiantes: [] });
    expect(screen.getByText('Sin estudiantes matriculados en el curso')).toBeInTheDocument();
  });

  it('modo lectura no tiene entradas editables', () => {
    renderGrid({ soloLectura: true });
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('soloLecturaNotas tiene prioridad sobre soloLectura', () => {
    renderGrid({ soloLectura: false, soloLecturaNotas: true });
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
  });

  it('agregar actividad solo existe si hay callback', async () => {
    const onAgregar = vi.fn();
    const { unmount } = renderGrid();
    expect(screen.queryByRole('button', { name: 'Agregar actividad' })).not.toBeInTheDocument();
    unmount();
    renderGrid({ onAgregarEvaluacion: onAgregar });
    await userEvent.click(screen.getByRole('button', { name: 'Agregar actividad' }));
    expect(onAgregar).toHaveBeenCalled();
  });

  it('sin evaluaciones y con callback guía a agregar la primera', () => {
    renderGrid({ evaluaciones: [], onAgregarEvaluacion: vi.fn() });
    expect(screen.getByText(/para agregar actividades/)).toBeInTheDocument();
  });

  it('menú de columna: editar, restablecer y eliminar', async () => {
    const onEditar = vi.fn();
    const onReset = vi.fn();
    const onEliminar = vi.fn();
    renderGrid({
      onEditarEvaluacion: onEditar,
      onResetEvaluacion: onReset,
      onEliminarEvaluacion: onEliminar,
    });
    await userEvent.click(screen.getByRole('button', { name: 'Opciones de Parcial 1' }));
    await userEvent.click(await screen.findByText('Editar actividad'));
    expect(onEditar).toHaveBeenCalledWith(evaluaciones[0]);

    await userEvent.click(screen.getByRole('button', { name: 'Opciones de Parcial 1' }));
    await userEvent.click(await screen.findByText('Restablecer notas'));
    expect(onReset).toHaveBeenCalledWith(evaluaciones[0]);

    await userEvent.click(screen.getByRole('button', { name: 'Opciones de Parcial 1' }));
    await userEvent.click(await screen.findByText('Eliminar actividad'));
    expect(onEliminar).toHaveBeenCalledWith(evaluaciones[0]);
  });

  it('sin acciones de columna no muestra menú', () => {
    renderGrid();
    expect(screen.queryByRole('button', { name: /Opciones de/ })).not.toBeInTheDocument();
  });

  it('Guardar notas: visible con mostrarGuardar, dispara y se deshabilita guardando', async () => {
    const onGuardar = vi.fn();
    const { unmount } = renderGrid({ onGuardarBimestre: onGuardar });
    expect(screen.queryByRole('button', { name: /Guardar notas/ })).not.toBeInTheDocument();
    unmount();
    const { unmount: u2 } = renderGrid({ onGuardarBimestre: onGuardar, mostrarGuardar: true });
    await userEvent.click(screen.getByRole('button', { name: /Guardar notas/ }));
    expect(onGuardar).toHaveBeenCalledTimes(1);
    u2();
    renderGrid({ onGuardarBimestre: onGuardar, mostrarGuardar: true, guardandoBimestre: true });
    expect(screen.getByRole('button', { name: /Guardar notas/ })).toBeDisabled();
  });
});

describe('ConsolidadoGrid', () => {
  beforeEach(mockMatchMedia);

  const filas = [
    {
      nro: 1,
      nombre: 'PEREZ GOMEZ JUAN',
      codigo: 'E-1',
      notaFinal: 70,
      recuperatorio: null,
      observacion: 'APROBADO',
      bimestres: [
        { teorico: 20, practico: 40, suma: 60 },
        { teorico: 25, practico: 45, suma: 70 },
      ],
    },
    { nro: 2, nombre: 'ROJAS LUNA ANA', notaFinal: 40, observacion: 'REPROBADO', bimestres: [] },
    { nro: 3, nombre: 'SOTO MAR LUIS', notaFinal: 55, observacion: null, bimestres: [] },
    { nro: 4, nombre: 'VEGA RIO EVA', notaFinal: null, observacion: null, bimestres: [] },
  ];
  const calendario = [
    { numero: 1, estadoCalendario: 'cerrado' },
    { numero: 2, estadoCalendario: 'abierto' },
    { numero: 3, estadoCalendario: 'futuro' },
  ];

  const renderGrid = (props) =>
    renderWithProviders(
      <ConsolidadoGrid
        estudiantes={filas}
        bimestreTitulos={['Bimestre 1', 'Bimestre 2', 'Bimestre 3']}
        bimestresCalendario={calendario}
        bimestreVigente={2}
        {...props}
      />,
    );

  it('muestra la leyenda, estados de cada bimestre y notas', () => {
    renderGrid();
    expect(screen.getByRole('note', { name: 'Leyenda de estados de bimestre' })).toBeInTheDocument();
    expect(screen.getByText('CERRADO')).toBeInTheDocument();
    expect(screen.getByText('EN CURSO')).toBeInTheDocument();
    expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
    expect(screen.getByText('PEREZ GOMEZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('E-1')).toBeInTheDocument();
    expect(screen.getAllByText('70').length).toBeGreaterThan(0);
  });

  it('observaciones: aprobado, reprobado, en curso y guion', () => {
    renderGrid();
    expect(screen.getByText('APROBADO')).toBeInTheDocument();
    expect(screen.getByText('REPROBADO')).toBeInTheDocument();
    expect(screen.getByText('En curso', { selector: 'span.cal-consolidado-grid__obs-parcial' })).toBeInTheDocument();
  });

  it('acciones por bimestre: ver consolidado, abrir cuaderno, bloqueado', async () => {
    const onAbrir = vi.fn();
    renderGrid({ onAbrirCuaderno: onAbrir });
    await userEvent.click(screen.getByRole('button', { name: /Ver consolidado/ }));
    expect(onAbrir).toHaveBeenLastCalledWith(1);
    await userEvent.click(screen.getByRole('button', { name: /Abrir cuaderno/ }));
    expect(onAbrir).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole('button', { name: /Ver cuaderno/ })).toBeDisabled();
    expect(onAbrir).toHaveBeenCalledTimes(2);
  });

  it('bimestre reabierto se muestra en curso', () => {
    renderGrid({
      bimestresCalendario: [{ numero: 1, estadoCalendario: 'cerrado', reabierto: true }],
      bimestreTitulos: ['Bimestre 1'],
      bimestreVigente: 3,
    });
    expect(screen.getByText('EN CURSO')).toBeInTheDocument();
  });

  it('sin estudiantes muestra el vacío', () => {
    renderGrid({ estudiantes: [] });
    expect(screen.getByText('Sin estudiantes matriculados en el curso')).toBeInTheDocument();
  });
});

describe('BimestreConsolidadoGrid', () => {
  beforeEach(mockMatchMedia);

  it('muestra práctico, teórico y total por estudiante', () => {
    renderWithProviders(
      <BimestreConsolidadoGrid
        bimestreTitulo="Bimestre 1"
        cuotaPractico={70}
        cuotaTeorico={30}
        evaluacionesCount={3}
        estudiantes={[
          { id: 1, nro: 1, nombre: 'PEREZ JUAN', codigo: 'E-1', practico: 50, teorico: 20, total: 70 },
          { id: 2, nro: 2, nombre: null, codigoEstudiante: 'E-2' },
        ]}
      />,
    );
    expect(screen.getByText('Bimestre 1')).toBeInTheDocument();
    expect(screen.getAllByText('Práctico (70 pts)').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Teórico (30 pts)').length).toBeGreaterThan(0);
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('E-2')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('vacío', () => {
    renderWithProviders(<BimestreConsolidadoGrid estudiantes={[]} />);
    expect(screen.getByText('Sin estudiantes matriculados en el curso')).toBeInTheDocument();
  });
});

describe('PoliticaConfiguracionResumenCard', () => {
  const base = {
    gestionNombre: 'Gestión 2026',
    gestionVigenteNombre: 'Gestión 2026',
    configurada: true,
    cuotaTeorico: 30,
    cuotaPractico: 70,
    pesosBimestres: [20, 20, 30, 30],
    politicaAsistenciaDefault: { politica: 'NO_AFECTA' },
    sumaCuota: 100,
    sumaBimestres: 100,
  };

  it('vigente guardada: valores y fecha de modificación', () => {
    render(
      <PoliticaConfiguracionResumenCard
        {...base}
        ultimaModificacion={{ updatedAt: '2026-02-03T10:00:00Z', updatedByNombre: 'Admin' }}
      />,
    );
    expect(screen.getByText('Detalle de la configuración')).toBeInTheDocument();
    expect(screen.getByText('Guardada')).toBeInTheDocument();
    expect(screen.getByText('30 pts teórico · 70 pts práctico')).toBeInTheDocument();
    expect(screen.getAllByText('20.0%').length).toBe(2);
    expect(screen.getByText(/Admin ·/)).toBeInTheDocument();
    expect(screen.getByText('61.0')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Copiar/ })).not.toBeInTheDocument();
  });

  it('borrador cuando no está configurada', () => {
    render(<PoliticaConfiguracionResumenCard {...base} configurada={false} />);
    expect(screen.getByText('Borrador (sin guardar)')).toBeInTheDocument();
  });

  it('asistencia COMPUTA_NOTA y CAUSA_REPROBACION muestran sus parámetros', () => {
    const { rerender } = render(
      <PoliticaConfiguracionResumenCard
        {...base}
        politicaAsistenciaDefault={{ politica: 'COMPUTA_NOTA', pesoAsistencia: 10 }}
      />,
    );
    expect(screen.getByText('Ponderación en nota final')).toBeInTheDocument();
    rerender(
      <PoliticaConfiguracionResumenCard
        {...base}
        politicaAsistenciaDefault={{ politica: 'CAUSA_REPROBACION', minimoAsistencia: 75, notaReprobada: 51 }}
      />,
    );
    expect(screen.getByText('Asistencia mínima exigida')).toBeInTheDocument();
    expect(screen.getByText('51.0')).toBeInTheDocument();
  });

  it('referencia anterior: copia la configuración y respeta disabled', async () => {
    const onUsar = vi.fn();
    const { rerender } = render(
      <PoliticaConfiguracionResumenCard
        {...base}
        variant="anterior"
        gestionNombre="Gestión 2025"
        onUsarConfiguracion={onUsar}
      />,
    );
    expect(screen.getByText('Gestión anterior')).toBeInTheDocument();
    expect(screen.getByText('Configuración de la gestión anterior')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Copiar y guardar configuración/ }));
    expect(onUsar).toHaveBeenCalled();
    rerender(
      <PoliticaConfiguracionResumenCard
        {...base}
        variant="anterior"
        onUsarConfiguracion={onUsar}
        usarConfiguracionDisabled
      />,
    );
    expect(screen.getByRole('button', { name: /Copiar y guardar configuración/ })).toBeDisabled();
  });

  it('suma inválida se pinta con color de advertencia', () => {
    render(<PoliticaConfiguracionResumenCard {...base} sumaCuota={90} sumaBimestres={95} />);
    expect(screen.getByText('90.0% / 100%')).toHaveStyle({ color: '#d97706' });
  });
});

describe('VistaPreviaDrawer', () => {
  const estado = (extra = {}) => ({
    filas: [
      { estudianteId: 1, nombre: 'PEREZ JUAN', notaTeorico: 20, notaPractico: 40, notaBimestre: 60 },
      { estudianteId: 2, nombre: 'ROJAS ANA', notaTeorico: null, notaPractico: 10, incompleto: true, incompletoTeorico: true },
      { estudianteId: 3, nombre: 'SOTO LUIS', notaTeorico: 5, notaPractico: 5, notaBimestre: 10 },
    ],
    validacionPuntos: { alertas: [], puntosListos: false, tieneTeorico: false, tienePractico: false },
    cuota: { teorico: 30, practico: 70, esOverride: false },
    resumen: { total: 3, calculables: 2, conFaltantes: 1 },
    isLoading: false,
    error: null,
    notaMinimaAprobacion: 51,
    ...extra,
  });

  it('muestra tabla, resumen e incompletos y cierra con el botón', async () => {
    vistaPrevia.current = estado();
    const onCerrar = vi.fn();
    render(<VistaPreviaDrawer abierto bimestre={2} onCerrar={onCerrar} evaluaciones={[{ id: 1 }]} />);
    expect(await screen.findByText('Vista previa · Bimestre 2')).toBeInTheDocument();
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
    expect(screen.getByText('Incompleto')).toBeInTheDocument();
    expect(screen.getByText(/2 de 3 estudiantes con bimestre calculable/)).toBeInTheDocument();
    expect(screen.getByText('1 estudiante con notas faltantes')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Volver al cuaderno' }));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('bimestre bajo la mínima se marca como reprobado', () => {
    vistaPrevia.current = estado();
    render(<VistaPreviaDrawer abierto bimestre={1} />);
    const reprobado = document.querySelector('.cal-preview__celda--reprobado');
    expect(reprobado).toHaveTextContent('10');
  });

  it('alertas de validación, cuota override y error de carga', () => {
    vistaPrevia.current = estado({
      validacionPuntos: {
        alertas: ['Faltan puntos teóricos'],
        puntosListos: true,
        tieneTeorico: true,
        tienePractico: true,
      },
      cuota: { teorico: 40, practico: 60, esOverride: true },
      error: new Error('x'),
    });
    render(<VistaPreviaDrawer abierto bimestre={1} evaluaciones={[]} />);
    expect(screen.getByText('Faltan puntos teóricos')).toBeInTheDocument();
    expect(screen.getByText(/Cuota institucional: 40 pts teórico · 60 pts práctico/)).toBeInTheDocument();
    expect(screen.getByText(/se usa 30\/70 por defecto/)).toBeInTheDocument();
    expect(screen.getByText(/Los puntos de cada componente completan la cuota/)).toBeInTheDocument();
    expect(screen.getByText(/sin evaluaciones en este bimestre/)).toBeInTheDocument();
  });

  it('cargando muestra skeleton y no la tabla', () => {
    vistaPrevia.current = estado({ isLoading: true });
    render(<VistaPreviaDrawer abierto bimestre={1} />);
    expect(document.querySelector('.ant-skeleton')).not.toBeNull();
    expect(screen.queryByText('PEREZ JUAN')).not.toBeInTheDocument();
  });

  it('cerrado no pinta contenido', () => {
    vistaPrevia.current = estado();
    render(<VistaPreviaDrawer abierto={false} bimestre={1} />);
    expect(screen.queryByText('PEREZ JUAN')).not.toBeInTheDocument();
  });
});
