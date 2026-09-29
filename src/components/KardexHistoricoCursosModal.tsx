import React, { useState, useMemo } from 'react';
import { 
  InscripcionCursoAcelerado, 
  CursoAcelerado, 
  ConfiguracionInstituto,
  ExpedidoBolivia
} from '../types';
import { 
  Printer, 
  Download, 
  X, 
  Search, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Clock, 
  BookOpen, 
  DollarSign, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Building2, 
  History, 
  FileText,
  Award,
  Layers,
  Phone,
  Mail,
  FolderArchive
} from 'lucide-react';
import { IngDataCompLogo } from './IngDataCompLogo';
import { imprimirElementoUniversal, descargarDocumentoHtml, numeroALiteralBolivianos } from '../services/printService';

export interface AlumnoHistoricoCursos {
  ci: string;
  expedido: ExpedidoBolivia;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  telefono: string;
  email: string;
  estudianteId?: string;
  inscripciones: InscripcionCursoAcelerado[];
  totalCursos: number;
  totalHoras: number;
  totalCostoReal: number;
  totalDescuento: number;
  totalCostoFinal: number;
  totalPagado: number;
  totalSaldo: number;
  estaAlDia: boolean;
}

interface KardexHistoricoCursosModalProps {
  inscripciones: InscripcionCursoAcelerado[];
  cursosAcelerados: CursoAcelerado[];
  institutoConfig?: ConfiguracionInstituto;
  customLogoUrl?: string | null;
  alumnoPreseleccionadoIdOIdentificador?: string;
  onClose: () => void;
  onInscribirNuevoCurso?: (ci: string) => void;
}

