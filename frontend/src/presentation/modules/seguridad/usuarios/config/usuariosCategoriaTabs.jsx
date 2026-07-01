/**
 * Pestañas de la pantalla de Usuarios por categoría de rol.
 * El `key` viaja al backend como `?categoria=` y como query string en la URL.
 */
import {
  SafetyCertificateOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';

export const USUARIOS_CATEGORIA_TABS = [
  {
    key: 'sistema',
    label: 'Sistema',
    icon: SafetyCertificateOutlined,
    title: 'Usuarios del sistema',
    description: 'Cuentas con rol Administrador del sistema, sin ficha institucional asociada.',
  },
  {
    key: 'estudiante',
    label: 'Estudiante',
    icon: UserOutlined,
    title: 'Usuarios estudiantes',
    description: 'Cuentas de acceso vinculadas a una ficha de estudiante registrada.',
  },
  {
    key: 'docente',
    label: 'Docente',
    icon: SolutionOutlined,
    title: 'Usuarios docentes',
    description: 'Cuentas de acceso vinculadas a una ficha de docente registrada.',
  },
  {
    key: 'personal',
    label: 'Administrativos',
    icon: TeamOutlined,
    title: 'Usuarios administrativos',
    description: 'Personal institucional: rectorado, dirección académica o administrativa y secretarías.',
  },
];

export const USUARIOS_CATEGORIA_DEFAULT = USUARIOS_CATEGORIA_TABS[0].key;

export const USUARIOS_CATEGORIA_KEYS = USUARIOS_CATEGORIA_TABS.map((t) => t.key);

export const resolveUsuariosCategoria = (requested) =>
  USUARIOS_CATEGORIA_KEYS.includes(requested) ? requested : USUARIOS_CATEGORIA_DEFAULT;
