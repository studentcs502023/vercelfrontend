<template>
  <div class="admin-pagos">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">
          <q-icon name="payments" size="28px" class="page-header__icon" />
          Gestión de Pagos
        </h1>
        <p class="page-header__desc">Administra las transacciones y flujos de energía monetaria.</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-card__label">Total Ingresos</span>
        <span class="stat-card__value">${{ totalIngresos }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Transacciones</span>
        <span class="stat-card__value">{{ pagos.length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Activas</span>
        <span class="stat-card__value stat-card__value--green">
          {{ pagos.filter(p => p.estado === 'activo').length }}
        </span>
      </div>
    </div>

    <!-- Búsqueda -->
    <div class="filters-bar">
      <q-input
        v-model="searchQuery"
        placeholder="Buscar por usuario o método..."
        outlined
        dense
        dark
        class="filter-search"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-select
        v-model="filterEstado"
        :options="estadoOptions"
        outlined
        dense
        dark
        class="filter-select"
        emit-value
        map-options
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="page-loading">
      <span class="page-loading__spinner">✦</span>
      <p>Consultando transacciones...</p>
    </div>

    <!-- Tabla de pagos -->
    <div v-else class="table-wrapper glass-card">
      <table class="pagos-table" v-if="paginatedPagos.length > 0">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Fecha Pago</th>
            <th>Vencimiento</th>
            <th>Método</th>
            <th>Monto</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="pago in paginatedPagos" :key="pago._id">
            <td>
              <div class="user-cell">
                <div class="user-cell__avatar">
                  {{ getInitials(pago.usuario_id?.nombre) }}
                </div>
                <div>
                  <p class="user-cell__name">{{ pago.usuario_id?.nombre || 'N/A' }}</p>
                  <p class="user-cell__email">{{ pago.usuario_id?.email || '' }}</p>
                </div>
              </div>
            </td>
            <td>{{ formatDate(pago.fecha_pago) }}</td>
            <td>{{ formatDate(pago.fecha_vencimiento) }}</td>
            <td>
              <span class="metodo-badge">{{ pago.metodo }}</span>
            </td>
            <td class="td-monto">${{ formatMonto(pago.monto) }}</td>
            <td>
              <span class="status-badge" :class="'status--' + pago.estado">
                {{ pago.estado }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Sin datos -->
      <div v-else class="no-results">
        <p>No se encontraron transacciones.</p>
      </div>

      <!-- Info paginación -->
      <div class="table-footer" v-if="filteredPagos.length > 0">
        <span class="table-footer__info">
          Mostrando {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, filteredPagos.length) }} de {{ filteredPagos.length }}
        </span>
      </div>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        class="pagination__btn"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <q-icon name="chevron_left" />
      </button>
      <button
        v-for="page in visiblePages"
        :key="page"
        class="pagination__btn"
        :class="{ 'pagination__btn--active': page === currentPage }"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
      <button
        class="pagination__btn"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        <q-icon name="chevron_right" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getData } from "@/services/apiClient.js";
import { useNotifications } from "@/composables/useNotifications.js";

const notify = useNotifications();

const pagos = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const filterEstado = ref("todos");
const currentPage = ref(1);
const perPage = 8;

const estadoOptions = [
  { label: "Todos", value: "todos" },
  { label: "Activos", value: "activo" },
  { label: "Vencidos", value: "vencido" },
];

onMounted(async () => {
  await loadPagos();
});

async function loadPagos() {
  loading.value = true;
  try {
    const res = await getData("admin/pagos");
    pagos.value = res.pagos || [];
  } catch (error) {
    notify.error("Error al cargar las transacciones");
  } finally {
    loading.value = false;
  }
}

// Computed
const totalIngresos = computed(() => {
  const total = pagos.value.reduce((sum, p) => sum + (parseFloat(p.monto) || 0), 0);
  return total.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

const filteredPagos = computed(() => {
  let result = [...pagos.value];

  if (filterEstado.value !== "todos") {
    result = result.filter((p) => p.estado === filterEstado.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (p) =>
        p.usuario_id?.nombre?.toLowerCase().includes(query) ||
        p.usuario_id?.email?.toLowerCase().includes(query) ||
        p.metodo?.toLowerCase().includes(query)
    );
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredPagos.value.length / perPage));

const paginatedPagos = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredPagos.value.slice(start, start + perPage);
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

// Helpers
function getInitials(nombre) {
  if (!nombre) return "?";
  const parts = nombre.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return nombre.substring(0, 2).toUpperCase();
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatMonto(monto) {
  const num = parseFloat(monto) || 0;
  return num.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<style scoped>
.admin-pagos {
  max-width: 1100px;
}

/* ── Header ── */
.page-header {
  margin-bottom: 28px;
}

.page-header__title {
  font-family: var(--font-body);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.page-header__icon {
  color: var(--orange-primary);
}

.page-header__desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

/* ── Stats ── */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 20px;
}

.stat-card__label {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.stat-card__value {
  font-family: var(--font-heading);
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-card__value--green {
  color: #22c55e;
}

/* ── Filtros ── */
.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-search {
  flex: 1;
}

.filter-search :deep(.q-field__control) {
  background: rgba(15, 14, 36, 0.8);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}

.filter-search :deep(.q-field--outlined .q-field__control::before),
.filter-search :deep(.q-field--outlined .q-field__control::after) {
  border: none;
}

.filter-select {
  width: 160px;
}

.filter-select :deep(.q-field__control) {
  background: rgba(15, 14, 36, 0.8);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
}

.filter-select :deep(.q-field--outlined .q-field__control::before),
.filter-select :deep(.q-field--outlined .q-field__control::after) {
  border: none;
}

/* ── Tabla ── */
.table-wrapper {
  padding: 0;
  overflow-x: auto;
}

.pagos-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.pagos-table thead {
  border-bottom: 1px solid var(--border-subtle);
}

.pagos-table th {
  text-align: left;
  padding: 16px 18px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.pagos-table td {
  padding: 14px 18px;
  color: var(--text-secondary);
  border-bottom: 1px solid rgba(124, 58, 237, 0.08);
}

.pagos-table tbody tr {
  transition: background 0.2s;
}

.pagos-table tbody tr:hover {
  background: rgba(124, 58, 237, 0.05);
}

/* User cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-cell__avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--violet-mid), var(--violet-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.user-cell__name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.82rem;
  margin: 0;
}

.user-cell__email {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 2px 0 0 0;
}

/* Monto */
.td-monto {
  font-weight: 700;
  color: var(--text-primary) !important;
}

/* Badges */
.metodo-badge {
  font-size: 0.72rem;
  text-transform: capitalize;
  color: var(--text-secondary);
  background: rgba(124, 58, 237, 0.1);
  padding: 3px 10px;
  border-radius: 6px;
}

.status-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: capitalize;
  padding: 4px 12px;
  border-radius: 20px;
}

.status--activo {
  background: rgba(34, 197, 94, 0.12);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.25);
}

.status--vencido {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Table footer */
.table-footer {
  padding: 14px 18px;
  border-top: 1px solid var(--border-subtle);
}

.table-footer__info {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* ── Paginación ── */
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
}

.pagination__btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.pagination__btn:hover:not(:disabled) {
  border-color: var(--violet-accent);
  color: var(--text-primary);
}

.pagination__btn--active {
  background: var(--violet-accent);
  border-color: var(--violet-accent);
  color: white;
}

.pagination__btn:disabled {
  opacity: 0.3;
  cursor: default;
}

/* ── Loading / Sin datos ── */
.page-loading,
.no-results {
  text-align: center;
  padding: 50px;
  color: var(--text-muted);
}

.page-loading__spinner {
  display: inline-block;
  font-size: 2rem;
  color: var(--violet-accent);
  animation: spin 1.5s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .filters-bar {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
  }

  .pagos-table {
    font-size: 0.78rem;
  }

  .pagos-table th,
  .pagos-table td {
    padding: 10px 12px;
  }
}
</style>
