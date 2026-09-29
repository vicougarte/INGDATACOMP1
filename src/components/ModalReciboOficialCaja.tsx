import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  Receipt, 
  Scissors, 
  CheckCircle2, 
  Calendar, 
  User, 
  Clock, 
  ShieldCheck,
  CreditCard,
  FileText,
  Download
} from 'lucide-react';
import { ConfiguracionInstituto } from '../types';
import { ReciboMultipleInfo } from './ModalRegistrarPagoPorCuota';
import { IngDataCompLogo } from './IngDataCompLogo';
import { 
  imprimirElementoUniversal, 
  descargarDocumentoHtml, 
  numeroALiteralBolivianos 
} from '../services/printService';

interface ModalReciboOficialCajaProps {
  recibo: ReciboMultipleInfo;
  institutoConfig?: ConfiguracionInstituto;
  customLogoUrl?: string | null;
  onClose: () => void;
}

export const ModalReciboOficialCaja: React.FC<ModalReciboOficialCajaProps> = ({
  recibo,
  institutoConfig,
  customLogoUrl,
  onClose
}) => {
  const [imprimiendo, setImprimiendo] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState<string | null>(null);

  const literalBolivianos = numeroALiteralBolivianos(recibo.totalAbonado);

  const handleEjecutarImpresion = async () => {
    setImprimiendo(true);
    setMensajeEstado('Enviando a diálogo de impresora...');

    try {
      const resultado = await imprimirElementoUniversal(
        'area-recibo-oficial-caja',
        `Recibo Oficial N° ${recibo.nroRecibo} - ${recibo.estudiante.apellidos}`
      );

      if (resultado.exito) {
        setMensajeEstado(`✓ Diálogo de impresión invocado correctamente.`);
      } else {
        setMensajeEstado('Abriendo descarga del recibo listo para imprimir...');
        descargarDocumentoHtml(
          'area-recibo-oficial-caja',
          `Recibo_Oficial_${recibo.nroRecibo}_${recibo.estudiante.apellidos}`
        );
      }
    } catch (err) {
      console.error('Error al imprimir recibo:', err);
      descargarDocumentoHtml(
        'area-recibo-oficial-caja',
        `Recibo_Oficial_${recibo.nroRecibo}_${recibo.estudiante.apellidos}`
      );
      setMensajeEstado('Descargando archivo oficial de recibo (listo para imprimir con doble clic)...');
    } finally {
      setTimeout(() => {
        setImprimiendo(false);
        setTimeout(() => setMensajeEstado(null), 5000);
      }, 1000);
    }
  };

  const handleDescargarRecibo = () => {
    descargarDocumentoHtml(
      'area-recibo-oficial-caja',
      `Recibo_Oficial_${recibo.nroRecibo}_${recibo.estudiante.apellidos}`
    );
    setMensajeEstado('✓ Recibo descargado como archivo HTML oficial (abre con doble clic y presiona Imprimir).');
    setTimeout(() => setMensajeEstado(null), 5000);
  };

  // Renderiza una sola copia del recibo oficial
  const renderCopiaRecibo = (tipoCopia: 'ORIGINAL - COPIA ESTUDIANTE' | 'COPIA CAJA / CONTABILIDAD', esSegunda: boolean) => (
    <div className={`border-2 border-slate-900 rounded-2xl p-4 sm:p-5 text-xs space-y-3 bg-white ${esSegunda ? 'border-dashed' : ''}`}>
      {/* Encabezado del Recibo */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 shrink-0">
            <IngDataCompLogo size="sm" customLogoUrl={customLogoUrl} />
          </div>
          <div>
            <h4 className="font-black text-slate-950 uppercase text-xs sm:text-sm tracking-tight leading-tight">
              {institutoConfig?.nombre || 'INSTITUTO TÉCNICO SUPERIOR ING DATA COMP'}
            </h4>
            <span className="text-[10px] text-blue-900 font-bold block">
              {institutoConfig?.resolucionMinisterial || 'R.M. No. 0397/2024'} • Cochabamba, Bolivia
            </span>
            <span className="text-[9px] text-slate-500 block">
              {institutoConfig?.direccion || 'Av. Heroínas esq. Ayacucho, Edif. Tecnológico 4to Piso'} • Telf: {institutoConfig?.telefono || '4528900'}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="bg-slate-900 text-amber-300 font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider block mb-1">
            {tipoCopia}
          </span>
          <span className="text-[10px] text-slate-500 font-bold block uppercase">
            N° DE RECIBO OFICIAL:
          </span>
          <span className="font-mono font-black text-sm sm:text-base text-blue-950 block">
            {recibo.nroRecibo}
          </span>
        </div>
      </div>

      {/* Datos del Estudiante y Carrera */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] py-1 border-b border-slate-200">
        <div>
          <span className="text-slate-500 text-[10px] uppercase font-bold block">Estudiante Titular:</span>
          <strong className="text-slate-900 uppercase text-xs">
            {recibo.estudiante.apellidos}, {recibo.estudiante.nombres}
          </strong>
          <span className="text-[10px] text-slate-600 font-mono block">
            CI: {recibo.estudiante.ci} {recibo.estudiante.expedido || 'CB'} • Cód: {recibo.estudiante.codigo}
          </span>
        </div>
        <div className="sm:text-right">
          <span className="text-slate-500 text-[10px] uppercase font-bold block">Programa Académico:</span>
          <strong className="text-slate-900 block text-xs">{recibo.carrera.nombre}</strong>
          <span className="text-[10px] text-slate-600 block">
            {recibo.estudiante.anioActual || 1}° Año de Formación • Turno {recibo.estudiante.turno || 'Mañana'}
          </span>
        </div>
      </div>

      {/* Cuadro Económico y Detalle de Cuotas */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
        <div className="flex justify-between items-center text-[11px] border-b border-slate-200/80 pb-1.5">
          <span className="text-slate-600 font-bold uppercase text-[10px]">Concepto:</span>
          <strong className="text-slate-900 text-right max-w-[420px] truncate" title={recibo.concepto}>
            {recibo.concepto}
          </strong>
        </div>

        {/* Tabla Detallada de Cuotas */}
        <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-slate-100 text-slate-800 font-black uppercase border-b border-slate-200">
              <tr>
                <th className="p-1.5 pl-2.5">N° Cuota</th>
                <th className="p-1.5">Mes Correspondiente</th>
                <th className="p-1.5 text-right">Abono (Bs)</th>
                <th className="p-1.5 text-right">Saldo Restante</th>
                <th className="p-1.5 text-center pr-2.5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recibo.cuotasInfo.map((cu) => (
                <tr key={cu.numeroCuota}>
                  <td className="p-1.5 pl-2.5 font-bold text-slate-900">Cuota N° {cu.numeroCuota}</td>
                  <td className="p-1.5 text-slate-700">{cu.mes}</td>
                  <td className="p-1.5 text-right font-black text-emerald-700 font-mono text-xs">
                    +{cu.montoAbonado.toLocaleString()} Bs
                  </td>
                  <td className="p-1.5 text-right font-mono text-slate-600">
                    {cu.saldoRestante === 0 ? '0 Bs (Al Día)' : `${cu.saldoRestante.toLocaleString()} Bs`}
                  </td>
                  <td className="p-1.5 text-center pr-2.5">
                    <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                      cu.estadoFinal === 'Cancelado' || cu.saldoRestante === 0
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {cu.estadoFinal === 'Cancelado' || cu.saldoRestante === 0 ? 'Cancelado' : 'Abono Parcial'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Literal del Monto y Forma de Pago */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200 text-[11px]">
          <div>
            <span className="text-slate-500 text-[9px] uppercase font-bold block">Son en Literal:</span>
            <span className="font-bold text-slate-900 italic text-[10px]">
              {literalBolivianos}
            </span>
          </div>
          <div className="sm:text-right">
            <span className="text-slate-500 text-[9px] uppercase font-bold block">Forma de Pago:</span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
              {recibo.metodoPago}
            </span>
          </div>
        </div>

        {/* Total Consolidado */}
        <div className="flex justify-between items-center text-sm border-t-2 border-slate-900 pt-2">
          <span className="font-black text-slate-950 uppercase tracking-wide">
            TOTAL CANCELADO:
          </span>
          <strong className="text-emerald-700 font-black text-lg sm:text-xl font-mono">
            {recibo.totalAbonado.toLocaleString()} Bs
          </strong>
        </div>

        {recibo.observaciones && (
          <div className="text-[10px] text-slate-600 italic bg-white p-1.5 rounded border border-slate-200">
            <span className="font-bold not-italic">Glosa: </span>{recibo.observaciones}
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200">
          <span>Fecha y Hora: <strong>{recibo.fecha} {recibo.hora}</strong></span>
          <span>Cajero Responsable: <strong>{recibo.cajero || 'Caja Central'}</strong></span>
        </div>
      </div>

      {/* Firmas Oficiales */}
      <div className="grid grid-cols-2 gap-8 pt-4 pb-1 text-center text-[9px] text-slate-400">
        <div>
          <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
          <span className="font-bold text-slate-700 uppercase block">Firma y Aclaración Estudiante</span>
          <span className="text-[8px] text-slate-400">CI: {recibo.estudiante.ci}</span>
        </div>
        <div>
          <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
          <span className="font-bold text-slate-700 uppercase block">Sello y Firma Caja Central</span>
          <span className="text-[8px] text-slate-400">{recibo.cajero || 'Responsable de Cobranzas'}</span>
        </div>
      </div>

      <div className="pt-1 text-[8px] text-slate-400 text-center border-t border-slate-100 flex justify-between items-center">
        <span>Válido como comprobante oficial de pago de aranceles académicos • Gestión 2026</span>
        <span>ING DATA COMP Cochabamba</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl space-y-4 border border-slate-200 my-auto flex flex-col max-h-[96vh]">
        
        {/* BARRA SUPERIOR DE ACCIONES (NO SE IMPRIME) */}
        <div className="no-print flex justify-between items-center border-b border-slate-200 pb-3 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
                <span>Recibo Oficial de Caja</span>
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                  {recibo.cuotasInfo.length === 1 
                    ? `1 Cuota (N° ${recibo.cuotasInfo[0]?.numeroCuota})` 
                    : `${recibo.cuotasInfo.length} Cuotas Simultáneas`}
                </span>
                <span className="text-xs bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-full font-mono">
                  {recibo.nroRecibo}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Formato institucional de doble copia (Original Estudiante y Copia Caja).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDescargarRecibo}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition border border-slate-300"
              title="Descargar archivo oficial .html para abrir e imprimir directamente"
            >
              <Download className="w-3.5 h-3.5 text-blue-900" />
              <span className="hidden sm:inline">Descargar Archivo</span>
            </button>

            <button
              type="button"
              onClick={handleEjecutarImpresion}
              disabled={imprimiendo}
              className={`px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition ${
                imprimiendo ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <Printer className={`w-4 h-4 ${imprimiendo ? 'animate-bounce' : ''}`} />
              <span>{imprimiendo ? 'Enviando...' : 'Imprimir Recibo'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition"
              title="Cerrar recibo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AVISO DE ESTADO / RETROALIMENTACIÓN */}
        {mensajeEstado && (
          <div className="no-print bg-blue-50 border border-blue-200 text-blue-900 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{mensajeEstado}</span>
          </div>
        )}

        {/* ÁREA DESPLAZABLE DEL RECIBO (DOBLE COPIA) */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          <div id="area-recibo-oficial-caja" className="space-y-4">
            
            {/* 1. ORIGINAL - COPIA ESTUDIANTE */}
            {renderCopiaRecibo('ORIGINAL - COPIA ESTUDIANTE', false)}

            {/* Línea de corte entre copias */}
            <div className="relative py-1 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-dashed border-slate-400"></div>
              </div>
              <div className="relative bg-white px-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase border border-slate-200 rounded-full shadow-2xs">
                <Scissors className="w-3.5 h-3.5 text-slate-700" />
                <span>Cortar por aquí (Separación Copia Alumno y Archivo Caja)</span>
              </div>
            </div>

            {/* 2. COPIA CAJA / CONTABILIDAD */}
            {renderCopiaRecibo('COPIA CAJA / CONTABILIDAD', true)}

          </div>
        </div>

        {/* BARRA INFERIOR DE ACCIONES (NO SE IMPRIME) */}
        <div className="no-print border-t border-slate-200 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <span>Estudiante: <strong className="text-slate-900">{recibo.estudiante.apellidos}, {recibo.estudiante.nombres}</strong></span>
            <span>•</span>
            <span>Total: <strong className="text-emerald-700 font-mono text-sm">{recibo.totalAbonado.toLocaleString()} Bs</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleDescargarRecibo}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer border border-slate-300 transition"
              title="Descarga el recibo oficial como archivo web listo para abrir e imprimir"
            >
              <Download className="w-4 h-4 text-blue-900" />
              <span>Descargar Archivo</span>
            </button>
            <button
              type="button"
              onClick={handleEjecutarImpresion}
              disabled={imprimiendo}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Recibo Oficial (2 Copias)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
