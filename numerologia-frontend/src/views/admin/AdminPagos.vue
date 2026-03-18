<template>
  <div class="cosmic-pagos">
    <!-- Fondo cósmico animado -->
    <div class="cosmic-bg">
      <div class="cosmic-bg__stars"></div>
      <div class="cosmic-bg__nebula"></div>
      <div class="cosmic-bg__orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
    </div>

    <!-- Header -->
    <div class="page-header">
      <div class="header-badge">
        <span class="badge-dot"></span>
        <span>ADMINISTRACIÓN</span>
      </div>
      <h1 class="page-header__title">
        <span class="title-gradient">Gestión de Pagos</span>
        <span class="title-emoji">💰</span>
      </h1>
      <p class="page-header__desc">Administra las transacciones y flujos de energía monetaria.</p>
    </div>

    <!-- Stats cósmicas -->
    <div class="stats-grid">
      <div class="stat-card stat-card--total">
        <div class="stat-card__glow"></div>
        <div class="stat-card__content">
          <span class="stat-card__label">Total Ingresos</span>
          <span class="stat-card__value">${{ totalIngresos }}</span>
          <span class="stat-card__trend">✦ flujo positivo</span>
        </div>
      </div>

      <div class="stat-card stat-card--transacciones">
        <div class="stat-card__glow"></div>
        <div class="stat-card__content">
          <span class="stat-card__label">Transacciones</span>
          <span class="stat-card__value">{{ pagos.length }}</span>
          <span class="stat-card__trend">📊 total</span>
        </div>
      </div>

      <div class="stat-card stat-card--activas">
        <div class="stat-card__glow"></div>
        <div class="stat-card__content">
          <span class="stat-card__label">Activas</span>
          <span class="stat-card__value">{{ pagos.filter(p => p.estado === 'activo').length }}</span>
          <span class="stat-card__trend">✨ activas</span>
        </div>
      </div>
    </div>

    <!-- Filtros mejorados -->
    <div class="filters-section">
      <div class="search-wrapper">
        <q-input
          v-model="searchQuery"
          placeholder="Buscar por usuario o método..."
          outlined
          dense
          dark
          class="cosmic-search"
        >
          <template #prepend>
            <q-icon name="search" class="search-icon" />
          </template>
        </q-input>
      </div>

      <div class="filter-wrapper">
        <q-select
          v-model="filterEstado"
          :options="estadoOptions"
          outlined
          dense
          dark
          class="cosmic-filter"
          emit-value
          map-options
        >
          <template #prepend>
            <q-icon name="filter_list" class="filter-icon" />
          </template>
        </q-select>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="cosmic-loading">
      <div class="loading-orb">
        <q-spinner-dots color="#b388ff" size="40px" />
      </div>
      <p>Consultando transacciones...</p>
    </div>

    <!-- Tabla de pagos -->
    <div v-else class="table-container glass-card">
      <table class="cosmic-table" v-if="paginatedPagos.length > 0">
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
          <tr v-for="pago in paginatedPagos" :key="pago._id" class="table-row">
            <td>
              <div class="user-cell">
                <div class="user-avatar" :class="`avatar--${pago.estado}`">
                  {{ getInitials(pago.usuario_id?.nombre) }}
                </div>
                <div class="user-info">
                  <p class="user-name">{{ pago.usuario_id?.nombre || 'N/A' }}</p>
                  <p class="user-email">{{ pago.usuario_id?.email || '' }}</p>
                </div>
              </div>
            </td>
            <td class="date-cell">{{ formatDate(pago.fecha_pago) }}</td>
            <td class="date-cell">{{ formatDate(pago.fecha_vencimiento) }}</td>
            <td>
              <span class="metodo-badge">{{ pago.metodo }}</span>
            </td>
            <td class="monto-cell">${{ formatMonto(pago.monto) }}</td>
            <td>
              <span class="status-badge" :class="`status--${pago.estado}`">
                <span class="status-dot"></span>
                {{ pago.estado }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Sin datos -->
      <div v-else class="no-results">
        <div class="no-results__orb">
          <span class="no-results__emoji">🌙</span>
        </div>
        <p>No se encontraron transacciones.</p>
      </div>

      <!-- Info paginación -->
      <div class="table-footer" v-if="filteredPagos.length > 0">
        <span class="table-footer__info">
          Mostrando {{ (currentPage - 1) * perPage + 1 }}-{{ Math.min(currentPage * perPage, filteredPagos.length) }} de {{ filteredPagos.length }} transacciones
        </span>
      </div>
    </div>

    <!-- Paginación cósmica -->
    <div v-if="totalPages > 1" class="cosmic-pagination">
      <button
        class="pagination-btn"
        :class="{ 'pagination-btn--disabled': currentPage === 1 }"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <q-icon name="chevron_left" />
      </button>
      
      <div class="pagination-numbers">
        <button
          v-for="page in visiblePages"
          :key="page"
          class="pagination-number"
          :class="{ 'pagination-number--active': page === currentPage }"
          @click="currentPage = page"
        >
          {{ page }}
        </button>
      </div>
      
      <button
        class="pagination-btn"
        :class="{ 'pagination-btn--disabled': currentPage === totalPages }"
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
  { label: "Todos los estados", value: "todos" },
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

<style>
/* Variables de color - Misma paleta cósmica */
:root {
  --color-bg: #0a0a14;
  --color-surface: rgba(18, 18, 32, 0.8);
  --color-surface-hover: rgba(28, 28, 48, 0.9);
  --color-primary: #b388ff;
  --color-primary-glow: rgba(179, 136, 255, 0.3);
  --color-success: #22c55e;
  --color-success-glow: rgba(34, 197, 94, 0.2);
  --color-danger: #ff6b4a;
  --color-danger-glow: rgba(255, 107, 74, 0.2);
  --color-text: #ffffff;
  --color-text-secondary: #a0a0c0;
  --border-radius: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cosmic-pagos {
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: var(--color-bg);
  position: relative;
  overflow-x: hidden;
}

/* Fondo cósmico */
.cosmic-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.cosmic-bg__stars {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 40px 70px, #fff, rgba(0,0,0,0)),
    radial-gradient(2px 2px at 80px 120px, #fff, rgba(0,0,0,0));
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.3;
  animation: stars 20s linear infinite;
}

.cosmic-bg__nebula {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 30% 50%, rgba(179, 136, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 70% 30%, rgba(255, 107, 74, 0.1) 0%, transparent 50%);
  filter: blur(40px);
}

.cosmic-bg__orbs .orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.15;
  animation: float 20s infinite;
}

.orb-1 {
  top: 20%;
  left: 10%;
  width: 300px;
  height: 300px;
  background: #7c4dff;
}

.orb-2 {
  bottom: 10%;
  right: 10%;
  width: 400px;
  height: 400px;
  background: #ff6b4a;
  animation-delay: -5s;
}

.orb-3 {
  top: 50%;
  left: 50%;
  width: 500px;
  height: 500px;
  background: #00bcd4;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-30px, 30px) scale(0.9); }
}

@keyframes stars {
  from { transform: translateY(0); }
  to { transform: translateY(-200px); }
}

/* Header */
.page-header {
  position: relative;
  z-index: 2;
  margin-bottom: 2rem;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: 100px;
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  backdrop-filter: blur(8px);
  margin-bottom: 1rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.page-header__title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 0.5rem;
}

.title-gradient {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-emoji {
  font-size: 2rem;
  animation: float-emoji 3s infinite;
}

@keyframes float-emoji {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.page-header__desc {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.stat-card {
  position: relative;
  padding: 1.5rem;
  border-radius: 20px;
  overflow: hidden;
  transition: var(--transition);
  border: 1px solid rgba(179, 136, 255, 0.1);
}

.stat-card--total {
  background: linear-gradient(145deg, #1a1f2a, #13161f);
}

.stat-card--transacciones {
  background: linear-gradient(145deg, #1a1f2a, #13161f);
}

.stat-card--activas {
  background: linear-gradient(145deg, #1a1f2a, #13161f);
}

.stat-card__glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(179, 136, 255, 0.1), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover .stat-card__glow {
  opacity: 1;
}

.stat-card__content {
  position: relative;
  z-index: 1;
}

.stat-card__label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.stat-card__value {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.stat-card__trend {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

/* Filtros */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.search-wrapper {
  flex: 1;
}

.cosmic-search :deep(.q-field__control) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(179, 136, 255, 0.2) !important;
  border-radius: 16px !important;
  min-height: 48px !important;
  transition: var(--transition) !important;
}

.cosmic-search :deep(.q-field--focused .q-field__control) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 20px var(--color-primary-glow) !important;
}

.cosmic-search :deep(.q-field__native) {
  color: white !important;
}

.search-icon {
  color: var(--color-primary) !important;
}

.filter-wrapper {
  width: 200px;
}

.cosmic-filter :deep(.q-field__control) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(179, 136, 255, 0.2) !important;
  border-radius: 16px !important;
  min-height: 48px !important;
  transition: var(--transition) !important;
}

.cosmic-filter :deep(.q-field--focused .q-field__control) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 20px var(--color-primary-glow) !important;
}

.filter-icon {
  color: var(--color-primary) !important;
}

/* Table Container */
.table-container {
  position: relative;
  z-index: 2;
  padding: 0;
  overflow-x: auto;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: var(--border-radius);
  transition: var(--transition);
}

.table-container:hover {
  border-color: var(--color-primary);
  box-shadow: 0 20px 40px -12px var(--color-primary-glow);
}

/* Tabla */
.cosmic-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.cosmic-table thead {
  border-bottom: 1px solid rgba(179, 136, 255, 0.2);
}

.cosmic-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-primary);
}

.cosmic-table td {
  padding: 1rem 1.5rem;
  color: var(--color-text-secondary);
  border-bottom: 1px solid rgba(179, 136, 255, 0.1);
}

.table-row {
  transition: var(--transition);
}

.table-row:hover {
  background: rgba(179, 136, 255, 0.05);
}

/* User cell */
.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.avatar--activo {
  background: linear-gradient(135deg, #7c4dff, #b388ff);
  box-shadow: 0 0 15px rgba(124, 77, 255, 0.5);
}

.avatar--vencido {
  background: linear-gradient(135deg, #ff6b4a, #ff8a6b);
  box-shadow: 0 0 15px rgba(255, 107, 74, 0.5);
}

.user-info {
  line-height: 1.4;
}

.user-name {
  font-weight: 600;
  color: white;
  margin: 0;
  font-size: 0.85rem;
}

.user-email {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin: 2px 0 0;
}

/* Date cell */
.date-cell {
  color: var(--color-text-secondary) !important;
  font-size: 0.8rem;
}

/* Método badge */
.metodo-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(179, 136, 255, 0.1);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: 20px;
  font-size: 0.7rem;
  color: var(--color-primary);
}

/* Monto cell */
.monto-cell {
  font-weight: 700;
  color: var(--color-primary) !important;
  font-size: 0.95rem;
}

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.status--activo {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.status--vencido {
  background: rgba(255, 107, 74, 0.1);
  color: #ff6b4a;
  border: 1px solid rgba(255, 107, 74, 0.3);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status--activo .status-dot {
  background: #22c55e;
  box-shadow: 0 0 10px #22c55e;
}

.status--vencido .status-dot {
  background: #ff6b4a;
  box-shadow: 0 0 10px #ff6b4a;
}

/* Table footer */
.table-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(179, 136, 255, 0.1);
  text-align: right;
}

.table-footer__info {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

/* Paginación cósmica */
.cosmic-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  position: relative;
  z-index: 2;
}

.pagination-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(179, 136, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: var(--color-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  backdrop-filter: blur(4px);
}

.pagination-btn:hover:not(.pagination-btn--disabled) {
  border-color: var(--color-primary);
  background: rgba(179, 136, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px var(--color-primary-glow);
}

.pagination-btn--disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.5rem;
}

.pagination-number {
  min-width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(179, 136, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: var(--color-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  backdrop-filter: blur(4px);
}

.pagination-number:hover {
  border-color: var(--color-primary);
  color: white;
}

.pagination-number--active {
  background: linear-gradient(135deg, #7c4dff, #b388ff);
  border-color: transparent;
  color: white;
  box-shadow: 0 5px 15px rgba(124, 77, 255, 0.4);
}

/* Loading */
.cosmic-loading {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 4rem;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: var(--border-radius);
}

.loading-orb {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(179, 136, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

.cosmic-loading p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* No results */
.no-results {
  text-align: center;
  padding: 4rem;
}

.no-results__orb {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(179, 136, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s infinite;
}

.no-results__emoji {
  font-size: 2rem;
  filter: drop-shadow(0 0 20px rgba(179, 136, 255, 0.5));
}

.no-results p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* Animaciones */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Responsive */
@media (max-width: 768px) {
  .cosmic-pagos {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .filters-section {
    flex-direction: column;
  }

  .filter-wrapper {
    width: 100%;
  }

  .cosmic-table {
    font-size: 0.75rem;
  }

  .cosmic-table th,
  .cosmic-table td {
    padding: 0.75rem 1rem;
  }

  .user-avatar {
    width: 30px;
    height: 30px;
    font-size: 0.6rem;
  }

  .user-name {
    font-size: 0.75rem;
  }

  .user-email {
    font-size: 0.6rem;
  }

  .pagination-numbers {
    gap: 0.25rem;
  }

  .pagination-number {
    min-width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }

  .pagination-btn {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 480px) {
  .title-gradient {
    font-size: 1.5rem;
  }

  .title-emoji {
    font-size: 1.5rem;
  }

  .stat-card__value {
    font-size: 1.5rem;
  }

  .cosmic-table {
    font-size: 0.7rem;
  }

  .cosmic-table th,
  .cosmic-table td {
    padding: 0.5rem;
  }

  .metodo-badge {
    padding: 2px 8px;
    font-size: 0.6rem;
  }
}
</style>