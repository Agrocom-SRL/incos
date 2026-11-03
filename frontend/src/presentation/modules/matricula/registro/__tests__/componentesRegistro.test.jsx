import { useEffect } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import HistorialEstadoSwitch from '../components/molecules/HistorialEstadoSwitch';
import HistorialNotaInput from '../components/molecules/HistorialNotaInput';
import ParaleloCard from '../components/molecules/ParaleloCard';
import HistorialPrevioNotasSection from '../components/organisms/HistorialPrevioNotasSection';
import InscripcionDetailTabs from '../components/organisms/InscripcionDetailTabs';
import InscripcionHistorialPrevioTab from '../components/organisms/InscripcionHistorialPrevioTab';
import InscripcionHorariosTab from '../components/organisms/InscripcionHorariosTab';
import InscripcionMateriasTab from '../components/organisms/InscripcionMateriasTab';
import InscripcionProfileSummary from '../components/organisms/InscripcionProfileSummary';
import InscripcionResumenTab from '../components/organisms/InscripcionResumenTab';
import InscripcionSeleccionResumen from '../components/organisms/InscripcionSeleccionResumen';
import InscripcionesCarreraStepContent from '../components/organisms/InscripcionesCarreraStepContent';
import InscripcionesHistorialPrevioStepContent from '../components/organisms/InscripcionesHistorialPrevioStepContent';
import InscripcionesPeriodoMateriasStepContent from '../components/organisms/InscripcionesPeriodoMateriasStepContent';
import InscripcionesPeriodoParalelosStepContent from '../components/organisms/InscripcionesPeriodoParalelosStepContent';
import InscripcionesPlanSelectorSection from '../components/organisms/InscripcionesPlanSelectorSection';
import MateriasPlanillaSelector from '../components/organisms/MateriasPlanillaSelector';

const conForm = (ui, initialValues) => {
  let formRef;
  const Wrapper = () => {
    const [form] = Form.useForm();
    useEffect(() => {
      formRef = form;
    }, [form]);
    return <Form form={form} initialValues={initialValues}>{ui(form)}</Form>;
  };
  const view = render(<Wrapper />);
  return { ...view, getForm: () => formRef };
};

const contexto = (extra = {}) => ({
  estudiante: { nombreCompleto: 'Pérez Luna Ana', ci: '123', codigoEstudiante: 'E-1', tipoAdmision: 'ANTIGUO', esNuevoSistema: true },
  carrera: { nombre: 'Sistemas' },
  plan: { nombre: 'Plan 2024' },
  gestion: { nombre: 'Gestión Regular 2026', anio: 2026 },
  periodos: [
    { id: 1, numero: 1, nombre: 'Primer año', asignaturas: [{ materiaId: 10, asignaturaPlanId: 100, sigla: 'MAT-101', nombre: 'Matemática', horasSemanales: 4 }, { materiaId: 11, asignaturaPlanId: 101, sigla: 'FIS-101', nombre: 'Física', horasSemanales: 2 }] },
    { id: 2, numero: 2, nombre: 'Segundo año', asignaturas: [{ materiaId: 20, asignaturaPlanId: 200, sigla: 'CAL-201', nombre: 'Cálculo', horasSemanales: 4, prerrequisito: { asignaturaPlanId: 100, sigla: 'MAT-101' } }] },
  ],
  ...extra,
});

