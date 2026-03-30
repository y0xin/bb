import * as XLSX from 'xlsx';
import { Product } from '@/types';

export const exportToExcel = (data: any[], filename: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const importFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bstr = e.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const formatProductForExcel = (products: Product[]) => {
  return products.flatMap(product => {
    if (!product.attributes || product.attributes.length === 0) {
      return [{
        ID: product.id,
        Name: product.name,
        Category: typeof product.category === 'string' ? product.category : product.category?.name || 'N/A',
        Price: product.price,
        Stock: product.stock,
        Attribute: 'N/A',
        Value: 'N/A'
      }];
    }
    return product.attributes.map(attr => ({
      ID: product.id,
      Name: product.name,
      Category: typeof product.category === 'string' ? product.category : product.category?.name || 'N/A',
      Price: product.price,
      Stock: product.stock,
      Attribute: attr.key,
      Value: attr.value
    }));
  });
};