export const KardexHistoricoCursosModal: React.FC<KardexHistoricoCursosModalProps> = ({
  inscripciones,
  cursosAcelerados,
  institutoConfig,
  customLogoUrl,
  alumnoPreseleccionadoIdOIdentificador,
  onClose,
  onInscribirNuevoCurso
}) => {
  // 1. Agrupar todas las inscripciones por alumno (clave: CI normalizado, o combinación de apellidos y nombres)
  const alumnosHistoricos = useMemo(() => {
    const mapa = new Map<string, AlumnoHistoricoCursos>();

    inscripciones.forEach(inc => {
      const ciLimpio = inc.ci ? inc.ci.trim().toUpperCase() : '';
      const clave = ciLimpio || `${inc.apellidos.trim().toLowerCase()}-${inc.nombres.trim().toLowerCase()}`;

      const costoReal = Number(inc.costoRealBs) || (Number(inc.costoBs) + (Number(inc.descuentoBs) || 0));
      const descuento = Number(inc.descuentoBs) || 0;
      const costoFinal = Number(inc.costoBs);
      const pagado = Number(inc.montoPagadoBs) || 0;
      const saldo = Number(inc.saldoBs) || Math.max(0, costoFinal - pagado);
      const horas = Number(inc.cargaHorariaCurso) || 40;

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          ci: inc.ci || 'S/CI',
          expedido: inc.expedido || 'CB',
          nombres: inc.nombres || '',
          apellidos: inc.apellidos || '',
          nombreCompleto: `${inc.apellidos}, ${inc.nombres}`.trim(),
          telefono: inc.telefono || '',
          email: inc.email || '',
          estudianteId: inc.estudianteId,
          inscripciones: [inc],
          totalCursos: 1,
          totalHoras: horas,
          totalCostoReal: costoReal,
          totalDescuento: descuento,
          totalCostoFinal: costoFinal,
          totalPagado: pagado,
          totalSaldo: saldo,
          estaAlDia: saldo <= 0
        });
      } else {
        const item = mapa.get(clave)!;
        item.inscripciones.push(inc);
        item.totalCursos += 1;
        item.totalHoras += horas;
        item.totalCostoReal += costoReal;
        item.totalDescuento += descuento;
        item.totalCostoFinal += costoFinal;
        item.totalPagado += pagado;
        item.totalSaldo += saldo;
        item.estaAlDia = item.totalSaldo <= 0;
        if (!item.telefono && inc.telefono) item.telefono = inc.telefono;
        if (!item.email && inc.email) item.email = inc.email;
      }
    });

    // Ordenar alfabéticamente por apellidos y nombres
    return Array.from(mapa.values()).sort((a, b) => 
      a.apellidos.localeCompare(b.apellidos, 'es', { sensitivity: 'base' })
    );
  }, [inscripciones]);

  // Búsqueda y selección de alumno
  const [busqueda, setBusqueda] = useState('');
  
  // Preseleccionar si viene un identificador
  const initialClave = useMemo(() => {
    if (alumnoPreseleccionadoIdOIdentificador && alumnosHistoricos.length > 0) {
      const match = alumnosHistoricos.find(a => 
        a.ci.toLowerCase() === alumnoPreseleccionadoIdOIdentificador.toLowerCase() ||
        a.nombreCompleto.toLowerCase().includes(alumnoPreseleccionadoIdOIdentificador.toLowerCase()) ||
        a.inscripciones.some(i => i.id === alumnoPreseleccionadoIdOIdentificador || i.codigoInscripcion === alumnoPreseleccionadoIdOIdentificador)
      );
      if (match) return match.ci;
    }
    return alumnosHistoricos[0]?.ci || '';
  }, [alumnoPreseleccionadoIdOIdentificador, alumnosHistoricos]);

  const [alumnoSeleccionadoCi, setAlumnoSeleccionadoCi] = useState<string>(initialClave);

  // Alumnos filtrados para el selector
  const alumnosFiltrados = useMemo(() => {
    if (!busqueda.trim()) return alumnosHistoricos;
    const q = busqueda.toLowerCase().trim();
    return alumnosHistoricos.filter(a => 
      a.nombreCompleto.toLowerCase().includes(q) ||
      a.ci.toLowerCase().includes(q) ||
      a.telefono.toLowerCase().includes(q) ||
      a.inscripciones.some(i => i.cursoNombre.toLowerCase().includes(q) || (i.subCurso && i.subCurso.toLowerCase().includes(q)))
    );
  }, [alumnosHistoricos, busqueda]);

  // Alumno activo actual
  const alumnoActivo = useMemo(() => {
    const encontrado = alumnosHistoricos.find(a => a.ci === alumnoSeleccionadoCi);
    return encontrado || alumnosHistoricos[0] || null;
  }, [alumnosHistoricos, alumnoSeleccionadoCi]);

  // Estados de impresión
  const [imprimiendo, setImprimiendo] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  // Fecha y hora formateada en español
  const fechaEmisionLiteral = useMemo(() => {
    const fecha = new Date();
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, '0');
    const min = String(fecha.getMinutes()).padStart(2, '0');
    return `${dia} de ${mes} de ${anio}, ${hora}:${min}`;
  }, []);

  const formatearFechaSimple = (fechaStr?: string) => {
    if (!fechaStr) return '-';
    try {
      const p = fechaStr.split('-');
      if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
      return fechaStr;
    } catch {
      return fechaStr;
    }
  };

  // Función de impresión universal directa
  const handleImprimirKardex = async () => {
    if (!alumnoActivo) return;
    setImprimiendo(true);
    setMensajeEstado('Enviando Kárdex Histórico a la impresora...');
    
    try {
      const res = await imprimirElementoUniversal(
        'kardex-historico-acelerados-imprimible',
        `Kardex_Historico_${alumnoActivo.ci}_${alumnoActivo.apellidos}`
      );
      if (res.exito) {
        setMensajeEstado('✓ Kárdex enviado a la impresora.');
      } else {
        descargarDocumentoHtml(
          'kardex-historico-acelerados-imprimible',
          `Kardex_Historico_${alumnoActivo.ci}_${alumnoActivo.apellidos}`
        );
        setMensajeEstado('✓ Descargando archivo HTML del Kárdex.');
      }
    } catch (e) {
      console.error('Error al imprimir kárdex:', e);
      descargarDocumentoHtml(
        'kardex-historico-acelerados-imprimible',
        `Kardex_Historico_${alumnoActivo.ci}_${alumnoActivo.apellidos}`
      );
    } finally {
      setTimeout(() => {
        setImprimiendo(false);
        setTimeout(() => setMensajeEstado(null), 5000);
      }, 1000);
    }
  };

  // Función de descarga HTML de respaldo
  const handleDescargarHtml = () => {
    if (!alumnoActivo) return;
    descargarDocumentoHtml(
      'kardex-historico-acelerados-imprimible',
      `Kardex_Historico_${alumnoActivo.ci}_${alumnoActivo.apellidos}`
    );
    setMensajeEstado('✓ Kárdex descargado en archivo HTML listo para imprimir.');
    setTimeout(() => setMensajeEstado(null), 5000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-slate-100 rounded-3xl max-w-5xl w-full max-h-[96vh] flex flex-col shadow-2xl border border-slate-300 overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        
        {/* ======================================================== */}
        {/* BARRA SUPERIOR DE CONTROL (NO SE IMPRIME)                */}
        {/* ======================================================== */}
        <div className="bg-white px-5 py-4 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 no-print shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs">
              <FolderArchive className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Kárdex Histórico de Alumno - Cursos Acelerados
                </h2>
                <span className="bg-amber-100 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-amber-300">
                  {alumnosHistoricos.length} Alumnos Registrados
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Historial consolidado de todos los cursos y pagos realizados por el estudiante.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            {/* Mensaje de estado */}
            {mensajeEstado && (
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200">
                {mensajeEstado}
              </span>
            )}

            {/* BOTÓN IMPRIMIR KÁRDEX */}
            <button
              onClick={handleImprimirKardex}
              disabled={imprimiendo || !alumnoActivo}
              className="px-4 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
              title="Enviar directamente a la impresora física o diálogo del navegador"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{imprimiendo ? 'Imprimiendo...' : 'Imprimir Kárdex'}</span>
            </button>

            {/* BOTÓN DESCARGAR ARCHIVO HTML */}
            <button
              onClick={handleDescargarHtml}
              disabled={!alumnoActivo}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 rounded-xl text-xs sm:text-sm shadow-2xs flex items-center gap-1.5 cursor-pointer transition"
              title="Descargar copia oficial en archivo HTML autónomo para abrir e imprimir en cualquier equipo"
            >
              <Download className="w-3.5 h-3.5 text-blue-900" />
              <span className="hidden sm:inline">Descargar</span>
            </button>

            {/* BOTÓN CERRAR */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SELECTOR Y BUSCADOR DE ALUMNO (NO SE IMPRIME)             */}
        {/* ======================================================== */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
            <label className="font-bold text-slate-600 shrink-0 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-900" />
              <span>Seleccionar Alumno:</span>
            </label>
            <div className="relative flex-1 max-w-md">
              <select
                value={alumnoActivo?.ci || ''}
                onChange={(e) => setAlumnoSeleccionadoCi(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-xs"
              >
                {alumnosFiltrados.map((a) => (
                  <option key={a.ci} value={a.ci}>
                    {a.nombreCompleto} — CI: {a.ci} ({a.totalCursos} {a.totalCursos === 1 ? 'curso' : 'cursos'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por Nombre, C.I. o Curso..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* ÁREA DEL DOCUMENTO IMPRIMIBLE OFICIAL                     */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 print:overflow-visible print:p-0 bg-slate-200/60 print:bg-white">
          {!alumnoActivo ? (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500">
              <FolderArchive className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm">No hay alumnos seleccionados o registrados en Cursos Acelerados.</p>
            </div>
          ) : (
            <div 
              id="kardex-historico-acelerados-imprimible"
              className="bg-white max-w-4xl mx-auto p-6 sm:p-9 rounded-2xl shadow-md border border-slate-300 text-slate-900 print:shadow-none print:border-none print:p-2 print:max-w-none print:w-full space-y-6"
            >
              {/* ENCABEZADO INSTITUCIONAL */}
              <div className="border-b-2 border-blue-900 pb-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Logo institucional */}
                  <div className="shrink-0 flex items-center">
                    <IngDataCompLogo customLogoUrl={customLogoUrl} className="w-16 h-16 sm:w-20 sm:h-20 object-contain" />
                  </div>

                  {/* Datos del Instituto */}
                  <div className="text-center flex-1">
                    <h1 className="text-base sm:text-xl font-black text-blue-950 tracking-tight leading-snug">
                      {institutoConfig?.nombre || 'INSTITUTO TECNOLÓGICO ING DATA COMP'}
                    </h1>
                    <p className="text-[11px] sm:text-xs font-bold text-amber-700 uppercase tracking-widest mt-0.5">
                      Centro de Capacitación Continua y Formación Tecnológica
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                      Resolución Ministerial {institutoConfig?.resolucionMinisterial || 'R.M. No. 0397/2024'} • {institutoConfig?.direccion || 'Av. Heroínas esq. Ayacucho, Edif. Tecnológico 4to Piso'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Telf: {institutoConfig?.telefono || '+591 4 4528900'} • {institutoConfig?.ciudad || 'Cochabamba'}, Bolivia
                    </p>
                  </div>

                  {/* Cuadro de Folio y Código */}
                  <div className="shrink-0 text-right">
                    <div className="border-2 border-blue-900 rounded-xl p-2.5 bg-blue-50/60 text-center min-w-[130px]">
                      <span className="block text-[9px] font-black uppercase text-blue-900 tracking-wider">
                        KÁRDEX HISTÓRICO
                      </span>
                      <span className="block text-xs font-mono font-black text-slate-950 mt-0.5">
                        KRD-CA-{alumnoActivo.ci}
                      </span>
                      <span className="block text-[9px] text-slate-500 mt-1 font-mono">
                        Gestión {new Date().getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Franja de Título de Documento */}
                <div className="mt-4 pt-3 border-t border-slate-200 text-center">
                  <h2 className="text-sm sm:text-base font-black uppercase text-slate-900 tracking-wider inline-block bg-slate-100 px-4 py-1 rounded-lg border border-slate-200">
                    KÁRDEX HISTÓRICO ACADÉMICO Y FINANCIERO DEL ALUMNO
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Historial consolidado de cursos acelerados, módulos de capacitación, horarios y estado de pagos
                  </p>
                </div>
              </div>

              {/* FICHA TÉCNICA DEL ALUMNO */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Apellidos y Nombres:</span>
                    <span className="font-black text-slate-900 text-sm block">
                      {alumnoActivo.apellidos}, {alumnoActivo.nombres}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Cédula de Identidad:</span>
                    <span className="font-mono font-bold text-blue-950 text-sm block">
                      {alumnoActivo.ci} {alumnoActivo.expedido}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Teléfono / Celular:</span>
                    <span className="font-mono font-medium text-slate-800 block">
                      {alumnoActivo.telefono || 'Sin registro'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Correo Electrónico:</span>
                    <span className="text-slate-800 font-mono text-[11px] truncate block">
                      {alumnoActivo.email || 'Sin correo registrado'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Total Cursos Inscritos:</span>
                    <span className="font-black text-blue-900 block text-xs">
                      {alumnoActivo.totalCursos} {alumnoActivo.totalCursos === 1 ? 'Curso' : 'Cursos Registrados'}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Carga Horaria Acumulada:</span>
                    <span className="font-black text-purple-900 block text-xs">
                      {alumnoActivo.totalHoras} Horas Académicas
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Fecha de Emisión:</span>
                    <span className="font-medium text-slate-700 block text-[11px]">
                      {fechaEmisionLiteral}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase">Estado Financiero General:</span>
                    {alumnoActivo.estaAlDia ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>AL DÍA - CUENTA CANCELADA</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        <AlertCircle className="w-3 h-3 stroke-[2.5]" />
                        <span>SALDO PENDIENTE: {alumnoActivo.totalSaldo} Bs.</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* RESUMEN FINANCIERO CONSOLIDADO (TARJETAS) */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Inversión Bruta</span>
                  <span className="font-black text-slate-800 text-sm block mt-0.5">
                    {alumnoActivo.totalCostoReal} Bs.
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase">Descuentos</span>
                  <span className="font-black text-rose-600 text-sm block mt-0.5">
                    -{alumnoActivo.totalDescuento} Bs.
                  </span>
                </div>

                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl">
                  <span className="block text-[10px] font-bold text-blue-900 uppercase">Costo Total Pautado</span>
                  <span className="font-black text-blue-950 text-sm block mt-0.5">
                    {alumnoActivo.totalCostoFinal} Bs.
                  </span>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="block text-[10px] font-bold text-emerald-800 uppercase">Total Cancelado</span>
                  <span className="font-black text-emerald-700 text-sm block mt-0.5">
                    {alumnoActivo.totalPagado} Bs.
                  </span>
                </div>

                <div className={`p-2.5 rounded-xl border ${alumnoActivo.estaAlDia ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-300'}`}>
                  <span className="block text-[10px] font-bold text-slate-600 uppercase">Saldo Pendiente</span>
                  <span className={`font-black text-sm block mt-0.5 ${alumnoActivo.estaAlDia ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {alumnoActivo.totalSaldo} Bs.
                  </span>
                </div>
              </div>

              {/* LITERAL DEL TOTAL PAGADO */}
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
                <span className="text-[11px] text-slate-600 font-bold">
                  SON CANCELADOS: <span className="font-black text-slate-900 uppercase">{numeroALiteralBolivianos(alumnoActivo.totalPagado)}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {alumnoActivo.totalCursos} registros certificados
                </span>
              </div>

              {/* ======================================================== */}
              {/* TABLA PRINCIPAL: DETALLE DE CURSOS Y PAGOS               */}
              {/* ======================================================== */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>Detalle Cronológico de Cursos y Módulos Matriculados</span>
                  </h3>
                  <span className="text-[11px] text-slate-500 font-bold">
                    Total: {alumnoActivo.inscripciones.length} Cursos
                  </span>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-blue-950 text-white font-bold text-[10px] uppercase tracking-wider">
                        <th className="py-2.5 px-2 text-center w-7">N°</th>
                        <th className="py-2.5 px-2">Código</th>
                        <th className="py-2.5 px-3">Curso y Sub-Curso / Módulo</th>
                        <th className="py-2.5 px-2 text-center">Horario</th>
                        <th className="py-2.5 px-2 text-center">Modalidad</th>
                        <th className="py-2.5 px-2 text-center">Período / Horas</th>
                        <th className="py-2.5 px-2 text-right">Costo</th>
                        <th className="py-2.5 px-2 text-right">Pagado</th>
                        <th className="py-2.5 px-2 text-right">Saldo</th>
                        <th className="py-2.5 px-2 text-center">Estado Pago</th>
                        <th className="py-2.5 px-2 text-center">Estado Curso</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {alumnoActivo.inscripciones.map((inc, idx) => {
                        const cursoObj = cursosAcelerados.find(c => c.id === inc.cursoId);
                        const horas = inc.cargaHorariaCurso || cursoObj?.cargaHoraria || 40;
                        const pagadoCompleto = (inc.saldoBs || 0) <= 0;
                        const costoReal = Number(inc.costoRealBs) || (Number(inc.costoBs) + (Number(inc.descuentoBs) || 0));
                        const descuento = Number(inc.descuentoBs) || 0;

                        return (
                          <tr key={inc.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                            <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="py-2.5 px-2 font-mono font-bold text-blue-900 text-[11px] whitespace-nowrap">
                              {inc.codigoInscripcion}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-slate-900 block leading-tight">
                                {inc.cursoNombre}
                              </span>
                              {inc.subCurso && (
                                <span className="inline-block mt-0.5 text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  Módulo: {inc.subCurso}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-500 block mt-0.5">
                                Docente: {inc.docenteCurso || cursoObj?.docente || 'Docente Titular Asignado'}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center whitespace-nowrap">
                              <span className="bg-slate-100 text-slate-800 font-bold px-1.5 py-0.5 rounded text-[10px] border border-slate-200">
                                {inc.horario}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                inc.modalidad === 'Presencial' 
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                                  : 'bg-purple-100 text-purple-900 border border-purple-200'
                              }`}>
                                {inc.modalidad}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center text-[10px] text-slate-600 whitespace-nowrap">
                              <span className="font-bold text-slate-800 block">{horas} Horas</span>
                              <span className="text-[9px] text-slate-400 block">
                                {formatearFechaSimple(inc.fechaInicioCurso)} al {formatearFechaSimple(inc.fechaFinCurso)}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-[11px] whitespace-nowrap">
                              {descuento > 0 && (
                                <span className="text-[9px] text-slate-400 line-through block">
                                  {costoReal} Bs.
                                </span>
                              )}
                              <span className="font-bold text-slate-900 block">{inc.costoBs} Bs.</span>
                              {descuento > 0 && (
                                <span className="text-[9px] text-rose-600 font-semibold block">
                                  Desc. -{descuento} Bs.
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-700 text-[11px] whitespace-nowrap">
                              {inc.montoPagadoBs} Bs.
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-[11px] whitespace-nowrap">
                              <span className={pagadoCompleto ? 'text-slate-400' : 'text-amber-700'}>
                                {inc.saldoBs} Bs.
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-center whitespace-nowrap">
                              {pagadoCompleto ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-0.5">
                                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  <span>Cancelado</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                  Saldo: {inc.saldoBs} Bs.
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-center whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-900 border border-blue-200">
                                {inc.estado || 'Inscrito'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-300 text-xs">
                        <td colSpan={6} className="py-2.5 px-3 text-right uppercase tracking-wider text-[11px]">
                          TOTALES CONSOLIDADOS DEL ALUMNO:
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono">
                          {alumnoActivo.totalCostoFinal} Bs.
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-emerald-700">
                          {alumnoActivo.totalPagado} Bs.
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-amber-700">
                          {alumnoActivo.totalSaldo} Bs.
                        </td>
                        <td colSpan={2} className="py-2.5 px-2 text-center">
                          {alumnoActivo.estaAlDia ? (
                            <span className="text-emerald-700 font-bold text-[10px]">
                              100% CANCELADO
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold text-[10px]">
                              PENDIENTE: {alumnoActivo.totalSaldo} Bs.
                            </span>
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* HISTORIAL DETALLADO DE PAGOS Y RECIBOS */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Historial de Pagos y Comprobantes de Caja Emitidos:</span>
                </h4>
                <div className="space-y-1.5">
                  {alumnoActivo.inscripciones.map((inc) => (
                    <div 
                      key={`pago-${inc.id}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px] gap-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-900">{inc.codigoInscripcion}</span>
                        <span className="text-slate-400">•</span>
                        <span className="font-semibold text-slate-800">{inc.cursoNombre} {inc.subCurso ? `(${inc.subCurso})` : ''}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 font-mono text-[10px]">Fecha: {formatearFechaSimple(inc.fechaInscripcion)}</span>
                      </div>
                      <div className="flex items-center gap-3 font-mono font-bold">
                        <span className="text-slate-600">Pautado: {inc.costoBs} Bs.</span>
                        <span className="text-emerald-700">Abonó: {inc.montoPagadoBs} Bs.</span>
                        <span className={inc.saldoBs <= 0 ? 'text-emerald-700' : 'text-amber-700'}>
                          Saldo: {inc.saldoBs} Bs.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OBSERVACIONES ACADÉMICAS SI EXISTEN */}
              {alumnoActivo.inscripciones.some(i => i.observaciones) && (
                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-950">
                  <span className="font-bold block uppercase text-[10px] tracking-wider mb-1">
                    Notas y Observaciones Registradas:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {alumnoActivo.inscripciones.filter(i => i.observaciones).map((inc) => (
                      <li key={`obs-${inc.id}`}>
                        <span className="font-bold">{inc.cursoNombre}:</span> {inc.observaciones}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* PIE INSTITUCIONAL, SELLOS Y FIRMAS (PARA IMPRESIÓN OFICIAL) */}
              <div className="pt-6 border-t border-slate-300 mt-6">
                <p className="text-[10px] text-slate-500 text-center mb-10 italic">
                  Certificación oficial emitida por el Instituto Tecnológico ING DATA COMP de acuerdo a los registros del Libro de Actas e Inscripciones. Validez oficial bajo R.M. No. 0397/2024.
                </p>

                <div className="grid grid-cols-3 gap-6 text-center text-xs pt-4">
                  {/* Firma 1: Secretaría General */}
                  <div className="flex flex-col items-center">
                    <div className="w-40 border-b-2 border-slate-800 mb-2"></div>
                    <span className="font-black text-slate-900 block text-xs">
                      {institutoConfig?.secretariaGeneral || 'Lic. Claudia Villarroel M.'}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Secretaría General y Caja
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      ING DATA COMP
                    </span>
                  </div>

                  {/* Firma 2: Dirección Académica */}
                  <div className="flex flex-col items-center">
                    <div className="w-40 border-b-2 border-slate-800 mb-2"></div>
                    <span className="font-black text-slate-900 block text-xs">
                      {institutoConfig?.directorAcademico || 'Ing. Grover Marcelo Arispe R.'}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Dirección Académica
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      ING DATA COMP
                    </span>
                  </div>

                  {/* Firma 3: Estudiante */}
                  <div className="flex flex-col items-center">
                    <div className="w-40 border-b-2 border-slate-800 mb-2"></div>
                    <span className="font-black text-slate-900 block text-xs">
                      {alumnoActivo.apellidos}, {alumnoActivo.nombres}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      Firma del Estudiante
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">
                      C.I. {alumnoActivo.ci} {alumnoActivo.expedido}
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 font-mono">
                  Documento generado electrónicamente por el Sistema Académico de ING DATA COMP • Cochabamba, Bolivia • Folio KRD-CA-{alumnoActivo.ci}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PIE DE DIÁLOGO MODAL */}
        <div className="bg-white px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print shrink-0 text-xs">
          <div className="text-slate-500 text-[11px]">
            {alumnoActivo && (
              <span>
                Visualizando historial de <strong className="text-slate-800">{alumnoActivo.nombreCompleto}</strong> — C.I. {alumnoActivo.ci} ({alumnoActivo.totalCursos} cursos registrados)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onInscribirNuevoCurso && alumnoActivo && (
              <button
                onClick={() => {
                  onInscribirNuevoCurso(alumnoActivo.ci);
                  onClose();
                }}
                className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl transition cursor-pointer flex items-center gap-1"
                title="Inscribir a este alumno en un nuevo curso acelerado adicional"
              >
                <span>+ Inscribir en Otro Curso</span>
              </button>
            )}

            <button
              onClick={handleImprimirKardex}
              disabled={imprimiendo || !alumnoActivo}
              className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Imprimir Kárdex</span>
            </button>

            <button
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
