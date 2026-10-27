import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import { findColumn, renderCell, renderCells } from '@/test/renderColumns';
import ActividadesSinClaseList from '../components/ActividadesSinClaseList';
import CabeceraSemanaAsistencia from '../components/CabeceraSemanaAsistencia';
import CalendarioMensualAsistencia from '../components/CalendarioMensualAsistencia';
import CeldaAsistencia from '../components/CeldaAsistencia';
import ConsolidadoAsistenciaGrid from '../components/ConsolidadoAsistenciaGrid';
import CursoContextoAsistencia from '../components/CursoContextoAsistencia';
import FechaEspecialDrawer from '../components/FechaEspecialDrawer';
import GrillaAsistenciaSemanal from '../components/GrillaAsistenciaSemanal';
import LicenciaDecisionDrawer from '../components/LicenciaDecisionDrawer';
import ResumenAsistenciaSidebar from '../components/ResumenAsistenciaSidebar';
import SeparadorSemanaAsistencia from '../components/SeparadorSemanaAsistencia';
import LicenciaAcademicoCell from '../components/atoms/LicenciaAcademicoCell';
import LicenciaEstudianteCell from '../components/atoms/LicenciaEstudianteCell';
import LicenciaFechasCell from '../components/atoms/LicenciaFechasCell';
import { createLicenciasTableColumns } from '../config/licenciasTableColumns';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

