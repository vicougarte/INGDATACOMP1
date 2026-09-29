import React, { useState } from 'react';
import { Estudiante, Carrera, Materia, ConfiguracionInstituto, CostoCarrera } from '../types';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  BookOpen, 
  Scissors,
  Building2,
  FileCheck,
  Eye,
  Download,
  Award,
  CreditCard,
  Receipt,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { IngDataCompLogo } from './IngDataCompLogo';
import { COSTOS_CARRERAS_INICIALES, MESES_10_CUOTAS } from '../data/initialData';
import { imprimirElementoUniversal, descargarDocumentoHtml } from '../services/printService';

interface BoletaMatriculaEstudianteModalProps {
  estudiante?: Estudiante | null;
  carrera?: Carrera | null;
  materias?: Materia[];
  institutoConfig?: ConfiguracionInstituto;
  customLogoUrl?: string | null;
  costosCarrera?: CostoCarrera[];
  onClose: () => void;
  autoPrint?: boolean;
}

export const BoletaMatriculaEstudianteModal: React.FC<BoletaMatriculaEstudianteModalProps> = ({
  estudiante,
  carrera,
  materias = [],
  institutoConfig,
  customLogoUrl,
  costosCarrera = COSTOS_CARRERAS_INICIALES,
  onClose,
  autoPrint = false
}) => {
  // Modo de visualización de copias: 'ambas' | 'alumno' | 'empresa'
  const [modoCopias, setModoCopias] = useState<'ambas' | 'alumno' | 'empresa'>('ambas');
  const [vistaPantallaCompleta, setVistaPantallaCompleta] = useState<boolean>(false);

  React.useEffect(() => {
    if (autoPrint && estudiante) {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.warn('Impresión automática prevenida:', e);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, estudiante]);

  // Si no hay estudiante seleccionado, mostrar mensaje seguro
  if (!estudiante) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4 shadow-2xl">
          <p className="font-bold text-slate-800">No se ha seleccionado un estudiante para la boleta.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const [imprimiendo, setImprimiendo] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  const handleImprimir = async () => {
    setImprimiendo(true);
    setMensajeEstado('Enviando boleta a la impresora...');
    try {
      const res = await imprimirElementoUniversal(
        'documento-boleta-matricula',
        `Boleta de Matricula - ${estudiante.apellidos}, ${estudiante.nombres}`
      );
      if (res.exito) {
        setMensajeEstado('✓ Enviado a diálogo de impresión.');
      } else {
        setMensajeEstado('Descargando archivo oficial de boleta...');
        descargarDocumentoHtml(
          'documento-boleta-matricula',
          `Boleta_Matricula_${estudiante.codigo}_${estudiante.apellidos}`
        );
      }
    } catch (e) {
      console.error('Error al imprimir boleta:', e);
      descargarDocumentoHtml(
        'documento-boleta-matricula',
        `Boleta_Matricula_${estudiante.codigo}_${estudiante.apellidos}`
      );
    } finally {
      setTimeout(() => {
        setImprimiendo(false);
        setTimeout(() => setMensajeEstado(null), 5000);
      }, 1000);
    }
  };

  const handleDescargarBoleta = () => {
    descargarDocumentoHtml(
      'documento-boleta-matricula',
      `Boleta_Matricula_${estudiante.codigo}_${estudiante.apellidos}`
    );
    setMensajeEstado('✓ Boleta descargada en formato web (abrir y pulsar Imprimir).');
    setTimeout(() => setMensajeEstado(null), 5000);
  };

  const anio = estudiante.anioActual || 1;
  const materiasAnuales = (Array.isArray(materias) ? materias : []).filter(
    m => m && m.carreraId === estudiante.carreraId && m.anio === anio
  );

  // Costos por carrera y valores del estudiante
  const costoOficial = costosCarrera.find(c => c.carreraId === estudiante.carreraId) || costosCarrera[0] || COSTOS_CARRERAS_INICIALES[0];
  
  const costoMatriculaBase = estudiante.costoMatriculaBs ?? costoOficial.costoMatriculaBs;
  const descMatricula = estudiante.descuentoMatriculaBs ?? 0;
  const costoMatriculaFinal = estudiante.montoMatriculaFinalBs ?? (costoMatriculaBase - descMatricula);

  const costoMensualidadBase = estudiante.costoMensualidadBs ?? costoOficial.costoMensualidadBs;
  const descMensualidad = estudiante.descuentoMensualidadBs ?? 0;
  const costoMensualidadFinal = estudiante.montoMensualidadFinalBs ?? (costoMensualidadBase - descMensualidad);

  const otrosCostos = estudiante.otrosCostosBs ?? costoOficial.otrosCostosBs;
  const conceptoOtros = estudiante.conceptoOtrosCostos || costoOficial.descripcionOtrosCostos || 'Seguro estudiantil y carnet institucional';

  const totalGestion = estudiante.montoTotalGestionBs ?? (costoMatriculaFinal + (costoMensualidadFinal * 10) + otrosCostos);
  const pagadoInicial = estudiante.montoPagadoInicialBs ?? costoMatriculaFinal;
  const saldoInicial = estudiante.saldoPendienteInicialBs ?? (costoMatriculaFinal > pagadoInicial ? costoMatriculaFinal - pagadoInicial : 0);
  const nroRecibo = estudiante.nroReciboInicial || `REC-2026-${String(estudiante.codigo || '001').replace(/[^0-9]/g, '').slice(-4).padStart(4, '0')}`;
  const metodoPago = estudiante.metodoPagoInicial || 'Efectivo';
  const fechaPago = estudiante.fechaPagoInicial || estudiante.fechaInscripcion || new Date().toISOString().slice(0, 10);

  const formatearFecha = (fechaStr?: string) => {
    if (!fechaStr) {
      return new Date().toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' });
    }
    try {
      const partes = String(fechaStr).split('-');
      if (partes.length === 3) {
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const dia = partes[2];
        const mes = meses[parseInt(partes[1], 10) - 1] || partes[1];
        const anioF = partes[0];
        return `${dia} de ${mes} de ${anioF}`;
      }
      return String(fechaStr);
    } catch {
      return String(fechaStr);
    }
  };

  const horarioTexto = (() => {
    switch (estudiante.turno) {
      case 'Mañana':
        return 'Turno Mañana (08:00 - 12:00)';
      case 'Tarde':
        return 'Turno Tarde (14:00 - 18:00)';
      case 'Noche':
        return 'Turno Noche (18:30 - 22:00)';
      case 'Sábado':
        return 'Sábado Intensivo (08:30 - 14:30)';
      default:
        return `${estudiante.turno || 'Mañana'}`;
    }
  })();

  // Renderizador de una boleta individual (para Copia Estudiante y Copia Empresa/Instituto)
  const renderBoletaIndividual = (
    tipoCopia: 'ESTUDIANTE' | 'EMPRESA / INSTITUTO - ARCHIVO KÁRDEX', 
    esSegunda = false
  ) => {
    const esAlumno = tipoCopia === 'ESTUDIANTE';

    return (
      <div className={`bg-white border-2 border-slate-900 rounded-2xl p-4 sm:p-5 text-slate-900 text-xs shadow-xs relative print:shadow-none print:rounded-none print:border-slate-800 ${esSegunda ? 'mt-4 print:mt-6' : ''}`}>
        
        {/* Etiqueta de tipo de copia */}
        <div className="absolute top-3 right-3">
          <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded uppercase shadow-xs ${
            esAlumno ? 'bg-amber-400 text-slate-950 border border-amber-500' : 'bg-slate-950 text-amber-300 border border-slate-800'
          }`}>
            COPIA {tipoCopia}
          </span>
        </div>

        {/* Encabezado Institucional */}
        <div className="flex items-center gap-3 border-b-2 border-slate-900 pb-3 mb-3">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center">
            <IngDataCompLogo size="sm" customLogoUrl={customLogoUrl} />
          </div>
          <div className="flex-1 pr-24">
            <h2 className="text-sm sm:text-base font-black tracking-tight uppercase leading-tight text-slate-950">
              {institutoConfig?.nombre || 'INSTITUTO TECNOLÓGICO ING DATA COMP'}
            </h2>
            <div className="text-[11px] font-bold text-blue-900 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Resolución Ministerial: {institutoConfig?.resolucionMinisterial || 'R.M. No. 0397/2024'}</span>
              <span className="hidden sm:inline">•</span>
              <span>Ministerio de Educación del Estado Plurinacional de Bolivia</span>
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
              DIRECCIÓN ACADÉMICA Y KÁRDEX CENTRAL • CARRERAS TÉCNICAS
            </span>
            <h3 className="text-xs sm:text-sm font-black text-slate-950">
              BOLETA OFICIAL DE MATRICULACIÓN, ARANCELES Y PLAN DE PAGOS
            </h3>
            <span className="text-[10px] text-slate-600 font-bold block">
              Régimen Anualizado (3 Años de Formación) • Plan Oficial de 10 Cuotas Anuales
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">N° DE BOLETA</span>
            <span className="font-mono font-black text-xs sm:text-sm text-blue-950 bg-white px-2 py-0.5 rounded border border-blue-300">
              BOL-MAT-2026-{String(estudiante.codigo || '001').replace('IDC-2026-', '')}
            </span>
            <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
              Gestión Oficial 2026
            </span>
          </div>
        </div>

        {/* Grid de Datos: Estudiante y Carrera */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {/* Datos del Estudiante */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <User className="w-3.5 h-3.5 text-blue-900" />
              <span>Datos Personales del Estudiante</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Apellidos:</span>
                <strong className="text-slate-950 block">{String(estudiante.apellidos || '').toUpperCase()}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Nombres:</span>
                <strong className="text-slate-950 block">{String(estudiante.nombres || '')}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Cédula de Identidad (CI):</span>
                <strong className="text-slate-950 font-mono block">
                  {estudiante.ci || '-'} {estudiante.expedido || ''}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Código de Estudiante:</span>
                <strong className="text-blue-950 font-mono block">
                  {estudiante.codigo || '-'}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Teléfono / Celular:</span>
                <span className="text-slate-800 font-mono font-semibold block">
                  {estudiante.telefono || 'Sin registro'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Correo Electrónico:</span>
                <span className="text-slate-800 truncate block font-medium" title={estudiante.email}>
                  {estudiante.email || 'Sin registro'}
                </span>
              </div>
            </div>
          </div>

          {/* Datos de la Matrícula Académica */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-900" />
              <span>Detalles del Programa Académico</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="col-span-2">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Carrera Técnica Profesional:</span>
                <strong className="text-slate-950 block text-xs">
                  {carrera?.nombre || 'Carrera Técnica Superior'}
                </strong>
                <span className="text-[10px] text-blue-900 font-mono font-bold">
                  Resolución Ministerial {carrera?.resolucion || 'R.M. No. 0397/2024'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Año de Formación:</span>
                <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-950 font-black rounded-md text-[11px]">
                  {anio}° Año {anio === 1 ? '(Primer Año)' : anio === 2 ? '(Segundo Año)' : '(Tercer Año)'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Turno y Horario:</span>
                <strong className="text-slate-950 block font-semibold">
                  {horarioTexto}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Fecha de Inscripción:</span>
                <span className="text-slate-800 font-medium block">
                  {formatearFecha(estudiante.fechaInscripcion)}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Estado de Matrícula:</span>
                <span className="inline-flex items-center gap-1 text-emerald-800 font-black text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>CONFIRMADO Y ACTIVO</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN ECONÓMICA: COSTOS, ARANCELES, DESCUENTOS Y LIQUIDACIÓN EN CAJA    */}
        {/* ========================================================================= */}
        <div className="border-2 border-emerald-900/40 rounded-xl overflow-hidden mb-3 bg-white">
          <div className="bg-emerald-900 text-white px-3 py-1.5 flex justify-between items-center text-[11px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-300" />
              <span>Aranceles Oficiales, Descuentos y Liquidación de Pagos (Gestión 2026)</span>
            </span>
            <span className="bg-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-100">
              Régimen 10 Cuotas Anuales
            </span>
          </div>

          <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Aranceles de Matrícula y Pensión */}
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-slate-700 border-b border-slate-200 pb-1">
                Conceptos Arancelarios
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 font-medium">Matrícula Anual:</span>
                <span className="font-bold text-slate-900">
                  {descMatricula > 0 ? (
                    <span>
                      <span className="line-through text-slate-400 mr-1">{costoMatriculaBase} Bs</span>
                      <span className="text-emerald-700">{costoMatriculaFinal} Bs</span>
                    </span>
                  ) : (
                    <span>{costoMatriculaFinal} Bs</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 font-medium">Pensión Mensual:</span>
                <span className="font-bold text-slate-900">
                  {descMensualidad > 0 ? (
                    <span>
                      <span className="line-through text-slate-400 mr-1">{costoMensualidadBase} Bs</span>
                      <span className="text-emerald-700">{costoMensualidadFinal} Bs</span>
                    </span>
                  ) : (
                    <span>{costoMensualidadFinal} Bs / mes</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 font-medium">Plan Cuotas Anuales:</span>
                <span className="font-bold text-blue-900">10 Cuotas (Feb - Nov)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 font-medium" title={conceptoOtros}>Otros Aranceles:</span>
                <span className="font-bold text-slate-900">{otrosCostos} Bs</span>
              </div>
              <div className="text-[9px] text-slate-500 italic">
                *{conceptoOtros}
              </div>
            </div>

            {/* 2. Beneficios y Descuentos */}
            <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-slate-700 border-b border-slate-200 pb-1">
                Descuentos y Convenios
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 font-medium">Tipo de Beneficio:</span>
                <span className="font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  {estudiante.tipoDescuento || 'Tarifa Regular'}
                </span>
              </div>
              {descMatricula > 0 && (
                <div className="flex justify-between items-center text-[11px] text-emerald-700 font-semibold">
                  <span>Rebaja Matrícula:</span>
                  <span>- {descMatricula} Bs</span>
                </div>
              )}
              {descMensualidad > 0 && (
                <div className="flex justify-between items-center text-[11px] text-emerald-700 font-semibold">
                  <span>Rebaja por Pensión:</span>
                  <span>- {descMensualidad} Bs / mes</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-1 flex justify-between items-center text-[11px]">
                <span className="font-black text-slate-800">Total Anual Plan:</span>
                <span className="font-black text-blue-950 text-xs">{totalGestion.toLocaleString()} Bs</span>
              </div>
              <div className="text-[9px] text-slate-500">
                (Matrícula + 10 Pensiones + Seguro/Carnet)
              </div>
            </div>

            {/* 3. Liquidación y Pago Inicial en Caja */}
            <div className="bg-emerald-50/70 rounded-lg p-2.5 border border-emerald-200 space-y-1.5">
              <div className="text-[10px] font-black uppercase text-emerald-950 border-b border-emerald-200 pb-1 flex justify-between items-center">
                <span>Comprobante de Caja</span>
                <span className="font-mono text-[9px] bg-emerald-700 text-white px-1.5 py-0.5 rounded">
                  {nroRecibo}
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-emerald-900 font-medium">Abono Inicial en Caja:</span>
                <strong className="text-emerald-800 text-xs font-black">{pagadoInicial.toLocaleString()} Bs</strong>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-700 font-medium">Saldo Matrícula/Inicial:</span>
                <strong className={`text-xs font-black ${saldoInicial > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {saldoInicial > 0 ? `${saldoInicial.toLocaleString()} Bs (Pendiente)` : '0.00 Bs (Al Día)'}
                </strong>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 font-medium">Método de Cobro:</span>
                <span className="font-bold text-slate-900">{metodoPago}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-600 font-medium">Fecha de Emisión:</span>
                <span className="font-mono text-slate-800">{formatearFecha(fechaPago)}</span>
              </div>
            </div>
          </div>

          {/* Cronograma compacto de las 10 cuotas */}
          <div className="bg-slate-100 px-3 py-1.5 border-t border-slate-200 text-[10px]">
            <div className="font-black text-slate-700 uppercase mb-1">
              Cronograma Oficial de Vencimiento de las 10 Cuotas (Vencimiento: Día 10 de cada mes):
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1 text-center font-mono">
              {MESES_10_CUOTAS.map(c => (
                <div key={c.numero} className="bg-white p-1 rounded border border-slate-200">
                  <span className="block text-[9px] font-black text-blue-900">C{c.numero} - {c.mes.slice(0, 3)}</span>
                  <span className="block text-[8px] text-slate-500">10/{String(c.numero + 1).padStart(2, '0')}</span>
                  <span className="block text-[9px] font-bold text-slate-800">{costoMensualidadFinal} Bs</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Malla Curricular / Asignaturas del Año */}
        {materiasAnuales.length > 0 && (
          <div className="border border-slate-300 rounded-xl overflow-hidden mb-3">
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-300 flex justify-between items-center text-[10px] font-black uppercase text-slate-700">
              <span>Asignaturas Oficiales Matriculadas - {anio}° Año</span>
              <span>Total: {materiasAnuales.length} Asignaturas Anuales</span>
            </div>
            <div className="p-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
              {materiasAnuales.map((m) => (
                <div key={m.id} className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  <span className="font-mono font-bold text-blue-950 block">[{m.codigo}]</span>
                  <span className="font-bold text-slate-900 block truncate" title={m.nombre}>{m.nombre}</span>
                  <span className="text-[9px] text-slate-500 block">{m.cargaHoraria} Horas • {m.docente || 'Docente Asignado'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Observaciones */}
        {estudiante.observaciones && (
          <div className="text-[10px] bg-amber-50/60 border border-amber-200 rounded-lg p-2 mb-3 text-slate-700">
            <strong className="text-amber-900 uppercase">Observaciones:</strong> {estudiante.observaciones}
          </div>
        )}

        {/* Firmas y Sellos */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-300 text-center text-[10px]">
          <div className="flex flex-col items-center">
            <div className="w-28 sm:w-36 border-b border-slate-400 mb-1"></div>
            <span className="font-bold text-slate-950 uppercase">{estudiante.nombres} {estudiante.apellidos}</span>
            <span className="text-slate-500">FIRMA DEL ESTUDIANTE</span>
            <span className="text-[9px] text-slate-400 font-mono">CI: {estudiante.ci} {estudiante.expedido}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-28 sm:w-36 border-b border-slate-400 mb-1"></div>
            <span className="font-bold text-slate-950 uppercase">CAJA CENTRAL</span>
            <span className="text-slate-500">SELLO Y FIRMA DE CAJA</span>
            <span className="text-[9px] text-slate-400 font-mono">Recibo: {nroRecibo}</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-28 sm:w-36 border-b border-slate-400 mb-1"></div>
            <span className="font-bold text-slate-950 uppercase">
              {institutoConfig?.directorAcademico || 'DIRECCIÓN ACADÉMICA'}
            </span>
            <span className="text-slate-500">DIRECCIÓN / KÁRDEX</span>
            <span className="text-[9px] text-slate-400 font-mono">{institutoConfig?.resolucionMinisterial || 'R.M. No. 0397/2024'}</span>
          </div>
        </div>

        {/* Pie de página de la boleta */}
        <div className="mt-3 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 flex justify-between items-center">
          <span>Válido como comprobante oficial de matrícula y convenio arancelario de Carrera Técnica Superior</span>
          <span>ING DATA COMP Cochabamba • Gestión 2026</span>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:overflow-visible">
      <div className={`bg-white rounded-3xl w-full ${vistaPantallaCompleta ? 'max-w-6xl' : 'max-w-4xl'} shadow-2xl overflow-hidden flex flex-col border border-slate-200 print:border-none print:shadow-none print:rounded-none print:w-full`}>
        
        {/* Barra superior de control del Modal (no-print) */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 no-print border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                <span>Boleta Oficial de Matrícula, Costos y Pensiones</span>
                <span className="bg-amber-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Doble Copia: Alumno y Empresa
                </span>
              </h3>
              <p className="text-xs text-blue-200">
                Imprime la boleta con aranceles de matrícula, plan de 10 cuotas y detalle económico de cobro.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Selector de copias */}
            <div className="bg-slate-900 border border-blue-800 rounded-xl p-1 flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setModoCopias('ambas')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  modoCopias === 'ambas' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Ambas (2 en 1)
              </button>
              <button
                type="button"
                onClick={() => setModoCopias('alumno')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  modoCopias === 'alumno' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Solo Alumno
              </button>
              <button
                type="button"
                onClick={() => setModoCopias('empresa')}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  modoCopias === 'empresa' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                Solo Empresa
              </button>
            </div>

            {/* Alternar pantalla completa */}
            <button
              type="button"
              onClick={() => setVistaPantallaCompleta(!vistaPantallaCompleta)}
              className="p-2 bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white rounded-xl transition cursor-pointer"
              title={vistaPantallaCompleta ? 'Vista normal' : 'Vista en pantalla ancha'}
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Botón Descargar Archivo Web */}
            <button
              type="button"
              onClick={handleDescargarBoleta}
              className="p-2 bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Descargar archivo HTML oficial para abrir e imprimir con doble clic"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Descargar Archivo</span>
            </button>

            {/* Botón Imprimir en Impresora */}
            <button
              type="button"
              onClick={handleImprimir}
              disabled={imprimiendo}
              className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-1.5 transition shadow-lg shadow-emerald-950/40 cursor-pointer ${
                imprimiendo ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <Printer className={`w-4 h-4 ${imprimiendo ? 'animate-bounce' : ''}`} />
              <span>{imprimiendo ? 'Enviando...' : 'Imprimir / PDF'}</span>
            </button>

            {/* Botón Cerrar */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition cursor-pointer"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notificación de estado */}
        {mensajeEstado && (
          <div className="no-print bg-blue-950/70 border-b border-blue-900 text-blue-100 text-xs px-5 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensajeEstado}</span>
          </div>
        )}

        {/* Cuerpo del Documento Imprimible */}
        <div id="documento-boleta-matricula" className="p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-140px)] print:max-h-none print:overflow-visible print:p-0">
          
          {/* COPIA 1: ESTUDIANTE */}
          {(modoCopias === 'ambas' || modoCopias === 'alumno') && (
            <div>
              {renderBoletaIndividual('ESTUDIANTE', false)}
            </div>
          )}

          {/* LÍNEA DE CORTE (Solo si se imprimen ambas en la misma página) */}
          {modoCopias === 'ambas' && (
            <div className="my-5 relative flex items-center justify-center print:my-4">
              <div className="border-t-2 border-dashed border-slate-400 w-full"></div>
              <div className="absolute bg-white px-3 py-1 text-slate-500 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 border border-slate-300 rounded-full shadow-xs">
                <Scissors className="w-3.5 h-3.5 text-slate-600 rotate-90" />
                <span>LÍNEA DE CORTE • SEPARAR COPIA ALUMNO Y COPIA EMPRESA / KÁRDEX</span>
              </div>
            </div>
          )}

          {/* COPIA 2: EMPRESA / INSTITUTO - ARCHIVO KÁRDEX */}
          {(modoCopias === 'ambas' || modoCopias === 'empresa') && (
            <div>
              {renderBoletaIndividual('EMPRESA / INSTITUTO - ARCHIVO KÁRDEX', modoCopias === 'ambas')}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
