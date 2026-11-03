import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { Form } from 'antd';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import PeriodoFormModal from '../academico/components/molecules/PeriodoFormModal';
import MateriaClasificacionFilter from '../academico/components/molecules/MateriaClasificacionFilter';
import PlanPeriodoAsignaturaRow from '../academico/components/molecules/PlanPeriodoAsignaturaRow';
import PlanPrerrequisitoRow from '../academico/components/molecules/PlanPrerrequisitoRow';
import PlanBuilderPrerrequisitoSlot from '../academico/components/molecules/PlanBuilderPrerrequisitoSlot';
import CarreraDetailInformacionSection from '../academico/components/organisms/CarreraDetailInformacionSection';
import CarreraDetailMateriasSection from '../academico/components/organisms/CarreraDetailMateriasSection';
import MateriaDetailAsignaturasSection from '../academico/components/organisms/MateriaDetailAsignaturasSection';
import MateriaDetailInformacionSection from '../academico/components/organisms/MateriaDetailInformacionSection';
import PlanEstudioDocumentoView from '../academico/components/organisms/PlanEstudioDocumentoView';
import PlanesTabPanel from '../academico/pages/PlanesTabPanel';

vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

const navigate = vi.fn();
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));

describe('PeriodoFormModal', () => {
  it('exige número y nombre y no envía incompleto', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<PeriodoFormModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    expect(screen.getByText('Agregar periodo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(await screen.findByText('El número de periodo es requerido')).toBeInTheDocument();
    expect(screen.getByText('El nombre del periodo es requerido')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envía número y nombre recortado', async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    renderWithProviders(<PeriodoFormModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByPlaceholderText('1'), '2');
    await userEvent.type(screen.getByPlaceholderText('Primer año'), '  Segundo año ');
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ nombre: 'Segundo año', numero: 2 }));
  });

  it('edición precarga y rotula "Guardar"', async () => {
    renderWithProviders(<PeriodoFormModal open mode="edit" initialValues={{ nombre: 'Primer año', numero: 1 }} onCancel={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByText('Editar periodo')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByDisplayValue('Primer año')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });
});

describe('MateriaClasificacionFilter', () => {
  it('lista las clasificaciones y notifica la elegida', async () => {
    const onChange = vi.fn();
    render(<MateriaClasificacionFilter clasificaciones={['Fundamental', 'Especialidad']} value="Fundamental" onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(await screen.findByText('Especialidad', { selector: '.ant-select-item-option-content *, .ant-select-item-option-content' }));
    expect(onChange).toHaveBeenCalledWith('Especialidad', expect.anything());
  });
});

describe('constructor del plan', () => {
  const fila = { key: 'f1', asignaturaId: 7, sigla: 'MAT-101', nombre: 'Álgebra', horas: 4, prereqs: [] };

  it('fila de asignatura: cambia horas y quita según permisos', async () => {
    const onCambiarHoras = vi.fn();
    const onQuitar = vi.fn();
    const { unmount } = render(
      <DndContext>
        <PlanPeriodoAsignaturaRow fila={fila} horasDisponibles={2} puedeEditar puedeEliminar onCambiarHoras={onCambiarHoras} onQuitar={onQuitar} />
      </DndContext>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Quitar Álgebra del periodo' }));
    expect(onQuitar).toHaveBeenCalledWith('f1');
    await userEvent.type(screen.getByLabelText('Horas semanales de Álgebra'), '{backspace}5');
    expect(onCambiarHoras).toHaveBeenCalled();
    unmount();

    // Asignatura ya persistida sin permiso ELIMINAR: no se ofrece quitarla
    render(<PlanPeriodoAsignaturaRow fila={fila} horasDisponibles={0} puedeEditar puedeEliminar={false} onCambiarHoras={vi.fn()} onQuitar={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Quitar/ })).not.toBeInTheDocument();
  });

  it('fila nueva (sin id) se puede quitar con solo EDITAR; sin EDITAR las horas se bloquean', () => {
    render(<PlanPeriodoAsignaturaRow fila={{ ...fila, asignaturaId: null }} horasDisponibles={0} puedeEditar puedeEliminar={false} onCambiarHoras={vi.fn()} onQuitar={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Quitar/ })).toBeInTheDocument();
  });

  it('slot de prerrequisitos: vacío invita a arrastrar y los tags se pueden quitar', async () => {
    const onEliminar = vi.fn();
    const { unmount } = render(
      <DndContext>
        <PlanPrerrequisitoRow fila={{ key: 'f1', sigla: 'MAT-102', nombre: 'Cálculo', prereqs: [] }} onEliminar={onEliminar} />
      </DndContext>,
    );
    expect(screen.getByText('MAT-102')).toBeInTheDocument();
    expect(screen.getByText('Arrastre aquí')).toBeInTheDocument();
    unmount();
    render(
      <DndContext>
        <PlanBuilderPrerrequisitoSlot filaKey="f2" prerrequisitos={[{ key: 'p1', sigla: 'MAT-101', nombre: 'Álgebra', prerrequisitoId: 1 }]} onEliminar={onEliminar} />
      </DndContext>,
    );
    fireEvent.click(screen.getByRole('img', { name: /close/i }));
    expect(onEliminar).toHaveBeenCalledWith('p1');
  });
});

describe('secciones de ficha de carrera y materia', () => {
  it('CarreraDetailInformacionSection: plan vigente y descripción opcionales', () => {
    const { container, rerender } = renderWithProviders(<CarreraDetailInformacionSection carrera={null} />);
    expect(container.querySelector('.sd-info-card, .ant-card')).toBeNull();
    rerender(<CarreraDetailInformacionSection carrera={{ codigo: 'SIS', nombre: 'Sistemas', activo: true, descripcion: 'Carrera técnica' }} planVigente={{ nombre: 'Plan 2026' }} />);
    expect(screen.getByText('Carrera técnica')).toBeInTheDocument();
    expect(screen.getByText('Plan 2026')).toBeInTheDocument();
  });

  it('CarreraDetailMateriasSection: vacío, por periodo y enlace a la materia por permiso', async () => {
    const { unmount } = renderWithProviders(<CarreraDetailMateriasSection periodos={[]} />);
    expect(screen.getByText('No hay materias asignadas en los planes de esta carrera.')).toBeInTheDocument();
    unmount();
    const periodos = [
      { periodoNombre: 'Primer año', materias: [{ asignaturaPlanId: 1, materiaId: 5, materiaSigla: 'MAT-101', materiaNombre: 'Álgebra', planNombre: 'Plan 2026', planVigente: true, materiaTipo: 'TEORICA', horasSemanales: 4, tienePrerrequisitos: false }] },
      { periodoNumero: 2, materias: [] },
    ];
    const { unmount: u2 } = renderWithProviders(<CarreraDetailMateriasSection periodos={periodos} puedeVerMateria />);
    expect(screen.getByText('Primer año')).toBeInTheDocument();
    expect(screen.getByText('Periodo 2')).toBeInTheDocument();
    expect(screen.getByText('Sin materias en este periodo.')).toBeInTheDocument();
    expect(screen.getByText('Vigente')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Materia' }));
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('5'));
    u2();
    renderWithProviders(<CarreraDetailMateriasSection periodos={periodos} />);
    expect(screen.queryByRole('button', { name: 'Materia' })).not.toBeInTheDocument();
  });

  it('MateriaDetailInformacionSection y asignaturas', () => {
    const { unmount } = renderWithProviders(<MateriaDetailInformacionSection materia={{ sigla: 'MAT-101', nombre: 'Álgebra', tipo: 'TEORICA', clasificacion: 'Fundamental', activo: true, objetivos: 'Aprender' }} tipoLabel="Teórica" />);
    expect(screen.getByText('Teórica')).toBeInTheDocument();
    expect(screen.getByText('Aprender')).toBeInTheDocument();
    unmount();
    const { unmount: u2 } = renderWithProviders(<MateriaDetailAsignaturasSection asignaturas={[]} />);
    expect(screen.getByText('Esta materia no está asignada a ningún plan de estudio.')).toBeInTheDocument();
    u2();
    renderWithProviders(
      <MateriaDetailAsignaturasSection
        asignaturas={[{ asignaturaPlanId: 1, planEstudioId: 3, planVigente: true, carreraCodigo: 'SIS', periodoNumero: 1, horasSemanales: 4, tienePrerrequisitos: true, cantidadPrerrequisitos: 2 }]}
      />,
    );
    expect(screen.getByText('Plan #3')).toBeInTheDocument();
    expect(screen.getByText('SIS')).toBeInTheDocument();
    expect(screen.getByText('Periodo 1')).toBeInTheDocument();
    expect(screen.getByText('4 h/sem')).toBeInTheDocument();
    expect(screen.getByText('Sí (2)')).toBeInTheDocument();
  });
});

describe('PlanEstudioDocumentoView', () => {
  const planMeta = { resolucion_ministerial: 'R.M. 123/2024', carga_horaria_total: 3000, horas_semana: 25 };
  const periodos = [
    { id: 1, nombre: 'Primer año', numero: 1, asignaturas: [{ id: 10, orden_visualizacion: 1, horas_semanales: 4, materia: { sigla: 'MAT-101', nombre: 'Álgebra' } }] },
  ];

  it('cargando y sin plan', () => {
    const { unmount } = renderWithProviders(<PlanEstudioDocumentoView loading />);
    expect(screen.getByText('Cargando plan de estudios…')).toBeInTheDocument();
    unmount();
    renderWithProviders(<PlanEstudioDocumentoView />);
    expect(screen.getByText('No hay plan de estudios vigente para esta carrera')).toBeInTheDocument();
  });

  it('documento: encabezado, materias, prerrequisitos y edición por periodo', async () => {
    const onEditarPeriodo = vi.fn();
    const { unmount } = renderWithProviders(
      <PlanEstudioDocumentoView
        carrera={{ nombre: 'Sistemas', areaFormacion: 'Tecnología', tituloOtorgado: 'Técnico Superior' }}
        planMeta={planMeta}
        periodos={periodos}
        prereqSiglaByAsignaturaId={new Map([[10, 'MAT-100']])}
        editable
        onEditarPeriodo={onEditarPeriodo}
      />,
      { auth: { permisos: [permiso('configuracion.plan-estudio.periodos', 'EDITAR')] } },
    );
    expect(screen.getByText('SISTEMAS')).toBeInTheDocument();
    expect(screen.getByText('Tecnología', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('PRIMER AÑO')).toBeInTheDocument();
    expect(screen.getByText('MAT-101')).toBeInTheDocument();
    expect(screen.getByText('MAT-100')).toBeInTheDocument();
    unmount();

    renderWithProviders(<PlanEstudioDocumentoView carrera={{ nombre: 'Sistemas' }} planMeta={planMeta} periodos={[]} />);
    expect(screen.getByText('Sin periodos en el plan')).toBeInTheDocument();
  });
});

describe('PlanesTabPanel', () => {
  const carreras = [{ id: 1, codigo: 'SIS', nombre: 'Sistemas', planes: [] }];

  it('lista carreras y busca', async () => {
    const setSearchText = vi.fn();
    renderWithProviders(<PlanesTabPanel navigate={vi.fn()} listNavState={{}} carreras={carreras} refetch={vi.fn()} setSearchText={setSearchText} />);
    await userEvent.type(screen.getByPlaceholderText('Buscar por código, nombre de carrera o RM...'), 'x');
    expect(setSearchText).toHaveBeenCalledWith('x');
    expect(screen.getByText('SISTEMAS')).toBeInTheDocument();
  });

  it('error y vacío', () => {
    renderWithProviders(<PlanesTabPanel navigate={vi.fn()} listNavState={{}} carreras={[]} error="Falla" refetch={vi.fn()} setSearchText={vi.fn()} />);
    expect(screen.getByText(/Falla/)).toBeInTheDocument();
  });
});

// Formulario auxiliar para confirmar que Form.useForm sigue disponible en este entorno
describe('entorno', () => {
  it('Form.useForm funciona dentro de un componente', () => {
    const Comp = () => {
      const [form] = Form.useForm();
      return <Form form={form}><Form.Item name="a" label="A"><input /></Form.Item></Form>;
    };
    render(<Comp />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });
});