describe('ActividadesSinClaseList', () => {
  it('sin actividades informa el vacío', () => {
    render(<ActividadesSinClaseList />);
    expect(screen.getByText('No hay feriados ni recesos en este bimestre')).toBeInTheDocument();
  });

  it('lista rangos, tipo, destacadas y la actividad en curso', () => {
    render(
      <ActividadesSinClaseList
        actividades={[
          { id: 1, nombre: 'Feriado nacional', tipo: 'FERIADO', fechaInicio: '2026-05-01', fechaFin: '2026-05-01', esDestacada: true },
          { id: 2, nombre: 'Receso', tipo: 'ACADEMICA', fechaInicio: '2026-07-06', fechaFin: '2026-07-17', estado: 'vigente' },
          { id: 3, nombre: 'Sin fecha', tipo: 'XYZ' },
        ]}
      />,
    );
    expect(screen.getByText('Feriado nacional')).toBeInTheDocument();
    expect(screen.getByText('Receso')).toBeInTheDocument();
    expect(screen.getByText('En curso')).toBeInTheDocument();
    expect(screen.getByText(/ – /)).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('CabeceraSemanaAsistencia', () => {
  const props = { rango: { desde: '2026-03-02', hasta: '2026-03-07' }, puedeAnterior: true, puedeSiguiente: false };

  it('muestra el rango y navega solo cuando se puede', async () => {
    const onAnterior = vi.fn();
    const onSiguiente = vi.fn();
    render(<CabeceraSemanaAsistencia {...props} onAnterior={onAnterior} onSiguiente={onSiguiente} />);
    await userEvent.click(screen.getByRole('button', { name: 'Semana anterior' }));
    expect(onAnterior).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Semana siguiente' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Ir a la semana actual' })).not.toBeInTheDocument();
  });

  it('sin rango usa el rótulo por defecto y el botón Hoy marca la semana actual', async () => {
    const onHoy = vi.fn();
    const { rerender } = render(<CabeceraSemanaAsistencia {...props} rango={null} onHoy={onHoy} />);
    expect(screen.getByText('Semana vigente')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ir a la semana actual' }));
    expect(onHoy).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Ir a la semana actual' })).toHaveAttribute('aria-pressed', 'false');
    rerender(<CabeceraSemanaAsistencia {...props} onHoy={onHoy} esSemanaActual />);
    expect(screen.getByRole('button', { name: 'Ir a la semana actual' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('con onIrAFecha muestra el selector de fecha', () => {
    const { container } = render(<CabeceraSemanaAsistencia {...props} onIrAFecha={vi.fn()} anioGestion={2026} />);
    expect(container.querySelector('.asi-semana-pager__picker')).not.toBeNull();
  });
});

describe('CeldaAsistencia', () => {
  const base = { estudianteNombre: 'Pérez Ana', fecha: '2026-03-02' };

  it('día futuro y neutro no son clicables', () => {
    const { rerender } = render(<CeldaAsistencia {...base} futuro />);
    expect(screen.getByLabelText('Día futuro, sin tomar')).toBeInTheDocument();
    rerender(<CeldaAsistencia {...base} neutro="FERIADO" />);
    expect(screen.getByLabelText('Día sin clase')).toBeInTheDocument();
    rerender(<CeldaAsistencia {...base} neutro="LICENCIA" />);
    expect(screen.getByLabelText('Licencia de Pérez Ana')).toBeInTheDocument();
    expect(screen.getByText('Licencia')).toBeInTheDocument();
  });

  it('editable es un botón que cicla; no editable es solo lectura', async () => {
    const onToggle = vi.fn();
    const { rerender } = render(<CeldaAsistencia {...base} estado="AUSENTE" editable onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ausente · Pérez Ana · 2026-03-02. Toque para cambiar' }));
    expect(onToggle).toHaveBeenCalled();
    rerender(<CeldaAsistencia {...base} estado="TARDANZA" editable={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Atraso · Pérez Ana · 2026-03-02')).toBeInTheDocument();
    rerender(<CeldaAsistencia {...base} estado={null} editable={false} />);
    expect(screen.getByLabelText('Presente · Pérez Ana · 2026-03-02')).toBeInTheDocument();
  });
});

describe('CursoContextoAsistencia', () => {
  const curso = { materia: 'Matemática', materiaSigla: 'mat-101', carrera: 'Sistemas', paralelo: 'A', docente: 'Luna', turno: 'NOCHE', estudiantes: 30 };

  it('muestra materia, sigla, bimestre y estadísticas', () => {
    render(<CursoContextoAsistencia curso={curso} bimestre={2} gestion="2026" registroEstado="ABIERTO" bimestreColor="#336699" />);
    expect(screen.getByRole('heading', { name: 'Matemática' })).toBeInTheDocument();
    expect(screen.getByText('MAT-101')).toBeInTheDocument();
    expect(screen.getByText('Bimestre 2')).toBeInTheDocument();
    expect(screen.getByText('ABIERTO')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
  });

  it('sin datos usa respaldos', () => {
    render(<CursoContextoAsistencia />);
    expect(screen.getByRole('heading', { name: '—' })).toBeInTheDocument();
    expect(screen.getByText('Bimestre')).toBeInTheDocument();
    expect(screen.queryByText('Estudiantes')).not.toBeInTheDocument();
  });

  it('el nombre del bimestre tiene prioridad', () => {
    render(<CursoContextoAsistencia curso={curso} bimestre={1} bimestreNombre="Primer bimestre" />);
    expect(screen.getByText('Primer bimestre')).toBeInTheDocument();
  });
});

describe('SeparadorSemanaAsistencia', () => {
  it('muestra el título de la semana, los KPIs y el buscador opcional', async () => {
    const onBusquedaChange = vi.fn();
    render(
      <SeparadorSemanaAsistencia
        rango={{ desde: '2026-03-02', hasta: '2026-03-07' }}
        resumen={{ total: 40, presentes: 30, atrasados: 4, faltantes: 5, conLicencia: 1 }}
        onBusquedaChange={onBusquedaChange}
        totalEstudiantes={20}
        filtrados={20}
      />,
    );
    expect(screen.getByText('Toma de asistencia')).toBeInTheDocument();
    expect(screen.getByText(/40 marcas registradas/)).toBeInTheDocument();
    ['Presentes', 'Atrasados', 'Faltantes', 'Con licencia'].forEach((k) => expect(screen.getByText(k)).toBeInTheDocument());
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('sin resumen ni rango ni buscador queda mínimo', () => {
    render(<SeparadorSemanaAsistencia />);
    expect(screen.getAllByText('Semana vigente').length).toBeGreaterThan(0);
    expect(screen.queryByText('Presentes')).not.toBeInTheDocument();
  });
});

describe('ResumenAsistenciaSidebar', () => {
  it('contexto del bimestre y KPIs con porcentaje del total', () => {
    render(
      <ResumenAsistenciaSidebar
        resumen={{ total: 40, presentes: 30, atrasados: 4, faltantes: 5, conLicencia: 1 }}
        turno="NOCHE"
        horario={[{ dia: 'LUNES', diaLabel: 'Lunes', bloques: [{ inicio: '19:00', fin: '19:45' }] }]}
        rango={{ desde: '2026-03-02', hasta: '2026-05-29' }}
        hoy="2026-03-09"
      />,
    );
    expect(screen.getByText('NOCHE')).toBeInTheDocument();
    expect(screen.getByText('Lunes')).toBeInTheDocument();
    expect(screen.getByText('19:00–19:45')).toBeInTheDocument();
    expect(screen.getByText('75% del total')).toBeInTheDocument();
    expect(screen.getAllByText('de 40 marcas')).toHaveLength(4);
  });

  it('sin resumen, sin horario y sin fechas muestra guiones', () => {
    render(<ResumenAsistenciaSidebar />);
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText('Presentes')).not.toBeInTheDocument();
    expect(screen.queryByText('Días de clase')).not.toBeInTheDocument();
  });

  it('con total cero el porcentaje es 0', () => {
    render(<ResumenAsistenciaSidebar resumen={{ total: 0 }} />);
    expect(screen.getAllByText('0% del total')).toHaveLength(4);
  });
});

describe('ConsolidadoAsistenciaGrid', () => {
  const asignaturas = [{ ofertaCursoId: 1, sigla: 'MAT', nombre: 'Matemática', docenteNombre: 'Luna', registroEstado: 'ABIERTO' }, { ofertaCursoId: 2, sigla: 'FIS', nombre: 'Física' }];
  const estudiantes = [
    { estudianteId: 1, codigo: 'E-1', nombreCompleto: 'Pérez Ana', promedioPct: 90.5, asistencia: { 1: { pctAsistencia: 90.5, sesiones: 20, ausencias: 1, tardanzas: 2, licencias: 1 }, 2: { pctAsistencia: 50, sesiones: 10 } } },
    { estudianteId: 2, codigo: 'E-2', nombreCompleto: 'Rojas Beto', promedioPct: null, asistencia: {} },
  ];

  it('muestra una columna por asignatura, el promedio y la leyenda', () => {
    const { container } = render(<ConsolidadoAsistenciaGrid asignaturas={asignaturas} estudiantes={estudiantes} bimestre={1} />);
    expect(screen.getAllByText('MAT').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Luna').length).toBeGreaterThan(0);
    expect(screen.getAllByText('registro abierto').length).toBeGreaterThan(0);
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    expect(screen.getAllByText('90,5%').length).toBeGreaterThan(0);
    expect(container.querySelector('.asi-consolidado__pct--riesgo')).not.toBeNull();
    expect(container.querySelector('.asi-consolidado__pct--vacia')).not.toBeNull();
    expect(screen.getByRole('note', { name: 'Leyenda del consolidado' })).toBeInTheDocument();
  });

  it('acumulado anual no marca registros abiertos y sin estudiantes informa el vacío', () => {
    render(<ConsolidadoAsistenciaGrid asignaturas={asignaturas} estudiantes={[]} bimestre={null} />);
    expect(screen.queryByText('registro abierto')).not.toBeInTheDocument();
    expect(screen.getByText('Sin registros de asistencia computables para el paralelo')).toBeInTheDocument();
  });
});

describe('GrillaAsistenciaSemanal', () => {
  const dias = [
    { fechaClase: '2026-03-02', esDiaClase: true, esFuturo: false, neutro: null, sesionEstado: 'ABIERTA', puedeHabilitarEspecial: false },
    { fechaClase: '2026-03-03', esDiaClase: false, esFuturo: false, neutro: null, puedeHabilitarEspecial: true },
    { fechaClase: '2026-03-04', esDiaClase: true, neutro: 'FERIADO' },
    { fechaClase: '2026-03-05', esDiaClase: true, esFuturo: true },
    { fechaClase: '2026-03-06', esDiaClase: true, sesionEstado: 'CERRADA' },
  ];
  const filas = [{ matriculaMateriaId: 10, estudianteCodigo: 'E-1', estudianteNombre: 'Pérez Ana', dias: [{ fechaClase: '2026-03-02', estado: 'AUSENTE' }] }];
  const base = { dias, filas, hoy: '2026-03-02', rangoSemana: { desde: '2026-03-02', hasta: '2026-03-07' }, estadoCelda: (_m, _f, backend) => backend };

  it('sin permiso de edición: solo lectura, sin acciones de cabecera', () => {
    render(<GrillaAsistenciaSemanal {...base} />);
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getAllByLabelText('Día sin asistencia').length).toBe(2);
  });

  it('editable: marca la celda, habilita fecha especial, cierra y reabre días y solicita licencia', async () => {
    const onToggleCelda = vi.fn();
    const onHabilitarEspecial = vi.fn();
    const onCerrarDia = vi.fn();
    const onReabrirDia = vi.fn();
    const onSolicitarLicencia = vi.fn();
    render(
      <GrillaAsistenciaSemanal
        {...base}
        puedeEditar
        onToggleCelda={onToggleCelda}
        onHabilitarEspecial={onHabilitarEspecial}
        onCerrarDia={onCerrarDia}
        onReabrirDia={onReabrirDia}
        onSolicitarLicencia={onSolicitarLicencia}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Ausente · Pérez Ana · 2026-03-02/ }));
    expect(onToggleCelda).toHaveBeenCalledWith(10, '2026-03-02', 'AUSENTE');
    await userEvent.click(screen.getByRole('button', { name: /Habilitar asistencia especial el/ }));
    expect(onHabilitarEspecial).toHaveBeenCalledWith('2026-03-03');
    await userEvent.click(screen.getByRole('button', { name: /Cerrar la asistencia del/ }));
    expect(onCerrarDia).toHaveBeenCalledWith('2026-03-02');
    await userEvent.click(screen.getByRole('button', { name: /Reabrir la asistencia del/ }));
    expect(onReabrirDia).toHaveBeenCalledWith('2026-03-06');
    await userEvent.click(screen.getByRole('button', { name: 'Solicitar licencia para Pérez Ana' }));
    expect(onSolicitarLicencia).toHaveBeenCalledWith(expect.objectContaining({ matriculaMateriaId: 10 }));
  });

  it('procesando cierre deshabilita los botones de cierre; sin filas informa el vacío', () => {
    const { rerender } = render(<GrillaAsistenciaSemanal {...base} puedeEditar procesandoCierre onToggleCelda={vi.fn()} />);
    screen.getAllByRole('button', { name: /la asistencia del/ }).forEach((b) => expect(b).toBeDisabled());
    rerender(<GrillaAsistenciaSemanal {...base} filas={[]} />);
    expect(screen.getByText('Sin estudiantes matriculados en el curso')).toBeInTheDocument();
  });
});

describe('CalendarioMensualAsistencia', () => {
  const dias = [
    { fechaClase: '2026-03-02', esDiaClase: true, tieneAsistencia: true },
    { fechaClase: '2026-03-09', esDiaClase: true },
    { fechaClase: '2026-03-16', esDiaClase: true, esFuturo: true },
    { fechaClase: '2026-03-04', esDiaClase: true, esSesionEspecial: true },
    { fechaClase: '2026-03-23', esDiaClase: true, neutro: 'FERIADO', motivo: 'Feriado' },
  ];
  const props = {
    dias,
    rango: { desde: '2026-03-01', hasta: '2026-05-31' },
    actividadesSinClase: [{ nombre: 'Receso', fechaInicio: '2026-03-30', fechaFin: '2026-04-01' }],
    anioCalendario: 2026,
    hoy: '2026-03-09',
  };

  it('pinta los 12 meses y la leyenda', () => {
    render(<CalendarioMensualAsistencia {...props} bimestreColor="#336699" />);
    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(12);
    expect(screen.getByText('Calendario del bimestre')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Referencias del calendario' })).toBeInTheDocument();
  });

  it('un día de clase navegable elige la semana; sesión especial abre su edición; un día libre habilita', async () => {
    const onElegirDia = vi.fn();
    const onDiaEspecial = vi.fn();
    const onEditarEspecial = vi.fn();
    render(<CalendarioMensualAsistencia {...props} onElegirDia={onElegirDia} onDiaEspecial={onDiaEspecial} onEditarEspecial={onEditarEspecial} />);
    await userEvent.click(screen.getByRole('button', { name: /asistencia tomada/ }));
    expect(onElegirDia).toHaveBeenCalledWith('2026-03-02');
    await userEvent.click(screen.getByRole('button', { name: /editar \/ eliminar fecha especial/ }));
    expect(onEditarEspecial).toHaveBeenCalledWith(expect.objectContaining({ fechaClase: '2026-03-04' }));
    const habilitables = document.querySelectorAll('button.asi-cal__dia--habilitable');
    expect(habilitables.length).toBeGreaterThan(0);
    await userEvent.click(habilitables[0]);
    expect(onDiaEspecial).toHaveBeenCalledWith(expect.stringMatching(/^2026-0[3-5]-\d{2}$/));
  });

  it('los días futuros, neutros y de actividad sin clase no son clicables', () => {
    const { container } = render(<CalendarioMensualAsistencia {...props} onElegirDia={vi.fn()} onDiaEspecial={vi.fn()} />);
    expect(container.querySelectorAll('.asi-cal__dia--sin-clase').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector('.asi-cal__dia--futuro[aria-disabled="true"]')).not.toBeNull();
    expect(container.querySelector('.asi-cal__dia--hoy')).not.toBeNull();
  });

  it('sin parámetros usa el año actual', () => {
    const { container } = render(<CalendarioMensualAsistencia />);
    expect(container.querySelectorAll('.asi-cal__mes')).toHaveLength(12);
  });
});

describe('FechaEspecialDrawer', () => {
  it('habilitar: exige motivo y confirma con la fecha y el horario', async () => {
    const onConfirmar = vi.fn().mockResolvedValue(true);
    const onCerrar = vi.fn();
    render(<FechaEspecialDrawer abierto fechaInicial="2026-03-14" onConfirmar={onConfirmar} onCerrar={onCerrar} />);
    expect(await screen.findByText('Habilitar fecha especial')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Habilitar fecha' }));
    expect(await screen.findByText('Indique el motivo (taller, recuperación, …)')).toBeInTheDocument();
    expect(onConfirmar).not.toHaveBeenCalled();
    await userEvent.type(screen.getByPlaceholderText('Taller de recuperación'), ' Taller ');
    await userEvent.click(screen.getByRole('button', { name: 'Habilitar fecha' }));
    await vi.waitFor(() => expect(onConfirmar).toHaveBeenCalledWith({ fecha: '2026-03-14', motivo: 'Taller', horaInicio: undefined, horaFin: undefined }));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('si la confirmación falla el drawer sigue abierto', async () => {
    const onCerrar = vi.fn();
    render(<FechaEspecialDrawer abierto fechaInicial="2026-03-14" onConfirmar={vi.fn().mockResolvedValue(false)} onCerrar={onCerrar} />);
    await userEvent.type(await screen.findByPlaceholderText('Taller de recuperación'), 'Recuperación');
    await userEvent.click(screen.getByRole('button', { name: 'Habilitar fecha' }));
    await Promise.resolve();
    expect(onCerrar).not.toHaveBeenCalled();
  });

  it('edición: precarga motivo y horas, permite eliminar con confirmación', async () => {
    const onEliminar = vi.fn().mockResolvedValue(true);
    const onCerrar = vi.fn();
    render(<FechaEspecialDrawer abierto fechaInicial="2026-03-14" sesion={{ motivo: 'Taller', horaInicio: '08:00:00', horaFin: '10:00:00' }} onEliminar={onEliminar} onConfirmar={vi.fn()} onCerrar={onCerrar} />);
    expect(await screen.findByText('Editar fecha especial')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Taller')).toBeInTheDocument();
    expect(screen.getByDisplayValue('08:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Eliminar/ }));
    await userEvent.click(await screen.findByRole('button', { name: 'Eliminar', hidden: false }).then(() => screen.getAllByRole('button', { name: 'Eliminar' }).at(-1)));
    await vi.waitFor(() => expect(onEliminar).toHaveBeenCalledWith('2026-03-14'));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('con asistencia ya registrada no se puede eliminar', async () => {
    render(<FechaEspecialDrawer abierto fechaInicial="2026-03-14" sesion={{ motivo: 'Taller', tieneMarcas: true }} onConfirmar={vi.fn()} onCerrar={vi.fn()} />);
    expect(await screen.findByRole('button', { name: /Eliminar/ })).toBeDisabled();
  });

  it('cerrado no pinta el formulario', () => {
    render(<FechaEspecialDrawer abierto={false} onConfirmar={vi.fn()} onCerrar={vi.fn()} />);
    expect(screen.queryByText('Habilitar fecha especial')).not.toBeInTheDocument();
  });
});

describe('LicenciaDecisionDrawer', () => {
  const licencia = (extra = {}) => ({
    id: 4, estado: 'PENDIENTE', estudianteNombre: 'Pérez Luna Ana', codigoEstudiante: 'E-1', carreraNombre: 'Sistemas', carreraCodigo: 'SIS', periodoNombre: '1° año', paraleloNombre: 'A',
    fechaInicio: '2026-03-02', fechaFin: '2026-03-04', totalDias: 3, fechaSolicitud: '2026-03-01', motivo: 'SALUD', detalleMotivo: 'Reposo médico', ...extra,
  });

  it('sin licencia no pinta contenido', () => {
    render(<LicenciaDecisionDrawer open licencia={null} />);
    expect(screen.queryByText('Inscripción')).not.toBeInTheDocument();
  });

  it('vista de una solicitud pendiente: datos y acciones según permisos', async () => {
    const { unmount } = render(<LicenciaDecisionDrawer open licencia={licencia()} puedeDecidir onCerrar={vi.fn()} />);
    expect(await screen.findByText('Pérez Luna Ana')).toBeInTheDocument();
    expect(screen.getByText('Reposo médico')).toBeInTheDocument();
    expect(screen.getByText('3 día(s)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aprobar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rechazar/ })).toBeInTheDocument();
    unmount();
    render(<LicenciaDecisionDrawer open licencia={licencia()} onCerrar={vi.fn()} />);
    await screen.findByText('Pérez Luna Ana');
    expect(screen.queryByRole('button', { name: /Aprobar/ })).not.toBeInTheDocument();
  });

  it('aprobar: observación opcional y confirma', async () => {
    const onDecidir = vi.fn().mockResolvedValue({ success: true });
    const onCerrar = vi.fn();
    render(<LicenciaDecisionDrawer open licencia={licencia()} puedeDecidir onDecidir={onDecidir} onCerrar={onCerrar} />);
    await userEvent.click(await screen.findByRole('button', { name: /Aprobar$/ }));
    expect(await screen.findByText('Observaciones (opcional)')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Confirmar aprobación/ }));
    await vi.waitFor(() => expect(onDecidir).toHaveBeenCalledWith({ decision: 'APROBAR', observacionesDecision: undefined }));
    expect(onCerrar).toHaveBeenCalled();
  });

  it('rechazar exige motivo antes de enviar', async () => {
    const onDecidir = vi.fn().mockResolvedValue({ success: true });
    render(<LicenciaDecisionDrawer open licencia={licencia()} puedeDecidir onDecidir={onDecidir} onCerrar={vi.fn()} />);
    await userEvent.click(await screen.findByRole('button', { name: /Rechazar$/ }));
    await userEvent.click(screen.getByRole('button', { name: /Confirmar rechazo/ }));
    expect(await screen.findByText('Indique el motivo')).toBeInTheDocument();
    expect(onDecidir).not.toHaveBeenCalled();
    await userEvent.type(screen.getByPlaceholderText(/documentación de respaldo no fue presentada/), ' Sin respaldo ');
    await userEvent.click(screen.getByRole('button', { name: /Confirmar rechazo/ }));
    await vi.waitFor(() => expect(onDecidir).toHaveBeenCalledWith({ decision: 'RECHAZAR', observacionesDecision: 'Sin respaldo' }));
  });

  it('una aprobada solo se cancela con permiso y motivo; volver regresa a la vista', async () => {
    const onCancelar = vi.fn().mockResolvedValue({ success: true });
    const aprobada = licencia({ estado: 'APROBADA', observacionesDecision: 'Verificada' });
    render(<LicenciaDecisionDrawer open licencia={aprobada} puedeCancelar onCancelar={onCancelar} onCerrar={vi.fn()} />);
    expect(await screen.findByText('Observaciones de la aprobación')).toBeInTheDocument();
    expect(screen.getByText('Verificada')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Cancelar solicitud/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(await screen.findByText('Observaciones de la aprobación')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Cancelar solicitud/ }));
    await userEvent.type(screen.getByPlaceholderText(/retomó asistencia/), 'Retomó');
    await userEvent.click(screen.getByRole('button', { name: /Confirmar cancelación/ }));
    await vi.waitFor(() => expect(onCancelar).toHaveBeenCalledWith(aprobada, 'Retomó'));
  });

  it('rechazada o cancelada son de solo lectura con su motivo', async () => {
    render(<LicenciaDecisionDrawer open licencia={licencia({ estado: 'RECHAZADA', observacionesDecision: 'Sin respaldo' })} puedeDecidir puedeCancelar onCerrar={vi.fn()} />);
    expect(await screen.findByText('Motivo del rechazo')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Aprobar|Rechazar|Cancelar solicitud/ })).not.toBeInTheDocument();
  });
});

describe('celdas y columnas de licencias', () => {
  it('celda de estudiante: identidad y estado', () => {
    const { text } = renderCell({ render: () => <LicenciaEstudianteCell nombre="Pérez Ana" codigo="E-1" estado="APROBADA" /> }, {});
    expect(text).toContain('Pérez Ana');
    expect(text).toContain('Aprobada');
  });

  it('celda académica con y sin datos', () => {
    const { rerender } = render(<LicenciaAcademicoCell carreraNombre="Sistemas" carreraCodigo="SIS" periodoNombre="1° año" paraleloNombre="A" />);
    expect(screen.getByText('Sistemas · SIS')).toBeInTheDocument();
    expect(screen.getByText('Paralelo A')).toBeInTheDocument();
    rerender(<LicenciaAcademicoCell />);
    expect(screen.getAllByText('—')).toHaveLength(3);
  });

  it('celda de fechas: un día, rango y total', () => {
    const { rerender } = render(<LicenciaFechasCell fechaInicio="2026-03-02" fechaFin="2026-03-02" />);
    expect(screen.getByText('Un solo día')).toBeInTheDocument();
    expect(screen.getByText('1 día(s)')).toBeInTheDocument();
    rerender(<LicenciaFechasCell fechaInicio="2026-03-02" fechaFin="2026-03-06" totalDias={5} />);
    expect(screen.getByText(/Fin:/)).toBeInTheDocument();
    expect(screen.getByText('5 día(s)')).toBeInTheDocument();
    rerender(<LicenciaFechasCell fechaInicio="2026-03-02" fechaFin="2026-03-06" />);
    expect(screen.getByText('— día(s)')).toBeInTheDocument();
  });

  describe('createLicenciasTableColumns', () => {
    const fila = { id: 1, estado: 'PENDIENTE', estudianteNombre: 'Pérez Ana', codigoEstudiante: 'E-1', carreraNombre: 'Sistemas', periodoNombre: '1°', paraleloNombre: 'A', fechaInicio: '2026-03-02', fechaFin: '2026-03-04', totalDias: 3, motivo: 'SALUD', fechaSolicitud: '2026-03-01' };

    it('renderiza todas las celdas y ordena', () => {
      const cols = createLicenciasTableColumns();
      const textos = renderCells(cols.slice(0, 5), fila);
      expect(Object.values(textos).join(' | ')).toContain('Pérez Ana');
      expect(cols[0].render(null, null, 1, 10)).toBe(12);
      expect(cols[1].sorter({ estudianteNombre: 'A' }, { estudianteNombre: 'B' })).toBeLessThan(0);
      expect(cols[3].sorter({ fechaInicio: '2026-01-01' }, { fechaInicio: '2026-02-01' })).toBeLessThan(0);
      expect(cols[4].sorter({ motivo: 'SALUD' }, { motivo: 'TRABAJO' })).toBeDefined();
    });

    it('acciones: ver, editar (solo pendiente) y cancelar según permisos', async () => {
      const handlers = { onVer: vi.fn(), onEditar: vi.fn(), onCancelar: vi.fn().mockResolvedValue({ success: true }) };
      const acciones = findColumn(createLicenciasTableColumns(handlers), 'acciones');
      const auth = { permisos: [permiso('academico.asistencia.licencia.ver', 'DETALLE'), permiso('academico.asistencia.licencia.crear', 'EDITAR', 'ELIMINAR')] };
      const { unmount } = renderCell(acciones, fila, { auth });
      const iconos = () => screen.queryAllByRole('button').map((b) => b.querySelector('[aria-label]')?.getAttribute('aria-label'));
      expect(iconos().length).toBeGreaterThan(0);
      await userEvent.click(screen.getAllByRole('button')[0]);
      expect(handlers.onVer).toHaveBeenCalledWith(fila);
      unmount();
      renderCell(acciones, { ...fila, estado: 'RECHAZADA' }, { auth });
      expect(screen.queryAllByRole('button').length).toBeLessThan(3);
      expect(within(document.body).queryAllByRole('button').length).toBeGreaterThanOrEqual(1);
    });
  });
});
