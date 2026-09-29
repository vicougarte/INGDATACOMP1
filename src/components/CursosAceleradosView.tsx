import React, { useState, useMemo, useRef } from 'react';
import { 
  CursoAcelerado, 
  InscripcionCursoAcelerado, 
  Estudiante, 
  HorarioCursoAcelerado, 
  HORARIOS_CURSOS_ACELERADOS, 
  ModalidadCurso, 
  EstadoCursoAcelerado,
  ExpedidoBolivia,
  ConfiguracionInstituto
} from '../types';
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  Users, 
  Calendar, 
  Coins, 
  X, 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Layers,
  UserPlus,
  Printer,
  Filter,
  DollarSign,
  Download,
  AlertCircle,
  FileText,
  Building2,
  Check,
  ChevronDown,
  RefreshCw,
  Tag,
  Scissors,
  FolderArchive,
  Award
} from 'lucide-react';
import { IngDataCompLogo } from './IngDataCompLogo';
import { tieneSubCursosAutorizados } from '../data/initialData';
import { BoletaInscripcionModal } from './BoletaInscripcionModal';
import { KardexHistoricoCursosModal } from './KardexHistoricoCursosModal';

interface CursosAceleradosViewProps {
  cursosAcelerados: CursoAcelerado[];
  inscripciones: InscripcionCursoAcelerado[];
  estudiantes: Estudiante[];
  institutoConfig?: ConfiguracionInstituto;
  onGuardarCurso: (curso: Partial<CursoAcelerado>) => void;
  onEliminarCurso: (id: string) => void;
  onInscribirAlumno: (inscripcion: Partial<InscripcionCursoAcelerado>) => void;
  onEliminarInscripcion: (id: string) => void;
  onRestaurarCatalogoCompleto?: () => void;
  customLogoUrl?: string | null;
}

