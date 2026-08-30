'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PricingTableRow, PricingTableData } from '@/types';
import { formatCurrency, generateId } from '@/lib/utils';

interface PricingTableProps {
  data: PricingTableData;
  onChange: (data: PricingTableData) => void;
  editable?: boolean;
  currency?: string;
}

export function PricingTable({ data, onChange, editable = true, currency = 'USD' }: PricingTableProps) {
  const currentRows = data?.rows || [];
  const activeCurrency = data?.currency || currency || 'USD';

  const recalculate = (newRows: PricingTableRow[], discount = data?.discount || 0, discountType = data?.discountType || 'fixed', tax = data?.tax || 0, taxType = data?.taxType || 'fixed') => {
    const subtotal = newRows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);

    let calculatedDiscount = Number(discount) || 0;
    if (discountType === 'percentage') {
      calculatedDiscount = (subtotal * (Number(discount) || 0)) / 100;
    }

    const afterDiscount = Math.max(0, subtotal - calculatedDiscount);

    let calculatedTax = Number(tax) || 0;
    if (taxType === 'percentage') {
      calculatedTax = (afterDiscount * (Number(tax) || 0)) / 100;
    }

    const total = afterDiscount + calculatedTax;

    onChange({
      rows: newRows,
      subtotal,
      discount: Number(discount) || 0,
      discountType,
      tax: Number(tax) || 0,
      taxType,
      total,
      currency: activeCurrency,
    });
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
    const newRow: PricingTableRow = {
      id: generateId(),
      item: 'Deliverable Item',
      description: 'Scope details',
      quantity: 1,
      unitPrice: 1000,
      total: 1000,
    };
    recalculate([...currentRows, newRow]);
  };

  const removeRow = (rowId: string) => {
    const newRows = currentRows.filter((r) => r.id !== rowId);
    recalculate(newRows);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-[#e4e4e7] bg-white p-4 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-[#f4f4f5] text-[#71717a] font-bold uppercase tracking-wider">
              <th className="py-2.5 px-3 rounded-l-lg">Item / Service</th>
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 w-20 text-center">Qty</th>
              <th className="py-2.5 px-3 w-28 text-right">Rate</th>
              <th className="py-2.5 px-3 w-28 text-right">Amount</th>
              {editable && <th className="py-2.5 px-2 w-10 text-center rounded-r-lg" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f4f4f5]">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-[#a1a1aa]">
                  No pricing line items added yet. Click &quot;Add Line Item&quot; below.
                </td>
              </tr>
            ) : (
              currentRows.map((row) => (
                <tr key={row.id} className="hover:bg-[#fafafa]">
                  <td className="py-2 px-2">
                    {editable ? (
                      <input
                        type="text"
                        value={row.item}
                        onChange={(e) => updateRow(row.id, 'item', e.target.value)}
                        placeholder="Item name"
                        className="w-full px-2 py-1 text-xs font-semibold text-[#09090b] border border-transparent hover:border-[#e4e4e7] focus:border-[#09090b] rounded-lg outline-none"
                      />
                    ) : (
                      <span className="font-semibold text-[#09090b] px-2">{row.item}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {editable ? (
                      <input
                        type="text"
                        value={row.description}
                        onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-2 py-1 text-xs text-[#52525b] border border-transparent hover:border-[#e4e4e7] focus:border-[#09090b] rounded-lg outline-none"
                      />
                    ) : (
                      <span className="text-[#71717a] px-2">{row.description}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {editable ? (
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => updateRow(row.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full text-center px-2 py-1 text-xs font-medium border border-transparent hover:border-[#e4e4e7] focus:border-[#09090b] rounded-lg outline-none"
                      />
                    ) : (
                      <span className="block text-center">{row.quantity}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    {editable ? (
                      <input
                        type="number"
                        min="0"
                        value={row.unitPrice}
                        onChange={(e) => updateRow(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full text-right px-2 py-1 text-xs font-medium border border-transparent hover:border-[#e4e4e7] focus:border-[#09090b] rounded-lg outline-none"
                      />
                    ) : (
                      <span className="block text-right">{formatCurrency(row.unitPrice, activeCurrency)}</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-[#09090b]">
                    {formatCurrency(row.total, activeCurrency)}
                  </td>
                  {editable && (
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => removeRow(row.id)}
                        className="p-1 rounded-lg text-[#a1a1aa] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove row"
                      >
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
        <Button variant="outline" size="sm" onClick={addRow} className="font-semibold text-xs gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add Line Item
        </Button>
      )}

      {/* Totals Section */}
      <div className="flex justify-end pt-3 border-t border-[#f4f4f5]">
        <div className="w-80 space-y-2 text-xs">
          <div className="flex justify-between items-center text-[#71717a]">
            <span>Subtotal</span>
            <span className="font-bold text-[#09090b]">{formatCurrency(data?.subtotal || 0, activeCurrency)}</span>
          </div>

          <div className="flex justify-between items-center text-[#71717a]">
            <div className="flex items-center gap-1.5">
              <span>Discount</span>
              {editable && (
                <select
                  value={data?.discountType || 'fixed'}
                  onChange={(e) => recalculate(currentRows, data?.discount, e.target.value as any, data?.tax, data?.taxType)}
                  className="px-1.5 py-0.5 rounded border border-[#e4e4e7] text-[10px] bg-white font-medium"
                >
                  <option value="fixed">Fixed</option>
                  <option value="percentage">%</option>
                </select>
              )}
            </div>
            {editable ? (
              <input
                type="number"
                min="0"
                value={data?.discount || 0}
                onChange={(e) => recalculate(currentRows, parseFloat(e.target.value) || 0, data?.discountType, data?.tax, data?.taxType)}
                className="w-20 px-2 py-0.5 text-right font-medium border border-[#e4e4e7] rounded-lg text-xs"
              />
            ) : (
              <span className="text-emerald-600 font-semibold">
                -{formatCurrency(data?.discount || 0, activeCurrency)}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center text-[#71717a]">
            <div className="flex items-center gap-1.5">
              <span>Tax / VAT</span>
              {editable && (
                <select
                  value={data?.taxType || 'fixed'}
                  onChange={(e) => recalculate(currentRows, data?.discount, data?.discountType, data?.tax, e.target.value as any)}
                  className="px-1.5 py-0.5 rounded border border-[#e4e4e7] text-[10px] bg-white font-medium"
                >
                  <option value="fixed">Fixed</option>
                  <option value="percentage">%</option>
                </select>
              )}
            </div>
            {editable ? (
              <input
                type="number"
                min="0"
                value={data?.tax || 0}
                onChange={(e) => recalculate(currentRows, data?.discount, data?.discountType, parseFloat(e.target.value) || 0, data?.taxType)}
                className="w-20 px-2 py-0.5 text-right font-medium border border-[#e4e4e7] rounded-lg text-xs"
              />
            ) : (
              <span>+{formatCurrency(data?.tax || 0, activeCurrency)}</span>
            )}
          </div>

          <div className="pt-2 border-t border-[#e4e4e7] flex justify-between items-baseline">
            <span className="font-extrabold text-[#09090b] text-sm">Total Investment</span>
            <span className="font-extrabold text-base text-[#09090b] bg-[#d4ff00]/30 px-2.5 py-0.5 rounded-lg">
              {formatCurrency(data?.total || 0, activeCurrency)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}