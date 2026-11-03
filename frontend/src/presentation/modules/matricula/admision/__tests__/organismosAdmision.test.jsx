import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '@/test/renderWithProviders';
import StudentInfoItem from '../components/molecules/StudentInfoItem';
import DatosPersonalesSection from '../components/organisms/DatosPersonalesSection';
import DisabilitiesSection from '../components/organisms/DisabilitiesSection';
import OriginsSection from '../components/organisms/OriginsSection';
import StudentInfoSection from '../components/organisms/StudentInfoSection';
import DocumentDeliveriesSection from '../components/organisms/DocumentDeliveriesSection';
import GuardiansSection from '../components/organisms/GuardiansSection';
import ScholarshipsSection from '../components/organisms/ScholarshipsSection';
import EstudianteAccessSection from '../components/organisms/EstudianteAccessSection';
import { DEFAULT_ESTADO_CFG, ESTADO, formatDate, getEstadoBecaCfg } from '../config/scholarshipsSectionConfig';
import {
  createAsignarBecaBreadcrumbItems,
  createBreadcrumbItems,
  createDetailBreadcrumbItems,
  createListBreadcrumbItems,
  createRegisterBreadcrumbItems,
} from '../config/breadcrumbs';

const navigate = vi.hoisted(() => vi.fn());
vi.mock('react-router-dom', async (orig) => ({ ...(await orig()), useNavigate: () => navigate }));
vi.mock('@container', () => ({ useContainer: () => ({ resolve: vi.fn() }) }));

beforeEach(() => navigate.mockClear());