export const CursosAceleradosView: React.FC<CursosAceleradosViewProps> = ({
  cursosAcelerados,
  inscripciones,
  estudiantes,
  institutoConfig,
  onGuardarCurso,
  onEliminarCurso,
  onInscribirAlumno,
  onEliminarInscripcion,
  onRestaurarCatalogoCompleto,
  customLogoUrl
}) => {
  // Pestaña interna de la vista: 'catalogo' | 'inscritos' | 'reporte-horario'
  const [vistaInterna, setVistaInterna] = useState<'catalogo' | 'inscritos' | 'reporte-horario'>('catalogo');

  // Estado para Modal de Kárdex Histórico de Alumno (Cursos y Pagos consolidados)
  const [modalKardexHistoricoAbierto, setModalKardexHistoricoAbierto] = useState(false);
  const [alumnoKardexSeleccionado, setAlumnoKardexSeleccionado] = useState<string | undefined>(undefined);

  // Lista de alumnos únicos registrados en cursos acelerados
  const alumnosUnicos = useMemo(() => {
    const mapa = new Map<string, { ci: string; nombreCompleto: string; count: number }>();
    inscripciones.forEach(inc => {
      const clave = inc.ci ? inc.ci.trim().toUpperCase() : `${inc.apellidos}-${inc.nombres}`;
      if (!mapa.has(clave)) {
        mapa.set(clave, {
          ci: inc.ci || '',
          nombreCompleto: `${inc.apellidos}, ${inc.nombres}`,
          count: 1
        });
      } else {
        mapa.get(clave)!.count += 1;
      }
    });
    return Array.from(mapa.values());
  }, [inscripciones]);

  // Filtros del catálogo
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroModalidadCatalogo, setFiltroModalidadCatalogo] = useState<'todas' | 'Presencial' | 'Virtual'>('todas');

  // Filtros de la tabla de inscritos
  const [filtroCursoInscritos, setFiltroCursoInscritos] = useState('todos');
  const [filtroHorarioInscritos, setFiltroHorarioInscritos] = useState('todos');
  const [filtroModalidadInscritos, setFiltroModalidadInscritos] = useState('todas');
  const [busquedaInscrito, setBusquedaInscrito] = useState('');

  // Filtros del Reporte Oficial por Horario
  const [reporteCursoId, setReporteCursoId] = useState<string>(cursosAcelerados[0]?.id || '');
  const [reporteHorario, setReporteHorario] = useState<HorarioCursoAcelerado>('8 a 10');
  const [reporteModalidad, setReporteModalidad] = useState<'Todas' | 'Presencial' | 'Virtual'>('Todas');

  // Modales
  const [modalCursoAbierto, setModalCursoAbierto] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<CursoAcelerado | null>(null);

  const [modalInscribirAbierto, setModalInscribirAbierto] = useState(false);
  const [inscripcionEditando, setInscripcionEditando] = useState<InscripcionCursoAcelerado | null>(null);

  const [eliminarCursoItem, setEliminarCursoItem] = useState<CursoAcelerado | null>(null);
  const [eliminarInscripcionItem, setEliminarInscripcionItem] = useState<InscripcionCursoAcelerado | null>(null);

  // Estados formulario Inscripción
  const [modoAlumno, setModoAlumno] = useState<'existente' | 'nuevo'>('nuevo');
  const [alumnoExistenteId, setAlumnoExistenteId] = useState('');
  const [insNombres, setInsNombres] = useState('');
  const [insApellidos, setInsApellidos] = useState('');
  const [insCi, setInsCi] = useState('');
  const [insExpedido, setInsExpedido] = useState<ExpedidoBolivia>('CB');
  const [insTelefono, setInsTelefono] = useState('');
  const [insEmail, setInsEmail] = useState('');

  const [insCursoId, setInsCursoId] = useState<string>(cursosAcelerados[0]?.id || '');
  const [insSubCurso, setInsSubCurso] = useState('');
  const [insHorario, setInsHorario] = useState<HorarioCursoAcelerado>('8 a 10');
  const [insModalidad, setInsModalidad] = useState<'Presencial' | 'Virtual'>('Presencial');
  const [insCostoRealBs, setInsCostoRealBs] = useState<number>(180);
  const [insDescuentoBs, setInsDescuentoBs] = useState<number>(0);
  const [insCostoBs, setInsCostoBs] = useState<number>(180);
  const [insMontoPagadoBs, setInsMontoPagadoBs] = useState<number>(180);
  const [insObservaciones, setInsObservaciones] = useState('');

  // Fechas de inicio y finalización del curso para la inscripción
  const [insFechaInicio, setInsFechaInicio] = useState('2026-03-02');
  const [insFechaFin, setInsFechaFin] = useState('2026-03-27');

  // Función para calcular automáticamente la fecha de finalización según carga horaria y duración
  const calcularFechaFinSegunCarga = (fechaInicioStr: string, cargaHoraria: number = 40, duracionStr: string = ''): string => {
    if (!fechaInicioStr) return '';
    try {
      const partes = fechaInicioStr.split('-');
      if (partes.length !== 3) return fechaInicioStr;
      const anio = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10);
      const dia = parseInt(partes[2], 10);
      const fecha = new Date(anio, mes - 1, dia);
      if (isNaN(fecha.getTime())) return fechaInicioStr;

      // 6 Semanas (60 Horas): 39 días corridos (viernes de la 6ta semana)
      // 4 Semanas (40 Horas): 25 días corridos (viernes de la 4ta semana)
      const es6Semanas = cargaHoraria >= 60 || duracionStr.toLowerCase().includes('6 semana') || duracionStr.toLowerCase().includes('60');
      const diasASumar = es6Semanas ? 39 : 25;

      fecha.setDate(fecha.getDate() + diasASumar);
      const y = fecha.getFullYear();
      const m = String(fecha.getMonth() + 1).padStart(2, '0');
      const d = String(fecha.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    } catch {
      return fechaInicioStr;
    }
  };

  const handleCambioFechaInicio = (nuevaFecha: string) => {
    setInsFechaInicio(nuevaFecha);
    const c = cursosAcelerados.find(item => item.id === insCursoId);
    const fFin = calcularFechaFinSegunCarga(nuevaFecha, c?.cargaHoraria || 40, c?.duracion || '');
    setInsFechaFin(fFin);
  };

  // Formateador literal de rango de fechas para vista previa
  const formatearRangoFechasLiteral = (inicioStr: string, finStr: string) => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const format = (str: string) => {
      try {
        const p = str.split('-');
        if (p.length === 3) {
          const d = parseInt(p[2], 10);
          const m = meses[parseInt(p[1], 10) - 1];
          const a = p[0];
          return `${String(d).padStart(2, '0')} de ${m} de ${a}`;
        }
        return str;
      } catch {
        return str;
      }
    };
    return `${format(inicioStr)} al ${format(finStr)}`;
  };

  // Boleta de inscripción seleccionada para imprimir directamente
  const [boletaInscripcionSeleccionada, setBoletaInscripcionSeleccionada] = useState<InscripcionCursoAcelerado | null>(null);
  const [autoPrintBoleta, setAutoPrintBoleta] = useState<boolean>(false);

  // Estados formulario Curso
  const [curCodigo, setCurCodigo] = useState('');
  const [curNombre, setCurNombre] = useState('');
  const [curDescripcion, setCurDescripcion] = useState('');
  const [curCategoria, setCurCategoria] = useState('Ofimática y Computación');
  const [curModalidad, setCurModalidad] = useState<ModalidadCurso>('Presencial');
  const [curDuracion, setCurDuracion] = useState('4 Semanas (40 Horas)');
  const [curCargaHoraria, setCurCargaHoraria] = useState(40);
  const [curDocente, setCurDocente] = useState('');
  const [curCostoBs, setCurCostoBs] = useState(180);
  const [curCostosOpciones, setCurCostosOpciones] = useState('160, 180, 200, 220');
  const [curSubCursosTexto, setCurSubCursosTexto] = useState('');
  const [curHorario, setCurHorario] = useState<HorarioCursoAcelerado>('8 a 10');
  const [curCupoMaximo, setCurCupoMaximo] = useState(25);
  const [curEstado, setCurEstado] = useState<EstadoCursoAcelerado>('Inscripciones Abiertas');

  // Curso actualmente seleccionado en el formulario de inscripción
  const cursoSeleccionadoIns = useMemo(() => {
    return cursosAcelerados.find(c => c.id === insCursoId) || cursosAcelerados[0];
  }, [cursosAcelerados, insCursoId]);

  // Al cambiar curso en formulario de inscripción, actualizar subcurso y costos sugeridos
  const handleCambioCursoIns = (cId: string) => {
    setInsCursoId(cId);
    const c = cursosAcelerados.find(item => item.id === cId);
    if (c) {
      const tieneSub = tieneSubCursosAutorizados(c.nombre, c.id);
      if (tieneSub && c.subCursos && c.subCursos.length > 0) {
        setInsSubCurso(c.subCursos[0]);
      } else {
        setInsSubCurso('');
      }
      const baseCost = c.costoBs || 180;
      setInsCostoRealBs(baseCost);
      setInsDescuentoBs(0);
      setInsCostoBs(baseCost);
      setInsMontoPagadoBs(baseCost);

      // Calcular y sugerir automáticamente las fechas de inicio y finalización del curso
      const fInicio = c.fechaInicio || insFechaInicio || '2026-03-02';
      setInsFechaInicio(fInicio);
      const fFin = c.fechaFin || calcularFechaFinSegunCarga(fInicio, c.cargaHoraria, c.duracion);
      setInsFechaFin(fFin);
    }
  };

  // Función para recalcular costo final y montos
  const handleActualizarCostoReal = (nuevoReal: number) => {
    const real = Math.max(0, nuevoReal);
    setInsCostoRealBs(real);
    const final = Math.max(0, real - insDescuentoBs);
    setInsCostoBs(final);
    setInsMontoPagadoBs(final);
  };

  const handleActualizarDescuento = (nuevoDesc: number) => {
    const desc = Math.max(0, Math.min(nuevoDesc, insCostoRealBs));
    setInsDescuentoBs(desc);
    const final = Math.max(0, insCostoRealBs - desc);
    setInsCostoBs(final);
    setInsMontoPagadoBs(final);
  };

  // Autocompletar cuando selecciona alumno existente
  const handleSeleccionarAlumnoExistente = (estId: string) => {
    setAlumnoExistenteId(estId);
    const est = estudiantes.find(e => e.id === estId);
    if (est) {
      setInsNombres(est.nombres);
      setInsApellidos(est.apellidos);
      setInsCi(est.ci);
      setInsExpedido(est.expedido);
      setInsTelefono(est.telefono || '');
      setInsEmail(est.email || '');
    }
  };

  // Abrir modal de inscripción con preselección opcional de curso, horario y modalidad
  const abrirModalInscripcion = (
    cursoIdPreseleccionado?: string,
    horarioPreseleccionado?: HorarioCursoAcelerado,
    modalidadPreseleccionada?: 'Presencial' | 'Virtual'
  ) => {
    setInscripcionEditando(null);
    setModoAlumno('nuevo');
    setAlumnoExistenteId('');
    setInsNombres('');
    setInsApellidos('');
    setInsCi('');
    setInsExpedido('CB');
    setInsTelefono('');
    setInsEmail('');
    setInsObservaciones('');

    const targetCursoId = cursoIdPreseleccionado || cursosAcelerados[0]?.id || '';
    setInsCursoId(targetCursoId);
    const c = cursosAcelerados.find(item => item.id === targetCursoId || item.codigo === targetCursoId) || cursosAcelerados[0];
    if (c) {
      const tieneSub = tieneSubCursosAutorizados(c.nombre, c.id);
      setInsSubCurso(tieneSub && c.subCursos && c.subCursos.length > 0 ? c.subCursos[0] : '');
      const baseCost = c.costoBs || 180;
      setInsCostoRealBs(baseCost);
      setInsDescuentoBs(0);
      setInsCostoBs(baseCost);
      setInsMontoPagadoBs(baseCost);

      const fInicio = c.fechaInicio || '2026-03-02';
      setInsFechaInicio(fInicio);
      const fFin = c.fechaFin || calcularFechaFinSegunCarga(fInicio, c.cargaHoraria || 40, c.duracion || '');
      setInsFechaFin(fFin);
    } else {
      setInsFechaInicio('2026-03-02');
      setInsFechaFin('2026-03-27');
    }

    // Preseleccionar horario si proviene del reporte por horario específico
    if (horarioPreseleccionado) {
      setInsHorario(horarioPreseleccionado);
    } else {
      setInsHorario((c?.horario as HorarioCursoAcelerado) || '8 a 10');
    }

    if (modalidadPreseleccionada) {
      setInsModalidad(modalidadPreseleccionada);
    } else {
      setInsModalidad('Presencial');
    }

    setModalInscribirAbierto(true);
  };

  // Abrir modal nuevo curso
  const abrirModalNuevoCurso = () => {
    setCursoEditando(null);
    setCurCodigo(`CA-${new Date().getFullYear()}-${String(cursosAcelerados.length + 1).padStart(2, '0')}`);
    setCurNombre('');
    setCurDescripcion('');
    setCurCategoria('Ofimática y Computación');
    setCurModalidad('Presencial');
    setCurDuracion('4 Semanas (40 Horas)');
    setCurCargaHoraria(40);
    setCurDocente('');
    setCurCostoBs(180);
    setCurCostosOpciones('160, 180, 200, 220');
    setCurSubCursosTexto('');
    setCurHorario('8 a 10');
    setCurCupoMaximo(25);
    setCurEstado('Inscripciones Abiertas');
    setModalCursoAbierto(true);
  };

  // Abrir modal editar curso
  const abrirModalEditarCurso = (curso: CursoAcelerado) => {
    setCursoEditando(curso);
    setCurCodigo(curso.codigo);
    setCurNombre(curso.nombre);
    setCurDescripcion(curso.descripcion || '');
    setCurCategoria(curso.categoria || 'General');
    setCurModalidad(curso.modalidad);
    setCurDuracion(curso.duracion);
    setCurCargaHoraria(curso.cargaHoraria);
    setCurDocente(curso.docente);
    setCurCostoBs(curso.costoBs);
    setCurCostosOpciones(curso.costosDisponibles ? curso.costosDisponibles.join(', ') : '160, 180, 200, 220');
    setCurSubCursosTexto(curso.subCursos ? curso.subCursos.join('\n') : '');
    setCurHorario((curso.horario as HorarioCursoAcelerado) || '8 a 10');
    setCurCupoMaximo(curso.cupoMaximo);
    setCurEstado(curso.estado);
    setModalCursoAbierto(true);
  };

  // Guardar Inscripción (con soporte para imprimir boleta directamente)
  const submitInscripcion = (e: React.FormEvent, imprimirDirecto: boolean = false) => {
    e.preventDefault();
    const curso = cursosAcelerados.find(c => c.id === insCursoId) || cursosAcelerados[0];
    const tieneSub = tieneSubCursosAutorizados(curso?.nombre, curso?.id);
    const subCursoFinal = tieneSub ? (insSubCurso.trim() || undefined) : undefined;
    const realCost = Number(insCostoRealBs) || (curso?.costoBs || 180);
    const desc = Number(insDescuentoBs) || 0;
    const costoFinal = Math.max(0, realCost - desc);
    const pagado = Number(insMontoPagadoBs) || 0;
    const saldo = Math.max(0, costoFinal - pagado);

    const inscripcionFinal: InscripcionCursoAcelerado = {
      id: inscripcionEditando?.id || `inc-${Date.now()}`,
      codigoInscripcion: inscripcionEditando?.codigoInscripcion || `INC-${new Date().getFullYear()}-${String(inscripciones.length + 1).padStart(3, '0')}`,
      estudianteId: modoAlumno === 'existente' ? alumnoExistenteId : undefined,
      nombres: insNombres.trim(),
      apellidos: insApellidos.trim(),
      ci: insCi.trim(),
      expedido: insExpedido,
      telefono: insTelefono.trim(),
      email: insEmail.trim(),
      cursoId: curso?.id || 'ca-01',
      cursoNombre: curso?.nombre || 'Curso Acelerado',
      subCurso: subCursoFinal,
      horario: insHorario,
      modalidad: insModalidad,
      costoRealBs: realCost,
      descuentoBs: desc,
      costoBs: costoFinal,
      montoPagadoBs: pagado,
      saldoBs: saldo,
      fechaInscripcion: new Date().toISOString().slice(0, 10),
      fechaInicioCurso: insFechaInicio.trim() || curso?.fechaInicio || '2026-03-02',
      fechaFinCurso: insFechaFin.trim() || curso?.fechaFin || '2026-03-27',
      duracionCurso: curso?.duracion || '4 Semanas (40 Horas)',
      cargaHorariaCurso: curso?.cargaHoraria || 40,
      docenteCurso: curso?.docente || 'Docente Titular Asignado',
      estado: 'Inscrito',
      observaciones: insObservaciones.trim()
    };

    onInscribirAlumno(inscripcionFinal);
    setModalInscribirAbierto(false);

    // Si se eligió imprimir directamente, abrir la boleta oficial
    if (imprimirDirecto) {
      setBoletaInscripcionSeleccionada(inscripcionFinal);
      setAutoPrintBoleta(true);
    }
  };

  // Guardar Curso
  const submitCurso = (e: React.FormEvent) => {
    e.preventDefault();

    // Calcular duración coherente con la carga horaria especificada
    const cargaNum = Number(curCargaHoraria) || 40;
    const duracionFinal = curDuracion && curDuracion.includes(String(cargaNum))
      ? curDuracion.trim()
      : cargaNum === 40
        ? '4 Semanas (40 Horas)'
        : cargaNum === 60
          ? '6 Semanas (60 Horas)'
          : `${Math.max(1, Math.round(cargaNum / 10))} Semanas (${cargaNum} Horas)`;

    const costoFinalBs = Number(curCostoBs) || 200;

    const opcionesIngresadas = curCostosOpciones
      .split(/[,;\s]+/)
      .map(v => Number(v.trim()))
      .filter(n => !isNaN(n) && n > 0);

    const costosArray = Array.from(new Set([
      costoFinalBs,
      ...opcionesIngresadas
    ])).filter(n => !isNaN(n) && n > 0);

    // Sub-cursos únicamente permitidos en los 5 cursos autorizados
    const esAutorizado = tieneSubCursosAutorizados(curNombre.trim(), cursoEditando?.id);
    const subCursosArray = esAutorizado
      ? curSubCursosTexto
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
      : undefined;

    onGuardarCurso({
      id: cursoEditando?.id,
      codigo: curCodigo.trim(),
      nombre: curNombre.trim(),
      descripcion: curDescripcion.trim(),
      categoria: curCategoria.trim(),
      modalidad: curModalidad,
      duracion: duracionFinal,
      cargaHoraria: cargaNum,
      docente: curDocente.trim(),
      costoBs: costoFinalBs,
      costosDisponibles: costosArray.length > 0 ? costosArray : [costoFinalBs, 160, 180, 200, 220],
      horario: curHorario,
      horariosDisponibles: [...HORARIOS_CURSOS_ACELERADOS],
      subCursos: (esAutorizado && subCursosArray && subCursosArray.length > 0) ? subCursosArray : undefined,
      cupoMaximo: Number(curCupoMaximo),
      inscritos: cursoEditando ? cursoEditando.inscritos : 0,
      estado: curEstado
    });

    setModalCursoAbierto(false);
  };

  // Áreas o categorías disponibles en el catálogo
  const categoriasDisponibles = useMemo(() => {
    const set = new Set<string>();
    cursosAcelerados.forEach(c => {
      if (c.categoria) set.add(c.categoria);
    });
    return Array.from(set);
  }, [cursosAcelerados]);

  // Filtro de cursos para el catálogo
  const cursosFiltrados = useMemo(() => {
    return cursosAcelerados.filter(c => {
      const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
        (c.subCursos && c.subCursos.some(sub => sub.toLowerCase().includes(busqueda.toLowerCase())));
      
      const matchCat = filtroCategoria === 'todas' || c.categoria === filtroCategoria;
      const matchMod = filtroModalidadCatalogo === 'todas' || c.modalidad === filtroModalidadCatalogo;
      return matchBusqueda && matchCat && matchMod;
    });
  }, [cursosAcelerados, busqueda, filtroCategoria, filtroModalidadCatalogo]);

  // Filtro de alumnos inscritos
  const inscripcionesFiltradas = useMemo(() => {
    return inscripciones.filter(inc => {
      const matchCurso = filtroCursoInscritos === 'todos' || inc.cursoId === filtroCursoInscritos;
      const matchHorario = filtroHorarioInscritos === 'todos' || inc.horario === filtroHorarioInscritos;
      const matchMod = filtroModalidadInscritos === 'todas' || inc.modalidad === filtroModalidadInscritos;
      const matchText = `${inc.nombres} ${inc.apellidos} ${inc.ci} ${inc.subCurso || ''}`.toLowerCase().includes(busquedaInscrito.toLowerCase());
      return matchCurso && matchHorario && matchMod && matchText;
    });
  }, [inscripciones, filtroCursoInscritos, filtroHorarioInscritos, filtroModalidadInscritos, busquedaInscrito]);

  // Alumnos para el Reporte Oficial por Curso y Horario
  const cursoReporteObj = useMemo(() => {
    return cursosAcelerados.find(c => c.id === reporteCursoId) || cursosAcelerados[0];
  }, [cursosAcelerados, reporteCursoId]);

  const alumnosReporte = useMemo(() => {
    if (!cursoReporteObj) return [];
    return inscripciones.filter(inc => {
      const matchCurso = inc.cursoId === cursoReporteObj.id || 
                         (inc.cursoNombre && inc.cursoNombre.toLowerCase().trim() === cursoReporteObj.nombre.toLowerCase().trim()) ||
                         inc.cursoId === cursoReporteObj.codigo;
      const matchHorario = inc.horario === reporteHorario;
      const matchMod = reporteModalidad === 'Todas' || inc.modalidad === reporteModalidad;
      return matchCurso && matchHorario && matchMod;
    });
  }, [inscripciones, cursoReporteObj, reporteHorario, reporteModalidad]);

  // Totales financieros del reporte
  const totalRecaudadoReporte = alumnosReporte.reduce((acc, curr) => acc + (curr.montoPagadoBs || 0), 0);
  const totalSaldoReporte = alumnosReporte.reduce((acc, curr) => acc + (curr.saldoBs || 0), 0);

  const handlePrintReporte = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ENCABEZADO PRINCIPAL DE CURSOS ACELERADOS */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5 no-print">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <Zap className="w-7 h-7 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Módulo de Cursos Acelerados y Capacitación Continua
              </h1>
              <span className="bg-amber-100 text-amber-950 font-black text-[10px] px-2.5 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider">
                Presencial y Virtual
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              Inscripción de alumnos por horario (8 a 22 hrs), módulos con Inteligencia Artificial, costos diferenciados (160, 180, 200, 220 Bs.) y reportes de nómina oficial.
            </p>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN PRINCIPALES */}
        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
          {/* BOTÓN SOLICITADO: VISUALIZAR E IMPRIMIR KARDEX HISTÓRICO */}
          <button
            onClick={() => {
              setAlumnoKardexSeleccionado(undefined);
              setModalKardexHistoricoAbierto(true);
            }}
            className="px-4.5 py-2.5 bg-blue-900 hover:bg-blue-850 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-950/20 hover:shadow-lg transition flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
            title="Visualizar e imprimir en KÁRDEX HISTÓRICO del Alumno de todos los cursos y pagos realizados"
          >
            <FolderArchive className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            <span>Kárdex Histórico Alumno</span>
          </button>

          {/* BOTÓN SOLICITADO: INSCRIBIR ALUMNOS */}
          <button
            onClick={() => abrirModalInscripcion()}
            className="px-4.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm shadow-md shadow-amber-900/10 hover:shadow-lg transition flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Inscribir Alumno</span>
          </button>

          <button
            onClick={abrirModalNuevoCurso}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Curso</span>
          </button>

          {onRestaurarCatalogoCompleto && (
            <button
              onClick={() => {
                if (window.confirm('¿Deseas restaurar el catálogo oficial de los 16 Cursos Acelerados de Google Sheets con todas sus características (horarios 8 a 22, presencial/virtual y costos 160-220 Bs)?')) {
                  onRestaurarCatalogoCompleto();
                }
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs sm:text-sm border border-slate-200/90 shadow-2xs transition flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
              title="Restaurar el catálogo completo de los 16 Cursos Acelerados oficiales"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-900" />
              <span>Restaurar Catálogo (16 Cursos)</span>
            </button>
          )}
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN INTERNA */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2 no-print overflow-x-auto text-xs sm:text-sm">
        <button
          onClick={() => setVistaInterna('catalogo')}
          className={`px-4 py-2.5 rounded-2xl font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
            vistaInterna === 'catalogo'
              ? 'bg-blue-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Catálogo de Cursos ({cursosAcelerados.length})</span>
        </button>

        <button
          onClick={() => setVistaInterna('inscritos')}
          className={`px-4 py-2.5 rounded-2xl font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
            vistaInterna === 'inscritos'
              ? 'bg-blue-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumnos Inscritos ({inscripciones.length})</span>
        </button>

        <button
          onClick={() => {
            setAlumnoKardexSeleccionado(undefined);
            setModalKardexHistoricoAbierto(true);
          }}
          className="px-4 py-2.5 rounded-2xl font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 text-slate-700 hover:text-blue-900 hover:bg-white border border-slate-200 shadow-2xs"
          title="Abrir Kárdex Histórico de todos los cursos y pagos realizados por alumno"
        >
          <FolderArchive className="w-4 h-4 text-blue-900" />
          <span>Kárdex Histórico ({alumnosUnicos.length} Alumnos)</span>
        </button>

        <button
          onClick={() => setVistaInterna('reporte-horario')}
          className={`px-4 py-2.5 rounded-2xl font-bold flex items-center space-x-2 transition cursor-pointer shrink-0 ${
            vistaInterna === 'reporte-horario'
              ? 'bg-amber-400 text-slate-950 font-black shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Reporte Oficial por Curso y Horario</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* VISTA 1: CATÁLOGO DE CURSOS ACELERADOS Y SUB-CURSOS      */}
      {/* ======================================================== */}
      {vistaInterna === 'catalogo' && (
        <div className="space-y-6">
          {/* Filtros de Búsqueda */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, código o sub-curso (ej. IA, Excel)..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Filtro por Categoría / Área */}
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value="todas">Todas las Áreas ({cursosAcelerados.length})</option>
                {categoriasDisponibles.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filtroModalidadCatalogo}
                onChange={(e) => setFiltroModalidadCatalogo(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none cursor-pointer text-xs"
              >
                <option value="todas">Presencial y Virtual</option>
                <option value="Presencial">Solo Presencial</option>
                <option value="Virtual">Solo Virtual</option>
              </select>

              <button
                onClick={() => abrirModalInscripcion()}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs text-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Inscribir Alumno</span>
              </button>
            </div>
          </div>

          {/* Grid de Tarjetas de Cursos */}
          {cursosFiltrados.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-6">
              <Zap className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-700 text-sm">No se encontraron cursos acelerados</h3>
              <p className="text-xs text-slate-400 mt-1">Crea un nuevo curso o restaura el catálogo oficial de 16 cursos.</p>
              <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={abrirModalNuevoCurso}
                  className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-800 transition cursor-pointer"
                >
                  + Crear Curso
                </button>
                {onRestaurarCatalogoCompleto && (
                  <button
                    onClick={onRestaurarCatalogoCompleto}
                    className="px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black shadow-sm hover:bg-amber-400 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Restaurar Catálogo Oficial (16 Cursos)</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {cursosFiltrados.map((curso) => {
                const inscritosCurso = inscripciones.filter(i => i.cursoId === curso.id).length;
                return (
                  <div
                    key={curso.id}
                    className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Cabecera de la Tarjeta */}
                      <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30">
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg bg-blue-950 text-amber-300">
                            {curso.codigo}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                            {curso.estado}
                          </span>
                        </div>

                        <h3 className="font-black text-lg text-slate-900 mt-2 leading-snug group-hover:text-blue-900 transition">
                          {curso.nombre}
                        </h3>

                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {curso.descripcion}
                        </p>
                      </div>

                      {/* Cuerpo de detalles */}
                      <div className="p-5 space-y-3.5 text-xs text-slate-600">
                        {/* Modalidad y Horarios */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-400 font-medium">Modalidad:</span>
                          <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md">
                            Presencial / Virtual
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-400 font-medium">Docente Titular:</span>
                          <span className="font-bold text-slate-800">{curso.docente || 'Docente Asignado'}</span>
                        </div>

                        {/* Inversión y Carga Horaria Oficial */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-400 font-medium">Inversión Oficial:</span>
                          <span className="font-mono font-black text-blue-950 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md text-xs">
                            {curso.costoBs} Bs.
                          </span>
                        </div>

                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <span className="text-slate-400 font-medium">Carga y Duración:</span>
                          <span className="font-bold text-amber-950 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md text-[11px]">
                            {curso.duracion || `${curso.cargaHoraria} Horas`}
                          </span>
                        </div>

                        {/* Horarios disponibles */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wider">
                            Horarios a Elección (8 a 22 hrs):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {HORARIOS_CURSOS_ACELERADOS.map((h) => (
                              <span
                                key={h}
                                className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded text-[10px]"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Sub-cursos: ÚNICAMENTE en los 5 cursos autorizados */}
                        {tieneSubCursosAutorizados(curso.nombre, curso.id) && curso.subCursos && curso.subCursos.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-500" />
                                <span>{curso.subCursos.length} Sub-cursos / Módulos:</span>
                              </span>
                            </div>
                            <div className="max-h-28 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                              {curso.subCursos.map((sub, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="text-[11px] bg-slate-50 hover:bg-blue-50/50 p-1 px-2 rounded border border-slate-200/80 font-medium text-slate-800 flex items-center gap-1.5 truncate"
                                  title={sub}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                                  <span className="truncate">{sub}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pie de la Tarjeta con Botón de Inscripción e Impresión de Boletas */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold text-slate-800">{inscritosCurso}</span>
                        <span>inscritos</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => abrirModalEditarCurso(curso)}
                          title="Editar Curso"
                          className="p-1.5 text-slate-500 hover:text-blue-900 rounded-lg hover:bg-slate-200 transition cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setEliminarCursoItem(curso)}
                          title="Eliminar Curso"
                          className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Ver inscritos y boletas del curso si tiene alumnos */}
                        {inscritosCurso > 0 && (
                          <button
                            onClick={() => {
                              setFiltroCursoInscritos(curso.id);
                              setVistaInterna('inscritos');
                            }}
                            title="Ver alumnos inscritos y sus boletas de inscripción"
                            className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                          >
                            <Printer className="w-3 h-3 text-blue-700" />
                            <span>Boletas</span>
                          </button>
                        )}

                        {/* Botón directo para inscribir alumno en este curso */}
                        <button
                          onClick={() => abrirModalInscripcion(curso.id)}
                          className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 transition shadow-xs cursor-pointer"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>Inscribir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 2: LISTADO DE ALUMNOS INSCRITOS A CURSOS           */}
      {/* ======================================================== */}
      {vistaInterna === 'inscritos' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Barra de Filtros */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={busquedaInscrito}
                  onChange={(e) => setBusquedaInscrito(e.target.value)}
                  placeholder="Buscar alumno, CI o sub-curso..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Filtro por Curso */}
              <select
                value={filtroCursoInscritos}
                onChange={(e) => setFiltroCursoInscritos(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos los Cursos</option>
                {cursosAcelerados.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>

              {/* Filtro por Horario Solicitado */}
              <select
                value={filtroHorarioInscritos}
                onChange={(e) => setFiltroHorarioInscritos(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="todos">Todos los Horarios (8 a 22)</option>
                {HORARIOS_CURSOS_ACELERADOS.map(h => (
                  <option key={h} value={h}>Horario: {h}</option>
                ))}
              </select>

              {/* Filtro por Modalidad */}
              <select
                value={filtroModalidadInscritos}
                onChange={(e) => setFiltroModalidadInscritos(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="todas">Presencial y Virtual</option>
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={() => setVistaInterna('reporte-horario')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-900" />
                <span>Ver Reporte Imprimible</span>
              </button>

              <button
                onClick={() => abrirModalInscripcion()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Inscribir Alumno</span>
              </button>
            </div>
          </div>

          {/* Tabla de Alumnos Inscritos */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">N°</th>
                  <th className="py-3 px-3">Código</th>
                  <th className="py-3 px-4">Alumno</th>
                  <th className="py-3 px-3">C.I.</th>
                  <th className="py-3 px-4">Curso y Sub-Curso</th>
                  <th className="py-3 px-3 text-center">Horario</th>
                  <th className="py-3 px-3 text-center">Modalidad</th>
                  <th className="py-3 px-3 text-right">Costo / Pagado</th>
                  <th className="py-3 px-3 text-center">Estado Pago</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inscripcionesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No hay alumnos inscritos con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  inscripcionesFiltradas.map((inc, idx) => {
                    const pagadoCompleto = (inc.saldoBs || 0) <= 0;
                    return (
                      <tr key={inc.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-900 text-xs">
                          {inc.codigoInscripcion}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">
                            {inc.apellidos}, {inc.nombres}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Tel: {inc.telefono || 'Sin teléfono'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-800">
                          {inc.ci} {inc.expedido}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 block">
                            {inc.cursoNombre}
                          </span>
                          {inc.subCurso && (
                            <span className="inline-block mt-0.5 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.2 rounded border border-amber-200">
                              {inc.subCurso}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block bg-blue-50 text-blue-900 font-bold px-2 py-0.5 rounded text-[11px] border border-blue-200">
                            {inc.horario}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inc.modalidad === 'Presencial' 
                              ? 'bg-emerald-100 text-emerald-900' 
                              : 'bg-purple-100 text-purple-900'
                          }`}>
                            {inc.modalidad}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          {inc.costoRealBs && inc.costoRealBs !== inc.costoBs ? (
                            <span className="text-[10px] text-slate-400 line-through block">
                              Real: {inc.costoRealBs} Bs.
                            </span>
                          ) : null}
                          {inc.descuentoBs ? (
                            <span className="text-[10px] text-rose-600 font-bold block">
                              Desc: -{inc.descuentoBs} Bs.
                            </span>
                          ) : null}
                          <span className="font-black text-slate-900 block">{inc.costoBs} Bs.</span>
                          <span className="text-[11px] text-emerald-700 font-bold block">Pagó: {inc.montoPagadoBs} Bs.</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {pagadoCompleto ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Cancelado</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 inline-block">
                              Saldo: {inc.saldoBs} Bs.
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* BOTÓN KARDEX HISTÓRICO DE ESTE ALUMNO */}
                            <button
                              onClick={() => {
                                setAlumnoKardexSeleccionado(inc.ci || `${inc.apellidos} ${inc.nombres}`);
                                setModalKardexHistoricoAbierto(true);
                              }}
                              title="Visualizar e imprimir Kárdex Histórico consolidado con todos los cursos y pagos de este alumno"
                              className="px-2.5 py-1 text-white bg-blue-900 hover:bg-blue-800 font-bold rounded-lg transition cursor-pointer flex items-center gap-1 text-xs shadow-2xs"
                            >
                              <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                              <span className="hidden sm:inline">Kárdex</span>
                            </button>

                            <button
                              onClick={() => {
                                setBoletaInscripcionSeleccionada(inc);
                                setAutoPrintBoleta(false);
                              }}
                              title="Imprimir Boleta Oficial de Inscripción"
                              className="px-2.5 py-1 text-slate-950 bg-amber-400 hover:bg-amber-300 font-black rounded-lg transition cursor-pointer flex items-center gap-1 text-xs shadow-2xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Boleta</span>
                            </button>

                            <button
                              onClick={() => setEliminarInscripcionItem(inc)}
                              title="Eliminar registro"
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VISTA 3: REPORTE OFICIAL BASADO EN CURSO Y HORARIO       */}
      {/* ======================================================== */}
      {vistaInterna === 'reporte-horario' && (
        <div className="space-y-6">
          {/* Controles del Reporte (no se imprimen) */}
          <div className="no-print bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Selector de Curso */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Curso Acelerado:
                </label>
                <select
                  value={reporteCursoId}
                  onChange={(e) => setReporteCursoId(e.target.value)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm cursor-pointer"
                >
                  {cursosAcelerados.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Horario Solicitado */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Horario de Clase:
                </label>
                <select
                  value={reporteHorario}
                  onChange={(e) => setReporteHorario(e.target.value as HorarioCursoAcelerado)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm cursor-pointer"
                >
                  {HORARIOS_CURSOS_ACELERADOS.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>

              {/* Selector de Modalidad */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                  Modalidad:
                </label>
                <select
                  value={reporteModalidad}
                  onChange={(e) => setReporteModalidad(e.target.value as any)}
                  className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm cursor-pointer"
                >
                  <option value="Todas">Presencial y Virtual</option>
                  <option value="Presencial">Solo Presencial</option>
                  <option value="Virtual">Solo Virtual</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={() => abrirModalInscripcion(reporteCursoId, reporteHorario, reporteModalidad === 'Todas' ? 'Presencial' : reporteModalidad)}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Inscribir a este Horario</span>
              </button>

              <button
                onClick={handlePrintReporte}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Nómina / PDF</span>
              </button>
            </div>
          </div>

          {/* DOCUMENTO OFICIAL IMPRIMIBLE: NÓMINA DE CURSO Y HORARIO */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-300 shadow-xl max-w-5xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 text-slate-900 font-sans">
            {/* Membrete Institucional */}
            <div className="border-b-2 border-slate-900 pb-5 mb-5">
              <div className="flex justify-between items-center gap-4">
                <div className="shrink-0 flex items-center justify-center">
                  <IngDataCompLogo size="lg" showSubtitle={false} customLogoUrl={customLogoUrl} />
                </div>

                <div className="text-center flex-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">
                    CAPACITACIÓN TÉCNICA CONTINUA Y ESPECIALIZADA
                  </span>
                  <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight leading-tight mt-0.5">
                    INSTITUTO TECNOLÓGICO ING DATA COMP
                  </h1>
                  <span className="inline-block bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full text-xs font-black text-blue-900 mt-1">
                    R.M. No. 0397/2024
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">
                    Cochabamba - Bolivia • Nómina y Control de Asistencia Oficial de Cursos Acelerados
                  </p>
                </div>

                {/* Sello de Horario */}
                <div className="text-right shrink-0">
                  <div className="border-2 border-blue-950 rounded-2xl p-2.5 text-center bg-blue-50/60">
                    <span className="block text-[9px] font-black text-slate-500 uppercase">
                      HORARIO ASIGNADO
                    </span>
                    <span className="block text-base sm:text-lg font-black text-blue-950 font-mono">
                      {reporteHorario}
                    </span>
                    <span className="block text-[9px] font-bold text-amber-700 uppercase mt-0.5">
                      {reporteModalidad === 'Todas' ? 'Presencial / Virtual' : reporteModalidad}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4 pt-3 border-t border-slate-200">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wider uppercase underline underline-offset-4">
                  NÓMINA OFICIAL DE ESTUDIANTES POR CURSO Y HORARIO
                </h2>
              </div>
            </div>

            {/* Ficha del Curso y Horario */}
            {cursoReporteObj && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-xs sm:text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2.5 gap-x-4">
                  <div className="sm:col-span-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Curso Acelerado:</span>
                    <span className="font-black text-blue-950 text-base">
                      {cursoReporteObj.nombre} ({cursoReporteObj.codigo})
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Horario de Clases:</span>
                    <span className="font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md inline-block">
                      {reporteHorario}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Docente Titular:</span>
                    <span className="font-bold text-slate-900">
                      {cursoReporteObj.docente || 'Por asignar'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Alumnos en Horario:</span>
                    <span className="font-black text-slate-900 font-mono text-sm">
                      {alumnosReporte.length} Alumnos
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Recaudado:</span>
                    <span className="font-black text-emerald-700 font-mono text-sm">
                      {totalRecaudadoReporte} Bs.
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Saldo Pendiente:</span>
                    <span className="font-bold text-amber-700 font-mono text-sm">
                      {totalSaldoReporte} Bs.
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Fecha de Emisión:</span>
                    <span className="font-mono text-slate-700">
                      {new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TABLA OFICIAL DE ESTUDIANTES INSCRITOS EN ESTE CURSO Y HORARIO */}
            <div className="mb-6">
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-2 w-8 text-center border-r border-slate-300">N°</th>
                    <th className="py-2.5 px-3 w-24 border-r border-slate-300">C.I. / Matrícula</th>
                    <th className="py-2.5 px-4 border-r border-slate-300">Apellidos y Nombres</th>
                    <th className="py-2.5 px-4 border-r border-slate-300">Módulo / Sub-Curso</th>
                    <th className="py-2.5 px-2 w-20 text-center border-r border-slate-300">Modalidad</th>
                    <th className="py-2.5 px-2 w-24 text-center border-r border-slate-300">Teléfono</th>
                    <th className="py-2.5 px-2 w-20 text-center border-r border-slate-300">Pago Bs.</th>
                    <th className="py-2.5 px-3 w-28 text-center border-r border-slate-300">Firma Alumno</th>
                    <th className="py-2.5 px-2 w-16 text-center">Asist.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {alumnosReporte.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No hay alumnos inscritos en el curso <strong>{cursoReporteObj?.nombre}</strong> en el horario <strong>{reporteHorario}</strong>.
                      </td>
                    </tr>
                  ) : (
                    alumnosReporte.map((alumno, index) => (
                      <tr key={alumno.id} className="hover:bg-slate-50/50">
                        <td className="py-2 px-2 text-center font-bold text-slate-500 border-r border-slate-200">
                          {index + 1}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900 border-r border-slate-200 text-xs">
                          {alumno.ci} {alumno.expedido}
                        </td>
                        <td className="py-2 px-4 font-bold text-slate-900 border-r border-slate-200">
                          {alumno.apellidos}, {alumno.nombres}
                        </td>
                        <td className="py-2 px-4 font-medium text-slate-800 border-r border-slate-200">
                          {alumno.subCurso || <span className="text-slate-400 italic">Curso General</span>}
                        </td>
                        <td className="py-2 px-2 text-center border-r border-slate-200">
                          <span className="font-semibold text-slate-700">
                            {alumno.modalidad}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600 border-r border-slate-200">
                          {alumno.telefono || '-'}
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold border-r border-slate-200">
                          <span className="text-emerald-700">{alumno.montoPagadoBs}</span>
                          {alumno.saldoBs > 0 && (
                            <span className="text-[10px] text-amber-700 block">S: {alumno.saldoBs}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 border-r border-slate-200">
                          {/* Espacio para la firma manual del estudiante */}
                          <div className="h-6"></div>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="w-5 h-5 border border-slate-300 mx-auto rounded"></div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* FIRMAS INSTITUCIONALES DEL REPORTE */}
            <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs text-slate-800">
              <div className="flex flex-col items-center">
                <div className="w-48 border-b-2 border-slate-400 mb-2"></div>
                <span className="font-bold block">{cursoReporteObj?.docente || 'Docente Titular'}</span>
                <span className="text-[11px] text-slate-500 block">DOCENTE INSTRUCTOR</span>
                <span className="text-[9px] text-slate-400 font-mono">INSTITUTO TECNOLÓGICO ING DATA COMP</span>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-48 border-b-2 border-slate-400 mb-2"></div>
                <span className="font-bold block">KÁRDEX CENTRAL Y REGISTRO</span>
                <span className="text-[11px] text-slate-500 block">DIRECCIÓN ACADÉMICA</span>
                <span className="text-[9px] text-slate-400 font-mono">R.M. No. 0397/2024</span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
              Reporte emitido automáticamente por el Sistema de Gestión del INSTITUTO TECNOLÓGICO ING DATA COMP. Válido para control de asistencia y kárdex.
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INSCRIBIR ALUMNO A CURSO ACELERADO (SOLICITADO)   */}
      {/* ======================================================== */}
      {modalInscribirAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-white">
                    Inscripción a Curso Acelerado
                  </h3>
                  <p className="text-xs text-blue-200 font-medium">
                    Selecciona horario, modalidad (Presencial/Virtual), sub-curso y costo
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setModalInscribirAbierto(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario de Inscripción */}
            <form onSubmit={submitInscripcion} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Opción: Seleccionar alumno existente o ingresar nuevo */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">
                    Tipo de Alumno:
                  </span>
                  <div className="flex items-center space-x-3 text-xs">
                    <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-800">
                      <input
                        type="radio"
                        name="modoAlumno"
                        checked={modoAlumno === 'nuevo'}
                        onChange={() => setModoAlumno('nuevo')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Nuevo Alumno</span>
                    </label>

                    <label className="flex items-center space-x-1.5 cursor-pointer font-semibold text-slate-800">
                      <input
                        type="radio"
                        name="modoAlumno"
                        checked={modoAlumno === 'existente'}
                        onChange={() => setModoAlumno('existente')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>Alumno Registrado</span>
                    </label>
                  </div>
                </div>

                {modoAlumno === 'existente' && (
                  <select
                    value={alumnoExistenteId}
                    onChange={(e) => handleSeleccionarAlumnoExistente(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Seleccionar Alumno Registrado en el Sistema --</option>
                    {estudiantes.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.apellidos}, {e.nombres} (CI: {e.ci} {e.expedido})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Datos Personales del Alumno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nombres del Alumno *
                  </label>
                  <input
                    type="text"
                    required
                    value={insNombres}
                    onChange={(e) => setInsNombres(e.target.value)}
                    placeholder="Ej. Juan Carlos"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Apellidos del Alumno *
                  </label>
                  <input
                    type="text"
                    required
                    value={insApellidos}
                    onChange={(e) => setInsApellidos(e.target.value)}
                    placeholder="Ej. Morales Pérez"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Cédula de Identidad *
                  </label>
                  <input
                    type="text"
                    required
                    value={insCi}
                    onChange={(e) => setInsCi(e.target.value)}
                    placeholder="Número de CI"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Expedido
                  </label>
                  <select
                    value={insExpedido}
                    onChange={(e) => setInsExpedido(e.target.value as ExpedidoBolivia)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none"
                  >
                    <option value="CB">CB (Cochabamba)</option>
                    <option value="LP">LP (La Paz)</option>
                    <option value="SC">SC (Santa Cruz)</option>
                    <option value="OR">OR (Oruro)</option>
                    <option value="PT">PT (Potosí)</option>
                    <option value="TJ">TJ (Tarija)</option>
                    <option value="CH">CH (Chuquisaca)</option>
                    <option value="BE">BE (Beni)</option>
                    <option value="PD">PD (Pando)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Teléfono Celular / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={insTelefono}
                    onChange={(e) => setInsTelefono(e.target.value)}
                    placeholder="Ej. 72234567"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={insEmail}
                    onChange={(e) => setInsEmail(e.target.value)}
                    placeholder="alumno@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <hr className="border-slate-200 my-2" />

              {/* Selección de Curso Acelerado */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Curso Acelerado Principal *
                </label>
                <select
                  required
                  value={insCursoId}
                  onChange={(e) => handleCambioCursoIns(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs sm:text-sm font-black text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {cursosAcelerados.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.codigo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-Cursos a Elegir: ÚNICAMENTE en Computación Básica, Avanzada, Lenguajes de Programación, Diseño Gráfico Publicitario y Arquitectónico */}
              {tieneSubCursosAutorizados(cursoSeleccionadoIns?.nombre, cursoSeleccionadoIns?.id) && cursoSeleccionadoIns?.subCursos && cursoSeleccionadoIns.subCursos.length > 0 && (
                <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200">
                  <label className="block text-xs font-black text-amber-950 uppercase mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Selecciona el Sub-Curso / Módulo *</span>
                  </label>
                  <select
                    value={insSubCurso}
                    onChange={(e) => setInsSubCurso(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {cursoSeleccionadoIns.subCursos.map((sub, idx) => (
                      <option key={idx} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Selección de Horario (8 a 22 hrs) y Modalidad (Presencial / Virtual) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-700" />
                    <span>Horario de Clase *</span>
                  </label>
                  <select
                    value={insHorario}
                    onChange={(e) => setInsHorario(e.target.value as HorarioCursoAcelerado)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {HORARIOS_CURSOS_ACELERADOS.map(h => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Modalidad *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setInsModalidad('Presencial')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                        insModalidad === 'Presencial'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>Presencial</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInsModalidad('Virtual')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer border ${
                        insModalidad === 'Virtual'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>Virtual</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CRONOGRAMA ACADÉMICO: FECHAS DE INICIO Y FINALIZACIÓN DEL CURSO */}
              <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-200 space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="block text-xs font-black text-blue-950 uppercase flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-800" />
                    <span>Cronograma de Clases: Inicio y Finalización del Curso *</span>
                  </label>
                  <span className="text-[11px] font-bold text-blue-900 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                    Duración: {cursoSeleccionadoIns?.duracion || '4 Semanas (40 Horas)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Fecha de Inicio *
                    </label>
                    <input
                      type="date"
                      required
                      value={insFechaInicio}
                      onChange={(e) => handleCambioFechaInicio(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Fecha de Finalización *
                    </label>
                    <input
                      type="date"
                      required
                      value={insFechaFin}
                      onChange={(e) => setInsFechaFin(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-blue-950 pt-1 flex-wrap gap-2">
                  <span>
                    Período programado: <strong className="text-blue-900">{formatearRangoFechasLiteral(insFechaInicio, insFechaFin)}</strong>
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Docente: {cursoSeleccionadoIns?.docente || 'Docente Titular Asignado'}
                  </span>
                </div>
              </div>

              {/* GESTIÓN FINANCIERA DE LA INSCRIPCIÓN (ADMINISTRADOR) */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 uppercase tracking-wide block">
                        Detalle Financiero de la Matrícula
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Costo, descuento, pago inicial y saldo
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
                    Administrador
                  </span>
                </div>

                {/* 1. Costo del Curso (Ingresado por Administrador) y 2. Descuento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Costo del Curso */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5">
                      Costo del Curso (Bs.) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="10000"
                        required
                        value={insCostoRealBs}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value));
                          setInsCostoRealBs(val);
                          const final = Math.max(0, val - insDescuentoBs);
                          setInsCostoBs(final);
                        }}
                        placeholder="Ej. 180"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-2xs"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        Bs.
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Costo arancelario ingresado por el administrador
                    </span>
                  </div>

                  {/* Descuento Aplicado */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-amber-600" />
                        <span>Descuento (Bs.)</span>
                      </span>
                      {insDescuentoBs > 0 && (
                        <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Rebaja: -{insDescuentoBs} Bs.
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={insCostoRealBs}
                        value={insDescuentoBs === 0 ? '' : insDescuentoBs}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(Number(e.target.value) || 0, insCostoRealBs));
                          setInsDescuentoBs(val);
                          const final = Math.max(0, insCostoRealBs - val);
                          setInsCostoBs(final);
                          if (insMontoPagadoBs > final) {
                            setInsMontoPagadoBs(final);
                          }
                        }}
                        placeholder="0 (Sin descuento)"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                        Bs.
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Descuento o beca ingresado en la ventana
                    </span>
                  </div>
                </div>

                {/* Banner de Total a Pagar */}
                <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-blue-900 block">
                      Total a Cancelar (Costo con Descuento)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {insCostoRealBs} Bs. {insDescuentoBs > 0 ? `- ${insDescuentoBs} Bs. de descuento` : '(Sin descuento)'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xl font-black text-blue-950">
                      {Math.max(0, insCostoRealBs - insDescuentoBs)} Bs.
                    </span>
                  </div>
                </div>

                {/* Grid con ¿Cuánto pagará hoy? y ¿Cuánto debe de saldo? */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* ¿Cuánto pagará hoy? */}
                  <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-black text-emerald-950 uppercase">
                        ¿Cuánto pagará hoy? (Bs.) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setInsMontoPagadoBs(Math.max(0, insCostoRealBs - insDescuentoBs))}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition cursor-pointer"
                        title="Pagar la totalidad del costo"
                      >
                        Pagar Totalidad
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max={Math.max(0, insCostoRealBs - insDescuentoBs)}
                        required
                        value={insMontoPagadoBs}
                        onChange={(e) => setInsMontoPagadoBs(Math.max(0, Number(e.target.value)))}
                        placeholder="Monto que paga hoy"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-emerald-300 rounded-xl text-base font-mono font-black text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-emerald-600">
                        Bs.
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-800 mt-1 block">
                      Abono o monto pagado al momento de inscribirse
                    </span>
                  </div>

                  {/* ¿Cuánto debe de saldo? */}
                  <div className={`p-3.5 rounded-xl border flex flex-col justify-between ${
                    Math.max(0, (insCostoRealBs - insDescuentoBs) - insMontoPagadoBs) <= 0
                      ? 'bg-emerald-100/60 border-emerald-300'
                      : 'bg-amber-100/70 border-amber-300'
                  }`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black uppercase text-slate-800">
                          ¿Cuánto debe de saldo? (Bs.)
                        </span>
                        {Math.max(0, (insCostoRealBs - insDescuentoBs) - insMontoPagadoBs) <= 0 ? (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                            Totalmente Cancelado
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                            Saldo Pendiente
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-2xl font-black mt-1">
                        <span className={Math.max(0, (insCostoRealBs - insDescuentoBs) - insMontoPagadoBs) <= 0 ? 'text-emerald-700' : 'text-amber-950'}>
                          {Math.max(0, (insCostoRealBs - insDescuentoBs) - insMontoPagadoBs)} Bs.
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-semibold mt-1 block ${
                      Math.max(0, (insCostoRealBs - insDescuentoBs) - insMontoPagadoBs) <= 0 ? 'text-emerald-700' : 'text-amber-800'
                    }`}>
                      {Math.max(0, (insCostoRealBs - insDescuentoBs) - insMontoPagadoBs) <= 0 
                        ? '✓ Sin saldo pendiente. Matrícula pagada al 100%.' 
                        : `Saldo deudor a regularizar: ${Math.max(0, (insCostoRealBs - insDescuentoBs) - insMontoPagadoBs)} Bs.`}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Observaciones (Opcional)
                </label>
                <input
                  type="text"
                  value={insObservaciones}
                  onChange={(e) => setInsObservaciones(e.target.value)}
                  placeholder="Ej. Traerá laptop propia, comprobante de depósito..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
                />
              </div>

              {/* Botones footer: Con botón para imprimir directamente la boleta oficial (Requerimiento 3) */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalInscribirAbierto(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>

                <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={(e) => submitInscripcion(e, false)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Solo Guardar Inscripción
                  </button>

                  <button
                    type="button"
                    onClick={(e) => submitInscripcion(e, true)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Registrar e Imprimir Boleta Directamente</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR / EDITAR CURSO ACELERADO                    */}
      {/* ======================================================== */}
      {modalCursoAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 my-8">
            <div className="bg-gradient-to-r from-blue-950 to-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">
                  {cursoEditando ? 'Editar Curso Acelerado' : 'Nuevo Curso Acelerado'}
                </h3>
                <p className="text-xs text-blue-200">
                  Capacitación continua y módulos especializados
                </p>
              </div>
              <button 
                onClick={() => setModalCursoAbierto(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitCurso} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={curCodigo}
                    onChange={(e) => setCurCodigo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Nombre del Curso *
                  </label>
                  <input
                    type="text"
                    required
                    value={curNombre}
                    onChange={(e) => setCurNombre(e.target.value)}
                    placeholder="Ej. Computación Básica"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={curDescripcion}
                  onChange={(e) => setCurDescripcion(e.target.value)}
                  placeholder="Detalles sobre el contenido del curso..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              {/* Sub-cursos: ÚNICAMENTE autorizados en los 5 cursos especificados */}
              {tieneSubCursosAutorizados(curNombre, cursoEditando?.id) ? (
                <div>
                  <label className="block text-[11px] font-bold text-blue-900 uppercase mb-1 flex items-center justify-between">
                    <span>Sub-cursos / Módulos a Elegir (Uno por línea):</span>
                    <span className="text-[10px] text-amber-600 font-bold">Autorizado con Sub-cursos</span>
                  </label>
                  <textarea
                    rows={4}
                    value={curSubCursosTexto}
                    onChange={(e) => setCurSubCursosTexto(e.target.value)}
                    placeholder="Microsoft Word Normal&#10;Microsoft Word con IA&#10;Microsoft Excel Normal&#10;Microsoft Excel con IA..."
                    className="w-full px-3 py-2 bg-blue-50/50 border border-blue-200 rounded-xl text-xs font-medium font-mono"
                  />
                </div>
              ) : (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500">
                  <span className="font-bold text-slate-700 block mb-0.5">ℹ️ Política Institucional de Sub-cursos:</span>
                  Los sub-cursos existen únicamente en: <strong>Computación Básica, Computación Avanzada, Lenguajes de Programación, Diseño Gráfico Publicitario</strong> y <strong>Diseño Gráfico Arquitectónico</strong>. En los demás cursos acelerados no se aplican sub-cursos.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Costo Base Oficial (Bs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={curCostoBs}
                    onChange={(e) => setCurCostoBs(Number(e.target.value))}
                    placeholder="Ej. 560"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Costo de matrícula referencial para este curso.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Docente Titular
                  </label>
                  <input
                    type="text"
                    value={curDocente}
                    onChange={(e) => setCurDocente(e.target.value)}
                    placeholder="Ej. Ing. Carlos Mamani"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Profesor o instructor a cargo del curso.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Carga Horaria (Horas) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={curCargaHoraria}
                    onChange={(e) => {
                      const h = Number(e.target.value);
                      setCurCargaHoraria(h);
                      if (h === 40) setCurDuracion('4 Semanas (40 Horas)');
                      else if (h === 60) setCurDuracion('6 Semanas (60 Horas)');
                      else setCurDuracion(`${Math.max(1, Math.round(h / 10))} Semanas (${h} Horas)`);
                    }}
                    placeholder="Ej. 40"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Duración Estimada *
                  </label>
                  <input
                    type="text"
                    required
                    value={curDuracion}
                    onChange={(e) => setCurDuracion(e.target.value)}
                    placeholder="Ej. 4 Semanas (40 Horas)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Opciones de Costos Sugeridos (separados por coma)
                </label>
                <input
                  type="text"
                  value={curCostosOpciones}
                  onChange={(e) => setCurCostosOpciones(e.target.value)}
                  placeholder="Ej. 160, 180, 200, 220, 560"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tarifas o descuentos sugeridos para los selectores de matrícula.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setModalCursoAbierto(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 text-white font-bold rounded-xl text-xs shadow-md"
                >
                  Guardar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR CURSO */}
      {eliminarCursoItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">¿Eliminar este Curso?</h3>
            <p className="text-xs text-slate-500">
              Se eliminará <strong>{eliminarCursoItem.nombre}</strong> ({eliminarCursoItem.codigo}). Esta acción no se puede deshacer.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setEliminarCursoItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onEliminarCurso(eliminarCursoItem.id);
                  setEliminarCursoItem(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR INSCRIPCIÓN */}
      {eliminarInscripcionItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">¿Eliminar Inscripción?</h3>
            <p className="text-xs text-slate-500">
              Se anulará la inscripción de <strong>{eliminarInscripcionItem.nombres} {eliminarInscripcionItem.apellidos}</strong> al curso <strong>{eliminarInscripcionItem.cursoNombre}</strong>.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setEliminarInscripcionItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onEliminarInscripcion(eliminarInscripcionItem.id);
                  setEliminarInscripcionItem(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: BOLETA OFICIAL DE INSCRIPCIÓN (IMPRESIÓN DIRECTA) */}
      {/* ======================================================== */}
      {boletaInscripcionSeleccionada && (
        <BoletaInscripcionModal
          inscripcion={boletaInscripcionSeleccionada}
          curso={cursosAcelerados.find(c => c.id === boletaInscripcionSeleccionada.cursoId)}
          institutoConfig={institutoConfig}
          customLogoUrl={customLogoUrl}
          autoPrint={autoPrintBoleta}
          onClose={() => {
            setBoletaInscripcionSeleccionada(null);
            setAutoPrintBoleta(false);
          }}
        />
      )}

      {/* ======================================================== */}
      {/* MODAL: KARDEX HISTÓRICO DE ALUMNO (CURSOS Y PAGOS)       */}
      {/* ======================================================== */}
      {modalKardexHistoricoAbierto && (
        <KardexHistoricoCursosModal
          inscripciones={inscripciones}
          cursosAcelerados={cursosAcelerados}
          institutoConfig={institutoConfig}
          customLogoUrl={customLogoUrl}
          alumnoPreseleccionadoIdOIdentificador={alumnoKardexSeleccionado}
          onClose={() => {
            setModalKardexHistoricoAbierto(false);
            setAlumnoKardexSeleccionado(undefined);
          }}
          onInscribirNuevoCurso={(ci) => {
            setModalKardexHistoricoAbierto(false);
            abrirModalInscripcion();
            const estCoincidente = estudiantes.find(e => e.ci === ci);
            if (estCoincidente) {
              handleSeleccionarAlumnoExistente(estCoincidente.id);
            }
          }}
        />
      )}
    </div>
  );
};
