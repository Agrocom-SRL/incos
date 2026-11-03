/**
 * Componentes pequeños de Calificaciones: plazo, pagers, celdas, contexto, footer y cabecera.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, permiso } from '../../../../../test/renderWithProviders.jsx';

const { navegacion, footerState } = vi.hoisted(() => ({
  navegacion: { current: {} },
  footerState: { current: { tipo: 'neutro' } },
}));

vi.mock('@application-academico/calificaciones/hooks/useNavegacionBimestres.js', () => ({
  useNavegacionBimestres: () => navegacion.current,
}));
vi.mock('@application-academico/calificaciones/context/cuadernoAutosaveContexts', () => ({
  useCuadernoFooterState: () => footerState.current,
}));

import BimestrePlazoCountdown from '../components/BimestrePlazoCountdown.jsx';
import CuadernoBimestrePager from '../components/CuadernoBimestrePager.jsx';
import BimestreConsolidadoBimestrePager from '../components/BimestreConsolidadoBimestrePager.jsx';
import CalificacionesAcciones, {
  AccionVolverCoordinacion,
  AccionConfiguracionNotas,
} from '../components/CalificacionesAcciones.jsx';
import CeldaEstudiante from '../components/CeldaEstudiante.jsx';
import CeldaSumaConAjusteInfo from '../components/CeldaSumaConAjusteInfo.jsx';
import ComponenteNotaCell from '../components/ComponenteNotaCell.jsx';
import CuadernoBuscarEstudiantes from '../components/CuadernoBuscarEstudiantes.jsx';
import CuadernoContextoPanel from '../components/CuadernoContextoPanel.jsx';
import CuadernoFooter from '../components/CuadernoFooter.jsx';
import CuadernoSkeleton from '../components/CuadernoSkeleton.jsx';
import CursoBimestres from '../components/CursoBimestres.jsx';
import CursoHeaderCard from '../components/CursoHeaderCard.jsx';
import CursoProfileHeader from '../components/CursoProfileHeader.jsx';
import EstadoEvaluacionChip from '../components/ajustes/EstadoEvaluacionChip.jsx';
import SeccionAjustes from '../components/ajustes/SeccionAjustes.jsx';
import { buildCursoProfileStats } from '../utils/buildCursoProfileStats.js';

const fmt = (d) => d.toISOString().slice(0, 10);
const enDias = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12));
};

describe('BimestrePlazoCountdown', () => {
  it('muestra los días restantes del bimestre', () => {
    render(
      <BimestrePlazoCountdown bimestreNum={1} fechaInicio={enDias(-10)} fechaFin={enDias(5)} />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/Quedan 5 días disponibles/);
    expect(screen.getByRole('status')).toHaveTextContent(/cierre:/);
  });

  it('singular y "hoy"', () => {
    const { rerender } = render(
      <BimestrePlazoCountdown bimestreNum={1} fechaInicio={enDias(-10)} fechaFin={enDias(1)} />,
    );
    expect(screen.getByText('1 día')).toBeInTheDocument();
    rerender(
      <BimestrePlazoCountdown bimestreNum={1} fechaInicio={enDias(-10)} fechaFin={enDias(0)} />,
    );
    expect(screen.getByText('hoy')).toBeInTheDocument();
  });

  it('nivel danger parpadea cuando el progreso es alto', () => {
    render(
      <BimestrePlazoCountdown bimestreNum={1} fechaInicio={enDias(-90)} fechaFin={enDias(5)} />,
    );
    expect(screen.getByRole('status').className).toMatch(/--danger/);
    expect(screen.getByRole('status').className).toMatch(/--parpadeo/);
  });

  it('último bimestre solo se ve en los últimos 2 días y habla de la gestión', () => {
    const { container, rerender } = render(
      <BimestrePlazoCountdown
        bimestreNum={4}
        fechaInicio={enDias(-30)}
        fechaFin={enDias(20)}
        gestionFechaFin={enDias(20)}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(
      <BimestrePlazoCountdown
        bimestreNum={4}
        fechaInicio={enDias(-30)}
        fechaFin={enDias(2)}
        gestionFechaFin={enDias(2)}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent(/gestión académica/);
  });

  it('no renderiza sin fechas, plazo vencido o mostrar=false', () => {
    const { container, rerender } = render(<BimestrePlazoCountdown bimestreNum={1} />);
    expect(container).toBeEmptyDOMElement();
    rerender(
      <BimestrePlazoCountdown bimestreNum={1} fechaInicio={enDias(-20)} fechaFin={enDias(-1)} />,
    );
    expect(container).toBeEmptyDOMElement();
    rerender(
      <BimestrePlazoCountdown
        bimestreNum={1}
        fechaInicio={enDias(-10)}
        fechaFin={enDias(5)}
        mostrar={false}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});

describe('pagers de bimestre', () => {
  beforeEach(() => {
    navegacion.current = {
      puedeAnterior: true,
      puedeSiguiente: true,
      irAnterior: vi.fn(),
      irSiguiente: vi.fn(),
    };
  });

  it.each([
    ['cuaderno', CuadernoBimestrePager],
    ['consolidado', BimestreConsolidadoBimestrePager],
  ])('%s: navega con las flechas', async (_n, Pager) => {
    const user = userEvent.setup();
    renderWithProviders(<Pager asignacionId={3} bimestreActivo={2} bimestreVigente={3} />);
    await user.click(screen.getByRole('button', { name: 'Bimestre anterior' }));
    await user.click(screen.getByRole('button', { name: /Bimestre siguiente|cuaderno del bimestre vigente/ }));
    expect(navegacion.current.irAnterior).toHaveBeenCalled();
    expect(navegacion.current.irSiguiente).toHaveBeenCalled();
  });

  it.each([
    ['cuaderno', CuadernoBimestrePager],
    ['consolidado', BimestreConsolidadoBimestrePager],
  ])('%s: deshabilita flechas bloqueadas', (_n, Pager) => {
    navegacion.current = { ...navegacion.current, puedeAnterior: false, puedeSiguiente: false };
    renderWithProviders(<Pager asignacionId={3} bimestreActivo={1} bimestreVigente={1} />);
    expect(screen.getByRole('button', { name: 'Bimestre anterior' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bimestre siguiente' })).toBeDisabled();
  });
});

describe('CalificacionesAcciones', () => {
  it('contenedor aplica className', () => {
    const { container } = render(<CalificacionesAcciones className="x">hola</CalificacionesAcciones>);
    expect(container.firstChild).toHaveClass('cal-acciones', 'x');
    expect(screen.getByText('hola')).toBeInTheDocument();
  });

  it('volver a coordinación solo con permiso LISTAR', () => {
    const { unmount } = renderWithProviders(<AccionVolverCoordinacion to="/c" />);
    expect(screen.queryByRole('button', { name: /Volver a coordinación/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<AccionVolverCoordinacion to="/c" />, {
      auth: { permisos: [permiso('academico.calificacion.coordinacion', 'LISTAR')] },
    });
    expect(screen.getByRole('button', { name: /Volver a coordinación/ })).toBeInTheDocument();
  });

  it('configuración de notas: RBAC y click', async () => {
    const onClick = vi.fn();
    const { unmount } = renderWithProviders(<AccionConfiguracionNotas onClick={onClick} />);
    expect(screen.queryByRole('button', { name: /Configuración de notas/ })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<AccionConfiguracionNotas onClick={onClick} />, {
      auth: { permisos: [permiso('academico.calificacion.politica', 'LISTAR')] },
    });
    await userEvent.click(screen.getByRole('button', { name: /Configuración de notas/ }));
    expect(onClick).toHaveBeenCalled();
  });
});

describe('celdas', () => {
  it('CeldaEstudiante con y sin código', () => {
    const { rerender } = render(<CeldaEstudiante nombre="PEREZ JUAN" codigo="E-1" />);
    expect(screen.getByText('E-1')).toBeInTheDocument();
    expect(screen.getByText('PEREZ JUAN')).toBeInTheDocument();
    rerender(<CeldaEstudiante nombre="PEREZ JUAN" />);
    expect(screen.queryByText('E-1')).not.toBeInTheDocument();
  });

  it('CeldaSumaConAjusteInfo muestra guion si no hay suma', () => {
    const { rerender } = render(<CeldaSumaConAjusteInfo suma={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    rerender(<CeldaSumaConAjusteInfo suma={null} className="z" />);
    expect(screen.getByText('—').parentElement).toHaveClass('z');
  });

  describe('ComponenteNotaCell', () => {
    it('lectura: 0 si no hay valor y marca error si excede', () => {
      const { container, rerender } = render(<ComponenteNotaCell valor={null} />);
      expect(screen.getByText('0')).toBeInTheDocument();
      rerender(<ComponenteNotaCell valor={30} max={25} />);
      expect(container.firstChild).toHaveClass('cal-nota-cell--error');
    });

    it('edición: etiqueta accesible según estado', () => {
      const { rerender } = render(<ComponenteNotaCell valor={null} soloLectura={false} />);
      expect(screen.getByLabelText('Puntos sin cargar')).toBeInTheDocument();
      rerender(<ComponenteNotaCell valor={10} max={25} soloLectura={false} />);
      expect(screen.getByLabelText('10 de 25 puntos')).toBeInTheDocument();
      rerender(<ComponenteNotaCell valor={40} max={25} soloLectura={false} />);
      expect(screen.getByLabelText('40 puntos: supera el máximo de 25')).toHaveAttribute(
        'aria-invalid',
        'true',
      );
    });

    it('emite enteros, null al vaciar e ignora decimales', () => {
      const onChange = vi.fn();
      render(<ComponenteNotaCell valor={null} soloLectura={false} onChange={onChange} />);
      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '12' } });
      expect(onChange).toHaveBeenLastCalledWith(12);
    });

    it('al vaciar una nota cargada emite null', () => {
      const onChange = vi.fn();
      render(<ComponenteNotaCell valor={9} soloLectura={false} onChange={onChange} />);
      fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '' } });
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });
});

describe('CuadernoBuscarEstudiantes', () => {
  it('contador total y filtrado, propaga cambios', async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <CuadernoBuscarEstudiantes value="" onChange={onChange} total={8} filtrados={8} />,
    );
    expect(screen.getByText('8 estudiantes')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Buscar estudiante'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
    rerender(<CuadernoBuscarEstudiantes value="a" onChange={onChange} total={8} filtrados={3} />);
    expect(screen.getByText('3 de 8')).toBeInTheDocument();
  });
});

describe('CuadernoContextoPanel', () => {
  const curso = {
    carrera: 'Sistemas',
    periodo: '1er Año',
    estudiantes: 12,
    materia: 'Algebra',
    materiaSigla: 'MAT-1',
    paralelo: 'A',
    turno: 'Mañana',
  };
  const docente = { nombre: 'Ana Gómez', gestionVigente: '2026' };

  it.each([
    [{ bimestreActivo: 3, bimestreVigente: 2 }, 'Futuro · No disponible'],
    [{ bimestreActivo: 2, bimestreVigente: 2, reabierto: true, modoEdicion: true }, 'Reabierto · En edición'],
    [{ bimestreActivo: 2, bimestreVigente: 2, reabierto: true }, 'Reabierto · Solo lectura'],
    [{ bimestreActivo: 1, bimestreVigente: 2 }, 'Histórico · Solo lectura'],
    [{ bimestreActivo: 2, bimestreVigente: 2, modoEdicion: true }, 'Vigente · En edición'],
    [{ bimestreActivo: 2, bimestreVigente: 2 }, 'Vigente · Solo lectura'],
  ])('estado del bimestre %#', (props, etiqueta) => {
    render(<CuadernoContextoPanel curso={curso} docente={docente} {...props} />);
    expect(screen.getByText(etiqueta)).toBeInTheDocument();
  });

  it('muestra datos del curso y docente en vista coordinación', () => {
    render(
      <CuadernoContextoPanel
        curso={curso}
        docente={docente}
        bimestreTitulo="Bimestre 2"
        bimestreActivo={2}
        esVistaCoordinacion
        docenteNombre="Luis Rojas"
      />,
    );
    expect(screen.getByText('Luis Rojas (vista coordinación)')).toBeInTheDocument();
    expect(screen.getByText('Algebra')).toBeInTheDocument();
    expect(screen.getByText('MAT-1')).toBeInTheDocument();
    expect(screen.getByText('Bimestre 2')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('sin datos usa guiones', () => {
    render(<CuadernoContextoPanel />);
    expect(screen.getAllByText('—').length).toBeGreaterThan(5);
  });
});

describe('CuadernoFooter', () => {
  it.each([
    [{ tipo: 'guardando' }, /Guardando notas/],
    [{ tipo: 'pendiente', cantidad: 1 }, /1 cambio sin guardar/],
    [{ tipo: 'pendiente', cantidad: 3 }, /3 cambios sin guardar/],
    [{ tipo: 'guardado', haceSeg: 4 }, /hace 4 seg/],
    [{ tipo: 'neutro' }, /Sin cambios pendientes/],
  ])('estado %#', (estado, texto) => {
    footerState.current = estado;
    render(<CuadernoFooter />);
    expect(screen.getByText(texto)).toBeInTheDocument();
    expect(screen.getByText(/lo realiza Coordinación Académica/)).toBeInTheDocument();
  });
});

describe('CuadernoSkeleton', () => {
  it('queda marcado como ocupado', () => {
    render(<CuadernoSkeleton />);
    expect(screen.getByLabelText('Cargando cuaderno')).toHaveAttribute('aria-busy', 'true');
  });
});

describe('CursoBimestres', () => {
  const bimestres = [
    { numero: 1, estado: { tipo: 'cerrado', etiqueta: 'Cerrado' }, progreso: 100, aprobados: 8, reprobados: 2 },
    { numero: 2, estado: { tipo: 'abierto', etiqueta: 'En curso' }, progreso: 40, pendientes: 5 },
    { numero: 3, estado: { tipo: 'futuro', etiqueta: 'Futuro' }, progreso: 0 },
  ];

  it('no renderiza sin bimestres', () => {
    const { container } = render(<CursoBimestres bimestres={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra aprobados/reprobados, pendientes y marca el vigente', () => {
    const { container } = render(<CursoBimestres bimestres={bimestres} bimestreVigente={2} />);
    expect(screen.getByText('B1')).toBeInTheDocument();
    expect(screen.getByText('Pend. 5')).toBeInTheDocument();
    expect(screen.getAllByTitle('Aprobados')[0]).toHaveTextContent('8');
    expect(screen.getAllByTitle('Reprobados')[0]).toHaveTextContent('2');
    expect(container.querySelectorAll('.cal-curso-card__bimestre--vigente')).toHaveLength(1);
    expect(container.querySelectorAll('.cal-curso-card__bimestre--futuro')).toHaveLength(1);
  });
});

describe('cabecera del curso', () => {
  it('buildCursoProfileStats con y sin datos', () => {
    expect(buildCursoProfileStats(null, null, null).every((s) => s.value === '—')).toBe(true);
    const stats = buildCursoProfileStats(
      { nombre: 'Ana', gestionVigente: '2026' },
      { periodo: 'P', paralelo: 'A', turno: 'T', estudiantes: 9 },
      undefined,
    );
    expect(stats.find((s) => s.label === 'Estudiantes').value).toBe('9');
    expect(stats.find((s) => s.label === 'Docente').value).toBe('Ana');
  });

  it('CursoProfileHeader: sigla como avatar, ícono sin sigla y botón de ajustes', async () => {
    const onAjustes = vi.fn();
    const { container, rerender } = render(
      <CursoProfileHeader
        materia="Algebra"
        sigla="mat"
        subtitulo="Sistemas"
        pill="Bimestre 2"
        stats={[{ label: 'Turno', value: 'Mañana' }]}
        onAjustes={onAjustes}
      />,
    );
    expect(screen.getByText('MAT')).toBeInTheDocument();
    expect(screen.getByText('Bimestre 2')).toBeInTheDocument();
    expect(screen.getByText('Mañana')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Configuración del curso' }));
    expect(onAjustes).toHaveBeenCalled();

    rerender(<CursoProfileHeader materia={null} ajustesDisabled onAjustes={onAjustes} />);
    expect(container.querySelector('.cal-curso-profile__avatar--sigla')).toBeNull();
    expect(screen.getByRole('button', { name: 'Configuración del curso' })).toBeDisabled();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('—');
  });

  it('CursoProfileHeader sin acciones no pinta la barra', () => {
    const { container } = render(<CursoProfileHeader materia="X" />);
    expect(container.querySelector('.cal-curso-profile__toolbar')).toBeNull();
  });

  it('CursoHeaderCard compone pill y stats', () => {
    render(
      <CursoHeaderCard
        curso={{ materia: 'Algebra', materiaSigla: 'MAT', carrera: 'Sistemas', paralelo: 'B' }}
        docente={{ nombre: 'Ana' }}
        bimestreActual={3}
        estudiantesCount={20}
        acciones={<span>extra</span>}
      />,
    );
    expect(screen.getByText('Bimestre 3')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
  });
});

describe('ajustes', () => {
  it('EstadoEvaluacionChip aplica / no aplica', () => {
    const { rerender } = render(<EstadoEvaluacionChip aplica />);
    expect(screen.getByText('Aplica a este curso')).toBeInTheDocument();
    rerender(<EstadoEvaluacionChip aplica={false} />);
    expect(screen.getByText('No aplica a este curso')).toBeInTheDocument();
  });

  it('SeccionAjustes renderiza título, ícono y cuerpo', () => {
    const Icon = (p) => <i data-testid="ic" {...p} />;
    const { container } = render(
      <SeccionAjustes icon={Icon} titulo="Notas" destacada className="k">
        cuerpo
      </SeccionAjustes>,
    );
    expect(screen.getByRole('heading', { name: 'Notas' })).toBeInTheDocument();
    expect(screen.getByTestId('ic')).toBeInTheDocument();
    expect(screen.getByText('cuerpo')).toBeInTheDocument();
    expect(container.firstChild).toHaveClass('cal-ajustes-seccion--destacada', 'k');
  });
});