describe('moléculas del historial de notas', () => {
  it('HistorialEstadoSwitch: alterna entre aprobado y convalidado con la pill o el switch', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<HistorialEstadoSwitch aprobado={false} onChange={onChange} materia="MAT-101" />);
    await userEvent.click(screen.getByRole('button', { name: 'Registrar nota de MAT-101 (aprobada)' }));
    expect(onChange).toHaveBeenLastCalledWith('APROBADO');
    rerender(<HistorialEstadoSwitch aprobado onChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Marcar como convalidada la materia' })).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenLastCalledWith('CONVALIDADO');
  });

  it('HistorialEstadoSwitch deshabilitado no notifica', async () => {
    const onChange = vi.fn();
    render(<HistorialEstadoSwitch disabled onChange={onChange} />);
    expect(screen.getByRole('button')).toBeDisabled();
    await userEvent.click(screen.getByRole('button'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('HistorialNotaInput: entero, vacío y límite de 100', () => {
    const onChange = vi.fn();
    const { container, rerender } = render(<HistorialNotaInput onChange={onChange} materia="MAT-101" />);
    expect(container.querySelector('.historial-nota-cell--vacia')).not.toBeNull();
    const input = screen.getByRole('spinbutton', { name: 'Nota final de MAT-101 (0 a 100)' });
    fireEvent.change(input, { target: { value: '71' } });
    expect(onChange).toHaveBeenLastCalledWith(71);
    rerender(<HistorialNotaInput value={71} onChange={onChange} materia="MAT-101" />);
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Nota final de MAT-101 (0 a 100)' }), { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(null);
    rerender(<HistorialNotaInput value={150} />);
    expect(container.querySelector('.historial-nota-cell--error')).not.toBeNull();
    rerender(<HistorialNotaInput value={50} invalido />);
    expect(container.querySelector('.historial-nota-cell--error')).not.toBeNull();
    rerender(<HistorialNotaInput value={50} />);
    expect(container.querySelector('.historial-nota-cell--error')).toBeNull();
    expect(screen.getByRole('spinbutton', { name: 'Nota final (0 a 100)' })).toBeInTheDocument();
  });

  it('ParaleloCard: turno con icono, estadísticas e inicial', () => {
    const { container, rerender } = render(<ParaleloCard paralelo={{ id: 1, nombre: 'TERCERO A', turno: 'noche', descripcion: 'Aula 4', estadisticas: { totalInscritos: 30, totalHombres: 12, totalMujeres: 18 } }} />);
    expect(screen.getByText('TERCERO A')).toBeInTheDocument();
    expect(screen.getByText('noche')).toBeInTheDocument();
    expect(screen.getByText('Aula 4')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(container.querySelector('.paralelo-card__inicial').textContent).toBe('A');
    expect(container.querySelector('.paralelo-card--accent')).not.toBeNull();
    rerender(<ParaleloCard paralelo={{ id: 2, codigo: 'B', totalInscritos: 5 }} />);
    expect(screen.getByText('B', { selector: 'h4' })).toBeInTheDocument();
    expect(container.querySelector('.paralelo-card--default')).not.toBeNull();
    rerender(<ParaleloCard paralelo={{ id: 7 }} />);
    expect(screen.getByText('Paralelo 7')).toBeInTheDocument();
    expect(container.querySelector('.paralelo-card__inicial').textContent).toBe('7');
    rerender(<ParaleloCard paralelo={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('HistorialPrevioNotasSection', () => {
  const rows = [
    { key: 'a', periodId: 1, periodName: 'Primer año', materiaSigla: 'MAT-101', materiaNombre: 'Matemática', status: 'APROBADO', nota: 80 },
    { key: 'b', periodId: 1, periodName: 'Primer año', materiaSigla: 'FIS-101', materiaNombre: 'Física', status: 'APROBADO', nota: null },
    { key: 'c', periodId: 2, periodName: 'Segundo año', materiaSigla: 'CAL-201', materiaNombre: 'Cálculo', status: 'CONVALIDADO' },
  ];

  it('sin filas no pinta nada', () => {
    const { container } = render(<HistorialPrevioNotasSection rows={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('agrupa por periodo con contadores y marca las notas pendientes', () => {
    render(<HistorialPrevioNotasSection rows={rows} invalidGradeKeys={['b']} />);
    expect(screen.getByText('PRIMER AÑO')).toBeInTheDocument();
    expect(screen.getByText('2 materias')).toBeInTheDocument();
    expect(screen.getByText('1 materia')).toBeInTheDocument();
    expect(screen.getByText(/2 con nota/)).toBeInTheDocument();
    expect(screen.getByText(/1 sin nota/)).toBeInTheDocument();
    expect(screen.getByText(/1 convalidadas/)).toBeInTheDocument();
    expect(screen.getByText('No aplica')).toBeInTheDocument();
  });

  it('cambiar el estado o la nota notifica con la clave de la fila', async () => {
    const onGradeChange = vi.fn();
    const onStatusChange = vi.fn();
    render(<HistorialPrevioNotasSection rows={rows} onGradeChange={onGradeChange} onStatusChange={onStatusChange} />);
    await userEvent.click(screen.getByRole('button', { name: /Registrar nota de CAL-201/ }));
    expect(onStatusChange).toHaveBeenCalledWith('c', 'APROBADO');
    fireEvent.change(screen.getByRole('spinbutton', { name: /Nota final de FIS-101/ }), { target: { value: '65' } });
    expect(onGradeChange).toHaveBeenCalledWith('b', 65);
  });

  it('solo lectura: pills y notas sin controles', () => {
    render(<HistorialPrevioNotasSection rows={rows} readOnly invalidGradeKeys={new Set()} loading />);
    expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument();
    expect(screen.getAllByText('Aprobado', { selector: 'span.cfg-materia-pill' })).toHaveLength(2);
    expect(screen.getByText('Convalidado', { selector: 'span.cfg-materia-pill' })).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });
});

describe('pestañas de la ficha de matrícula', () => {
  const propsFicha = {
    student: { codigoEstudiante: 'E-1', ci: '123', expedicion: 'LP', genero: 'F', celular: '70' },
    nombreCompleto: 'Pérez Luna Ana',
    enrollment: { tipoInscripcion: 'ANTIGUO' },
    studentAcademicData: { estadoRegistro: 'ADMITIDO' },
    management: { nombre: 'Gestión 2026', anio: 2026, tipo: 'REGULAR' },
    career: { codigo: 'SIS', nombre: 'Sistemas', tituloOtorgado: 'Técnico Superior' },
    subjectEnrollments: [{ id: 1, materiaSigla: 'MAT-101', materiaNombre: 'Matemática', status: 'CURSANDO', paralelo: { nombre: 'A', turno: 'NOCHE' }, horarios: [{}] }],
    priorEnrollmentHistories: [{ id: 5, periodoNombre: '1° año', materiaSigla: 'FIS', materiaNombre: 'Física', estado: 'APROBADO', notaFinal: 70 }],
    requiereHistorialPrevio: true,
    historialEstadoInfo: { color: 'success', text: 'Historial registrado' },
    cantidadHistorialPrevio: 1,
    courseSchedules: [],
  };

  it('InscripcionResumenTab: estudiante, inscripción, carrera e historial', () => {
    render(<InscripcionResumenTab {...propsFicha} />);
    expect(screen.getByText('E-1')).toBeInTheDocument();
    expect(screen.getByText('123 LP')).toBeInTheDocument();
    expect(screen.getByText('ANTIGUO')).toBeInTheDocument();
    expect(screen.getByText('ADMITIDO')).toBeInTheDocument();
    expect(screen.getByText('Gestión 2026 (2026)')).toBeInTheDocument();
    expect(screen.getByText('Técnico Superior')).toBeInTheDocument();
    expect(screen.getByText('1 materia(s)')).toBeInTheDocument();
    expect(screen.getByText('Historial registrado')).toBeInTheDocument();
    expect(screen.getByText('1 materia(s) registrada(s)')).toBeInTheDocument();
  });

  it('InscripcionResumenTab: datos faltantes y tipo NUEVO sin historial', () => {
    render(<InscripcionResumenTab requiereHistorialPrevio={false} subjectEnrollments={[]} historialEstadoInfo={{}} />);
    expect(screen.queryByText('Historial de notas')).not.toBeInTheDocument();
    expect(screen.getAllByText('—').length).toBeGreaterThan(5);
  });

  it('InscripcionMateriasTab: vacío y tabla de materias', () => {
    const { rerender } = render(<InscripcionMateriasTab subjectEnrollments={[]} />);
    expect(screen.getByText('No hay materias inscritas para esta inscripción')).toBeInTheDocument();
    rerender(<InscripcionMateriasTab subjectEnrollments={propsFicha.subjectEnrollments} />);
    expect(screen.getByText('Materias inscritas (1)')).toBeInTheDocument();
    expect(screen.getByText('Matemática')).toBeInTheDocument();
    expect(screen.getByText('1 bloque(s)')).toBeInTheDocument();
  });

  it('InscripcionHorariosTab: sin horarios y con calendario', () => {
    const { container, rerender } = render(<InscripcionHorariosTab courseSchedules={[]} />);
    expect(screen.getByText('Sin horarios asignados en las materias inscritas')).toBeInTheDocument();
    rerender(
      <InscripcionHorariosTab
        courseSchedules={[{ cursoId: 1, cursoCodigo: 'MAT', materiaSigla: 'MAT', materiaNombre: 'Mat', bloques: [{ cursoHorarioId: 1, dia: 'LUNES', horaInicio: '19:00:00', horaFin: '19:45:00', turno: 'NOCHE', paralelo: 'A' }] }]}
        gridRangeInscripcion={{ startMinutes: 1140, endMinutes: 1320 }}
        sabadoRangeInscripcion={{ startMinutes: 480, endMinutes: 720 }}
      />,
    );
    expect(container.querySelector('.da-cal-semanal')).not.toBeNull();
  });

  it('InscripcionHistorialPrevioTab: NUEVO, vacío con acción protegida por RBAC y tabla', async () => {
    const a = render(<InscripcionHistorialPrevioTab requiereHistorialPrevio={false} />);
    expect(screen.getByText('El tipo de inscripción NUEVO no requiere historial de notas.')).toBeInTheDocument();
    a.unmount();
    const onEditar = vi.fn();
    const b = renderWithProviders(<InscripcionHistorialPrevioTab requiereHistorialPrevio priorEnrollmentHistories={[]} canEdit onEditar={onEditar} />, {
      auth: { permisos: [permiso('matricula.inscripcion.editar', 'EDITAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: /Completar historial de notas/ }));
    expect(onEditar).toHaveBeenCalled();
    b.unmount();
    const c = renderWithProviders(<InscripcionHistorialPrevioTab requiereHistorialPrevio priorEnrollmentHistories={[]} canEdit onEditar={onEditar} />);
    expect(screen.queryByRole('button', { name: /Completar historial/ })).not.toBeInTheDocument();
    c.unmount();
    render(<InscripcionHistorialPrevioTab requiereHistorialPrevio priorEnrollmentHistories={propsFicha.priorEnrollmentHistories} />);
    expect(screen.getByText('Historial de notas (1)')).toBeInTheDocument();
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
  });

  it('InscripcionDetailTabs: cuatro pestañas y navegación entre ellas', async () => {
    render(<InscripcionDetailTabs {...propsFicha} />);
    expect(screen.getAllByRole('tab').map((t) => t.textContent.trim())).toEqual(['Inscripción', 'Historial de notas', 'Materias', 'Horarios']);
    await userEvent.click(screen.getByRole('tab', { name: /Materias/ }));
    expect(await screen.findByText('Materias inscritas (1)')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('tab', { name: /Horarios/ }));
    expect(await screen.findByText('Calendario semanal de materias inscritas')).toBeInTheDocument();
  });
});

describe('InscripcionProfileSummary', () => {
  const base = { avatarText: 'PA', nombreCompleto: 'Pérez Ana', tipoInscripcion: 'ANTIGUO', student: { codigoEstudiante: 'E-1' }, management: { nombre: 'G26', anio: 2026 }, subjectCount: 5 };

  it('muestra identidad, estadísticas y estado de cursado', () => {
    render(<InscripcionProfileSummary {...base} estadoCursado="CURSANDO" />);
    expect(screen.getByRole('heading', { name: 'Pérez Ana' })).toBeInTheDocument();
    expect(screen.getByText('ANTIGUO')).toBeInTheDocument();
    expect(screen.getByText('E-1')).toBeInTheDocument();
    expect(screen.getByText('G26 (2026)')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Estado de cursado')).toBeInTheDocument();
  });

  it('valores ausentes usan respaldos', () => {
    render(<InscripcionProfileSummary />);
    expect(screen.getByRole('heading', { name: 'Estudiante sin nombre' })).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('editar solo si puede; deshabilitado sin canEdit', async () => {
    const onEditar = vi.fn();
    const { rerender } = render(<InscripcionProfileSummary {...base} puedeEditarInscripcion canEdit onEditar={onEditar} />);
    await userEvent.click(screen.getByRole('button', { name: 'Editar inscripción' }));
    expect(onEditar).toHaveBeenCalledTimes(1);
    rerender(<InscripcionProfileSummary {...base} puedeEditarInscripcion canEdit={false} onEditar={onEditar} />);
    expect(screen.getByRole('button', { name: 'Editar inscripción' })).toBeDisabled();
    rerender(<InscripcionProfileSummary {...base} />);
    expect(screen.queryByRole('button', { name: 'Editar inscripción' })).not.toBeInTheDocument();
  });

  it('activar cursado y boleta según permisos y estado', async () => {
    const onActivarCursado = vi.fn();
    const onDownloadOrGenerateBoleta = vi.fn();
    const { rerender } = render(
      <InscripcionProfileSummary {...base} puedeActivarCursado onActivarCursado={onActivarCursado} puedeGenerarBoletaPdf studentId={3} onDownloadOrGenerateBoleta={onDownloadOrGenerateBoleta} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Activar cursado/ }));
    expect(onActivarCursado).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /Generar boleta/ }));
    expect(onDownloadOrGenerateBoleta).toHaveBeenCalled();
    rerender(<InscripcionProfileSummary {...base} puedeActivarCursado activatingCursado puedeGenerarBoletaPdf boletaInscripcion studentId={3} />);
    expect(screen.getByRole('button', { name: /Activando/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: /Descargar boleta/ })).toBeInTheDocument();
    rerender(<InscripcionProfileSummary {...base} puedeGenerarBoletaPdf />);
    expect(screen.getByRole('button', { name: /Generar boleta/ })).toBeDisabled();
  });
});

describe('InscripcionesPlanSelectorSection', () => {
  const planes = [{ id: 1, nombre: 'Plan 2024', resolucionMinisterial: '123/2024', vigente: true }, { id: 2, nombre: 'Plan 2018', vigente: false }];

  it('carga inicial, error y nada que mostrar', () => {
    const a = render(<InscripcionesPlanSelectorSection loading />);
    expect(screen.getByText('Cargando planes de estudio…')).toBeInTheDocument();
    a.unmount();
    const b = render(<InscripcionesPlanSelectorSection error="x" />);
    expect(screen.getByText(/No se pudo cargar la información de planes de estudio/)).toBeInTheDocument();
    b.unmount();
    const { container } = render(<InscripcionesPlanSelectorSection />);
    expect(container).toBeEmptyDOMElement();
  });

  it('con varios planes permite elegir; por defecto el vigente', async () => {
    const onChange = vi.fn();
    render(<InscripcionesPlanSelectorSection planes={planes} mostrarSelector onChange={onChange} />);
    expect(screen.getByText('R.M. 123/2024')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Plan 2024/ })).toBeChecked();
    expect(screen.getByText('Anterior')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('radio', { name: /Plan 2018/ }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('plan fijo: explica el motivo', () => {
    const { rerender } = render(<InscripcionesPlanSelectorSection planResuelto={{ nombre: 'Plan 2024', vigente: true }} planFijoMotivo="ADMISION_NUEVA" />);
    expect(screen.getByText(/admisión nueva/)).toBeInTheDocument();
    expect(screen.getByText('Vigente')).toBeInTheDocument();
    rerender(<InscripcionesPlanSelectorSection planResuelto={{ nombre: 'Plan 2018' }} />);
    expect(screen.getByText(/un solo plan habilitado/)).toBeInTheDocument();
    expect(screen.getByText('Anterior')).toBeInTheDocument();
  });

  it('recargar el contexto con planes ya cargados no oculta el selector', () => {
    render(<InscripcionesPlanSelectorSection planes={planes} mostrarSelector loading />);
    expect(screen.getAllByRole('radio')).toHaveLength(2);
  });
});

describe('MateriasPlanillaSelector', () => {
  it('sin carrera, cargando y con error', async () => {
    const a = render(<MateriasPlanillaSelector />);
    expect(screen.getByText(/Seleccione primero la carrera/)).toBeInTheDocument();
    a.unmount();
    const b = render(<MateriasPlanillaSelector hasCarrera loading />);
    expect(screen.getByLabelText('Cargando plan de estudios')).toBeInTheDocument();
    b.unmount();
    const onRetry = vi.fn();
    render(<MateriasPlanillaSelector hasCarrera error="x" onRetry={onRetry} />);
    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar el plan de estudios de la carrera.');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('pinta un bloque por periodo y las materias con su prerrequisito', () => {
    render(<MateriasPlanillaSelector hasCarrera contexto={contexto()} tipoAdmision="ANTIGUO" esNuevoSistema onToggleMaterias={vi.fn()} />);
    expect(screen.getByText('PRIMER AÑO')).toBeInTheDocument();
    expect(screen.getByText('SEGUNDO AÑO')).toBeInTheDocument();
    expect(screen.getByText('Matemática')).toBeInTheDocument();
    expect(screen.getByText('Cálculo')).toBeInTheDocument();
    expect(screen.getAllByText('MAT-101').length).toBeGreaterThan(1);
  });

  it('marcar una materia notifica el periodo con la selección resultante y desmarca', async () => {
    const onToggleMaterias = vi.fn();
    const { rerender } = render(<MateriasPlanillaSelector hasCarrera contexto={contexto()} tipoAdmision="ANTIGUO" esNuevoSistema onToggleMaterias={onToggleMaterias} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'MAT-101 Matemática' }));
    expect(onToggleMaterias).toHaveBeenLastCalledWith(1, [10]);
    rerender(<MateriasPlanillaSelector hasCarrera contexto={contexto()} tipoAdmision="ANTIGUO" esNuevoSistema selectedMateriaIdsByPeriod={{ 1: [10, 11] }} onToggleMaterias={onToggleMaterias} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'FIS-101 Física' }));
    expect(onToggleMaterias).toHaveBeenLastCalledWith(1, [10]);
  });

  it('marcar todo en un periodo y la fila completa también alterna', async () => {
    const onToggleMaterias = vi.fn();
    render(<MateriasPlanillaSelector hasCarrera contexto={contexto()} tipoAdmision="ANTIGUO" esNuevoSistema onToggleMaterias={onToggleMaterias} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Marcar todas las asignaturas de Primer año' }));
    expect(onToggleMaterias).toHaveBeenLastCalledWith(1, [10, 11]);
    await userEvent.click(screen.getByText('Física'));
    expect(onToggleMaterias).toHaveBeenLastCalledWith(1, [11]);
  });

  it('con más de un periodo seleccionado avisa de la nivelación', () => {
    render(<MateriasPlanillaSelector hasCarrera contexto={contexto()} tipoAdmision="ANTIGUO" esNuevoSistema selectedMateriaIdsByPeriod={{ 1: [10], 2: [20] }} />);
    expect(screen.getByText(/quedará en nivelación/)).toBeInTheDocument();
  });

  it('solo lectura no permite marcar', async () => {
    const onToggleMaterias = vi.fn();
    render(<MateriasPlanillaSelector hasCarrera contexto={contexto()} tipoAdmision="ANTIGUO" esNuevoSistema readOnly onToggleMaterias={onToggleMaterias} />);
    expect(screen.getByRole('checkbox', { name: 'MAT-101 Matemática' })).toBeDisabled();
    await userEvent.click(screen.getByText('Matemática'));
    expect(onToggleMaterias).not.toHaveBeenCalled();
  });

  it('un estudiante NUEVO ve el primer periodo fijo y el resto bloqueado; el aviso de inválido se muestra', () => {
    render(<MateriasPlanillaSelector hasCarrera contexto={contexto({ estudiante: { tipoAdmision: 'NUEVO', esNuevoSistema: true } })} invalid invalidHint="Marque al menos una materia" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Marque al menos una materia');
    const fija = screen.getByRole('checkbox', { name: 'MAT-101 Matemática' });
    expect(fija).toBeDisabled();
    expect(fija).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Marcar todas las asignaturas de Segundo año' })).toBeDisabled();
  });

  it('pendientes de nivelación desmarcadas se advierten con sus siglas', () => {
    const ctx = contexto({
      estudiante: { tipoAdmision: 'ANTIGUO', esNuevoSistema: false },
      resumenHistorial: { minPeriodoPendiente: 1 },
      periodos: [
        { id: 1, numero: 1, nombre: 'Primer año', asignaturas: [{ materiaId: 10, sigla: 'MAT-101', nombre: 'Matemática', estadoHistorial: 'APROBADO', notaFinal: 70 }, { materiaId: 11, sigla: 'FIS-101', nombre: 'Física' }] },
        { id: 2, numero: 2, nombre: 'Segundo año', asignaturas: [{ materiaId: 20, sigla: 'CAL-201', nombre: 'Cálculo' }] },
      ],
    });
    render(<MateriasPlanillaSelector hasCarrera contexto={ctx} selectedMateriaIdsByPeriod={{ 2: [20] }} />);
    expect(screen.getByLabelText('Nota 70')).toBeInTheDocument();
  });
});

describe('InscripcionSeleccionResumen', () => {
  it('sin materias marcadas invita a volver al paso anterior', () => {
    renderWithProviders(<InscripcionSeleccionResumen section={{ title: 'Resumen', description: 'Revise' }} contexto={contexto()} tipoAdmision="ANTIGUO" esNuevoSistema />);
    expect(screen.getByText('Resumen')).toBeInTheDocument();
    expect(screen.getByText('Pérez Luna Ana')).toBeInTheDocument();
    expect(screen.getByText('Sistemas')).toBeInTheDocument();
    expect(screen.getByText('Plan 2024')).toBeInTheDocument();
    expect(screen.getByText('Gestión Regular 2026')).toBeInTheDocument();
    expect(screen.getByText(/Aún no hay materias marcadas/)).toBeInTheDocument();
  });

  it('con materias muestra el periodo, la carga y la nivelación', () => {
    renderWithProviders(<InscripcionSeleccionResumen contexto={contexto()} tipoAdmision="ANTIGUO" esNuevoSistema selectedMateriaIdsByPeriod={{ 1: [10, 11], 2: [20] }} />);
    expect(screen.getByText('3 materias · 10 h/sem')).toBeInTheDocument();
    expect(screen.getByText('Primer año')).toBeInTheDocument();
    expect(screen.getByText('2 materias marcadas · 6 h/semana')).toBeInTheDocument();
    expect(screen.getByText('1 materia marcada · 4 h/semana')).toBeInTheDocument();
    expect(screen.getAllByText('Nivelación').length).toBeGreaterThan(0);
    expect(screen.getByText(/El estudiante quedará en nivelación/)).toBeInTheDocument();
  });

  it('sin estudiante ni gestión solo muestra los datos disponibles', () => {
    renderWithProviders(<InscripcionSeleccionResumen contexto={{ periodos: [] }} />);
    expect(screen.queryByText('C.I.')).not.toBeInTheDocument();
  });
});

describe('pasos del wizard de inscripción', () => {
  it('Historial previo: vacío y con filas', () => {
    const a = renderWithProviders(<InscripcionesHistorialPrevioStepContent section={{ title: 'Historial', description: 'd' }} historialPrevioData={{ hasRows: false }} />);
    expect(screen.getByText(/No hay materias pendientes de registrar/)).toBeInTheDocument();
    a.unmount();
    const setGrade = vi.fn();
    renderWithProviders(
      <InscripcionesHistorialPrevioStepContent
        historialPrevioData={{ hasRows: true, rows: [{ key: 'a', periodId: 1, periodName: 'Primer año', materiaSigla: 'MAT', materiaNombre: 'Mat', status: 'APROBADO', nota: 70 }], setGrade, setStatus: vi.fn() }}
      />,
    );
    expect(screen.getByText('Historial de notas')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '80' } });
    expect(setGrade).toHaveBeenCalledWith('a', 80);
  });

  it('Periodo y materias: aviso de solo lectura y planilla', () => {
    renderWithProviders(<InscripcionesPeriodoMateriasStepContent section={{ title: 'Periodo' }} matriculaContexto={{ contexto: contexto(), esNuevoSistema: true }} tipoAdmision="ANTIGUO" hasCarrera readOnly />);
    expect(screen.getByText(/Modo edición: en inscripciones de tipo NUEVO/)).toBeInTheDocument();
    expect(screen.getByText('PRIMER AÑO')).toBeInTheDocument();
    const { unmount } = renderWithProviders(<InscripcionesPeriodoMateriasStepContent matriculaContexto={null} />);
    unmount();
  });

  it('Paralelos por periodo: indica qué elegir y notifica el paralelo seleccionado', async () => {
    const onSelectParalelo = vi.fn();
    const { rerender } = conForm((form) => (
      <InscripcionesPeriodoParalelosStepContent form={form} section={{ title: 'Paralelos', fields: [] }} periodosData={{ periodos: [], selectedPeriodIds: [] }} paralelosData={{ paralelos: [] }} carrerasData={{ carreras: [] }} />
    ));
    expect(screen.getByText(/Seleccione carrera y uno o más periodos/)).toBeInTheDocument();
    rerender(<Form />);
    conForm((form) => (
      <InscripcionesPeriodoParalelosStepContent
        form={form}
        section={{ title: 'Paralelos', fields: [] }}
        periodosData={{ periodos: [{ id: 1, nombre: 'Primer año' }], selectedPeriodIds: [1, 2] }}
        paralelosData={{ paralelos: [{ id: 5, periodoId: 1, carreraId: 1, nombre: 'PRIMERO A', turno: 'NOCHE' }], selectedParalelosByPeriod: { 1: { id: 5, nombre: 'PRIMERO A' } } }}
        carrerasData={{ carreras: [{ id: 1, nombre: 'Sistemas' }] }}
        onSelectParalelo={onSelectParalelo}
      />
    ));
    expect(screen.getByText('Primer año')).toBeInTheDocument();
    expect(screen.getByText('Periodo 2')).toBeInTheDocument();
    expect(screen.getByText('Paralelo elegido: PRIMERO A')).toBeInTheDocument();
    expect(screen.getByText('Elija un paralelo')).toBeInTheDocument();
    expect(screen.getByText('No hay paralelos en este periodo.')).toBeInTheDocument();
    await userEvent.click(screen.getByText('PRIMERO A', { selector: 'h4' }));
    expect(onSelectParalelo).toHaveBeenCalledWith(expect.objectContaining({ id: 5, carreraNombre: 'Sistemas' }));
  });

  it('Carrera y plan: elegir carrera y carrera fija con overlay en las demás', async () => {
    const onCarreraChange = vi.fn();
    const carreras = [{ id: 1, nombre: 'Sistemas', codigo: 'SIS', colorHex: '#123456' }, { id: 2, nombre: 'Contaduría', codigo: 'CON', colorHex: '#654321' }];
    const a = conForm((form) => (
      <InscripcionesCarreraStepContent form={form} section={{ title: 'Carrera' }} carreras={carreras} onCarreraChange={onCarreraChange} isEditMode />
    ));
    expect(screen.getByText(/Modo edición: el estudiante y la carrera no se modifican/)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Contaduría'));
    expect(onCarreraChange).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
    a.unmount();
    onCarreraChange.mockClear();
    const b = conForm((form) => (
      <InscripcionesCarreraStepContent form={form} carreras={carreras} selectedStudent={{ careerId: 1 }} onCarreraChange={onCarreraChange} planData={{ planes: [], planResuelto: null }} />
    ));
    expect(onCarreraChange).toHaveBeenCalledWith({ id: 1 });
    expect(b.getForm().getFieldValue('carrera')).toBe(1);
  });
});
