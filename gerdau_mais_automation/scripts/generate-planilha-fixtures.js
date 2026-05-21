/**
 * Gera fixtures XLSX mínimas para E2E de planilha (layout genérico "Código" + "Quantidade").
 * Se o QA exigir colunas do modelo oficial, baixe o modelo na UI e alinhe este script,
 * ou defina PLANILHA_SKU / PLANILHA_SKU_2 no ambiente ao regenerar.
 *
 * Uso: npm run fixtures:planilhas
 */
/* eslint-disable no-console */
const path = require('path');
const XLSX = require('xlsx');

const outDir = path.join(__dirname, '..', 'cypress', 'fixtures');

const sku1 = process.env.PLANILHA_SKU || '106040273';
const sku2 = process.env.PLANILHA_SKU_2 || sku1;

function write(name, aoa) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, 'Planilha1');
  const fp = path.join(outDir, name);
  XLSX.writeFile(wb, fp);
  console.log('gravado:', fp);
}

write('planilha-qa-1-item-codigo-qty.xlsx', [
  ['Código', 'Quantidade'],
  [sku1, 1],
]);

write('planilha-qa-2-itens-codigo-qty.xlsx', [
  ['Código', 'Quantidade'],
  [sku1, 1],
  [sku2, 2],
]);

write('planilha-qa-sku-inexistente.xlsx', [
  ['Código', 'Quantidade'],
  ['99988877766655544332211', 1],
]);

write('planilha-qa-colunas-erradas.xlsx', [
  ['foo', 'bar', 'baz'],
  ['x', 'y', 'z'],
]);

console.log('Concluído. SKUs exemplo:', sku1, sku2);
