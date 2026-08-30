'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PricingTableRow, PricingTableData } from '@/types';
import { formatCurrency, generateId, cn } from '@/lib/utils';

interface PricingTableProps {
  data: PricingTableData;
  onChange: (data: PricingTableData) => void;
  editable?: boolean;
  currency?: string;
}

export function PricingTable({ data, onChange, editable = true, currency = 'INR' }: PricingTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; field: string } | null>(null);

  const updateRow = (rowId: string, field: keyof PricingTableRow, value: string | number) => {
    const newRows = data.rows.map((row) => {
      if (row.id !== rowId) return row;
      const updated = { ...row, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        updated.total = updated.quantity * updated.unitPrice;
      }
      return updated;
    });
    recalculate({ ...data, rows: newRows });
  };

  const addRow = () => {
    const newRow: PricingTableRow = {
      id: generateId(),
      item: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    recalculate({ ...data, rows: [...data.rows, newRow] });
  };

  const removeRow = (rowId: string) => {
    const newRows = data.rows.filter((r) => r.id !== rowId);
    recalculate({ ...data, rows: newRows });
  };

  const recalculate = (updated: PricingTableData) => {
    const subtotal = updated.rows.reduce((sum, row) => sum + row.total, 0);
    let discount = updated.discount;
    if (updated.discountType === 'percentage') {
      discount = (subtotal * updated.discount) / 100;
    }
    const afterDiscount = subtotal - discount;
    let tax = updated.tax;
    if (updated.taxType === 'percentage') {
      tax = (afterDiscount * updated.tax) / 100;
    }
    const total = afterDiscount + tax;
    onChange({ ...updated, rows: updated.rows, subtotal, total });
  };

  const updateDiscount = (value: number) => {
    recalculate({ ...data, discount: value });
  };

  const updateTax = (value: number) => {
    recalculate({ ...data, tax: value });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              {editable && <th className="w-10 p-2 border border-gray-200" />}
              <th className="text-left p-2 border border-gray-200 text-sm font-medium">Item</th>
              <th className="text-left p-2 border border-gray-200 text-sm font-medium">Description</th>
              <th className="text-right p-2 border border-gray-200 text-sm font-medium w-20">Qty</th>
              <th className="text-right p-2 border border-gray-200 text-sm font-medium w-28">Unit Price</th>
              <th className="text-right p-2 border border-gray-200 text-sm font-medium w-28">Total</th>
              {editable && <th className="w-10 p-2 border border-gray-200" />}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {editable && (
                  <td className="p-2 border border-gray-200 text-center">
                    <GripVertical className="h-4 w-4 text-gray-400 mx-auto" />
                  </td>
                )}
                <td className="p-1 border border-gray-200">
                  {editable ? (
                    <Input
                      value={row.item}
                      onChange={(e) => updateRow(row.id, 'item', e.target.value)}
                      placeholder="Item name"
                      className="border-0 focus-visible:ring-0 h-8"
                    />
                  ) : (
                    <span className="px-2">{row.item}</span>
                  )}
                </td>
                <td className="p-1 border border-gray-200">
                  {editable ? (
                    <Input
                      value={row.description}
                      onChange={(e) => updateRow(row.id, 'description', e.target.value)}
                      placeholder="Description"
                      className="border-0 focus-visible:ring-0 h-8"
                    />
                  ) : (
                    <span className="px-2 text-gray-600">{row.description}</span>
                  )}
                </td>
                <td className="p-1 border border-gray-200">
                  {editable ? (
                    <Input
                      type="number"
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, 'quantity', parseInt(e.target.value) || 0)}
                      className="border-0 focus-visible:ring-0 h-8 text-right"
                      min="0"
                    />
                  ) : (
                    <span className="px-2 text-right block">{row.quantity}</span>
                  )}
                </td>
                <td className="p-1 border border-gray-200">
                  {editable ? (
                    <Input
                      type="number"
                      value={row.unitPrice}
                      onChange={(e) => updateRow(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="border-0 focus-visible:ring-0 h-8 text-right"
                      min="0"
                    />
                  ) : (
                    <span className="px-2 text-right block">{formatCurrency(row.unitPrice, currency)}</span>
                  )}
                </td>
                <td className="p-2 border border-gray-200 text-right font-medium">
                  {formatCurrency(row.total, currency)}
                </td>
                {editable && (
                  <td className="p-2 border border-gray-200 text-center">
                    <button
                      onClick={() => removeRow(row.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editable && (
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4 mr-1" />
          Add Row
        </Button>
      )}

      {/* Totals */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(data.subtotal, currency)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Discount</span>
              {editable && (
                <select
                  value={data.discountType}
                  onChange={(e) => recalculate({ ...data, discountType: e.target.value as 'percentage' | 'fixed' })}
                  className="text-xs border border-gray-200 rounded px-1 py-0.5"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">Fixed</option>
                </select>
              )}
            </div>
            {editable ? (
              <Input
                type="number"
                value={data.discount}
                onChange={(e) => updateDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 h-8 text-right text-sm"
                min="0"
              />
            ) : (
              <span className="text-red-600">-{formatCurrency(data.discount, currency)}</span>
            )}
          </div>

          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Tax</span>
              {editable && (
                <select
                  value={data.taxType}
                  onChange={(e) => recalculate({ ...data, taxType: e.target.value as 'percentage' | 'fixed' })}
                  className="text-xs border border-gray-200 rounded px-1 py-0.5"
                >
                  <option value="percentage">%</option>
                  <option value="fixed">Fixed</option>
                </select>
              )}
            </div>
            {editable ? (
              <Input
                type="number"
                value={data.tax}
                onChange={(e) => updateTax(parseFloat(e.target.value) || 0)}
                className="w-24 h-8 text-right text-sm"
                min="0"
              />
            ) : (
              <span>{formatCurrency(data.tax, currency)}</span>
            )}
          </div>

          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-gray-900">{formatCurrency(data.total, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}