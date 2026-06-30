/**
 * Celda de identidad de usuario (patrón gráfico de los listados de Configuración → Académico):
 * barra de acento por rol + usuario (nombre) + correo (secundario con icono).
 * Estilos: clases `cfg-materia-identidad*` (importadas por la página de listado).
 */
import { MailOutlined } from '@ant-design/icons';
import { rolColorVar } from '@modules/seguridad/roles/components/atoms/rolColor.js';

const UsuarioIdentidadCell = ({ username, email, rolTipo, rolIsSystem = false }) => (
  <span className="cfg-materia-identidad">
    <span
      className="cfg-materia-identidad__margen"
      style={{ backgroundColor: rolColorVar(rolTipo, rolIsSystem) }}
      aria-hidden
    />
    <span className="cfg-materia-identidad__texto">
      <span className="cfg-materia-identidad__nombre">{username || '—'}</span>
      <span className="cfg-materia-identidad__sigla">
        <MailOutlined style={{ marginInlineEnd: 4 }} aria-hidden />
        {email || 'Sin correo'}
      </span>
    </span>
  </span>
);

export default UsuarioIdentidadCell;
