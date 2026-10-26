import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardWelcomeBanner from '../DashboardWelcomeBanner';
import DashboardAccesoHubCard from '../DashboardAccesoHubCard';
import DashboardAccesoRapidoCard from '../DashboardAccesoRapidoCard';
import DashboardCarrerasSection from '../DashboardCarrerasSection';
import DashboardCarreraCard from '../DashboardCarreraCard';
import DashboardEstudiantesResumenCard from '../DashboardEstudiantesResumenCard';
import DashboardMiSaldoCard from '../DashboardMiSaldoCard';
import DashboardCapacitacionAbiertaTiles from '../DashboardCapacitacionAbiertaTiles';
import DashboardCursosDocenteCard from '../DashboardCursosDocenteCard';
import DashboardDocentesListCard from '../DashboardDocentesListCard';
import DashboardActividadesRecientesCard from '../DashboardActividadesRecientesCard';
import DashboardPersonasOverflowModal from '../DashboardPersonasOverflowModal';
import DashboardUltimosPersonasBlock from '../DashboardUltimosPersonasBlock';
import DashboardUltimosRegistrosPanel from '../DashboardUltimosRegistrosPanel';
import DashboardPageShell from '../../organisms/DashboardPageShell';

describe('DashboardWelcomeBanner', () => {
  it('muestra los dos CTA y los dispara', async () => {
    const onVerCarreras = vi.fn();
    const onRegistrarEstudiante = vi.fn();
    render(<DashboardWelcomeBanner onVerCarreras={onVerCarreras} onRegistrarEstudiante={onRegistrarEstudiante} />);
    await userEvent.click(screen.getByRole('button', { name: 'Ver carreras' }));
    await userEvent.click(screen.getByRole('button', { name: 'Registrar estudiante' }));
    expect(onVerCarreras).toHaveBeenCalled();
    expect(onRegistrarEstudiante).toHaveBeenCalled();
  });

  it('oculta los CTA según permisos y respeta título/descripción propios', () => {
    render(<DashboardWelcomeBanner showVerCarreras={false} showRegistrarEstudiante={false} title="Hola, Ana" description="Detalle" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Hola, Ana')).toBeInTheDocument();
    expect(screen.getByText('Detalle')).toBeInTheDocument();
  });

  it('muestra solo el CTA permitido', () => {
    render(<DashboardWelcomeBanner showVerCarreras={false} />);
    expect(screen.queryByRole('button', { name: 'Ver carreras' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Registrar estudiante' })).toBeInTheDocument();
  });
});

describe('Tarjetas de acceso', () => {
  it('DashboardAccesoHubCard responde a clic y a Enter/Espacio', async () => {
    const onClick = vi.fn();
    render(<DashboardAccesoHubCard icon={<i />} title="Mi perfil" description="Revise su cuenta" actionLabel="Ir" onClick={onClick} />);
    const tarjeta = screen.getByRole('button');
    await userEvent.click(tarjeta);
    tarjeta.focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
    expect(screen.getByText('Revise su cuenta')).toBeInTheDocument();
  });

  it('DashboardAccesoRapidoCard muestra el detalle y navega por teclado', async () => {
    const onClick = vi.fn();
    render(<DashboardAccesoRapidoCard icon={<i />} title="Mis aportes" detail="Bs 10" onClick={onClick} />);
    expect(screen.getByText('Bs 10')).toBeInTheDocument();
    screen.getByRole('link').focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('DashboardCarrerasSection / DashboardCarreraCard', () => {
  it('sin carreras muestra el texto vacío', () => {
    render(<DashboardCarrerasSection carreras={[]} />);
    expect(screen.getByText('No hay carreras activas para mostrar.')).toBeInTheDocument();
    expect(screen.queryByText('Ver todas')).not.toBeInTheDocument();
  });

  it('lista carreras y permite "Ver todas" y seleccionar una', async () => {
    const onVerTodas = vi.fn();
    const onCarreraClick = vi.fn();
    render(
      <DashboardCarrerasSection
        carreras={[{ id: 1, label: 'Sistemas', codigo: 'SIS' }, { id: 2, label: 'Contaduría', codigo: 'CON', image: '/c.png' }]}
        onVerTodas={onVerTodas}
        onCarreraClick={onCarreraClick}
      />,
    );
    await userEvent.click(screen.getByText('Ver todas'));
    expect(onVerTodas).toHaveBeenCalled();
    await userEvent.click(screen.getByText('Sistemas'));
    expect(onCarreraClick).toHaveBeenCalled();
    expect(screen.getByAltText('Contaduría')).toHaveAttribute('src', '/c.png');
  });

  it('la tarjeta sin código usa "?" como inicial', () => {
    render(<DashboardCarreraCard carrera={{ label: 'Otra' }} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});

describe('DashboardEstudiantesResumenCard', () => {
  it('muestra hoy y este mes por defecto', () => {
    render(<DashboardEstudiantesResumenCard todayCount={2} monthCount={9} />);
    expect(screen.getByText('Hoy: 2 estudiantes')).toBeInTheDocument();
    expect(screen.getByText('Este mes: 9 estudiantes')).toBeInTheDocument();
  });

  it('acepta líneas personalizadas', () => {
    render(<DashboardEstudiantesResumenCard compact lines={[{ label: 'Cursos', value: 4 }]} />);
    expect(screen.getByText('Cursos: 4')).toBeInTheDocument();
    expect(screen.queryByText(/Hoy/)).not.toBeInTheDocument();
  });
});

describe('DashboardMiSaldoCard', () => {
  it('con deuda avisa que hay saldo por cubrir', () => {
    render(<DashboardMiSaldoCard saldoPendiente={150} />);
    expect(screen.getByText('Tiene un saldo por cubrir.')).toBeInTheDocument();
  });

  it('sin deuda indica que está al día y navega con Enter', async () => {
    const onVerAportes = vi.fn();
    render(<DashboardMiSaldoCard saldoPendiente={0} onVerAportes={onVerAportes} />);
    expect(screen.getByText('Está al día con sus aportes.')).toBeInTheDocument();
    screen.getByRole('button').focus();
    await userEvent.keyboard('{Enter}');
    expect(onVerAportes).toHaveBeenCalled();
  });
});

describe('DashboardCapacitacionAbiertaTiles', () => {
  it('sin cursos no dibuja nada', () => {
    const { container } = render(<DashboardCapacitacionAbiertaTiles cursos={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('numera los cursos e inscribe con el curso elegido', async () => {
    const onInscribir = vi.fn();
    const cursos = [
      { id: 1, tituloCompleto: 'Excel', fechaInicioLabel: '01/02' },
      { id: 2, tituloCompleto: 'Word' },
    ];
    render(<DashboardCapacitacionAbiertaTiles cursos={cursos} onInscribir={onInscribir} />);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText(/Inicia 01\/02/)).toBeInTheDocument();
    await userEvent.click(screen.getByText('Word'));
    expect(onInscribir).toHaveBeenCalledWith(cursos[1]);
  });
});

describe('DashboardCursosDocenteCard', () => {
  it('sin cursos muestra el vacío', () => {
    render(<DashboardCursosDocenteCard />);
    expect(screen.getByText(/Aún no tiene cursos asignados/)).toBeInTheDocument();
  });

  it('agrupa por carrera y periodo, con conteos y acción de cabecera', () => {
    render(
      <DashboardCursosDocenteCard
        headerAction={<button>Mis asignaciones</button>}
        cursos={[
          { id: 1, materia: 'Álgebra', materiaSigla: 'MAT', carrera: 'Sistemas', periodo: 'Primer Año', paralelo: 'A', turno: 'NOCHE', horasSemana: 4, bloques: 1, estudiantes: 1 },
          { id: 2, materia: 'Cálculo', carrera: 'Sistemas', periodo: 'Primer Año', estudiantes: 25 },
        ]}
      />,
    );
    expect(screen.getByText('2 cursos')).toBeInTheDocument();
    expect(screen.getByText('MAT · Álgebra')).toBeInTheDocument();
    expect(screen.getByText('A · NOCHE · 4 h/sem · 1 bloque')).toBeInTheDocument();
    expect(screen.getByText('1 estudiante')).toBeInTheDocument();
    expect(screen.getByText('25 estudiantes')).toBeInTheDocument();
    expect(screen.getByText('Sin contexto académico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mis asignaciones' })).toBeInTheDocument();
  });
});

describe('DashboardDocentesListCard', () => {
  it('sin docentes explica que no hay asignados', () => {
    render(<DashboardDocentesListCard />);
    expect(screen.getByText(/Aún no tiene docentes asignados/)).toBeInTheDocument();
  });

  it('lista docentes y materias, con texto por defecto si no hay materias', () => {
    render(
      <DashboardDocentesListCard docentes={[{ id: 1, name: 'PEREZ ANA', description: 'Álgebra' }, { id: 2, name: 'LOPEZ LUIS' }]} />,
    );
    expect(screen.getByText('2 docentes')).toBeInTheDocument();
    expect(screen.getByText('Álgebra')).toBeInTheDocument();
    expect(screen.getByText('Sin materias registradas')).toBeInTheDocument();
  });
});

describe('DashboardActividadesRecientesCard', () => {
  it('vacío', () => {
    render(<DashboardActividadesRecientesCard actividades={[]} />);
    expect(screen.getByText('No hay actividades recientes.')).toBeInTheDocument();
  });

  it('navega solo si la actividad trae enlace', async () => {
    const onRowNavigate = vi.fn();
    const onVerTodas = vi.fn();
    render(
      <DashboardActividadesRecientesCard
        onVerTodas={onVerTodas}
        onRowNavigate={onRowNavigate}
        actividades={[
          { name: 'Ana', action: 'se inscribió', timeAgo: 'hace 1 h', linkPath: '/estudiantes/1' },
          { name: 'Luis', action: 'pagó' },
        ]}
      />,
    );
    await userEvent.click(screen.getAllByText('Ana')[0]);
    expect(onRowNavigate).toHaveBeenCalledWith('/estudiantes/1');
    onRowNavigate.mockClear();
    await userEvent.click(screen.getAllByText('Luis')[0]);
    expect(onRowNavigate).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Ver todas'));
    expect(onVerTodas).toHaveBeenCalled();
    expect(screen.getByText('hace 1 h')).toBeInTheDocument();
  });
});

describe('DashboardPersonasOverflowModal', () => {
  it('lista las personas restantes y navega al listado completo', async () => {
    const onNavigateList = vi.fn();
    const onClose = vi.fn();
    render(
      <DashboardPersonasOverflowModal
        open
        title="Últimos docentes"
        items={[{ id: 1, name: 'Ana', description: 'Sistemas' }]}
        listPath="/docentes/listar"
        onClose={onClose}
        onNavigateList={onNavigateList}
      />,
    );
    expect(screen.getByText('Ana')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Ver listado completo' }));
    expect(onNavigateList).toHaveBeenCalledWith('/docentes/listar');
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('sin items muestra el vacío y sin ruta deshabilita el listado', () => {
    render(<DashboardPersonasOverflowModal open title="X" items={[]} />);
    expect(screen.getByText('No hay personas para mostrar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ver listado completo' })).toBeDisabled();
  });
});

describe('Últimos registros', () => {
  const personas = [1, 2, 3, 4, 5].map((n) => ({ id: n, name: `Persona ${n}`, description: `desc ${n}`, avatarSeed: `s${n}` }));

  it('el bloque muestra título, total, "reciente" y badge +N que abre el overflow', async () => {
    const onOverflowClick = vi.fn();
    const onVerTodos = vi.fn();
    render(
      <DashboardUltimosPersonasBlock title="Últimos docentes" people={personas} onVerTodos={onVerTodos} onOverflowClick={onOverflowClick} />,
    );
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Reciente: desc 1')).toBeInTheDocument();
    await userEvent.click(screen.getByText('+2'));
    expect(onOverflowClick).toHaveBeenCalled();
    await userEvent.click(screen.getByText('Ver todos'));
    expect(onVerTodos).toHaveBeenCalled();
  });

  it('el bloque sin personas no muestra línea de reciente', () => {
    render(<DashboardUltimosPersonasBlock title="Últimos estudiantes" people={[]} />);
    expect(screen.queryByText(/Reciente/)).not.toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('el panel compone ambos bloques', () => {
    render(<DashboardUltimosRegistrosPanel ultimosDocentes={[]} ultimosEstudiantes={personas.slice(0, 1)} />);
    expect(screen.getByText('Últimos docentes')).toBeInTheDocument();
    expect(screen.getByText('Últimos estudiantes')).toBeInTheDocument();
  });
});

describe('DashboardPageShell', () => {
  it('renderiza sus hijos', () => {
    render(<DashboardPageShell><p>contenido</p></DashboardPageShell>);
    expect(screen.getByText('contenido')).toBeInTheDocument();
  });
});
