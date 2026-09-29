import { 
  Carrera, 
  Materia, 
  Curso, 
  CursoAcelerado, 
  Estudiante, 
  Calificacion, 
  ConfiguracionInstituto, 
  ExpedidoBolivia, 
  TurnoEstudio, 
  EstadoEstudiante, 
  EstadoCalificacion,
  ModalidadCurso,
  EstadoCursoAcelerado,
  HORARIOS_CURSOS_ACELERADOS,
  CostoCarrera,
  PagoCuotaEstudiante,
  MetodoPago,
  EstadoPagoCuota
} from '../types';
import { getAccessToken } from './googleAuth';
import { 
  CURSOS_ACELERADOS_INICIALES,
  CARRERAS_INICIALES,
  MATERIAS_INICIALES,
  ESTUDIANTES_INICIALES,
  CALIFICACIONES_INICIALES,
  COSTOS_CARRERAS_INICIALES,
  PAGOS_CUOTAS_INICIALES
} from '../data/initialData';

export interface CreacionPlanillaResultado {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

export interface DatosSincronizados {
  config: ConfiguracionInstituto;
  carreras: Carrera[];
  materias: Materia[];
  cursos: Materia[]; // Retrocompatibilidad
  cursosAcelerados: CursoAcelerado[];
  estudiantes: Estudiante[];
  calificaciones: Calificacion[];
  costosCarreras: CostoCarrera[];
  pagosCuotas: PagoCuotaEstudiante[];
  tituloPlanilla: string;
  conteo: {
    carreras: number;
    materias: number;
    cursosAcelerados: number;
    estudiantes: number;
    calificaciones: number;
    costosCarreras?: number;
    pagosCuotas?: number;
    cursos?: number;
  };
}

/**
 * Extrae el Spreadsheet ID limpio desde una URL o un ID directo
 */
export const extraerSpreadsheetId = (urlOId: string): string => {
  if (!urlOId) return '';
  const trimmed = urlOId.trim();
  
  // Si es una URL completa de Google Sheets
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Si es un ID directo
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  
  return trimmed;
};

/**
 * Normaliza nombres de encabezados para mapeo flexible
 */
const normalizarClave = (str: any): string => {
  if (!str) return '';
  return String(str)
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, '_');
};

/**
 * Lee los datos reales de las pestañas de Google Sheets
 */
export const leerDatosDeGoogleSheets = async (
  spreadsheetId: string,
  tokenParam?: string | null
): Promise<DatosSincronizados> => {
  const cleanId = extraerSpreadsheetId(spreadsheetId);
  if (!cleanId) {
    throw new Error('El ID o enlace de la Hoja de Google no es válido.');
  }

  const token = tokenParam || (await getAccessToken());

  if (token) {
    try {
      return await leerConSheetsApiV4(cleanId, token);
    } catch (apiError: any) {
      console.warn('Error con Sheets API v4 autenticada:', apiError);
      return await leerConGVizFallback(cleanId);
    }
  } else {
    return await leerConGVizFallback(cleanId);
  }
};

/**
 * Lee usando la API oficial de Google Sheets v4
 */
