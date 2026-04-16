// ── Status Colors ──────────────────────────────────────────────
// Donation / Payment status
export const getStatusColor = (status) => {
  const colors = {
    completed: 'text-green-600',
    paid: 'text-green-600',
    active: 'text-green-600',
    partially_paid: 'text-orange-600',
    pay_later: 'text-orange-600',
    pending: 'text-yellow-600',
    scheduled: 'text-blue-600',
    upcoming: 'text-blue-600',
    failed: 'text-red-600',
    cancelled: 'text-red-600',
    unpaid: 'text-red-600',
  };
  return colors[status] || 'text-gray-500';
};

// Active / Inactive boolean
export const getActiveColor = (isActive) =>
  isActive ? 'text-green-600' : 'text-red-600';

export const getActiveHoverColor = (isActive) =>
  isActive
    ? 'text-green-600 hover:text-green-700'
    : 'text-red-600 hover:text-red-700';

export const getActiveLabel = (isActive) =>
  isActive ? 'Active' : 'Inactive';

// ── Payment Mode Colors ───────────────────────────────────────
export const getPaymentModeColor = (mode) => {
  const colors = {
    cash: 'text-blue-600',
    online: 'text-purple-600',
    pay_later: 'text-orange-600',
    cheque: 'text-teal-600',
    partially_paid: 'text-amber-600',
  };
  return colors[mode] || 'text-gray-500';
};

// ── Event Type Colors (Bapu Schedule) ─────────────────────────
export const getEventTypeColor = (type) => {
  const colors = {
    Padhramani: 'text-purple-600',
    Katha: 'text-orange-600',
    Event: 'text-blue-600',
    Personal: 'text-blue-600',
  };
  return colors[type] || 'text-blue-600';
};
