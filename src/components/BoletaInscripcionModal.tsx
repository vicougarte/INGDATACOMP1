import React, { useEffect } from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  User, 
  BookOpen, 
  DollarSign, 
  ShieldCheck,
  Scissors
} from 'lucide-react';
import { CursoAcelerado, InscripcionCursoAcelerado, ConfiguracionInstituto } from '../types';
import { IngDataCompLogo } from './IngDataCompLogo';
import { imprimirElementoUniversal, descargarDocumentoHtml } from '../services/printService';
import { Download } from 'lucide-react';

interface BoletaInscripcionModalProps {
  inscripcion: InscripcionCursoAcelerado;
  curso?: CursoAcelerado;
  institutoConfig?: ConfiguracionInstituto;
  customLogoUrl?: string | null;
  onClose: () => void;
  autoPrint?: boolean;
}

export const BoletaInscripcionModal: React.FC<BoletaInscripcionModalProps> = ({
  inscripcion,
  curso,
  institutoConfig,
  customLogoUrl,
  onClose,
  autoPrint = false
}) => {
  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const costoReal = inscripcion.costoRealBs ?? (inscripcion.costoBs + (inscripcion.descuentoBs ?? 0));
  const descuento = inscripcion.descuentoBs ?? 0;
  const costoFinal = inscripcion.costoBs;
  const pagado = inscripcion.montoPagadoBs;
  const saldo = inscripcion.saldoBs;
  const estaCancelado = saldo <= 0;

  const fechaInicio = inscripcion.fechaInicioCurso || curso?.fechaInicio || '2026-03-02';
  const fechaFin = inscripcion.fechaFinCurso || curso?.fechaFin || '2026-03-27';
  const cargaHoraria = inscripcion.cargaHorariaCurso || curso?.cargaHoraria || 40;
  const duracionBase = inscripcion.duracionCurso || curso?.duracion || '4 Semanas (40 Horas)';
  const duracion = duracionBase.includes('Hora') ? duracionBase : `${duracionBase} (${cargaHoraria} Horas)`;
  const docente = inscripcion.docenteCurso || curso?.docente || 'Docente Titular Asignado';

  const formatearFecha = (fechaStr?: string) => {
    if (!fechaStr) return 'Por confirmar';
    try {
      const partes = fechaStr.split('-');
      if (partes.length === 3) {
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const dia = partes[2];
        const mes = meses[parseInt(partes[1], 10) - 1] || partes[1];
        const anio = partes[0];
        return `${dia} de ${mes} de ${anio}`;
      }
      return fechaStr;
    } catch {
      return fechaStr;
    }
  };

  const [imprimiendo, setImprimiendo] = React.useState(false);
  const [mensajeEstado, setMensajeEstado] = React.useState<string | null>(null);

  const handleImprimir = async () => {
    setImprimiendo(true);
    setMensajeEstado('Enviando boleta oficial a la impresora...');
    try {
      const res = await imprimirElementoUniversal(
        'boleta-imprimible-area',
        `Boleta Oficial - ${inscripcion.nombres} ${inscripcion.apellidos}`
      );
      if (res.exito) {
        setMensajeEstado('✓ Diálogo de impresión invocado correctamente.');
      } else {
        // En caso excepcional, fallback a window.print()
        window.print();
        setMensajeEstado('✓ Enviado a impresión directa.');
      }
    } catch (e) {
      console.error('Error al imprimir comprobante:', e);
      window.print();
    } finally {
      setTimeout(() => {
        setImprimiendo(false);
        setTimeout(() => setMensajeEstado(null), 4000);
      }, 800);
    }
  };

  const handleDescargarBoleta = () => {
    descargarDocumentoHtml(
      'boleta-imprimible-area',
      `Boleta_Curso_${inscripcion.ci}_${inscripcion.apellidos}`
    );
    setMensajeEstado('✓ Comprobante descargado en archivo HTML listo para imprimir.');
    setTimeout(() => setMensajeEstado(null), 5000);
  };

  // Renderizador de una boleta individual (para Copia Estudiante y Copia Instituto)
  const renderBoletaIndividual = (tipoCopia: 'ESTUDIANTE' | 'INSTITUTO - ARCHIVO CAJA') => (
    <div className="bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-5 text-slate-900 text-xs shadow-xs relative">
      {/* Etiqueta de tipo de copia */}
      <div className="absolute top-2 right-3">
        <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded bg-slate-900 text-amber-300 uppercase">
          COPIA {tipoCopia}
        </span>
      </div>

      {/* Encabezado Institucional */}
      <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3 mb-3">
        <div className="w-12 h-12 shrink-0">
          <IngDataCompLogo size="sm" customLogoUrl={customLogoUrl} />
        </div>
        <div className="flex-1 pr-14">
          <h2 className="text-sm sm:text-base font-black tracking-tight uppercase leading-tight text-slate-950">
            {institutoConfig?.nombre || 'INSTITUTO TÉCNICO SUPERIOR ING DATA COMP'}
          </h2>
          <div className="text-[11px] font-bold text-blue-900 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span>Resolución Ministerial: {institutoConfig?.resolucionMinisterial || 'R.M. No. 0397/2024'}</span>
            <span className="hidden sm:inline">•</span>
            <span>Ministerio de Educación de Bolivia</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {institutoConfig?.direccion || 'Av. Heroínas esq. Ayacucho, Edificio Tecnológico 4to Piso, Cochabamba'} | Telf: {institutoConfig?.telefono || '+591 4 4528900 / 76912345'}
          </p>
        </div>
      </div>

      {/* Título de la Boleta y Código */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-2.5 mb-3 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-blue-950 tracking-wider block">
            DEPARTAMENTO DE CAPACITACIÓN CONTINUA • CURSOS ACELERADOS
          </span>
          <h3 className="text-xs sm:text-sm font-black text-slate-950">
            BOLETA OFICIAL DE MATRICULACIÓN Y COMPROBANTE DE INVERSIÓN
          </h3>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-500 block uppercase font-bold">N° DE BOLETA</span>
          <span className="font-mono font-black text-xs sm:text-sm text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-300">
            {inscripcion.codigoInscripcion}
          </span>
        </div>
      </div>

      {/* Grid de 2 Columnas: Datos Personales y Datos Académicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Columna 1: Datos Personales */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
          <div className="flex items-center gap-1.5 text-blue-950 font-black text-[11px] uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2">
            <User className="w-3.5 h-3.5 text-blue-700" />
            <span>Datos Personales del Estudiante</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Estudiante:</span>
              <span className="font-bold text-slate-950 text-right">{inscripcion.apellidos}, {inscripcion.nombres}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Cédula de Identidad:</span>
              <span className="font-mono font-bold text-slate-900">{inscripcion.ci} {inscripcion.expedido}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Teléfono / WhatsApp:</span>
              <span className="font-mono font-bold text-slate-900">{inscripcion.telefono || 'No registrado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Correo Electrónico:</span>
              <span className="font-medium text-slate-700 truncate max-w-[180px]">{inscripcion.email || 'No registrado'}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Fecha de Inscripción:</span>
              <span className="font-mono font-bold text-slate-900">{formatearFecha(inscripcion.fechaInscripcion)}</span>
            </div>
          </div>
        </div>

        {/* Columna 2: Datos Académicos y Cronograma */}
        <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/60">
          <div className="flex items-center gap-1.5 text-blue-950 font-black text-[11px] uppercase tracking-wide border-b border-slate-200 pb-1.5 mb-2">
            <BookOpen className="w-3.5 h-3.5 text-blue-700" />
            <span>Curso y Cronograma Académico</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between items-start">
              <span className="text-slate-500 font-medium">Curso Acelerado:</span>
              <span className="font-black text-blue-950 text-right">{inscripcion.cursoNombre}</span>
            </div>
            {inscripcion.subCurso && (
              <div className="flex justify-between items-start bg-amber-100/70 p-1 rounded border border-amber-200">
                <span className="text-amber-950 font-bold">Sub-Curso Asignado:</span>
                <span className="font-black text-amber-950 text-right">{inscripcion.subCurso}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Horario de Clases:</span>
              <span className="font-mono font-black text-blue-900 bg-blue-100/70 px-1.5 py-0.2 rounded">
                {inscripcion.horario} hrs.
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Modalidad de Estudio:</span>
              <span className={`font-bold px-1.5 rounded ${inscripcion.modalidad === 'Presencial' ? 'bg-emerald-100 text-emerald-900' : 'bg-purple-100 text-purple-900'}`}>
                {inscripcion.modalidad}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Duración y Carga:</span>
              <span className="font-bold text-slate-900">{duracion} ({cargaHoraria} Horas)</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Fecha Inicio y Fin:</span>
              <span className="font-bold text-slate-900 text-right">
                {formatearFecha(fechaInicio)} al {formatearFecha(fechaFin)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Docente Titular:</span>
              <span className="font-bold text-slate-800 text-right">{docente}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cuadro Financiero: Costo Real, Descuento, Pago y Saldo */}
      <div className="border-2 border-slate-900 rounded-xl p-3 bg-amber-50/40 mb-3">
        <div className="flex items-center justify-between border-b border-amber-200 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5 text-slate-950 font-black text-[11px] uppercase tracking-wide">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>Detalle Financiero del Curso</span>
          </div>
          <div>
            {estaCancelado ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                <span>TOTALMENTE CANCELADO</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                <AlertCircle className="w-3 h-3 text-amber-700" />
                <span>PAGO PARCIAL (CON SALDO PENDIENTE)</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Costo Real</span>
            <span className="font-mono font-black text-slate-900 text-sm">{costoReal} Bs.</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Descuento</span>
            <span className="font-mono font-black text-rose-600 text-sm">
              {descuento > 0 ? `-${descuento} Bs.` : '0 Bs.'}
            </span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Inversión Final</span>
            <span className="font-mono font-black text-blue-950 text-sm">{costoFinal} Bs.</span>
          </div>
          <div className="bg-white p-2 rounded-lg border border-emerald-300">
            <span className="text-[10px] text-emerald-700 block uppercase font-bold">Monto Pagado</span>
            <span className="font-mono font-black text-emerald-700 text-sm">{pagado} Bs.</span>
          </div>
          <div className={`p-2 rounded-lg border ${estaCancelado ? 'bg-white border-slate-200' : 'bg-amber-100 border-amber-300'}`}>
            <span className="text-[10px] text-slate-700 block uppercase font-bold">Saldo Pendiente</span>
            <span className={`font-mono font-black text-sm ${estaCancelado ? 'text-slate-400' : 'text-amber-900'}`}>
              {saldo} Bs.
            </span>
          </div>
        </div>

        {inscripcion.observaciones && (
          <div className="mt-2 pt-2 border-t border-amber-200 text-[10px] text-slate-600">
            <span className="font-bold text-slate-800">Observaciones:</span> {inscripcion.observaciones}
          </div>
        )}
      </div>

      {/* Normativa y Reglamento */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 mb-3 text-[10px] text-slate-600 leading-relaxed">
        <span className="font-bold text-slate-800 uppercase block mb-0.5">Términos y Normativa Académica:</span>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>Asistencia mínima obligatoria del 80% en clases teóricas y prácticas para habilitación a certificación.</li>
          <li>El certificado curricular oficial con aval ministerial R.M. 0397/2024 se extenderá tras la conclusión del curso y habiendo cancelado el 100% de la inversión.</li>
          <li>Esta boleta es el comprobante oficial de ingreso a laboratorios tecnológicos y aulas virtuales.</li>
        </ul>
      </div>

      {/* Firmas y Sellos Autorizados */}
      <div className="grid grid-cols-2 gap-8 pt-6 mt-4 border-t border-slate-300 text-center text-[10px]">
        <div>
          <div className="border-t border-slate-400 w-36 mx-auto pt-1 mb-0.5 font-bold text-slate-900">
            Firma del Estudiante
          </div>
          <span className="text-slate-500 font-mono">CI: {inscripcion.ci} {inscripcion.expedido}</span>
        </div>

        <div>
          <div className="border-t border-slate-400 w-44 mx-auto pt-1 mb-0.5 font-bold text-slate-900">
            Sello y Firma Caja / Admisiones
          </div>
          <span className="text-slate-500">Secretaría Académica ING DATA COMP</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
      {/* Contenedor principal modal */}
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 my-4 flex flex-col max-h-[95vh] print:max-h-none print:h-auto print:overflow-visible print:border-none print:shadow-none print:rounded-none print:w-full print:m-0 print:p-0 print:block">
        
        {/* Barra de Acciones Superior (No se imprime) */}
        <div className="no-print bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base leading-tight">
                Boleta Oficial de Inscripción • Curso Acelerado
              </h3>
              <p className="text-xs text-slate-300">
                Instituto Técnico Superior ING DATA COMP (R.M. No. 0397/2024)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDescargarBoleta}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
              title="Descargar archivo HTML oficial para imprimir"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Descargar Archivo</span>
            </button>

            <button
              onClick={handleImprimir}
              disabled={imprimiendo}
              className={`px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition cursor-pointer ${
                imprimiendo ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <Printer className={`w-4 h-4 ${imprimiendo ? 'animate-bounce' : ''}`} />
              <span>{imprimiendo ? 'Enviando...' : 'Imprimir Boleta Directamente'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mensajeEstado && (
          <div className="no-print bg-amber-400/20 text-amber-200 border-b border-amber-400/30 text-xs px-4 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{mensajeEstado}</span>
          </div>
        )}

        {/* Zona con Scroll para visualización previa en pantalla */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-slate-100 flex-1 space-y-6 print:overflow-visible print:p-0 print:m-0 print:bg-white print:h-auto print:block">
          <div className="no-print text-center text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Documento oficial con validez institucional. Imprime 2 copias: Copia Estudiante y Copia Instituto / Caja.</span>
          </div>

          {/* DOCUMENTO IMPRIMIBLE: Formato Dual A4 */}
          <div id="boleta-imprimible-area" className="space-y-4 print:p-0 print:m-0 print:space-y-3">
            {/* 1. COPIA ESTUDIANTE */}
            {renderBoletaIndividual('ESTUDIANTE')}

            {/* Línea de corte entre copias */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-slate-400"></div>
              </div>
              <div className="relative bg-slate-100 px-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase">
                <Scissors className="w-3.5 h-3.5" />
                <span>Cortar por aquí (Separación de Comprobantes)</span>
              </div>
            </div>

            {/* 2. COPIA INSTITUTO */}
            {renderBoletaIndividual('INSTITUTO - ARCHIVO CAJA')}
          </div>
        </div>

        {/* Barra Inferior (No se imprime) */}
        <div className="no-print p-4 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500">
            Estudiante: <strong>{inscripcion.nombres} {inscripcion.apellidos}</strong> • CI: {inscripcion.ci}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl cursor-pointer"
            >
              Cerrar
            </button>
            <button
              onClick={handleDescargarBoleta}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-300"
              title="Descargar archivo web listo para imprimir"
            >
              <Download className="w-3.5 h-3.5 text-blue-900" />
              <span>Descargar Archivo</span>
            </button>
            <button
              onClick={handleImprimir}
              disabled={imprimiendo}
              className="px-5 py-2.5 bg-blue-950 hover:bg-blue-900 text-amber-300 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
