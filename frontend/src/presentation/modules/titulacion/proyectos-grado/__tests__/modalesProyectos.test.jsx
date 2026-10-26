import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/renderWithProviders';
import AgregarIntegranteModal from '../components/modals/AgregarIntegranteModal';
import AnularActaDefensaModal from '../components/modals/AnularActaDefensaModal';
import AprobarEtapaModal from '../components/modals/AprobarEtapaModal';
import AsignarTutorModal from '../components/modals/AsignarTutorModal';
import BitacoraEntradaDrawer from '../components/modals/BitacoraEntradaDrawer';
import CancelarProyectoModal from '../components/modals/CancelarProyectoModal';
import SubirAvanceModal from '../components/modals/SubirAvanceModal';

const mocks = vi.hoisted(() => ({ buscar: vi.fn() }));
vi.mock('@application-titulacion/proyectos-grado/hooks/api/useBuscarEstudiantesTit', () => ({
  useBuscarEstudiantesTit: mocks.buscar,
}));

const elegir = async (texto) => {
  await userEvent.click(screen.getAllByRole('combobox').at(-1));
  await userEvent.click(await screen.findByText(texto, { selector: '.ant-select-item-option-content' }));
};

describe('AgregarIntegranteModal', () => {
  it('excluye a los integrantes activos de las opciones y envía el estudiante elegido', async () => {
    const buscar = vi.fn();
    mocks.buscar.mockReturnValue({
      estudiantes: [
        { id: 1, nombreCompleto: 'Pérez Ana', ci: '123' },
        { id: 2, nombreCompleto: 'Soto Luis' },
      ],
      loading: false,
      buscar,
      limpiar: vi.fn(),
    });
    const onSubmit = vi.fn();
    renderWithProviders(
      <AgregarIntegranteModal open onCancel={vi.fn()} onSubmit={onSubmit} integrantes={[{ estudianteId: 1, estado: 'ACTIVO' }]} />,
    );
    await userEvent.click(screen.getByRole('combobox'));
    expect(await screen.findByText('Soto Luis', { selector: '.ant-select-item-option-content' })).toBeInTheDocument();
    expect(screen.queryByText(/Pérez Ana/, { selector: '.ant-select-item-option-content' })).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Soto Luis', { selector: '.ant-select-item-option-content' }));
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(2));
  });

  it('sin selección muestra el error y no envía', async () => {
    mocks.buscar.mockReturnValue({ estudiantes: [], loading: false, buscar: vi.fn(), limpiar: vi.fn() });
    const onSubmit = vi.fn();
    renderWithProviders(<AgregarIntegranteModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(await screen.findByText('Seleccione al estudiante')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('AnularActaDefensaModal y CancelarProyectoModal', () => {
  it('anular: motivo obligatorio, mínimo 3 caracteres y envío recortado', async () => {
    const onAnular = vi.fn();
    renderWithProviders(<AnularActaDefensaModal open acta={{ numeroActaFormateado: 'N° 1/2026', estudianteNombre: 'Pérez Ana' }} onAnular={onAnular} onCancelar={vi.fn()} />);
    expect(screen.getByText(/Se anulará el acta N° 1\/2026 de Pérez Ana/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Anular acta' }));
    expect(await screen.findByText('Indique el motivo de la anulación')).toBeInTheDocument();
    const campo = screen.getByPlaceholderText(/Explique por qué se anula/);
    await userEvent.type(campo, 'ab');
    await userEvent.click(screen.getByRole('button', { name: 'Anular acta' }));
    expect(await screen.findByText('El motivo debe tener al menos 3 caracteres')).toBeInTheDocument();
    expect(onAnular).not.toHaveBeenCalled();
    await userEvent.type(campo, 'c  ');
    await userEvent.click(screen.getByRole('button', { name: 'Anular acta' }));
    await waitFor(() => expect(onAnular).toHaveBeenCalledWith('abc'));
  });

  it('anular sin acta usa el aviso genérico', () => {
    renderWithProviders(<AnularActaDefensaModal open onAnular={vi.fn()} onCancelar={vi.fn()} />);
    expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument();
  });

  it('cancelar proyecto: valida el motivo y lo envía', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<CancelarProyectoModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Sí, cancelar proyecto' }));
    expect(await screen.findByText('Indique el motivo de la cancelación')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(screen.getByPlaceholderText(/Explique por qué se cancela/), 'Abandono del postulante');
    await userEvent.click(screen.getByRole('button', { name: 'Sí, cancelar proyecto' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('Abandono del postulante'));
  });
});

describe('AsignarTutorModal', () => {
  const docentes = [{ value: 3, label: 'Ing. Luna' }];

  it('sin catálogo de docentes advierte y no muestra el formulario', () => {
    renderWithProviders(<AsignarTutorModal open onCancel={vi.fn()} onSubmit={vi.fn()} docentesDisponible={false} />);
    expect(screen.getByText('Catálogo de docentes no disponible para su rol')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('exige elegir tutor y envía con observaciones recortadas', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<AsignarTutorModal open onCancel={vi.fn()} onSubmit={onSubmit} docentes={docentes} />);
    expect(screen.getByText('Asignar tutor al proyecto')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Asignar tutor' }));
    expect(await screen.findByText('Seleccione al docente tutor')).toBeInTheDocument();
    await elegir('Ing. Luna');
    await userEvent.type(screen.getByPlaceholderText(/Registre observaciones/), ' ok ');
    await userEvent.click(screen.getByRole('button', { name: 'Asignar tutor' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ tutorId: 3, observaciones: 'ok' }));
  });

  it('con tutor actual el título es "Cambiar" y precarga', async () => {
    renderWithProviders(<AsignarTutorModal open onCancel={vi.fn()} onSubmit={vi.fn()} docentes={docentes} tutorActualId={3} />);
    expect(screen.getByText('Cambiar tutor del proyecto')).toBeInTheDocument();
    expect(await screen.findByText('Ing. Luna', { selector: '.ant-select-content-value, .ant-select-selection-item' })).toBeInTheDocument();
  });
});

describe('SubirAvanceModal', () => {
  it('exige adjuntar el archivo', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<SubirAvanceModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Enviar avance' }));
    expect(await screen.findByText('Adjunte el archivo del avance')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envía el archivo y los textos opcionales recortados', async () => {
    const onSubmit = vi.fn();
    const { baseElement } = renderWithProviders(<SubirAvanceModal open onCancel={vi.fn()} onSubmit={onSubmit} />);
    const archivo = new File(['x'], 'avance.pdf', { type: 'application/pdf' });
    await userEvent.upload(baseElement.querySelector('input[type="file"]'), archivo);
    await userEvent.type(screen.getByPlaceholderText(/Capítulo 2/), '  Marco  ');
    await userEvent.click(screen.getByRole('button', { name: 'Enviar avance' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload.file).toBe(archivo);
    expect(payload.titulo).toBe('Marco');
    expect(payload.descripcion).toBeUndefined();
  });
});

describe('BitacoraEntradaDrawer', () => {
  it('nueva entrada: actividad obligatoria y tipo REUNION', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<BitacoraEntradaDrawer open onClose={vi.fn()} onSubmit={onSubmit} proyectoTitulo="Inventarios" />);
    expect(screen.getByText('Nueva entrada del cronograma de progreso')).toBeInTheDocument();
    expect(screen.getByText('Proyecto: Inventarios')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Guardar entrada/ }));
    expect(await screen.findByText('Describa la actividad revisada')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(screen.getByPlaceholderText(/Avance revisado en relación/), ' Revisión ');
    await userEvent.click(screen.getByRole('button', { name: /Guardar entrada/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ tipo: 'REUNION', actividad: 'Revisión', observaciones: null });
  });

  it('revisión de avance: envía el avance y el resultado de la revisión', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(
      <BitacoraEntradaDrawer open onClose={vi.fn()} onSubmit={onSubmit} avance={{ id: 9, titulo: 'Cap. 1' }} porcentajeActual={30} />,
    );
    expect(screen.getByText('Revisar avance', { selector: '.ant-drawer-title' })).toBeInTheDocument();
    expect(screen.getByText('Avance revisado: Cap. 1')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/Avance revisado en relación/), 'Se revisó');
    await userEvent.click(screen.getByRole('button', { name: /Guardar entrada/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ tipo: 'REVISION_AVANCE', avanceProyectoId: 9, estadoRevisionAvance: 'OBSERVADO', porcentajeAvance: 30 });
  });

  it('edición: permite cambiar el estado de la observación', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(
      <BitacoraEntradaDrawer open onClose={vi.fn()} onSubmit={onSubmit} entrada={{ fecha: '2026-03-05', actividad: 'Reunión', estado: 'PENDIENTE', tipo: 'REUNION' }} />,
    );
    expect(screen.getByText('Editar entrada del cronograma de progreso')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByDisplayValue('Reunión')).toBeInTheDocument());
    await elegir('Subsanado');
    await userEvent.click(screen.getByRole('button', { name: /Guardar entrada/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ estado: 'SUBSANADO', actividad: 'Reunión' })));
  });
});

describe('AprobarEtapaModal', () => {
  it('sin destino informa que el estado es terminal', () => {
    renderWithProviders(<AprobarEtapaModal open onCancel={vi.fn()} onSubmit={vi.fn()} transiciones={['CANCELADO']} estadoActual="APROBADO" />);
    expect(screen.getByText(/no admite más transiciones/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  it('requisito automático pendiente bloquea (tutor para pasar a desarrollo)', () => {
    renderWithProviders(<AprobarEtapaModal open onCancel={vi.fn()} onSubmit={vi.fn()} transiciones={['DESARROLLO', 'CANCELADO']} estadoActual="APROBADO_PERFIL" proyecto={{ tutorId: null }} />);
    expect(screen.getByText('Asignar al menos un tutor al proyecto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continuar a «En desarrollo»/ })).toBeDisabled();
  });

  it('requisito cumplido permite continuar y envía las observaciones', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<AprobarEtapaModal open onCancel={vi.fn()} onSubmit={onSubmit} transiciones={['DESARROLLO']} estadoActual="APROBADO_PERFIL" proyecto={{ tutorId: 3 }} />);
    await userEvent.type(screen.getByPlaceholderText(/Registre observaciones/), ' listo ');
    await userEvent.click(screen.getByRole('button', { name: /Continuar a «En desarrollo»/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ estado: 'DESARROLLO', observaciones: 'listo' }));
  });

  it('requisito manual exige confirmar antes de continuar', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<AprobarEtapaModal open onCancel={vi.fn()} onSubmit={onSubmit} transiciones={['APROBADO_PERFIL']} estadoActual="PERFIL" proyecto={{}} />);
    const boton = screen.getByRole('button', { name: /Continuar a «Perfil aprobado»/ });
    expect(boton).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: /Confirmo que se cumplieron/ }));
    expect(boton).toBeEnabled();
    await userEvent.click(boton);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ estado: 'APROBADO_PERFIL', observaciones: undefined }));
  });

  it('informe de suficiencia exige los tres criterios y el veredicto', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<AprobarEtapaModal open onCancel={vi.fn()} onSubmit={onSubmit} transiciones={['SUFICIENCIA']} estadoActual="DESARROLLO" proyecto={{}} />);
    await userEvent.click(screen.getByRole('button', { name: /Continuar a «Informe de suficiencia»/ }));
    expect(await screen.findByText('Indique los aspectos de formato del proyecto')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await userEvent.type(screen.getByPlaceholderText(/Formato, redacción/), 'Correcto');
    await userEvent.type(screen.getByPlaceholderText(/Pertinencia, desarrollo/), 'Consistente');
    await userEvent.type(screen.getByPlaceholderText(/Cumplimiento y desempeño/), 'Sostenido');
    await userEvent.click(screen.getByText('Apto para la Defensa'));
    await userEvent.click(screen.getByRole('button', { name: /Continuar a «Informe de suficiencia»/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ estado: 'SUFICIENCIA', aspectosFormato: 'Correcto', resultadoSuficiencia: 'APROBADO' })));
  });

  it('aprobación de predefensa pide la nota', async () => {
    const onSubmit = vi.fn();
    renderWithProviders(<AprobarEtapaModal open onCancel={vi.fn()} onSubmit={onSubmit} transiciones={['APROBADO_PREDEFENSA']} estadoActual="PREDEFENSA" proyecto={{}} />);
    await userEvent.click(screen.getByRole('checkbox', { name: /Confirmo/ }));
    await userEvent.click(screen.getByRole('button', { name: /Continuar a «Predefensa aprobada»/ }));
    expect(await screen.findByText('Indique la nota que el tribunal asignó en la predefensa')).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText('Nota sobre 100'), '75');
    await userEvent.click(screen.getByRole('button', { name: /Continuar a «Predefensa aprobada»/ }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ estado: 'APROBADO_PREDEFENSA', nota: 75 })));
  });
});
