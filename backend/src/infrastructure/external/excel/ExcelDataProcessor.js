/**
 * ExcelDataProcessor - Procesa y agrupa los datos para el Excel
 * Responsabilidad: Transformar datos de BD en estructura para Excel
 * Principio: Single Responsibility Principle (SRP)
 */

class ExcelDataProcessor {
  /**
   * Agrupa los datos por carrera y periodo
   */
  static agruparDatos(datos) {
    const grupos = {};

    datos.forEach(reg => {
      const carrera = reg.carrera_nombre || reg.carreraNombre;
      const regimen = this.formatearRegimen(reg.periodo_numero || reg.periodoNumero);

      if (!grupos[carrera]) {
        grupos[carrera] = {};
      }

      if (!grupos[carrera][regimen]) {
        grupos[carrera][regimen] = {
          carrera,
          regimen,
          paralelos: {}
        };
      }

      const paralelo = this.determinarParalelo(
        reg.paralelo_nombre || reg.paraleloNombre,
        reg.paralelo_turno || reg.paraleloTurno
      );

      this.agregarDatosParalelo(grupos[carrera][regimen].paralelos, paralelo, reg);
    });

    return grupos;
  }

  /**
   * Agrega datos de un paralelo al grupo
   */
  static agregarDatosParalelo(paralelos, paralelo, reg) {
    if (!paralelos[paralelo]) {
      paralelos[paralelo] = this.inicializarParalelo();
    }

    const paraleloData = paralelos[paralelo];

    // Inscripción
    paraleloData.m_inscripcion += reg.total_mujeres || reg.totalMujeres || 0;
    paraleloData.v_inscripcion += reg.total_hombres || reg.totalHombres || 0;

    // Efectivos
    paraleloData.m_efectivos += this.obtenerValor(reg, 'total_mujeres_efectivos', 'total_mujeres');
    paraleloData.v_efectivos += this.obtenerValor(reg, 'total_hombres_efectivos', 'total_hombres');

    // Abandonos
    paraleloData.m_abandono += reg.total_mujeres_abandono || reg.totalMujeresAbandono || 0;
    paraleloData.v_abandono += reg.total_hombres_abandono || reg.totalHombresAbandono || 0;

    // Reprobados
    paraleloData.m_reprobado += reg.total_mujeres_reprobado || reg.totalMujeresReprobado || 0;
    paraleloData.v_reprobado += reg.total_hombres_reprobado || reg.totalHombresReprobado || 0;

    // Aprobados (calcular)
    const m_aprobado = this.calcularAprobados(reg, 'mujeres');
    const v_aprobado = this.calcularAprobados(reg, 'hombres');

    paraleloData.m_aprobado += m_aprobado;
    paraleloData.v_aprobado += v_aprobado;
  }

  /**
   * Inicializa un objeto paralelo con valores en cero
   */
  static inicializarParalelo() {
    return {
      m_inscripcion: 0,
      v_inscripcion: 0,
      m_efectivos: 0,
      v_efectivos: 0,
      m_abandono: 0,
      v_abandono: 0,
      m_reprobado: 0,
      v_reprobado: 0,
      m_aprobado: 0,
      v_aprobado: 0
    };
  }

  /**
   * Obtiene un valor con fallback
   */
  static obtenerValor(reg, campoPrincipal, campoFallback) {
    return reg[campoPrincipal] || 
           reg[this.toCamelCase(campoPrincipal)] || 
           reg[campoFallback] || 
           reg[this.toCamelCase(campoFallback)] || 
           0;
  }

  /**
   * Convierte snake_case a camelCase
   */
  static toCamelCase(str) {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Calcula aprobados para un género
   */
  static calcularAprobados(reg, genero) {
    const prefijo = genero === 'mujeres' ? 'mujeres' : 'hombres';
    const aprobado = reg[`total_${prefijo}_aprobado`] || reg[`total${prefijo.charAt(0).toUpperCase() + prefijo.slice(1)}Aprobado`];
    
    if (aprobado !== undefined) {
      return aprobado;
    }

    // Calcular: Efectivos - Abandonos - Reprobados
    const efectivos = this.obtenerValor(reg, `total_${prefijo}_efectivos`, `total_${prefijo}`);
    const abandono = reg[`total_${prefijo}_abandono`] || reg[`total${prefijo.charAt(0).toUpperCase() + prefijo.slice(1)}Abandono`] || 0;
    const reprobado = reg[`total_${prefijo}_reprobado`] || reg[`total${prefijo.charAt(0).toUpperCase() + prefijo.slice(1)}Reprobado`] || 0;

    return Math.max(0, efectivos - abandono - reprobado);
  }

  /**
   * Determina la letra del paralelo basado en el nombre y turno
   */
  static determinarParalelo(nombre, turno) {
    const n = (nombre || '').toUpperCase().trim();
    
    // 1. Buscar letra explícita
    const letraMatch = n.match(/\b([ABCD])\b/);
    if (letraMatch) {
      return letraMatch[1];
    }
    
    // 2. Buscar patrones específicos
    const patrones = {
      'A': ['PRIMERO A', 'SEGUNDO A', 'TERCERO A', 'CUARTO A', 'QUINTO A', 'SEXTO A'],
      'B': ['PRIMERO B', 'SEGUNDO B', 'TERCERO B', 'CUARTO B', 'QUINTO B', 'SEXTO B'],
      'C': ['PRIMERO C', 'SEGUNDO C', 'TERCERO C', 'CUARTO C', 'QUINTO C', 'SEXTO C'],
      'D': ['PRIMERO D', 'SEGUNDO D', 'TERCERO D', 'CUARTO D', 'QUINTO D', 'SEXTO D']
    };

    for (const [letra, listaPatrones] of Object.entries(patrones)) {
      if (listaPatrones.some(patron => n.includes(patron))) {
        return letra;
      }
    }

    // 3. Usar turno como fallback
    const t = (turno || '').toUpperCase().trim();
    const mapeoTurno = {
      'MAÑANA': 'A',
      'MANANA': 'A',
      'TARDE': 'B',
      'NOCHE': 'C',
      'SÁBADO': 'D',
      'SABADO': 'D'
    };

    for (const [turnoKey, letra] of Object.entries(mapeoTurno)) {
      if (t.includes(turnoKey)) {
        return letra;
      }
    }

    // 4. Default
    return 'A';
  }

  /**
   * Formatea el número de periodo a formato de régimen
   */
  static formatearRegimen(numero) {
    const num = parseInt(numero) || 1;
    const nombres = ['1ER AÑO', '2DO AÑO', '3ER AÑO', '4TO AÑO'];
    return nombres[num - 1] || `${num}º AÑO`;
  }
}

module.exports = { ExcelDataProcessor };
