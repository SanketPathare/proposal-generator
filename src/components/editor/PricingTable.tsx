'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PricingTableRow, PricingTableData, TemplateStyles } from '@/types';
import { formatCurrency, generateId } from '@/lib/utils';

interface PricingTableProps {
  data: PricingTableData;
  onChange: (data: PricingTableData) => void;
  editable?: boolean;
  currency?: string;
  styles?: TemplateStyles;
}

const DEFAULT_STYLES: TemplateStyles = {
  fonts: { heading: 'Plus Jakarta Sans', body: 'Inter' },
  colors: { primary: '#09090b', secondary: '#f4f4f5', accent: '#d4ff00', background: '#ffffff', text: '#09090b' },
  logoPosition: 'left', header: '', footer: '',
  coverLayout: 'standard', sectionStyle: 'cards', borderStyle: 'rounded', accentStyle: 'glow', pricingStyle: 'standard', timelineStyle: 'vertical',
};

export function PricingTable({ data, onChange, editable = true, currency = 'USD', styles = DEFAULT_STYLES }: PricingTableProps) {
  const currentRows = data?.rows || [];
  const activeCurrency = data?.currency || currency || 'USD';

  const borderClass = styles.borderStyle === 'sharp' ? 'rounded-none' : styles.borderStyle === 'pill' ? 'rounded-xl' : 'rounded-2xl';
  const thClass = styles.borderStyle === 'sharp' ? 'rounded-none first:rounded-none last:rounded-none' : styles.borderStyle === 'pill' ? 'rounded-full first:rounded-l-full last:rounded-r-full' : 'first:rounded-l-lg last:rounded-r-lg';

  const recalculate = (newRows: PricingTableRow[], discount = data?.discount || 0, discountType = data?.discountType || 'fixed', tax = data?.tax || 0, taxType = data?.taxType || 'fixed') => {
    const subtotal = newRows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
    let calculatedDiscount = Number(discount) || 0;
    if (discountType === 'percentage') calculatedDiscount = (subtotal * (Number(discount) || 0)) / 100;
    const afterDiscount = Math.max(0, subtotal - calculatedDiscount);
    let calculatedTax = Number(tax) || 0;
    if (taxType === 'percentage') calculatedTax = (afterDiscount * (Number(tax) || 0)) / 100;
    const total = afterDiscount + calculatedTax;
    onChange({ rows: newRows, subtotal, discount: Number(discount) || 0, discountType, tax: Number(tax) || 0, taxType, total, currency: activeCurrency });
  };

  const updateRow = (rowId: string, field: keyof PricingTableRow, val: string | number) => {
    const newRows = currentRows.map((r) => {
      if (r.id !== rowId) return r;
      const updated = { ...r, [field]: val };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Number(val) || 0 : r.quantity;
        const price = field === 'unitPrice' ? Number(val) || 0 : r.unitPrice;
        updated.total = qty * price;
      }
      return updated;
    });
    recalculate(newRows);
  };

  const addRow = () => {
    const newRow: PricingTableRow = { id: generateId(), item: 'Deliverable Item', description: 'Scope details', quantity: 1, unitPrice: 1000, total: 1000 };
    recalculate([...currentRows, newRow]);
  };

  const removeRow = (rowId: string) => {
    recalculate(currentRows.filter((r) => r.id !== rowId));
  };

  return (
    <div className={`${borderClass} border p-4 shadow-xs`} style={{ backgroundColor: styles.sectionStyle === 'filled' ? styles.colors.secondary : 'white', borderColor: `${styles.colors.text}10`, fontFamily: styles.fonts.body }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="font-bold uppercase tracking-wider" style={{ backgroundColor: styles.colors.secondary, color: styles.colors.text }}>
              <th className={`py-2.5 px-3 ${thClass}`}>Item / Service</th>
              <th className={`py-2.5 px-3 ${thClass}`}>Description</th>
              <th className={`py-2.5 px-3 w-20 text-center ${thClass}`}>Qty</th>
              <th className={`py-2.5 px-3 w-28 text-right ${thClass}`}>Rate</th>
              <th className={`py-2.5 px-3 w-28 text-right ${thClass}`}>Amount</th>
              {editable && <th className={`py-2.5 px-2 w-10 text-center ${thClass}`} />}
            </tr>
          </thead>
          <tbody style={{ borderTop: `1px solid ${styles.colors.text}10` }}>
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center" style={{ color: `${styles.colors.text}50` }}>
                  No pricing line items added yet. Click &quot;Add Line Item&quot; below.
                </td>
              </tr>
            ) : (
              currentRows.map((row) => (
                <tr key={row.id} style={{ borderBottom: `1px solid ${styles.colors.text}08` }}>
                  <td className="py-2 px-2">
                    {editable ? (
                      <input type="text" value={row.item} onChange={(e) => updateRow(row.id, 'item', e.target.value)} placeholder="Item name" className="w-full px-2 py-1 text-xs font-semibold bg-transparent outline-none rounded-lg" style={{ color: styles.colors.text, borderColor: 'transparent' }} />
                    ) : (
                      <span className="font-semibold px-2" style={{ color: styles.colors.text }}>{row.item}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {editable ? (
                      <input type="text" value={row.description} onChange={(e) => updateRow(row.id, 'description', e.target.value)} placeholder="Description" className="w-full px-2 py-1 text-xs bg-transparent outline-none rounded-lg" style={{ color: `${styles.colors.text}80` }} />
                    ) : (
                      <span className="px-2" style={{ color: `${styles.colors.text}70` }}>{row.description}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {editable ? (
                      <input type="number" min="1" value={row.quantity} onChange={(e) => updateRow(row.id, 'quantity', parseInt(e.target.value) || 0)} className="w-full text-center px-2 py-1 text-xs font-medium border border-transparent rounded-lg outline-none" />
                    ) : (
                      <span className="block text-center">{row.quantity}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {editable ? (
                      <input type="number" min="0" value={row.unitPrice} onChange={(e) => updateRow(row.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full text-right px-2 py-1 text-xs font-medium border border-transparent rounded-lg outline-none" />
                    ) : (
                      <span className="block text-right">{formatCurrency(row.unitPrice, activeCurrency)}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-bold" style={{ color: styles.colors.text }}>
                    {formatCurrency(row.total, activeCurrency)}
                  </td>
                  {editable && (
                    <td className="py-2 px-2 text-center">
                      <button onClick={() => removeRow(row.id)} className="p-1 rounded-lg transition-colors cursor-pointer" style={{ color: `${styles.colors.text}40` }} title="Remove row">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editable && (
        <Button variant="outline" size="sm" onClick={addRow} className="font-semibold text-xs gap-1 mt-3">
          <Plus className="h-3.5 w-3.5" /> Add Line Item
        </Button>
      )}

      <div className="flex justify-end pt-3" style={{ borderTop: `1px solid ${styles.colors.text}10` }}>
        <div className="w-80 space-y-2 text-xs">
          <div className="flex justify-between items-center" style={{ color: `${styles.colors.text}70` }}>
            <span>Subtotal</span>
            <span className="font-bold" style={{ color: styles.colors.text }}>{formatCurrency(data?.subtotal || 0, activeCurrency)}</span>
          </div>
          <div className="flex justify-between items-center" style={{ color: `${styles.colors.text}70` }}>
            <div className="flex items-center gap-1.5">
              <span>Discount</span>
              {editable && (
                <select value={data?.discountType || 'fixed'} onChange={(e) => recalculate(currentRows, data?.discount, e.target.value as any, data?.tax, data?.taxType)} className="px-1.5 py-0.5 rounded border text-[10px] bg-white font-medium" style={{ borderColor: `${styles.colors.text}15` }}>
                  <option value="fixed">Fixed</option>
                  <option value="percentage">%</option>
                </select>
              )}
            </div>
            {editable ? (
              <input type="number" min="0" value={data?.discount || 0} onChange={(e) => recalculate(currentRows, parseFloat(e.target.value) || 0, data?.discountType, data?.tax, data?.taxType)} className="w-20 px-2 py-0.5 text-right font-medium border rounded-lg text-xs" style={{ borderColor: `${styles.colors.text}15` }} />
            ) : (
              <span className="text-emerald-600 font-semibold">-{formatCurrency(data?.discount || 0, activeCurrency)}</span>
            )}
          </div>
          <div className="flex justify-between items-center" style={{ color: `${styles.colors.text}70` }}>
            <div className="flex items-center gap-1.5">
              <span>Tax / VAT</span>
              {editable && (
                <select value={data?.taxType || 'fixed'} onChange={(e) => recalculate(currentRows, data?.discount, data?.discountType, data?.tax, e.target.value as any)} className="px-1.5 py-0.5 rounded border text-[10px] bg-white font-medium" style={{ borderColor: `${styles.colors.text}15` }}>
                  <option value="fixed">Fixed</option>
                  <option value="percentage">%</option>
                </select>
              )}
            </div>
            {editable ? (
              <input type="number" min="0" value={data?.tax || 0} onChange={(e) => recalculate(currentRows, data?.discount, data?.discountType, parseFloat(e.target.value) || 0, data?.taxType)} className="w-20 px-2 py-0.5 text-right font-medium border rounded-lg text-xs" style={{ borderColor: `${styles.colors.text}15` }} />
            ) : (
              <span>+{formatCurrency(data?.tax || 0, activeCurrency)}</span>
            )}
          </div>
          <div className="pt-2 flex justify-between items-baseline" style={{ borderTop: `1px solid ${styles.colors.text}15` }}>
            <span className="font-extrabold text-sm" style={{ color: styles.colors.text, fontFamily: styles.fonts.heading }}>Total Investment</span>
            <span className="font-extrabold text-base px-2.5 py-0.5 rounded-lg" style={{ color: styles.colors.text, backgroundColor: `${styles.colors.accent}30` }}>
              {formatCurrency(data?.total || 0, activeCurrency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
