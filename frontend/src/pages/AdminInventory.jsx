import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

// ── Stock status helper ────────────────────────────────────────────────────────
const getStockStatus = (quantity, threshold) => {
  if (quantity <= 0) return { label: 'Out of Stock', color: 'red' };
  if (quantity <= threshold) return { label: 'Low Stock', color: 'yellow' };
  return { label: 'Healthy', color: 'green' };
};

const STATUS_COLORS = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
};

// ── Inline edit row component ─────────────────────────────────────────────────
const InventoryRow = ({ item, onUpdate, onDelete }) => {
  const [editValue, setEditValue] = useState('');
  const [operation, setOperation] = useState('set');
  const [editThreshold, setEditThreshold] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rowError, setRowError] = useState('');

  const status = getStockStatus(item.quantity, item.threshold);

  const handleSave = async () => {
    const numVal = parseFloat(editValue);
    if (editValue === '' || isNaN(numVal) || numVal < 0) {
      setRowError('Enter a valid non-negative number');
      return;
    }
    setRowError('');
    setSaving(true);
    try {
      const thresholdVal = editThreshold !== '' ? parseFloat(editThreshold) : undefined;
      await onUpdate(item._id, operation, numVal, thresholdVal);
      setEditValue('');
      setEditThreshold('');
    } catch (err) {
      setRowError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${item.ingredientName}" from inventory?`)) return;
    setDeleting(true);
    try {
      await onDelete(item._id);
    } catch (err) {
      setRowError(err.response?.data?.message || 'Delete failed');
      setDeleting(false);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
        {item.ingredientName}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
        {item.quantity} {item.unit}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {item.threshold} {item.unit}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-0.5 inline-flex text-xs font-semibold rounded-full ${STATUS_COLORS[status.color]}`}>
          {status.label}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            className="text-xs border-gray-300 rounded shadow-sm focus:ring-orange-500 focus:border-orange-500 h-8"
          >
            <option value="set">Set</option>
            <option value="increase">+Add</option>
            <option value="decrease">-Remove</option>
          </select>
          <input
            type="number"
            min="0"
            step="0.1"
            value={editValue}
            onChange={(e) => { setEditValue(e.target.value); setRowError(''); }}
            placeholder="Qty"
            className="w-20 text-sm border-gray-300 rounded shadow-sm focus:ring-orange-500 focus:border-orange-500 h-8 px-2"
          />
          <input
            type="number"
            min="0"
            step="0.1"
            value={editThreshold}
            onChange={(e) => setEditThreshold(e.target.value)}
            placeholder="Threshold"
            className="w-24 text-sm border-gray-300 rounded shadow-sm focus:ring-orange-500 focus:border-orange-500 h-8 px-2"
          />
          <button
            onClick={handleSave}
            disabled={saving || editValue === ''}
            className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded shadow disabled:opacity-40 transition-colors h-8"
          >
            {saving ? '...' : 'Save'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded shadow disabled:opacity-40 transition-colors h-8"
          >
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
        {rowError && <p className="text-xs text-red-600 mt-1">{rowError}</p>}
      </td>
    </tr>
  );
};

// ── Create Ingredient form ─────────────────────────────────────────────────────
const CreateIngredientForm = ({ onCreate }) => {
  const [form, setForm] = useState({ ingredientName: '', quantity: '', threshold: '', unit: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const { ingredientName, quantity, threshold, unit } = form;
    if (!ingredientName.trim() || quantity === '' || threshold === '' || !unit.trim()) {
      setError('All fields are required');
      return;
    }
    setSaving(true);
    try {
      await onCreate({
        ingredientName: ingredientName.trim(),
        quantity: parseFloat(quantity),
        threshold: parseFloat(threshold),
        unit: unit.trim(),
      });
      setForm({ ingredientName: '', quantity: '', threshold: '', unit: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ingredient');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'border border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500 px-3 py-2';

  return (
    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg shadow-sm border mb-6">
      <h2 className="text-base font-semibold text-gray-800 mb-4">➕ Add New Ingredient</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Name</label>
          <input
            value={form.ingredientName}
            onChange={e => setForm(f => ({ ...f, ingredientName: e.target.value }))}
            placeholder="e.g. dough"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Quantity</label>
          <input
            type="number" min="0" step="0.1"
            value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
            placeholder="0"
            className={`${inputCls} w-24`}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Threshold</label>
          <input
            type="number" min="0" step="0.1"
            value={form.threshold}
            onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
            placeholder="0"
            className={`${inputCls} w-28`}
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Unit</label>
          <input
            value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            placeholder="pcs / g / ml"
            className={`${inputCls} w-28`}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-md shadow disabled:opacity-40 transition-colors"
        >
          {saving ? 'Creating...' : 'Create'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </form>
  );
};

// ── Main AdminInventory component ─────────────────────────────────────────────
const AdminInventory = () => {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/inventory');
      setItems(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchInventory();
    }
  }, [authLoading, user, fetchInventory]);

  const showFeedback = (msg) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(''), 3500);
  };

  const handleCreate = async (payload) => {
    const res = await apiClient.post('/inventory', payload);
    setItems(prev => [...prev, res.data.data].sort((a, b) => a.ingredientName.localeCompare(b.ingredientName)));
    showFeedback(`"${res.data.data.ingredientName}" added to inventory`);
  };

  const handleUpdate = async (id, operation, value, threshold) => {
    const body = { operation, value };
    if (threshold !== undefined && !isNaN(threshold)) body.threshold = threshold;
    const res = await apiClient.patch(`/inventory/${id}`, body);
    const updated = res.data.data;
    setItems(prev => prev.map(i => i._id === id ? updated : i));
    showFeedback(`"${updated.ingredientName}" updated → ${updated.quantity} ${updated.unit}`);
  };

  const handleDelete = async (id) => {
    const res = await apiClient.delete(`/inventory/${id}`);
    setItems(prev => prev.filter(i => i._id !== id));
    showFeedback(res.data.message || 'Item deleted');
  };

  if (authLoading) return <div className="p-10 text-center text-gray-500">Loading...</div>;

  const filtered = items.filter(i =>
    i.ingredientName.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount = items.filter(i => i.quantity > 0 && i.quantity <= i.threshold).length;
  const outOfStockCount = items.filter(i => i.quantity <= 0).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Header */}
      <div className="mb-8 border-b pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage ingredient stock levels</p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {outOfStockCount > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
              {outOfStockCount} Out of Stock
            </span>
          )}
          {lowStockCount > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
              {lowStockCount} Low Stock
            </span>
          )}
          <button
            onClick={fetchInventory}
            className="px-4 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Feedback / Error */}
      {feedback && (
        <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm shadow-sm">
          ✓ {feedback}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm shadow-sm">
          {error}
        </div>
      )}

      {/* Create Form */}
      <CreateIngredientForm onCreate={handleCreate} />

      {/* Search */}
      <div className="mb-5 bg-white p-4 rounded-lg shadow-sm border">
        <input
          type="text"
          placeholder="Search ingredient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-80 border-gray-300 rounded-md shadow-sm text-sm focus:ring-orange-500 focus:border-orange-500"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading inventory...</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Ingredient', 'Current Stock', 'Threshold', 'Status', 'Update / Delete'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                      No ingredients found.
                    </td>
                  </tr>
                ) : filtered.map(item => (
                  <InventoryRow
                    key={item._id}
                    item={item}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
