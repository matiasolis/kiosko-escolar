import * as XLSX from 'xlsx';

export interface CsvColumn<T = any> {
  key: keyof T | string;
  label: string;
  format?: (value: any, row: T) => string | number;
}

export function exportToCsv<T = any>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[]
) {
  const headerRow = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`).join(',');

  const rows = data.map((row: any) => {
    return columns
      .map((col) => {
        let val = row[col.key];
        if (col.format) {
          val = col.format(val, row);
        }
        if (val === undefined || val === null) {
          return '""';
        }
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadProductTemplate(format: 'xlsx' | 'csv' = 'xlsx') {
  const templateHeaders = [
    'Nombre',
    'Marca',
    'Categoria',
    'Descripcion',
    'PrecioCompra',
    'PrecioVenta',
    'Stock',
    'SKU',
    'Estado',
  ];

  const sampleRows = [
    {
      Nombre: 'Alfajor Havanna Mixto',
      Marca: 'Havanna',
      Categoria: 'Alfajores',
      Descripcion: 'Alfajor artesanal relleno de dulce de leche bañado en chocolate semiamargo',
      PrecioCompra: 900,
      PrecioVenta: 1600,
      Stock: 30,
      SKU: 'ALF-HAV-01',
      Estado: 'activo',
    },
    {
      Nombre: 'Agua Mineral Villavicencio 500ml',
      Marca: 'Villavicencio',
      Categoria: 'Bebidas',
      Descripcion: 'Agua mineral de manantial natural sin gas baja en sodio',
      PrecioCompra: 450,
      PrecioVenta: 950,
      Stock: 48,
      SKU: 'BEB-AGU-01',
      Estado: 'activo',
    },
    {
      Nombre: 'Turrón Arcor 25g',
      Marca: 'Arcor',
      Categoria: 'Golosinas',
      Descripcion: 'Oblea crocante rellena de pasta de maní',
      PrecioCompra: 200,
      PrecioVenta: 400,
      Stock: 60,
      SKU: 'GOL-TUR-01',
      Estado: 'activo',
    },
    {
      Nombre: 'Papas Fritas Lays Clásicas 85g',
      Marca: 'Lays',
      Categoria: 'Snacks',
      Descripcion: 'Papas fritas saladas crujientes',
      PrecioCompra: 850,
      PrecioVenta: 1500,
      Stock: 25,
      SKU: 'SNA-LAY-01',
      Estado: 'activo',
    },
    {
      Nombre: 'Sándwich de Miga Jamón y Queso',
      Marca: 'Elaboración Kiosco',
      Categoria: 'Comida',
      Descripcion: 'Sándwich fresco triple de jamón cocido y queso de máquina',
      PrecioCompra: 1200,
      PrecioVenta: 2200,
      Stock: 15,
      SKU: 'COM-SAN-01',
      Estado: 'activo',
    },
  ];

  if (format === 'xlsx') {
    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: templateHeaders });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Productos');
    XLSX.writeFile(wb, 'plantilla_importacion_productos_kiosControl.xlsx');
  } else {
    exportToCsv(
      'plantilla_importacion_productos_kiosControl.csv',
      templateHeaders.map((h) => ({ key: h, label: h })),
      sampleRows
    );
  }
}
