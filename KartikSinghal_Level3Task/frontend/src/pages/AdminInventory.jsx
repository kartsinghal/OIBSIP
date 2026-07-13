import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

// ── Stock status helper ────────────────────────────────────────────────────────
const getStockStatus = (quantity, threshold) => {
  if (quantity <= 0) return { label: 'Out of Stock', color: 'red' };
  if (quantity <= threshold) return { label: 'Low Stock', color: 'yellow' };
  return { label: 'Healthy', color: 'green' };
};

const STATUS_BADGE_STYLES = {
  green:  { bg: 'rgba(22,163,74,0.12)',   border: 'rgba(22,163,74,0.3)',   text: '#16a34a' },
  yellow: { bg: 'rgba(234,179,8,0.12)',   border: 'rgba(234,179,8,0.3)',   text: '#ca8a04' },
  red:    { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   text: '#dc2626' },
};

// ── Shared input style ─────────────────────────────────────────────────────────
const inputStyle = {
  background: 'var(--bg-tertiary)',
  border: '1px solid var(--border-color)',
  borderRadius: 8,
  color: 'var(--text-primary)',
  fontSize: 13,
  padding: '8px 12px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s ease',
};

// ── Inline edit row component ─────────────────────────────────────────────────
const InventoryRow = ({ item, onUpdate, onDelete }) => {
  const [editValue, setEditValue]       = useState('');
  const [operation, setOperation]       = useState('set');
  const [editThreshold, setEditThreshold] = useState('');
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);
  const [rowError, setRowError]         = useState('');

  const status = getStockStatus(item.quantity, item.threshold);
  const badge  = STATUS_BADGE_STYLES[status.color];

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

  const TD = { padding: '14px 20px', verticalAlign: 'middle', borderBottom: '1px solid var(--border-color)' };

  return (
    <tr
      style={{ transition: 'background-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* Name */}
      <td style={{ ...TD, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
        {item.ingredientName}
      </td>

      {/* Current Stock */}
      <td style={{ ...TD, fontSize: 13, color: 'var(--text-primary)', fontFamily: 'Courier New, monospace', whiteSpace: 'nowrap' }}>
        {item.quantity} <span style={{ color: 'var(--text-tertiary)' }}>{item.unit}</span>
      </td>

      {/* Threshold */}
      <td style={{ ...TD, fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
        {item.threshold} <span style={{ color: 'var(--text-tertiary)' }}>{item.unit}</span>
      </td>

      {/* Status badge */}
      <td style={{ ...TD, whiteSpace: 'nowrap' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          fontSize: 11, fontWeight: 700, padding: '3px 10px',
          borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em',
          backgroundColor: badge.bg, border: `1px solid ${badge.border}`, color: badge.text,
        }}>
          {status.label}
        </span>
      </td>

      {/* Update / Delete controls */}
      <td style={{ ...TD }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Operation selector */}
          <select
            value={operation}
            onChange={e => setOperation(e.target.value)}
            style={{ ...inputStyle, padding: '6px 10px', height: 34, cursor: 'pointer' }}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          >
            <option value="set">Set</option>
            <option value="increase">+Add</option>
            <option value="decrease">−Remove</option>
          </select>

          {/* Quantity input */}
          <input
            type="number"
            min="0"
            step="0.1"
            value={editValue}
            onChange={e => { setEditValue(e.target.value); setRowError(''); }}
            placeholder="Qty"
            style={{ ...inputStyle, width: 72, height: 34, padding: '6px 10px' }}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />

          {/* Threshold input */}
          <input
            type="number"
            min="0"
            step="0.1"
            value={editThreshold}
            onChange={e => setEditThreshold(e.target.value)}
            placeholder="Threshold"
            style={{ ...inputStyle, width: 100, height: 34, padding: '6px 10px' }}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || editValue === ''}
            style={{
              height: 34, padding: '0 14px',
              background: saving || editValue === '' ? 'var(--bg-tertiary)' : '#FF4500',
              color: saving || editValue === '' ? 'var(--text-tertiary)' : '#fff',
              border: '1px solid transparent',
              borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: saving || editValue === '' ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, opacity 0.2s',
              opacity: saving ? 0.6 : 1,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!saving && editValue !== '') e.currentTarget.style.background = '#DC3800'; }}
            onMouseLeave={e => { if (!saving && editValue !== '') e.currentTarget.style.background = '#FF4500'; }}
          >
            {saving ? '...' : 'Save'}
          </button>

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              height: 34, padding: '0 14px',
              background: 'rgba(239,68,68,0.08)',
              color: '#dc2626',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 8, fontSize: 12, fontWeight: 700,
              cursor: deleting ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s, opacity 0.2s',
              opacity: deleting ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
            onMouseLeave={e => { if (!deleting) e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          >
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
        {rowError && (
          <p style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>{rowError}</p>
        )}
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

  const fieldInput = (override = {}) => ({
    ...inputStyle,
    ...override,
  });

  const LabelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: 6,
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        padding: '20px 24px',
        marginBottom: 20,
      }}
    >
      <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.01em' }}>
        ➕ Add New Ingredient
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
        <div>
          <label style={LabelStyle}>Name</label>
          <input
            value={form.ingredientName}
            onChange={e => setForm(f => ({ ...f, ingredientName: e.target.value }))}
            placeholder="e.g. dough"
            style={fieldInput({ minWidth: 160 })}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
        <div>
          <label style={LabelStyle}>Quantity</label>
          <input
            type="number" min="0" step="0.1"
            value={form.quantity}
            onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
            placeholder="0"
            style={fieldInput({ width: 96 })}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
        <div>
          <label style={LabelStyle}>Threshold</label>
          <input
            type="number" min="0" step="0.1"
            value={form.threshold}
            onChange={e => setForm(f => ({ ...f, threshold: e.target.value }))}
            placeholder="0"
            style={fieldInput({ width: 96 })}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
        <div>
          <label style={LabelStyle}>Unit</label>
          <input
            value={form.unit}
            onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            placeholder="pcs / g / ml"
            style={fieldInput({ width: 110 })}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          style={{
            padding: '9px 22px',
            background: saving ? 'var(--bg-tertiary)' : '#FF4500',
            color: saving ? 'var(--text-tertiary)' : '#fff',
            border: 'none', borderRadius: 8,
            fontSize: 13, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, opacity 0.2s',
            opacity: saving ? 0.6 : 1,
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#DC3800'; }}
          onMouseLeave={e => { if (!saving) e.currentTarget.style.background = '#FF4500'; }}
        >
          {saving ? 'Creating...' : 'Create'}
        </button>
      </div>
      {error && (
        <p style={{ marginTop: 10, fontSize: 12, color: '#dc2626' }}>{error}</p>
      )}
    </form>
  );
};

// ── Main AdminInventory component ─────────────────────────────────────────────
const AdminInventory = () => {
  const { user, loading: authLoading } = useAuth();
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [feedback, setFeedback] = useState('');
  const [search,   setSearch]   = useState('');

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiClient.get('/inventory');
      setItems(Array.isArray(res.data?.data) ? res.data.data : []);
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

  if (authLoading) return (
    <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-secondary)' }}>
      Loading...
    </div>
  );

  if (!user || user.role !== 'admin') return (
    <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-secondary)' }}>
      Access restricted to administrators.
    </div>
  );

  const filtered = items.filter(i =>
    i.ingredientName.toLowerCase().includes(search.toLowerCase())
  );

  const lowStockCount  = items.filter(i => i.quantity > 0 && i.quantity <= i.threshold).length;
  const outOfStockCount = items.filter(i => i.quantity <= 0).length;

  const TH_STYLE = {
    padding: '12px 20px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    borderBottom: '1px solid var(--border-color)',
    whiteSpace: 'nowrap',
    background: 'var(--bg-secondary)',
  };

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', minHeight: '90vh', padding: '40px 0 80px' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .inv-container { padding: 20px 16px !important; }
        }
      `}</style>

      <div className="inv-container" style={{ maxWidth: 1400, margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px)' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 32, flexWrap: 'wrap', gap: 16,
          paddingBottom: 24, borderBottom: '1px solid var(--border-color)',
        }}>
          <div>
            <h1 style={{
              fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 800,
              margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)',
            }}>
              Inventory Dashboard
            </h1>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
              Manage ingredient stock levels
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {outOfStockCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 100,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#dc2626', fontSize: 12, fontWeight: 700,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', display: 'inline-block' }} />
                {outOfStockCount} Out of Stock
              </span>
            )}
            {lowStockCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 100,
                background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)',
                color: '#ca8a04', fontSize: 12, fontWeight: 700,
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ca8a04', display: 'inline-block' }} />
                {lowStockCount} Low Stock
              </span>
            )}
            <button
              onClick={fetchInventory}
              disabled={loading}
              style={{
                padding: '9px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                color: 'var(--text-primary)', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; }}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
            >
              <span style={{ display: 'inline-block', transform: loading ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>↻</span>
              Refresh
            </button>
          </div>
        </div>

        {/* ── Feedback / Error ── */}
        {feedback && (
          <div style={{
            marginBottom: 20, padding: '12px 20px', borderRadius: 12,
            background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)',
            color: '#15803d', fontSize: 13, fontWeight: 600,
          }}>
            ✓ {feedback}
          </div>
        )}
        {error && (
          <div style={{
            marginBottom: 20, padding: '12px 20px', borderRadius: 12,
            background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#dc2626', fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* ── Create Form ── */}
        <CreateIngredientForm onCreate={handleCreate} />

        {/* ── Search bar ── */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 15 }}>🔍</span>
          <input
            type="text"
            placeholder="Search ingredient..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              ...inputStyle,
              flex: 1,
              maxWidth: 360,
              border: 'none',
              background: 'transparent',
              padding: '4px 0',
              fontSize: 14,
            }}
            onFocus={e => e.target.style.outline = 'none'}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                background: 'none', border: 'none',
                color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 16, padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
            <div style={{
              width: 28, height: 28,
              border: '2px solid rgba(255,69,0,0.15)', borderTopColor: '#FF4500',
              borderRadius: '50%', animation: 'spin 0.8s linear infinite',
              margin: '0 auto 16px',
            }} />
            Loading inventory...
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Ingredient', 'Current Stock', 'Threshold', 'Status', 'Update / Delete'].map(h => (
                      <th key={h} style={TH_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{
                        padding: '60px 20px', textAlign: 'center',
                        color: 'var(--text-tertiary)', fontSize: 14,
                      }}>
                        {search ? `No ingredients matching "${search}".` : 'No ingredients found.'}
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
            <div style={{
              padding: '12px 20px', borderTop: '1px solid var(--border-color)',
              fontSize: 12, color: 'var(--text-tertiary)',
            }}>
              Showing {filtered.length} of {items.length} ingredients
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default AdminInventory;