async function leerConSheetsApiV4(spreadsheetId: string, token: string): Promise<DatosSincronizados> {
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=properties.title,sheets.properties.title`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!metaRes.ok) {
    const errorJson = await metaRes.json().catch(() => ({}));
    const msg = errorJson.error?.message || metaRes.statusText;
    if (metaRes.status === 403 || metaRes.status === 401) {
      throw new Error(`Permiso denegado por Google. Inicia sesión con la cuenta de Google con acceso (${msg}).`);
    } else if (metaRes.status === 404) {
      throw new Error('No se encontró la hoja de cálculo. Verifica el enlace o ID.');
    }
    throw new Error(`Error de Google Sheets: ${msg}`);
  }

  const metadata = await metaRes.json();
  const tituloPlanilla = metadata.properties?.title || 'Base de Datos INSTITUTO TECNOLÓGICO ING DATA COMP';
  const nombresHojas: string[] = (metadata.sheets || []).map((s: any) => s.properties?.title || '');

  const buscarPestana = (clave: string) => {
    const k = normalizarClave(clave);
    return nombresHojas.find(n => normalizarClave(n).includes(k)) || null;
  };

  const hojaConfig = buscarPestana('CONFIG');
  const hojaCarreras = buscarPestana('CARRERA') || buscarPestana('PROGRAMA') || buscarPestana('OFERTA') || buscarPestana('TECNICA');
  let hojaMaterias = buscarPestana('MATERIA') || buscarPestana('ASIGNATURA') || buscarPestana('MALLA') || buscarPestana('CURRICULA') || buscarPestana('PLAN');
  if (!hojaMaterias) {
    const cand = nombresHojas.find(n => n.toUpperCase().includes('CURSO') && !n.toUpperCase().includes('ACELERADO'));
    if (cand) hojaMaterias = cand;
  }
  const hojaAcelerados = buscarPestana('ACELERADO') || buscarPestana('CAPACITAC');
  const hojaEstudiantes = buscarPestana('ESTUDIANTE') || buscarPestana('ALUMNO');
  const hojaCalificaciones = buscarPestana('CALIFICA') || buscarPestana('NOTA');
  const hojaCostos = buscarPestana('COSTO') || buscarPestana('ARANCEL') || buscarPestana('PENSION');
  const hojaPagos = buscarPestana('PAGO') || buscarPestana('CUOTA') || buscarPestana('COBRO');

  // Detección de pestañas por carrera técnica individual
  const pestanaSistemas = buscarPestana('SISTEMA');
  const pestanaDiseno = buscarPestana('DISENO') || buscarPestana('GRAFIC');
  const pestanaIndustrial = buscarPestana('INDUSTRIAL');
  const pestanaContaduria = buscarPestana('CONTADUR');

  const queries: { key: string; sheet: string; range: string }[] = [];
  if (hojaConfig) queries.push({ key: 'config', sheet: hojaConfig, range: 'A1:C50' });
  if (hojaCarreras) queries.push({ key: 'carreras', sheet: hojaCarreras, range: 'A1:H100' });
  if (hojaMaterias) queries.push({ key: 'materias', sheet: hojaMaterias, range: 'A1:I300' });
  if (hojaAcelerados) queries.push({ key: 'acelerados', sheet: hojaAcelerados, range: 'A1:M100' });
  if (hojaEstudiantes) queries.push({ key: 'estudiantes', sheet: hojaEstudiantes, range: 'A1:Z2000' });
  if (hojaCalificaciones) queries.push({ key: 'calificaciones', sheet: hojaCalificaciones, range: 'A1:O4000' });
  if (hojaCostos) queries.push({ key: 'costos', sheet: hojaCostos, range: 'A1:K50' });
  if (hojaPagos) queries.push({ key: 'pagos', sheet: hojaPagos, range: 'A1:U4000' });

  // Si existen pestañas dedicadas por carrera, consultarlas para extraer mallas o asignaturas
  if (pestanaSistemas && pestanaSistemas !== hojaCarreras && pestanaSistemas !== hojaMaterias) {
    queries.push({ key: 'pestana_sistemas', sheet: pestanaSistemas, range: 'A1:I200' });
  }
  if (pestanaDiseno && pestanaDiseno !== hojaCarreras && pestanaDiseno !== hojaMaterias) {
    queries.push({ key: 'pestana_diseno', sheet: pestanaDiseno, range: 'A1:I200' });
  }
  if (pestanaIndustrial && pestanaIndustrial !== hojaCarreras && pestanaIndustrial !== hojaMaterias) {
    queries.push({ key: 'pestana_industrial', sheet: pestanaIndustrial, range: 'A1:I200' });
  }
  if (pestanaContaduria && pestanaContaduria !== hojaCarreras && pestanaContaduria !== hojaMaterias) {
    queries.push({ key: 'pestana_contaduria', sheet: pestanaContaduria, range: 'A1:I200' });
  }

  let rawConfig: any[][] = [];
  let rawCarreras: any[][] = [];
  let rawMaterias: any[][] = [];
  let rawAcelerados: any[][] = [];
  let rawEstudiantes: any[][] = [];
  let rawCalificaciones: any[][] = [];
  let rawCostos: any[][] = [];
  let rawPagos: any[][] = [];
  const rawPestanasCarreras: Record<string, any[][]> = {};

  if (queries.length > 0) {
    const ranges = queries.map(q => encodeURIComponent(`'${q.sheet}'!${q.range}`)).join('&ranges=');
    const batchRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (batchRes.ok) {
      const batchData = await batchRes.json();
      const valueRanges = batchData.valueRanges || [];
      queries.forEach((q, idx) => {
        const values = valueRanges[idx]?.values || [];
        if (q.key === 'config') rawConfig = values;
        else if (q.key === 'carreras') rawCarreras = values;
        else if (q.key === 'materias') rawMaterias = values;
        else if (q.key === 'acelerados') rawAcelerados = values;
        else if (q.key === 'estudiantes') rawEstudiantes = values;
        else if (q.key === 'calificaciones') rawCalificaciones = values;
        else if (q.key === 'costos') rawCostos = values;
        else if (q.key === 'pagos') rawPagos = values;
        else if (q.key.startsWith('pestana_')) {
          rawPestanasCarreras[q.key] = values;
        }
      });
    }
  }

  return procesarFilasDeHojas(tituloPlanilla, rawConfig, rawCarreras, rawMaterias, rawAcelerados, rawEstudiantes, rawCalificaciones, rawPestanasCarreras, rawCostos, rawPagos);
}

/**
 * Fallback usando GViz
 */
async function leerConGVizFallback(spreadsheetId: string): Promise<DatosSincronizados> {
  const fetchSheetGviz = async (sheetName: string): Promise<any[][]> => {
    try {
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const text = await res.text();
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) return [];
      const json = JSON.parse(text.substring(jsonStart, jsonEnd + 1));
      
      const cols = (json.table?.cols || []).map((c: any) => c?.label || c?.id || '');
      const rows = (json.table?.rows || []).map((r: any) => 
        (r?.c || []).map((cell: any) => cell?.v !== undefined && cell?.v !== null ? cell.v : (cell?.f || ''))
      );

      return [cols, ...rows];
    } catch (e) {
      return [];
    }
  };

  const [
    rawConfig, 
    rawCarreras, 
    rawMaterias, 
    rawAcelerados, 
    rawEstudiantes, 
    rawCalificaciones,
    rawCostos,
    rawPagos
  ] = await Promise.all([
    fetchSheetGviz('CONFIGURACION'),
    fetchSheetGviz('CARRERAS'),
    fetchSheetGviz('MATERIAS').then(res => res.length > 1 ? res : fetchSheetGviz('ASIGNATURAS')),
    fetchSheetGviz('CURSOS_ACELERADOS').then(res => res.length > 1 ? res : fetchSheetGviz('CURSOS')),
    fetchSheetGviz('ESTUDIANTES'),
    fetchSheetGviz('CALIFICACIONES'),
    fetchSheetGviz('COSTOS_CARRERAS').then(res => res.length > 1 ? res : fetchSheetGviz('COSTOS').then(r2 => r2.length > 1 ? r2 : fetchSheetGviz('ARANCELES'))),
    fetchSheetGviz('PAGOS_10_CUOTAS').then(res => res.length > 1 ? res : fetchSheetGviz('PAGOS'))
  ]);

  return procesarFilasDeHojas(
    'Base de Datos INSTITUTO TECNOLÓGICO ING DATA COMP',
    rawConfig,
    rawCarreras,
    rawMaterias,
    rawAcelerados,
    rawEstudiantes,
    rawCalificaciones,
    {},
    rawCostos,
    rawPagos
  );
}

/**
 * Procesa y normaliza las matrices de filas en objetos tipados
 */
function procesarFilasDeHojas(
  tituloPlanilla: string,
  rawConfig: any[][],
  rawCarreras: any[][],
  rawMaterias: any[][],
  rawAcelerados: any[][],
  rawEstudiantes: any[][],
  rawCalificaciones: any[][],
  rawPestanasCarreras: Record<string, any[][]> = {},
  rawCostos: any[][] = [],
  rawPagos: any[][] = []
): DatosSincronizados {
  // 1. CONFIGURACION
  const configMap: Record<string, string> = {};
  if (rawConfig.length > 1) {
    for (let i = 1; i < rawConfig.length; i++) {
      const fila = rawConfig[i];
      if (fila && fila[0]) {
        const k = normalizarClave(fila[0]);
        configMap[k] = String(fila[1] || '').trim();
      }
    }
  }

  const config: ConfiguracionInstituto = {
    nombre: configMap['INSTITUTO_NOMBRE'] || 'INSTITUTO TECNOLÓGICO ING DATA COMP',
    siglas: configMap['SIGLAS'] || 'ING DATA COMP',
    subtitulo: configMap['SUBTITULO'] || 'Educación Superior Tecnológica y Capacitación Continua',
    ciudad: configMap['CIUDAD'] || 'Cochabamba',
    departamento: configMap['DEPARTAMENTO'] || 'Cochabamba',
    pais: configMap['PAIS'] || 'Bolivia',
    direccion: configMap['DIRECCION'] || 'Av. Heroínas esq. Ayacucho, Edificio Tecnológico',
    telefono: configMap['TELEFONO'] || '+591 4 4528900',
    email: configMap['EMAIL'] || 'informaciones@ingdatacomp.edu.bo',
    resolucionMinisterial: configMap['RESOLUCION_MINISTERIAL'] || 'R.M. No. 0397/2024',
    directorAcademico: configMap['DIRECTOR_ACADEMICO'] || 'Ing. Grover Marcelo Arispe R.',
    secretariaGeneral: configMap['SECRETARIA_GENERAL'] || 'Lic. Claudia Villarroel M.'
  };

  // 2. CARRERAS (Régimen Anualizado - 3 Años: Sistemas, Diseño Gráfico, Informática Industrial, Contaduría General)
  const carreras: Carrera[] = [];
  if (rawCarreras && rawCarreras.length > 0) {
    let filaInicio = 0;
    const primeraFilaNorm = (rawCarreras[0] || []).map(normalizarClave);
    const tieneEncabezados = primeraFilaNorm.some(k => 
      k.includes('ID') || k.includes('COD') || k.includes('NOMBRE') || k.includes('CARRERA') || k.includes('DURAC')
    );
    if (tieneEncabezados && rawCarreras.length > 1) {
      filaInicio = 1;
    }

    const headers = tieneEncabezados ? primeraFilaNorm : [];
    const getColIndex = (keywords: string[]) => {
      for (const kw of keywords) {
        const idx = headers.findIndex(h => h.includes(kw));
        if (idx >= 0) return idx;
      }
      return -1;
    };

    const idxNombre = getColIndex(['NOMBRE', 'CARRERA', 'PROGRAMA', 'ESPECIALIDAD', 'DENOMINACION', 'TITULO']);
    const idxCodigo = getColIndex(['CODIGO', 'SIGLA', 'COD']);
    const idxResolucion = getColIndex(['RESOLUCION', 'NORMA', 'RM']);
    const idxDuracion = getColIndex(['DURACION', 'ANIO', 'SEMESTRE']);
    const idxTurnos = getColIndex(['TURNO', 'HORARIO']);
    const idxColor = getColIndex(['COLOR']);

    for (let i = filaInicio; i < rawCarreras.length; i++) {
      const fila = rawCarreras[i];
      if (!fila || fila.length === 0) continue;

      // Buscar el nombre de la carrera
      let nombre = '';
      if (idxNombre >= 0 && fila[idxNombre]) {
        nombre = String(fila[idxNombre]).trim();
      } else {
        const celdaValida = fila.find(c => {
          if (!c) return false;
          const s = String(c).trim();
          return s.length >= 4 && !/^\d+$/.test(s) && !s.startsWith('#');
        });
        if (celdaValida) nombre = String(celdaValida).trim();
      }

      if (!nombre || nombre.toLowerCase() === 'carrera' || nombre.toLowerCase() === 'nombre') continue;

      const nombreNorm = normalizarClave(nombre);
      
      // Filtrar carreras antiguas o inventadas
      if (nombreNorm.includes('REDES') || nombreNorm.includes('ROBOTICA') || nombreNorm.includes('TELECOMUNIC')) {
        continue;
      }

      let id = `car-${carreras.length + 1}`;
      let codigo = `CAR-${carreras.length + 1}`;
      let color = '#1E3A8A';

      if (nombreNorm.includes('SISTEMA')) {
        nombre = 'Sistemas Informáticos';
        id = 'car-1';
        codigo = 'SIS-INF';
        color = '#1E3A8A';
      } else if (nombreNorm.includes('DISENO') || nombreNorm.includes('GRAFIC')) {
        nombre = 'Diseño Gráfico';
        id = 'car-2';
        codigo = 'DIS-GRA';
        color = '#EA580C';
      } else if (nombreNorm.includes('INDUSTRIAL')) {
        nombre = 'Informática Industrial';
        id = 'car-3';
        codigo = 'INF-IND';
        color = '#0284C7';
      } else if (nombreNorm.includes('CONTADUR')) {
        nombre = 'Contaduría General';
        id = 'car-4';
        codigo = 'CON-GEN';
        color = '#16A34A';
      } else {
        // Ignorar carreras no oficiales de ING DATA COMP
        continue;
      }

      // Evitar duplicados
      if (carreras.some(c => c.nombre.toLowerCase() === nombre.toLowerCase() || c.id === id)) {
        continue;
      }

      let resolucion = 'R.M. No. 0397/2024';
      if (idxResolucion >= 0 && fila[idxResolucion]) {
        resolucion = String(fila[idxResolucion]).trim() || resolucion;
      }

      let duracionAnios = 3;
      if (idxDuracion >= 0 && fila[idxDuracion]) {
        const num = Number(fila[idxDuracion]);
        if (!isNaN(num) && num > 0 && num <= 5) duracionAnios = num;
      }

      let turnos: TurnoEstudio[] = ['Mañana', 'Noche'];
      if (idxTurnos >= 0 && fila[idxTurnos]) {
        const turnosArr = String(fila[idxTurnos]).split(/[,;/]/).map(t => t.trim()).filter(Boolean) as TurnoEstudio[];
        if (turnosArr.length > 0) turnos = turnosArr;
      }

      carreras.push({
        id,
        codigo,
        nombre,
        resolucion,
        duracionAnios,
        regimen: 'Anualizado',
        turnoDisponibles: turnos,
        color
      });
    }
  }

  // 3. ASIGNATURAS ANUALES (MATERIAS)
  const materias: Materia[] = [];
  if (rawMaterias.length > 1) {
    const headers = rawMaterias[0].map(normalizarClave);
    const getVal = (fila: any[], colName: string, indexFallback: number) => {
      const idx = headers.indexOf(colName);
      return idx >= 0 ? fila[idx] : fila[indexFallback];
    };

    for (let i = 1; i < rawMaterias.length; i++) {
      const fila = rawMaterias[i];
      if (!fila || fila.length === 0 || (!fila[1] && !fila[2])) continue;

      const idRaw = String(getVal(fila, 'ID', 0) || `mat-${i}`).trim();
      const id = idRaw ? idRaw.toLowerCase() : `mat-${i}`;
      const codigo = String(getVal(fila, 'CODIGO', 1) || `MAT-${i}`).trim();
      const nombre = String(getVal(fila, 'NOMBRE_MATERIA', 2) || getVal(fila, 'NOMBRE_CURSO', 2) || getVal(fila, 'NOMBRE', 2) || codigo).trim();
      
      const carreraRef = String(getVal(fila, 'ID_CARRERA', 3) || getVal(fila, 'CARRERA', 3) || '').trim();
      let carreraId = 'car-1';
      const refNorm = normalizarClave(carreraRef);
      if (refNorm.includes('DISEN') || refNorm.includes('GRAF') || carreraRef.toLowerCase() === 'car-2' || refNorm.includes('DIS_GRA')) {
        carreraId = 'car-2';
      } else if (refNorm.includes('INDUST') || carreraRef.toLowerCase() === 'car-3' || refNorm.includes('INF_IND')) {
        carreraId = 'car-3';
      } else if (refNorm.includes('CONTAD') || carreraRef.toLowerCase() === 'car-4' || refNorm.includes('CON_GEN')) {
        carreraId = 'car-4';
      } else {
        carreraId = 'car-1';
      }

      // Calcular año formativo (1, 2, 3)
      let anioVal = Number(getVal(fila, 'ANIO', 4) || getVal(fila, 'ANO', 4));
      if (!anioVal || isNaN(anioVal)) {
        const sem = Number(getVal(fila, 'SEMESTRE', 4)) || 1;
        anioVal = Math.ceil(sem / 2);
      }
      const anio = Math.min(3, Math.max(1, anioVal)) as 1 | 2 | 3;

      const cargaHoraria = Number(getVal(fila, 'CARGA_HORARIA_HRS', 5) || getVal(fila, 'CARGA_HORARIA', 5)) || 120;
      const docente = String(getVal(fila, 'DOCENTE', 6) || '').trim();
      const prerrequisito = String(getVal(fila, 'PRERREQUISITO', 7) || 'Ninguno').trim();

      materias.push({
        id: id || `mat-${i}`,
        codigo,
        nombre,
        carreraId,
        anio,
        cargaHoraria,
        docente,
        prerrequisito
      });
    }
  }

  // Si se leyeron pestañas individuales de carreras técnicas, incorporar sus materias
  const parsearMateriasDePestanaCarrera = (filasPestana: any[][], carId: string, prefixCodigo: string) => {
    if (!filasPestana || filasPestana.length <= 1) return;
    const headerNorm = filasPestana[0].map(normalizarClave);
    const idxNombre = headerNorm.findIndex(h => h.includes('MATERIA') || h.includes('NOMBRE') || h.includes('ASIGNATURA'));
    const idxCodigo = headerNorm.findIndex(h => h.includes('CODIGO') || h.includes('SIGLA') || h.includes('COD'));
    const idxAnio = headerNorm.findIndex(h => h.includes('ANIO') || h.includes('ANO') || h.includes('CURSO') || h.includes('NIVEL'));
    const idxDocente = headerNorm.findIndex(h => h.includes('DOCENTE') || h.includes('PROFESOR'));
    const idxHoras = headerNorm.findIndex(h => h.includes('HORA') || h.includes('CARGA'));

    for (let f = 1; f < filasPestana.length; f++) {
      const row = filasPestana[f];
      if (!row || row.length === 0) continue;
      const nom = idxNombre >= 0 && row[idxNombre] ? String(row[idxNombre]).trim() : String(row[1] || '').trim();
      if (!nom || nom.length < 3 || nom.toLowerCase() === 'materia' || nom.toLowerCase() === 'nombre') continue;

      const cod = idxCodigo >= 0 && row[idxCodigo] ? String(row[idxCodigo]).trim() : `${prefixCodigo}-${f}`;
      const anioNum = idxAnio >= 0 && Number(row[idxAnio]) ? Math.min(3, Math.max(1, Number(row[idxAnio]))) : 1;
      const docente = idxDocente >= 0 && row[idxDocente] ? String(row[idxDocente]).trim() : '';
      const cargaHoraria = idxHoras >= 0 && Number(row[idxHoras]) ? Number(row[idxHoras]) : 120;

      // Evitar duplicados
      if (!materias.some(m => m.carreraId === carId && (m.codigo.toLowerCase() === cod.toLowerCase() || m.nombre.toLowerCase() === nom.toLowerCase()))) {
        materias.push({
          id: `mat-${carId}-${f}`,
          codigo: cod,
          nombre: nom,
          carreraId: carId,
          anio: anioNum as 1 | 2 | 3,
          cargaHoraria,
          docente,
          prerrequisito: 'Ninguno'
        });
      }
    }
  };

  if (rawPestanasCarreras['pestana_sistemas']) {
    parsearMateriasDePestanaCarrera(rawPestanasCarreras['pestana_sistemas'], 'car-1', 'SIS');
  }
  if (rawPestanasCarreras['pestana_diseno']) {
    parsearMateriasDePestanaCarrera(rawPestanasCarreras['pestana_diseno'], 'car-2', 'DIS');
  }
  if (rawPestanasCarreras['pestana_industrial']) {
    parsearMateriasDePestanaCarrera(rawPestanasCarreras['pestana_industrial'], 'car-3', 'IND');
  }
  if (rawPestanasCarreras['pestana_contaduria']) {
    parsearMateriasDePestanaCarrera(rawPestanasCarreras['pestana_contaduria'], 'car-4', 'CON');
  }

  // 4. CURSOS ACELERADOS
  const cursosAcelerados: CursoAcelerado[] = [];
  if (rawAcelerados.length > 1) {
    const headers = rawAcelerados[0].map(normalizarClave);
    const getVal = (fila: any[], colName: string, indexFallback: number) => {
      const idx = headers.indexOf(colName);
      return idx >= 0 ? fila[idx] : fila[indexFallback];
    };

    for (let i = 1; i < rawAcelerados.length; i++) {
      const fila = rawAcelerados[i];
      if (!fila || fila.length === 0 || !fila[1]) continue;

      const id = String(getVal(fila, 'ID', 0) || `ca-${i}`).trim();
      const codigo = String(getVal(fila, 'CODIGO', 1) || `CA-${i}`).trim();
      const nombre = String(getVal(fila, 'NOMBRE_CURSO', 2) || getVal(fila, 'NOMBRE', 2) || codigo).trim();
      const descripcion = String(getVal(fila, 'DESCRIPCION', 3) || '').trim();
      const categoria = String(getVal(fila, 'CATEGORIA', 4) || 'General').trim();
      const modalidad = (String(getVal(fila, 'MODALIDAD', 5) || 'Presencial').trim() || 'Presencial') as ModalidadCurso;
      const duracion = String(getVal(fila, 'DURACION', 6) || '4 Semanas').trim();
      const cargaHoraria = Number(getVal(fila, 'CARGA_HORARIA', 7)) || 40;
      const docente = String(getVal(fila, 'DOCENTE', 8) || '').trim();
      const costoBs = Number(getVal(fila, 'COSTO_BS', 9)) || 250;
      const horario = String(getVal(fila, 'HORARIO', 10) || 'Sábados').trim();
      const cupoMaximo = Number(getVal(fila, 'CUPOS', 11)) || 25;
      const inscritos = Number(getVal(fila, 'INSCRITOS', 12)) || 0;
      const estado = (String(getVal(fila, 'ESTADO', 13) || 'Inscripciones Abiertas').trim()) as EstadoCursoAcelerado;

      const oficial = CURSOS_ACELERADOS_INICIALES.find(o => 
        o.nombre.toLowerCase().trim() === nombre.toLowerCase().trim() || 
        o.codigo.toLowerCase().trim() === codigo.toLowerCase().trim() ||
        o.id === id
      );

      cursosAcelerados.push({
        id: oficial ? oficial.id : id,
        codigo: codigo || (oficial ? oficial.codigo : `CA-${i}`),
        nombre,
        descripcion: descripcion || (oficial ? oficial.descripcion : ''),
        categoria: (categoria && categoria !== 'General') ? categoria : (oficial?.categoria || 'General'),
        modalidad,
        duracion: duracion || (oficial ? oficial.duracion : '4 Semanas (40 Horas)'),
        cargaHoraria: cargaHoraria || (oficial ? oficial.cargaHoraria : 40),
        docente: docente || (oficial ? oficial.docente : ''),
        costoBs: costoBs || (oficial ? oficial.costoBs : 180),
        costosDisponibles: oficial?.costosDisponibles || [160, 180, 200, 220],
        horario: (horario && horario !== 'Sábados') ? horario : (oficial?.horario || '8 a 10'),
        horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
        subCursos: oficial?.subCursos,
        cupoMaximo: cupoMaximo || 25,
        inscritos: inscritos || (oficial ? oficial.inscritos : 0),
        estado: estado || 'Inscripciones Abiertas'
      });
    }
  }

  // Si no había cursos acelerados en la hoja, proveer los cursos iniciales
  const aceleradosFinales = cursosAcelerados.length > 0 ? cursosAcelerados : CURSOS_ACELERADOS_INICIALES;

  // 5. ESTUDIANTES
  const estudiantes: Estudiante[] = [];
  if (rawEstudiantes.length > 1) {
    const headers = rawEstudiantes[0].map(normalizarClave);
    const getVal = (fila: any[], colName: string, indexFallback: number) => {
      const idx = headers.indexOf(colName);
      return idx >= 0 ? fila[idx] : fila[indexFallback];
    };

    for (let i = 1; i < rawEstudiantes.length; i++) {
      const fila = rawEstudiantes[i];
      if (!fila || fila.length === 0 || (!fila[2] && !fila[3])) continue;

      const idRaw = String(getVal(fila, 'ID', 0) || `est-${i}`).trim();
      const id = idRaw ? idRaw.toLowerCase() : `est-${i}`;
      const codigo = String(getVal(fila, 'CODIGO_ESTUDIANTE', 1) || getVal(fila, 'CODIGO', 1) || `IDC-2026-${String(i).padStart(3, '0')}`).trim();
      const nombres = String(getVal(fila, 'NOMBRES', 2) || '').trim();
      const apellidos = String(getVal(fila, 'APELLIDOS', 3) || '').trim();
      const ci = String(getVal(fila, 'CI', 4) || '').trim();
      
      const expRaw = String(getVal(fila, 'EXPEDIDO', 5) || 'CB').trim().toUpperCase() as ExpedidoBolivia;
      const expedidoValido = ['CB', 'LP', 'SC', 'OR', 'PT', 'TJ', 'CH', 'BE', 'PD'].includes(expRaw) ? expRaw : 'CB';

      const email = String(getVal(fila, 'EMAIL', 6) || '').trim();
      const telefono = String(getVal(fila, 'TELEFONO', 7) || '').trim();
      
      const carreraRef = String(getVal(fila, 'ID_CARRERA', 8) || getVal(fila, 'CARRERA', 8) || '').trim();
      let carreraId = carreras[0]?.id || 'car-1';
      const carMatch = carreras.find(c => 
        c.id.toLowerCase() === carreraRef.toLowerCase() || 
        c.codigo.toLowerCase() === carreraRef.toLowerCase() ||
        c.nombre.toLowerCase().includes(carreraRef.toLowerCase())
      );
      if (carMatch) carreraId = carMatch.id;

      // Año de formación (1, 2, 3)
      let anioVal = Number(getVal(fila, 'ANIO_ACTUAL', 9) || getVal(fila, 'ANO', 9));
      if (!anioVal || isNaN(anioVal)) {
        const sem = Number(getVal(fila, 'SEMESTRE_ACTUAL', 9) || getVal(fila, 'SEMESTRE', 9)) || 1;
        anioVal = Math.ceil(sem / 2);
      }
      const anioActual = Math.min(3, Math.max(1, anioVal)) as 1 | 2 | 3;
      
      const turnoRaw = String(getVal(fila, 'TURNO', 10) || 'Mañana').trim() as TurnoEstudio;
      const turno = ['Mañana', 'Tarde', 'Noche', 'Sábado'].includes(turnoRaw) ? turnoRaw : 'Mañana';

      const fechaInscripcion = String(getVal(fila, 'FECHA_INSCRIPCION', 11) || new Date().toISOString().slice(0, 10)).trim();
      const estado = (String(getVal(fila, 'ESTADO', 12) || 'Activo').trim() || 'Activo') as EstadoEstudiante;
      const observaciones = String(getVal(fila, 'OBSERVACIONES', 13) || '').trim();

      estudiantes.push({
        id: id || `est-${i}`,
        codigo,
        nombres,
        apellidos,
        ci,
        expedido: expedidoValido,
        email,
        telefono,
        carreraId,
        anioActual,
        semestreActual: anioActual * 2 - 1,
        turno,
        fechaInscripcion,
        estado,
        observaciones
      });
    }
  }

  // 6. CALIFICACIONES
  const calificaciones: Calificacion[] = [];
  if (rawCalificaciones.length > 1) {
    const headers = rawCalificaciones[0].map(normalizarClave);
    const getVal = (fila: any[], colName: string, indexFallback: number) => {
      const idx = headers.indexOf(colName);
      return idx >= 0 ? fila[idx] : fila[indexFallback];
    };

    for (let i = 1; i < rawCalificaciones.length; i++) {
      const fila = rawCalificaciones[i];
      if (!fila || fila.length === 0 || !fila[1]) continue;

      const idRaw = String(getVal(fila, 'ID', 0) || `cal-${i}`).trim();
      const id = idRaw ? idRaw.toLowerCase() : `cal-${i}`;
      
      const estRef = String(getVal(fila, 'ID_ESTUDIANTE', 1) || '').trim();
      const codEstRef = String(getVal(fila, 'CODIGO_ESTUDIANTE', 2) || '').trim();
      
      const estMatch = estudiantes.find(e => 
        e.id.toLowerCase() === estRef.toLowerCase() || 
        e.codigo.toLowerCase() === codEstRef.toLowerCase() ||
        e.codigo.toLowerCase() === estRef.toLowerCase() ||
        e.ci === estRef
      );
      const estudianteId = estMatch ? estMatch.id : (estRef || estudiantes[0]?.id || 'est-1');

      const matRef = String(getVal(fila, 'ID_MATERIA', 3) || getVal(fila, 'ID_CURSO', 3) || '').trim();
      const matMatch = materias.find(m => 
        m.id.toLowerCase() === matRef.toLowerCase() || 
        m.codigo.toLowerCase() === matRef.toLowerCase() ||
        m.nombre.toLowerCase().includes(matRef.toLowerCase())
      );
      const materiaId = matMatch ? matMatch.id : (matRef || materias[0]?.id || 'mat-1');

      const carRef = String(getVal(fila, 'ID_CARRERA', 4) || '').trim();
      const carreraId = estMatch?.carreraId || matMatch?.carreraId || carRef || carreras[0]?.id || 'car-1';

      const anio = (Number(getVal(fila, 'ANIO', 5) || matMatch?.anio || estMatch?.anioActual || 1) as 1 | 2 | 3);
      const gestion = String(getVal(fila, 'GESTION', 6) || getVal(fila, 'PERIODO', 6) || '2026').trim();

      const p1 = Number(getVal(fila, 'PRIMER_PARCIAL', 7) || getVal(fila, 'PARCIAL_1', 7)) || 0;
      const p2 = Number(getVal(fila, 'SEGUNDO_PARCIAL', 8) || getVal(fila, 'PARCIAL_2', 8)) || 0;
      const p3 = Number(getVal(fila, 'TERCER_PARCIAL', 9) || getVal(fila, 'PARCIAL_3', 9) || getVal(fila, 'PRACTICAS', 9)) || 0;
      const ef = Number(getVal(fila, 'EXAMEN_FINAL', 10)) || 0;
      const st = getVal(fila, 'SEGUNDO_TURNO', 11) ? Number(getVal(fila, 'SEGUNDO_TURNO', 11)) : undefined;

      const notaFinalCalc = Math.round((p1 + p2 + p3 + ef) / 4);
      const notaFinal = Number(getVal(fila, 'NOTA_FINAL', 12)) || notaFinalCalc;

      let estadoFinal: EstadoCalificacion = notaFinal >= 51 ? 'Aprobado' : 'Reprobado';
      if (st !== undefined && st >= 51) estadoFinal = 'Segundo Turno';

      const asistencia = Number(getVal(fila, 'ASISTENCIA', 13)) || 95;
      const observaciones = String(getVal(fila, 'OBSERVACIONES', 14) || '').trim();
      const fechaRegistro = String(getVal(fila, 'FECHA_REGISTRO', 15) || new Date().toISOString().slice(0, 10)).trim();

      calificaciones.push({
        id: id || `cal-${i}`,
        estudianteId,
        materiaId,
        cursoId: materiaId,
        carreraId,
        anio,
        gestion,
        primerParcial: p1,
        segundoParcial: p2,
        tercerParcial: p3,
        practicas: p3,
        examenFinal: ef,
        segundoTurno: st,
        notaFinal,
        estadoFinal,
        turno: (getVal(fila, 'TURNO', 16) || estMatch?.turno || 'Mañana') as TurnoEstudio,
        docente: String(getVal(fila, 'DOCENTE', 17) || matMatch?.docente || '').trim(),
        asistenciaPorcentaje: asistencia,
        observaciones,
        fechaRegistro
      });
    }
  }

  // 1. Carreras Técnicas Oficiales de Régimen Anualizado:
  // Garantizar estrictamente las 4 carreras oficiales de ING DATA COMP:
  // 1: Sistemas Informáticos (car-1, SIS-INF)
  // 2: Diseño Gráfico (car-2, DIS-GRA)
  // 3: Informática Industrial (car-3, INF-IND)
  // 4: Contaduría General (car-4, CON-GEN)
  const carrerasFinales: Carrera[] = CARRERAS_INICIALES.map(oficial => {
    const encontrada = carreras.find(c => 
      c.id === oficial.id || 
      c.codigo === oficial.codigo || 
      normalizarClave(c.nombre).includes(normalizarClave(oficial.nombre).substring(0, 6))
    );
    return encontrada 
      ? { ...oficial, ...encontrada, id: oficial.id, codigo: oficial.codigo, nombre: oficial.nombre } 
      : oficial;
  });

  // 2. Materias: Asegurar que todas las carreras cuenten con su malla curricular anualizada
  const materiasFinales = materias.length > 0 ? [...materias] : [...MATERIAS_INICIALES];
  for (const car of carrerasFinales) {
    const tiene = materiasFinales.some(m => m.carreraId === car.id);
    if (!tiene) {
      const oficiales = MATERIAS_INICIALES.filter(m => m.carreraId === car.id);
      materiasFinales.push(...oficiales);
    }
  }

  const estudiantesFinales = estudiantes.length > 0 ? estudiantes : ESTUDIANTES_INICIALES;
  const calificacionesFinales = calificaciones.length > 0 ? calificaciones : CALIFICACIONES_INICIALES;

  // 6. COSTOS Y ARANCELES OFICIALES POR CARRERA TÉCNICA
  const costosCarreras: CostoCarrera[] = [];
  if (rawCostos && rawCostos.length > 0) {
    let filaInicio = 0;
    let headers: string[] = [];

    // Comprobar si la fila 0 tiene encabezados
    const fila0Norm = (rawCostos[0] || []).map(normalizarClave);
    const tieneEncabezadosFila0 = fila0Norm.some(k => 
      k.includes('MATRICULA') || k.includes('PENSION') || k.includes('CUOTA') || k.includes('CARRERA') || k.includes('ARANCEL')
    );

    if (tieneEncabezadosFila0) {
      headers = fila0Norm;
      filaInicio = 1;
    } else if (rawCostos.length > 1) {
      const fila1Norm = (rawCostos[1] || []).map(normalizarClave);
      const tieneEncabezadosFila1 = fila1Norm.some(k => 
        k.includes('MATRICULA') || k.includes('PENSION') || k.includes('CUOTA') || k.includes('CARRERA') || k.includes('ARANCEL')
      );
      if (tieneEncabezadosFila1) {
        headers = fila1Norm;
        filaInicio = 2;
      }
    }

    const getCol = (keywords: string[]) => {
      for (const kw of keywords) {
        const idx = headers.findIndex((h: string) => h.includes(kw));
        if (idx >= 0) return idx;
      }
      return -1;
    };

    let idxCarId = getCol(['ID_CARRERA', 'IDCARRERA', 'ID']);
    let idxCodigo = getCol(['CODIGO']);
    let idxNombre = getCol(['NOMBRE', 'CARRERA']);
    let idxMatricula = getCol(['MATRICULA', 'COSTO_MATRICULA']);
    let idxMensualidad = getCol(['MENSUAL', 'PENSION', 'CUOTA']);
    let idxCuotas = getCol(['NUMERO_CUOTAS', 'CUOTAS', 'CANTIDAD']);
    let idxOtros = getCol(['OTROS', 'SEGURO', 'CARNET']);
    let idxDescOtros = getCol(['DESCRIPCION_OTROS', 'CONCEPTO_OTROS']);
    let idxTotal = getCol(['TOTAL', 'ANUAL']);

    // Si no se identificaron columnas por texto, usar posiciones canónicas por defecto
    if (idxCarId === -1) idxCarId = 0;
    if (idxCodigo === -1) idxCodigo = 1;
    if (idxNombre === -1) idxNombre = 2;
    if (idxMatricula === -1) idxMatricula = 3;
    if (idxMensualidad === -1) idxMensualidad = 4;
    if (idxCuotas === -1) idxCuotas = 5;
    if (idxOtros === -1) idxOtros = 6;
    if (idxDescOtros === -1) idxDescOtros = 7;
    if (idxTotal === -1) idxTotal = 8;

    for (let i = filaInicio; i < rawCostos.length; i++) {
      const fila = rawCostos[i];
      if (!fila || fila.length === 0) continue;

      // Saltar fila si es un encabezado repetido
      const fNorm = fila.map(normalizarClave).join('_');
      if (fNorm.includes('MATRICULA') && fNorm.includes('PENSION')) continue;

      let cId = String(fila[idxCarId] || '').trim();
      let cod = String(fila[idxCodigo] || '').trim();
      let nom = String(fila[idxNombre] || '').trim();

      // Buscar coincidencia en las carreras oficiales para completar datos faltantes
      const carMatch = carrerasFinales.find(c => 
        (cId && c.id === cId) || 
        (cod && c.codigo.toUpperCase() === cod.toUpperCase()) || 
        (nom && c.nombre.toUpperCase().includes(nom.toUpperCase()))
      ) || (carrerasFinales[costosCarreras.length] || null);

      if (carMatch) {
        if (!cId) cId = carMatch.id;
        if (!cod) cod = carMatch.codigo;
        if (!nom) nom = carMatch.nombre;
      }

      const rawMat = fila[idxMatricula];
      const rawMen = fila[idxMensualidad];
      const rawNumC = fila[idxCuotas];
      const rawOtros = fila[idxOtros];

      const mat = (rawMat !== undefined && rawMat !== '' && !isNaN(Number(rawMat))) ? Number(rawMat) : 300;
      const men = (rawMen !== undefined && rawMen !== '' && !isNaN(Number(rawMen))) ? Number(rawMen) : 380;
      const numC = (rawNumC !== undefined && rawNumC !== '' && !isNaN(Number(rawNumC))) ? Number(rawNumC) : 10;
      const otros = (rawOtros !== undefined && rawOtros !== '' && !isNaN(Number(rawOtros))) ? Number(rawOtros) : 50;
      const descOtros = (idxDescOtros >= 0 && fila[idxDescOtros]) ? String(fila[idxDescOtros]).trim() : 'Seguro estudiantil y carnet institucional';
      const tot = (mat + (men * numC) + otros);

      if (cId || nom) {
        costosCarreras.push({
          carreraId: cId || `car-${costosCarreras.length + 1}`,
          carreraCodigo: cod || `CAR-${costosCarreras.length + 1}`,
          carreraNombre: nom || `Carrera Técnica ${costosCarreras.length + 1}`,
          costoMatriculaBs: mat,
          costoMensualidadBs: men,
          numeroCuotas: numC,
          otrosCostosBs: otros,
          descripcionOtrosCostos: descOtros,
          totalAnualBs: tot
        });
      }
    }
  }
  // Si la hoja remota no tiene datos en COSTOS_CARRERAS, retornar array vacío para no sobreescribir los costos locales del usuario
  const costosFinales: CostoCarrera[] = costosCarreras.length > 0 ? costosCarreras : [];

  // 7. PAGOS Y CUOTAS DE ESTUDIANTES (10 CUOTAS ANUALES)
  const pagosCuotas: PagoCuotaEstudiante[] = [];
  if (rawPagos && rawPagos.length > 1) {
    const headers = (rawPagos[0] || []).map(normalizarClave);
    const getCol = (keywords: string[]) => {
      for (const kw of keywords) {
        const idx = headers.findIndex((h: string) => h.includes(kw));
        if (idx >= 0) return idx;
      }
      return -1;
    };
    const idxId = getCol(['ID_PAGO', 'ID']);
    const idxEstId = getCol(['ID_ESTUDIANTE', 'ESTUDIANTE_ID']);
    const idxCod = getCol(['CODIGO_ESTUDIANTE', 'CODIGO']);
    const idxNom = getCol(['NOMBRE_ESTUDIANTE', 'ESTUDIANTE', 'NOMBRE']);
    const idxCar = getCol(['ID_CARRERA', 'CARRERA']);
    const idxAnio = getCol(['ANIO', 'CURSO']);
    const idxGestion = getCol(['GESTION', 'PERIODO']);
    const idxTipo = getCol(['TIPO_PAGO', 'TIPO', 'CONCEPTO']);
    const idxNumCuota = getCol(['NUMERO_CUOTA', 'CUOTA_NRO', 'CUOTA']);
    const idxMes = getCol(['MES']);
    const idxVenc = getCol(['VENCIMIENTO', 'FECHA_VENCIMIENTO']);
    const idxPactado = getCol(['MONTO_PACTADO', 'PACTADO', 'TOTAL']);
    const idxPagado = getCol(['MONTO_PAGADO', 'PAGADO', 'ABONO']);
    const idxSaldo = getCol(['SALDO', 'SALDO_PENDIENTE']);
    const idxEstado = getCol(['ESTADO']);
    const idxRecibo = getCol(['RECIBO', 'NRO_RECIBO']);
    const idxFechaPago = getCol(['FECHA_PAGO', 'FECHA']);
    const idxMetodo = getCol(['METODO', 'FORMA_PAGO']);
    const idxObs = getCol(['OBSERVACIONES', 'OBS']);

    for (let i = 1; i < rawPagos.length; i++) {
      const fila = rawPagos[i];
      if (!fila || fila.length === 0) continue;
      const pactado = parseFloat(String(fila[idxPactado] || '0')) || 0;
      const pagado = parseFloat(String(fila[idxPagado] || '0')) || 0;
      const saldo = idxSaldo >= 0 ? (parseFloat(String(fila[idxSaldo] || '0')) || Math.max(0, pactado - pagado)) : Math.max(0, pactado - pagado);
      let estado: EstadoPagoCuota = 'Pendiente';
      const estStr = normalizarClave(fila[idxEstado]);
      if (estStr.includes('CANCEL') || estStr.includes('PAGAD') || saldo <= 0) {
        estado = 'Cancelado';
      } else if (estStr.includes('PARCIAL') || pagado > 0) {
        estado = 'Parcial';
      } else if (estStr.includes('VENCID') || estStr.includes('MORA')) {
        estado = 'Vencido';
      }

      pagosCuotas.push({
        id: String(fila[idxId] || `pago-${i}`).trim(),
        estudianteId: String(fila[idxEstId] || '').trim(),
        codigoEstudiante: String(fila[idxCod] || '').trim(),
        nombreEstudiante: String(fila[idxNom] || '').trim(),
        carreraId: String(fila[idxCar] || 'car-1').trim(),
        anio: (parseInt(String(fila[idxAnio] || '1'), 10) || 1) as 1 | 2 | 3,
        gestion: String(fila[idxGestion] || '2026').trim(),
        tipoPago: (String(fila[idxTipo] || 'Cuota Mensual')) as any,
        numeroCuota: parseInt(String(fila[idxNumCuota] || '1'), 10) || 1,
        mesCorrespondiente: String(fila[idxMes] || 'Febrero').trim(),
        fechaVencimiento: String(fila[idxVenc] || '').trim(),
        montoPactadoBs: pactado,
        montoPagadoBs: pagado,
        saldoPendienteBs: saldo,
        estado,
        ultimoNroRecibo: idxRecibo >= 0 ? String(fila[idxRecibo] || '') : undefined,
        ultimaFechaPago: idxFechaPago >= 0 ? String(fila[idxFechaPago] || '') : undefined,
        ultimoMetodoPago: idxMetodo >= 0 ? (String(fila[idxMetodo] || 'Efectivo') as MetodoPago) : 'Efectivo',
        observaciones: idxObs >= 0 ? String(fila[idxObs] || '') : ''
      });
    }
  }
  // Si la hoja remota no tiene datos en PAGOS_10_CUOTAS, retornar array vacío para no sobreescribir los pagos locales del usuario
  const pagosFinales: PagoCuotaEstudiante[] = pagosCuotas.length > 0 ? pagosCuotas : [];

  return {
    config,
    carreras: carrerasFinales,
    materias: materiasFinales,
    cursos: materiasFinales, // retrocompatibilidad
    cursosAcelerados: aceleradosFinales,
    estudiantes: estudiantesFinales,
    calificaciones: calificacionesFinales,
    costosCarreras: costosFinales,
    pagosCuotas: pagosFinales,
    tituloPlanilla,
    conteo: {
      carreras: carrerasFinales.length,
      materias: materiasFinales.length,
      cursosAcelerados: aceleradosFinales.length,
      estudiantes: estudiantesFinales.length,
      calificaciones: calificacionesFinales.length,
      costosCarreras: costosFinales.length,
      pagosCuotas: pagosFinales.length
    }
  };
}

/**
 * Guarda y actualiza la planilla completa en Google Drive / Google Sheets
 */
export const guardarDatosEnGoogleSheets = async (
  spreadsheetId: string,
  config: ConfiguracionInstituto,
  carreras: Carrera[],
  materias: Materia[],
  cursosAcelerados: CursoAcelerado[],
  estudiantes: Estudiante[],
  calificaciones: Calificacion[],
  costosCarreras: CostoCarrera[] = COSTOS_CARRERAS_INICIALES,
  pagosCuotas: PagoCuotaEstudiante[] = PAGOS_CUOTAS_INICIALES
): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No hay sesión activa con Google. Inicia sesión para guardar en la hoja.');
  }

  const cleanId = extraerSpreadsheetId(spreadsheetId);
  if (!cleanId) {
    throw new Error('ID de hoja inválido.');
  }

  const configRows = [
    ['CLAVE', 'VALOR', 'DESCRIPCION'],
    ['INSTITUTO_NOMBRE', config.nombre, 'Nombre institucional'],
    ['SIGLAS', config.siglas, 'Siglas'],
    ['CIUDAD', config.ciudad, 'Ciudad de funcionamiento'],
    ['PAIS', config.pais, 'País'],
    ['DIRECCION', config.direccion, 'Dirección física'],
    ['TELEFONO', config.telefono, 'Teléfono'],
    ['EMAIL', config.email, 'Correo'],
    ['RESOLUCION_MINISTERIAL', config.resolucionMinisterial, 'R.M. Bolivia'],
    ['DIRECTOR_ACADEMICO', config.directorAcademico, 'Director Académico'],
    ['SECRETARIA_GENERAL', config.secretariaGeneral, 'Secretaria General'],
    ['REGIMEN', 'ANUALIZADO (3 AÑOS)', 'Régimen de formación'],
    ['ESCALA_APROBACION_MIN', '51', 'Nota mínima de aprobación en Bolivia (51/100)']
  ];

  const carrerasParaGuardar: Carrera[] = CARRERAS_INICIALES.map(oficial => {
    const encontrada = carreras.find(c => 
      c.id === oficial.id || 
      c.codigo === oficial.codigo || 
      normalizarClave(c.nombre).includes(normalizarClave(oficial.nombre).substring(0, 6))
    );
    return encontrada 
      ? { ...oficial, ...encontrada, id: oficial.id, codigo: oficial.codigo, nombre: oficial.nombre } 
      : oficial;
  });

  const carreraRows = [
    ['ID', 'CODIGO', 'NOMBRE', 'RESOLUCION_MINISTERIAL', 'DURACION_ANIOS', 'TURNOS_DISPONIBLES', 'COLOR_HEX', 'REGIMEN'],
    ...carrerasParaGuardar.map(c => [
      c.id,
      c.codigo,
      c.nombre,
      c.resolucion || 'R.M. No. 0397/2024',
      c.duracionAnios || 3,
      c.turnoDisponibles.join(', '),
      c.color,
      'Anualizado'
    ])
  ];

  const materiaRows = [
    ['ID', 'CODIGO', 'NOMBRE_MATERIA', 'ID_CARRERA', 'ANIO', 'CARGA_HORARIA_HRS', 'DOCENTE', 'PRERREQUISITO'],
    ...materias.map(m => [
      m.id,
      m.codigo,
      m.nombre,
      m.carreraId,
      m.anio,
      m.cargaHoraria,
      m.docente,
      m.prerrequisito || 'Ninguno'
    ])
  ];

  const aceleradoRows = [
    ['ID', 'CODIGO', 'NOMBRE_CURSO', 'DESCRIPCION', 'CATEGORIA', 'MODALIDAD', 'DURACION', 'CARGA_HORARIA', 'DOCENTE', 'COSTO_BS', 'HORARIO', 'CUPOS', 'INSCRITOS', 'ESTADO'],
    ...cursosAcelerados.map(ca => [
      ca.id,
      ca.codigo,
      ca.nombre,
      ca.descripcion || '',
      ca.categoria || 'General',
      ca.modalidad,
      ca.duracion,
      ca.cargaHoraria,
      ca.docente,
      ca.costoBs,
      ca.horario,
      ca.cupoMaximo,
      ca.inscritos,
      ca.estado
    ])
  ];

  const estudianteRows = [
    ['ID', 'CODIGO_ESTUDIANTE', 'NOMBRES', 'APELLIDOS', 'CI', 'EXPEDIDO', 'EMAIL', 'TELEFONO', 'ID_CARRERA', 'ANIO_ACTUAL', 'TURNO', 'FECHA_INSCRIPCION', 'ESTADO', 'OBSERVACIONES'],
    ...estudiantes.map(e => [
      e.id,
      e.codigo,
      e.nombres,
      e.apellidos,
      e.ci,
      e.expedido,
      e.email,
      e.telefono,
      e.carreraId,
      e.anioActual || 1,
      e.turno,
      e.fechaInscripcion,
      e.estado,
      e.observaciones || ''
    ])
  ];

  const calificacionRows = [
    ['ID', 'ID_ESTUDIANTE', 'CODIGO_ESTUDIANTE', 'ID_MATERIA', 'ID_CARRERA', 'ANIO', 'GESTION', 'PRIMER_PARCIAL', 'SEGUNDO_PARCIAL', 'TERCER_PARCIAL', 'EXAMEN_FINAL', 'SEGUNDO_TURNO', 'NOTA_FINAL', 'ESTADO_FINAL', 'ASISTENCIA', 'OBSERVACIONES', 'FECHA_REGISTRO', 'TURNO', 'DOCENTE'],
    ...calificaciones.map(cal => {
      const est = estudiantes.find(e => e.id === cal.estudianteId);
      const mat = materias.find(m => m.id === cal.materiaId || m.id === cal.cursoId);
      return [
        cal.id,
        cal.estudianteId,
        est?.codigo || '',
        cal.materiaId || cal.cursoId || '',
        cal.carreraId,
        cal.anio || 1,
        cal.gestion || '2026',
        cal.primerParcial,
        cal.segundoParcial,
        cal.tercerParcial ?? cal.practicas ?? 0,
        cal.examenFinal,
        cal.segundoTurno ?? '',
        cal.notaFinal,
        cal.estadoFinal,
        cal.asistenciaPorcentaje ?? 95,
        cal.observaciones || '',
        cal.fechaRegistro,
        cal.turno || est?.turno || 'Mañana',
        cal.docente || mat?.docente || ''
      ];
    })
  ];

  const listaCostos = costosCarreras && costosCarreras.length > 0 ? costosCarreras : COSTOS_CARRERAS_INICIALES;
  const costoRows = [
    ['ID_CARRERA', 'CODIGO_CARRERA', 'NOMBRE_CARRERA', 'COSTO_MATRICULA_BS', 'PENSION_MENSUAL_BS', 'NUMERO_CUOTAS', 'OTROS_COSTOS_BS', 'DESCRIPCION_OTROS', 'TOTAL_ANUAL_BS'],
    ...listaCostos.map(c => [
      c.carreraId,
      c.carreraCodigo,
      c.carreraNombre,
      c.costoMatriculaBs,
      c.costoMensualidadBs,
      c.numeroCuotas,
      c.otrosCostosBs,
      c.descripcionOtrosCostos || '',
      c.totalAnualBs
    ])
  ];

  const listaPagos = pagosCuotas && pagosCuotas.length > 0 ? pagosCuotas : PAGOS_CUOTAS_INICIALES;
  const pagoRows = [
    ['ID_PAGO', 'ID_ESTUDIANTE', 'CODIGO_ESTUDIANTE', 'NOMBRE_ESTUDIANTE', 'ID_CARRERA', 'ANIO_ESTUDIO', 'GESTION', 'TIPO_PAGO', 'NUMERO_CUOTA', 'MES', 'FECHA_VENCIMIENTO', 'MONTO_PACTADO_BS', 'MONTO_PAGADO_BS', 'SALDO_PENDIENTE_BS', 'ESTADO_PAGO', 'NRO_RECIBO', 'FECHA_PAGO', 'METODO_PAGO', 'OBSERVACIONES'],
    ...listaPagos.map(p => [
      p.id,
      p.estudianteId,
      p.codigoEstudiante,
      p.nombreEstudiante || '',
      p.carreraId,
      p.anio,
      p.gestion || '2026',
      p.tipoPago,
      p.numeroCuota || '',
      p.mesCorrespondiente || '',
      p.fechaVencimiento || '',
      p.montoPactadoBs,
      p.montoPagadoBs,
      p.saldoPendienteBs,
      p.estado,
      p.ultimoNroRecibo || '',
      p.ultimaFechaPago || '',
      p.ultimoMetodoPago || '',
      p.observaciones || ''
    ])
  ];

  // 1. Consultar metadatos para verificar qué pestañas existen ya en la hoja
  let hojasExistentes: string[] = [];
  try {
    const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=sheets.properties.title`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      hojasExistentes = (meta.sheets || []).map((s: any) => s.properties?.title || '');
    }
  } catch (metaErr) {
    console.warn('Advertencia al consultar hojas existentes:', metaErr);
  }

  // 2. Determinar nombres de las pestañas a utilizar
  const buscarPestana = (clave: string) => {
    return hojasExistentes.find(n => n.toUpperCase().includes(clave)) || null;
  };

  let titleConfig = buscarPestana('CONFIG');
  let titleCarreras = buscarPestana('CARRERA') || buscarPestana('PROGRAMA') || buscarPestana('OFERTA') || buscarPestana('TECNICA');
  let titleMaterias = buscarPestana('MATERIA') || buscarPestana('ASIGNATURA') || buscarPestana('MALLA') || buscarPestana('CURRICULA') || buscarPestana('PLAN');
  if (!titleMaterias) {
    const cand = hojasExistentes.find(n => n.toUpperCase().includes('CURSO') && !n.toUpperCase().includes('ACELERADO'));
    if (cand) titleMaterias = cand;
  }
  let titleAcelerados = buscarPestana('ACELERADO') || buscarPestana('CAPACITAC');
  let titleEstudiantes = buscarPestana('ESTUDIANTE') || buscarPestana('ALUMNO');
  let titleCalificaciones = buscarPestana('CALIFICA') || buscarPestana('NOTA');
  let titleCostos = buscarPestana('COSTO') || buscarPestana('ARANCEL') || buscarPestana('PENSION');
  let titlePagos = buscarPestana('PAGO') || buscarPestana('CUOTA') || buscarPestana('COBRO');

  // 3. Crear las pestañas faltantes para evitar errores como "Unable to parse range: MATERIAS!A1:H500"
  const pestanasPorCrear: any[] = [];
  if (!titleConfig) {
    titleConfig = 'CONFIGURACION';
    pestanasPorCrear.push({ addSheet: { properties: { title: 'CONFIGURACION', tabColor: { red: 0.12, green: 0.23, blue: 0.54 } } } });
  }
  if (!titleCarreras) {
    titleCarreras = 'CARRERAS';
    pestanasPorCrear.push({ addSheet: { properties: { title: 'CARRERAS', tabColor: { red: 0.14, green: 0.38, blue: 0.92 } } } });
  }
  if (!titleMaterias) {
    titleMaterias = 'MATERIAS';
    pestanasPorCrear.push({ addSheet: { properties: { title: 'MATERIAS', tabColor: { red: 0.05, green: 0.58, blue: 0.53 } } } });
  }
  if (!titleAcelerados) {
    titleAcelerados = 'CURSOS_ACELERADOS';
    pestanasPorCrear.push({ addSheet: { properties: { title: 'CURSOS_ACELERADOS', tabColor: { red: 0.96, green: 0.62, blue: 0.04 } } } });
  }
  if (!titleEstudiantes) {
    titleEstudiantes = 'ESTUDIANTES';
    pestanasPorCrear.push({ addSheet: { properties: { title: 'ESTUDIANTES', tabColor: { red: 0.48, green: 0.22, blue: 0.92 } } } });
  }
  if (!titleCalificaciones) {
    titleCalificaciones = 'CALIFICACIONES';
    pestanasPorCrear.push({ addSheet: { properties: { title: 'CALIFICACIONES', tabColor: { red: 0.13, green: 0.77, blue: 0.36 } } } });
  }
  if (!titleCostos) {
    titleCostos = 'COSTOS_CARRERAS';
    pestanasPorCrear.push({ addSheet: { properties: { title: 'COSTOS_CARRERAS', tabColor: { red: 0.95, green: 0.45, blue: 0.15 } } } });
  }
  if (!titlePagos) {
    titlePagos = 'PAGOS_10_CUOTAS';
    pestanasPorCrear.push({ addSheet: { properties: { title: 'PAGOS_10_CUOTAS', tabColor: { red: 0.20, green: 0.70, blue: 0.40 } } } });
  }

  if (pestanasPorCrear.length > 0) {
    for (const req of pestanasPorCrear) {
      try {
        const addRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}:batchUpdate`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ requests: [req] })
        });
        if (!addRes.ok) {
          const errText = await addRes.text().catch(() => '');
          console.warn(`Advertencia al crear pestaña ${req.addSheet?.properties?.title}:`, errText);
        }
      } catch (e) {
        console.warn('Error al solicitar creación de pestaña:', e);
      }
    }
  }

  // 4. Escribir los datos en cada pestaña de forma segura (usando A1 para permitir expansión dinámica)
  const data = [
    { range: `'${titleConfig}'!A1`, values: configRows },
    { range: `'${titleCarreras}'!A1`, values: carreraRows },
    { range: `'${titleMaterias}'!A1`, values: materiaRows },
    { range: `'${titleAcelerados}'!A1`, values: aceleradoRows },
    { range: `'${titleEstudiantes}'!A1`, values: estudianteRows },
    { range: `'${titleCalificaciones}'!A1`, values: calificacionRows },
    { range: `'${titleCostos}'!A1`, values: costoRows },
    { range: `'${titlePagos}'!A1`, values: pagoRows }
  ];

  // Si existen pestañas dedicadas a cada carrera técnica, sincronizar también sus asignaturas
  const pestanaSistemas = buscarPestana('SISTEMA');
  const pestanaDiseno = buscarPestana('DISENO') || buscarPestana('GRAFIC');
  const pestanaIndustrial = buscarPestana('INDUSTRIAL');
  const pestanaContaduria = buscarPestana('CONTADUR');

  if (pestanaSistemas && pestanaSistemas !== titleCarreras && pestanaSistemas !== titleMaterias) {
    const matSisRows = [
      ['ID', 'CODIGO', 'NOMBRE_MATERIA', 'ANIO', 'CARGA_HORARIA_HRS', 'DOCENTE', 'PRERREQUISITO'],
      ...materias.filter(m => m.carreraId === 'car-1').map(m => [m.id, m.codigo, m.nombre, m.anio, m.cargaHoraria, m.docente, m.prerrequisito || 'Ninguno'])
    ];
    data.push({ range: `'${pestanaSistemas}'!A1`, values: matSisRows });
  }
  if (pestanaDiseno && pestanaDiseno !== titleCarreras && pestanaDiseno !== titleMaterias) {
    const matDisRows = [
      ['ID', 'CODIGO', 'NOMBRE_MATERIA', 'ANIO', 'CARGA_HORARIA_HRS', 'DOCENTE', 'PRERREQUISITO'],
      ...materias.filter(m => m.carreraId === 'car-2').map(m => [m.id, m.codigo, m.nombre, m.anio, m.cargaHoraria, m.docente, m.prerrequisito || 'Ninguno'])
    ];
    data.push({ range: `'${pestanaDiseno}'!A1`, values: matDisRows });
  }
  if (pestanaIndustrial && pestanaIndustrial !== titleCarreras && pestanaIndustrial !== titleMaterias) {
    const matIndRows = [
      ['ID', 'CODIGO', 'NOMBRE_MATERIA', 'ANIO', 'CARGA_HORARIA_HRS', 'DOCENTE', 'PRERREQUISITO'],
      ...materias.filter(m => m.carreraId === 'car-3').map(m => [m.id, m.codigo, m.nombre, m.anio, m.cargaHoraria, m.docente, m.prerrequisito || 'Ninguno'])
    ];
    data.push({ range: `'${pestanaIndustrial}'!A1`, values: matIndRows });
  }
  if (pestanaContaduria && pestanaContaduria !== titleCarreras && pestanaContaduria !== titleMaterias) {
    const matConRows = [
      ['ID', 'CODIGO', 'NOMBRE_MATERIA', 'ANIO', 'CARGA_HORARIA_HRS', 'DOCENTE', 'PRERREQUISITO'],
      ...materias.filter(m => m.carreraId === 'car-4').map(m => [m.id, m.codigo, m.nombre, m.anio, m.cargaHoraria, m.docente, m.prerrequisito || 'Ninguno'])
    ];
    data.push({ range: `'${pestanaContaduria}'!A1`, values: matConRows });
  }

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data
    })
  });

  if (!res.ok) {
    // Si batchUpdate falla en conjunto (p. ej. error en una pestaña), escribir individualmente para garantizar que COSTOS_CARRERAS y PAGOS se guarden
    let algunExito = false;
    for (const item of data) {
      try {
        const singleRes = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(item.range)}?valueInputOption=USER_ENTERED`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: item.values })
          }
        );
        if (singleRes.ok) algunExito = true;
      } catch (errSingle) {
        console.warn(`Error guardando rango ${item.range}:`, errSingle);
      }
    }

    if (!algunExito) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Error al guardar datos en Google Sheets.');
    }
  }
};

