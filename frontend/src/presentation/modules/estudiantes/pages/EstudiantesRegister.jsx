/**
 * EstudiantesRegister - Página para registrar nuevo estudiante
 * 
 * Single Responsibility: Mostrar datos de referencia iniciales para el formulario de registro
 * 
 * Atomic Design: Page
 * - Por ahora solo muestra los datos de referencia disponibles
 * - Futuramente orquestará el formulario completo
 * 
 * Arquitectura:
 * Page → Consumer del StudentContext (datos vienen del Provider)
 */

import { useStudentRegisterContext } from '@application-estudiantes/hooks';

const EstudiantesRegister = () => {
  // Obtener datos del contexto (toda la lógica está en el Provider)
  const {
    // Datos esenciales del formulario
    paises = [],
    idiomas = [],
    estadosCiviles = [],
    documentacion = [],
    expediciones = [],
    generos = [],
    tiposSangre = [],
    
    // Estados
    loading = false,
    error = null,
  } = useStudentRegisterContext();

  if (loading) {
    return <div>Cargando datos de referencia...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Registro de Estudiante</h1>
      <p>Datos de referencia cargados:</p>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Países ({paises.length})</h2>
        <pre>{JSON.stringify(paises, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Idiomas ({idiomas.length})</h2>
        <pre>{JSON.stringify(idiomas, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Estados Civiles ({estadosCiviles.length})</h2>
        <pre>{JSON.stringify(estadosCiviles, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Documentación ({documentacion.length})</h2>
        <pre>{JSON.stringify(documentacion, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Expediciones ({expediciones.length})</h2>
        <pre>{JSON.stringify(expediciones, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Géneros ({generos.length})</h2>
        <pre>{JSON.stringify(generos, null, 2)}</pre>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Tipos de Sangre ({tiposSangre.length})</h2>
        <pre>{JSON.stringify(tiposSangre, null, 2)}</pre>
      </div>
    </div>
  );
};

export default EstudiantesRegister;