describe('StudentInfoItem', () => {
  it('muestra etiqueta y valor; sin valor usa N/A', () => {
    const { rerender } = render(<StudentInfoItem icon={<i />} label="CI" value="123" />);
    expect(screen.getByText('CI')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
    rerender(<StudentInfoItem icon={<i />} label="CI" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});

describe('secciones de la ficha de admisión', () => {
  it('StudentInfoSection: sin estudiante no pinta; con estudiante muestra sus datos', () => {
    const { container, rerender } = render(<StudentInfoSection student={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<StudentInfoSection student={{ codigoEstudiante: 'E-1', nombreCompleto: 'Pérez Ana', ciCompleto: '123 LP' }} />);
    expect(screen.getByText('Información del estudiante')).toBeInTheDocument();
    expect(screen.getByText('E-1')).toBeInTheDocument();
    expect(screen.getByText('Pérez Ana')).toBeInTheDocument();
    expect(screen.getByText('123 LP')).toBeInTheDocument();
  });

  it('DatosPersonalesSection: campos, estado civil de respaldo y residencia compuesta', () => {
    const { container, rerender } = render(<DatosPersonalesSection />);
    expect(container).toBeEmptyDOMElement();
    rerender(
      <DatosPersonalesSection
        studentData={{
          codigoEstudiante: 'E-1', ciCompleto: '123 LP', nombres: 'Ana', estadoCivilId: 2, tipoSangre: 'O+',
          municipioResidenciaName: 'La Paz', provinciaResidenciaName: 'Murillo', departamentoResidenciaName: 'La Paz', observaciones: 'Nota',
        }}
      />,
    );
    expect(screen.getByText('DATOS PERSONALES')).toBeInTheDocument();
    expect(screen.getByText('Ana')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('La Paz, Murillo, La Paz')).toBeInTheDocument();
    expect(screen.getByText('Observaciones')).toBeInTheDocument();
  });

  it('DatosPersonalesSection: usa la residencia completa del servidor y oculta observaciones vacías', () => {
    render(<DatosPersonalesSection studentData={{ residenceAddressComplete: 'Calle 1', estadoCivilName: 'Soltero' }} />);
    expect(screen.getByText('Calle 1')).toBeInTheDocument();
    expect(screen.getByText('Soltero')).toBeInTheDocument();
    expect(screen.queryByText('Observaciones')).not.toBeInTheDocument();
  });

  it('DisabilitiesSection: lista cada discapacidad con separadores y causa opcional', () => {
    const { container, rerender } = render(<DisabilitiesSection disabilities={[]} />);
    expect(container).toBeEmptyDOMElement();
    rerender(
      <DisabilitiesSection
        disabilities={[
          { id: 1, disabilityTypeName: 'Visual', disabilityDegree: 'Leve', description: 'Miopía', cause: 'Congénita' },
          { disabilityTypeId: 7, gradoDiscapacidad: 'Grave', descripcion: 'Otra' },
        ]}
      />,
    );
    expect(screen.getByText('Visual')).toBeInTheDocument();
    expect(screen.getByText('Congénita')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getAllByText('Causa')).toHaveLength(1);
    expect(container.querySelectorAll('.ant-divider')).toHaveLength(1);
  });

  it('OriginsSection: principal sí/no, países y lugar de nacimiento', () => {
    const { container, rerender } = render(<OriginsSection origins={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(
      <OriginsSection
        origins={[
          { id: 1, originType: 'NACIMIENTO', isPrincipal: true, countryName: 'Bolivia', originAddressComplete: 'La Paz', motherTongueName: 'Aymara' },
          { tipoOrigen: 'RESIDENCIA', countryId: 9, birthCity: 'Oruro', secondaryLanguageId: 3 },
        ]}
      />,
    );
    expect(screen.getByText('Sí')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('Bolivia')).toBeInTheDocument();
    expect(screen.getByText('Oruro')).toBeInTheDocument();
    expect(screen.getByText('Aymara')).toBeInTheDocument();
  });
});

describe('DocumentDeliveriesSection', () => {
  it('sin documentos no pinta nada', () => {
    const { container } = render(<DocumentDeliveriesSection documentDeliveries={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('entregado, pendiente, en trámite y observaciones', () => {
    render(
      <DocumentDeliveriesSection
        documentDeliveries={[
          { id: 1, documentacionName: 'Cédula', entregado: true, fechaEntrega: '2026-02-01' },
          { id: 2, documentacionId: 55, entregado: false, enTramite: true, observaciones: 'Falta sello' },
          {},
        ]}
      />,
    );
    expect(screen.getByText('Documentos entregados')).toBeInTheDocument();
    expect(screen.getByText('Cédula')).toBeInTheDocument();
    expect(screen.getByText('Entregado el 2026-02-01')).toBeInTheDocument();
    expect(screen.getByText('55')).toBeInTheDocument();
    expect(screen.getByText('Documento 3')).toBeInTheDocument();
    expect(screen.getByText(/En trámite/)).toBeInTheDocument();
    expect(screen.getByText('Falta sello')).toBeInTheDocument();
    expect(screen.getAllByText(/Pendiente/)).toHaveLength(2);
  });
});

describe('GuardiansSection', () => {
  it('sin contactos no pinta', () => {
    const { container } = render(<GuardiansSection guardians={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('nombre, parentesco, convivencia y teléfonos con enlace', () => {
    render(
      <GuardiansSection
        guardians={[
          { id: 1, firstName: 'María', lastName: 'Luna', relationshipTypeName: 'Madre', livesWithStudent: true, cellphone1: '7111', cellphone2: '7222' },
          { nombres: 'Juan', relationshipTypeId: 4, celular1: '7333' },
          {},
        ]}
      />,
    );
    expect(screen.getByText('Contactos de emergencia')).toBeInTheDocument();
    expect(screen.getByText('María Luna')).toBeInTheDocument();
    expect(screen.getByText('Madre')).toBeInTheDocument();
    expect(screen.getByText('Convive')).toBeInTheDocument();
    expect(screen.getAllByText('No convive')).toHaveLength(2);
    expect(screen.getByRole('link', { name: '7111' })).toHaveAttribute('href', 'tel:7111');
    expect(screen.getByRole('link', { name: '7222' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '7333' })).toBeInTheDocument();
    expect(screen.getAllByText('Contacto')).toHaveLength(1);
    expect(screen.getAllByText('—').length).toBeGreaterThan(0);
  });
});

describe('configuración de becas de la ficha', () => {
  it('resuelve el estado conocido, el desconocido y el vacío', () => {
    expect(getEstadoBecaCfg('ACTIVA')).toBe(ESTADO.ACTIVA);
    expect(getEstadoBecaCfg('RARO')).toEqual({ ...DEFAULT_ESTADO_CFG, label: 'RARO' });
    expect(getEstadoBecaCfg()).toEqual(DEFAULT_ESTADO_CFG);
    expect(getEstadoBecaCfg()).not.toBe(DEFAULT_ESTADO_CFG);
  });

  it('formatea fechas o devuelve nulo', () => {
    expect(formatDate(null)).toBeNull();
    expect(formatDate('2026-03-05T12:00:00')).toMatch(/2026/);
  });
});

describe('ScholarshipsSection', () => {
  const becas = [
    { id: 1, scholarshipName: 'Excelencia', scholarshipCode: 'B-1', state: 'ACTIVA', scholarshipPercentage: 50, requestDate: '2026-03-05T12:00:00', managementCode: 'G-2026', documentsComplete: true, observations: 'Buen promedio' },
    { id: 2, estado: 'PENDIENTE', documentosCompletos: false },
  ];

  it('sin becas no pinta', () => {
    const { container } = render(<ScholarshipsSection scholarships={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra nombre, estado, descuento, gestión, documentos y observaciones', () => {
    render(<ScholarshipsSection scholarships={becas} />);
    expect(screen.getByText('Becas asignadas')).toBeInTheDocument();
    expect(screen.getByText('Excelencia')).toBeInTheDocument();
    expect(screen.getByText('B-1')).toBeInTheDocument();
    expect(screen.getByText('Activa')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('G-2026')).toBeInTheDocument();
    expect(screen.getByText(/Completos/)).toBeInTheDocument();
    expect(screen.getByText(/Incompletos/)).toBeInTheDocument();
    expect(screen.getByText('Obs: Buen promedio')).toBeInTheDocument();
    expect(screen.getByText('Beca 2')).toBeInTheDocument();
    expect(screen.getByText('Pendiente')).toBeInTheDocument();
  });

  it('sin onDeleteBeca no ofrece eliminar', () => {
    renderWithProviders(<ScholarshipsSection scholarships={becas} />, { auth: { permisos: [permiso('matricula.beca.asignar', 'ELIMINAR')] } });
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
  });

  it('eliminar exige el permiso ELIMINAR y llama onDeleteBeca con la beca cruda tras confirmar', async () => {
    const onDeleteBeca = vi.fn().mockResolvedValue({ success: true });
    const { unmount } = renderWithProviders(<ScholarshipsSection scholarships={becas} onDeleteBeca={onDeleteBeca} />, {
      auth: { permisos: [permiso('matricula.beca.asignar', 'ELIMINAR')] },
    });
    const botones = screen.getAllByRole('button', { name: 'delete' });
    expect(botones).toHaveLength(2);
    await userEvent.click(botones[0]);
    const confirmar = await screen.findByRole('button', { name: /Eliminar|Sí|Confirmar|OK/i });
    await userEvent.click(confirmar);
    await vi.waitFor(() => expect(onDeleteBeca).toHaveBeenCalledWith(becas[0]));
    unmount();
    renderWithProviders(<ScholarshipsSection scholarships={becas} onDeleteBeca={onDeleteBeca} />);
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
  });
});

describe('EstudianteAccessSection', () => {
  const props = { estudianteId: 5, estudianteNombreCompleto: 'Pérez Ana', estudianteCiCompleto: '123', estudianteCodigo: 'E-5', estudianteEmailPersonal: 'a@x.bo' };

  it('sin cuenta explica y permite crear usuario con el vínculo prellenado', async () => {
    renderWithProviders(<EstudianteAccessSection {...props} access={{ tieneAcceso: false }} puedeCrearUsuario />, { route: '/estudiantes/5' });
    expect(screen.getByText(/no tiene usuario vinculado/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Crear usuario de acceso/ }));
    expect(navigate).toHaveBeenCalledWith('/seguridad/usuarios/nuevo', {
      state: expect.objectContaining({
        createInitialStep: 2,
        forceCategoriaCreacion: 'ASIGNAR_ESTUDIANTE',
        forceRoleCode: 'ESTUDIANTE',
        returnToPath: '/estudiantes/5',
        prefillEstudianteUsuario: { estudianteId: 5, nombreCompleto: 'Pérez Ana', ciCompleto: '123', codigo: 'E-5', emailPersonal: 'a@x.bo' },
      }),
    });
  });

  it('sin permiso de crear no hay acción; sin id de estudiante no navega', async () => {
    const { unmount } = renderWithProviders(<EstudianteAccessSection {...props} access={{ tieneAcceso: false }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<EstudianteAccessSection access={null} puedeCrearUsuario />);
    await userEvent.click(screen.getByRole('button', { name: /Crear usuario de acceso/ }));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('con cuenta muestra usuario, rol y estado; administrar exige permiso', async () => {
    const access = { tieneAcceso: true, usuarioId: 9, usuario: 'ana.perez', rol: 'ESTUDIANTE', estadoCuenta: 'BLOQUEADO' };
    const { unmount } = renderWithProviders(<EstudianteAccessSection {...props} access={access} puedeEditarUsuario />);
    expect(screen.getByText('ana.perez')).toBeInTheDocument();
    expect(screen.getByText('ESTUDIANTE')).toBeInTheDocument();
    expect(screen.getByText('BLOQUEADO')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Administrar usuario/ }));
    expect(navigate).toHaveBeenCalledWith('/seguridad/usuarios/9');
    unmount();
    renderWithProviders(<EstudianteAccessSection {...props} access={access} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('estado de cuenta vacío se rotula como activo sin restricción', () => {
    renderWithProviders(<EstudianteAccessSection {...props} access={{ tieneAcceso: true, usuarioId: 1 }} />);
    expect(screen.getByText('Activo (sin restricción registrada)')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});

describe('breadcrumbs de admisión', () => {
  it('generan items con la raíz Matrícula y el título actual', () => {
    expect(createBreadcrumbItems('MAT-ADMISION')).toEqual(expect.any(Array));
    expect(createListBreadcrumbItems().length).toBeGreaterThan(0);
    expect(JSON.stringify(createRegisterBreadcrumbItems('Editar estudiante'))).toContain('Editar estudiante');
    expect(JSON.stringify(createDetailBreadcrumbItems())).toContain('Detalle del estudiante');
    expect(JSON.stringify(createAsignarBecaBreadcrumbItems())).toContain('Asignar beca');
  });
});
