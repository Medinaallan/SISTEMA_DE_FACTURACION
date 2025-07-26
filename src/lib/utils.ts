/**
 * Genera un CAI (Código de Autorización de Impresión) simulado para Honduras
 * Formato SAR: XXXXXXXX-XXXXXX-XXXXXX-XXXXXXXXXXXXXXXX
 */
export function generateCAI(): string {
  // Generar CAI con formato SAR real
  const year = new Date().getFullYear().toString().substring(2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const day = new Date().getDate().toString().padStart(2, '0');
  
  const part1 = year + month + day + Math.floor(Math.random() * 10).toString();
  const part2 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const part3 = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const part4 = Math.floor(Math.random() * 10000000000000000).toString().padStart(16, '0');
  
  return `${part1}-${part2}-${part3}-${part4}`;
}

/**
 * Genera un rango autorizado SAR
 */
export function generateRangoAutorizado(): string {
  const inicio = Math.floor(Math.random() * 1000000) + 1;
  const fin = inicio + 999999;
  return `${inicio.toString().padStart(9, '0')} al ${fin.toString().padStart(9, '0')}`;
}

/**
 * Genera fecha límite de emisión (1 año desde hoy)
 */
export function generateFechaLimiteEmision(): string {
  const fecha = new Date();
  fecha.setFullYear(fecha.getFullYear() + 1);
  return fecha.toISOString().split('T')[0];
}

/**
 * Genera el próximo número de factura
 */
export function generateInvoiceNumber(prefix: string, lastNumber: number): string {
  const nextNumber = lastNumber + 1;
  return `${prefix}${nextNumber.toString().padStart(8, '0')}`;
}

/**
 * Genera un ID único
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Valida formato de RTN hondureño
 */
export function validateRTN(rtn: string): boolean {
  const rtnRegex = /^\d{14}$/;
  return rtnRegex.test(rtn);
}

/**
 * Formatea números como moneda hondureña
 */
export function formatCurrency(amount: number): string {
  return `L ${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

/**
 * Formatea fechas para el contexto hondureño
 */
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-HN');
}

/**
 * Convierte números a texto para facturas
 */
export function numberToWords(num: number): string {
  if (num === 0) return 'cero';
  
  const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  
  if (num < 10) return units[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    return tens[ten] + (unit > 0 ? ' y ' + units[unit] : '');
  }
  
  return num.toString(); // Simplificado para números mayores
}