/**
 * Crea la planilla completa en Google Drive con formato y pestañas
 */
export const crearPlanillaCompletaEnGoogleDrive = async (
  config: ConfiguracionInstituto,
  carreras: Carrera[],
  materias: Materia[],
  cursosAcelerados: CursoAcelerado[],
  estudiantes: Estudiante[],
  calificaciones: Calificacion[],
  costosCarreras: CostoCarrera[] = COSTOS_CARRERAS_INICIALES,
  pagosCuotas: PagoCuotaEstudiante[] = PAGOS_CUOTAS_INICIALES
): Promise<CreacionPlanillaResultado> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Debes iniciar sesión con Google para crear la hoja en Google Drive.');
  }

  const spreadsheetBody = {
    properties: {
      title: `Base de Datos - ${config.nombre} (R.M. No. 0397/2024)`
    },
    sheets: [
      { properties: { title: 'CONFIGURACION', tabColor: { red: 0.12, green: 0.23, blue: 0.54 } } },
      { properties: { title: 'CARRERAS', tabColor: { red: 0.14, green: 0.38, blue: 0.92 } } },
      { properties: { title: 'MATERIAS', tabColor: { red: 0.05, green: 0.58, blue: 0.53 } } },
      { properties: { title: 'CURSOS_ACELERADOS', tabColor: { red: 0.96, green: 0.62, blue: 0.04 } } },
      { properties: { title: 'ESTUDIANTES', tabColor: { red: 0.48, green: 0.22, blue: 0.92 } } },
      { properties: { title: 'CALIFICACIONES', tabColor: { red: 0.13, green: 0.77, blue: 0.36 } } },
      { properties: { title: 'COSTOS_CARRERAS', tabColor: { red: 0.95, green: 0.45, blue: 0.15 } } },
      { properties: { title: 'PAGOS_10_CUOTAS', tabColor: { red: 0.20, green: 0.70, blue: 0.40 } } }
    ]
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(spreadsheetBody)
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err.error?.message || 'No se pudo crear la hoja en Google Drive.');
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Poblar con los datos
  await guardarDatosEnGoogleSheets(
    spreadsheetId,
    config,
    carreras,
    materias,
    cursosAcelerados,
    estudiantes,
    calificaciones,
    costosCarreras,
    pagosCuotas
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    title: spreadsheetBody.properties.title
  };
};
