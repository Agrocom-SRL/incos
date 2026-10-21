import { ManOutlined, UserOutlined, WomanOutlined } from '@ant-design/icons';

/** ENUM de género → icono, tono y etiqueta legible (listado y ficha). */
export const getGeneroMeta = (genero) => {
  const g = String(genero || '').toUpperCase();
  if (g === 'MASCULINO' || g === 'M') {
    return {
      icon: ManOutlined,
      toneClass: 'doc-docente-genero-tone--m',
      label: 'Masculino',
    };
  }
  if (g === 'FEMENINO' || g === 'F') {
    return {
      icon: WomanOutlined,
      toneClass: 'doc-docente-genero-tone--f',
      label: 'Femenino',
    };
  }
  if (!genero) return null;
  return {
    icon: UserOutlined,
    toneClass: 'doc-docente-genero-tone--o',
    label: genero,
  };
};
