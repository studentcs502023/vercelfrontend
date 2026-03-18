<template>
  <div class="admin-usuarios">
    <!-- Header -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">
          <q-icon name="group" size="28px" class="page-header__icon" />
          Usuarios Registrados
        </h1>
        <p class="page-header__desc">Lista de cuentas activas en el sistema.</p>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-card__label">Total</span>
        <span class="stat-card__value">{{ usuarios.length }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Activos</span>
        <span class="stat-card__value stat-card__value--green">
          {{ usuarios.filter(u => u.estado === 'activo').length }}
        </span>
      </div>
      <div class="stat-card">
        <span class="stat-card__label">Administradores</span>
        <span class="stat-card__value stat-card__value--orange">
          {{ usuarios.filter(u => u.rol === 'administrador' || u.rol === 'admin').length }}
        </span>
      </div>
    </div>

    <!-- Búsqueda y filtros -->
    <div class="filters-bar">
      <q-input
        v-model="searchQuery"
        placeholder="Buscar por nombre o email..."
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
      <q-spinner-dots color="#e8842a" size="40px" />
      <p>Cargando usuarios...</p>
    </div>

    <!-- Grid de usuarios -->
    <div v-else class="usuarios-grid">
      <div
        v-for="usuario in paginatedUsuarios"
        :key="usuario._id"
        class="usuario-card glass-card"
      >
        <!-- Acciones (ocultas para el admin logueado) -->
        <div class="usuario-card__actions" v-if="!isCurrentAdmin(usuario)">
          <button
            class="action-btn action-btn--edit"
            @click="toggleRol(usuario)"
            :title="esAdmin(usuario) ? 'Cambiar a usuario' : 'Cambiar a admin'"
          >
            <q-icon name="admin_panel_settings" size="16px" />
          </button>
          <button
            class="action-btn action-btn--delete"
            @click="confirmDelete(usuario)"
            title="Eliminar cuenta"
          >
            <q-icon name="delete" size="16px" />
          </button>
        </div>
        <!-- Badge "Tú" para el admin logueado -->
        <div class="usuario-card__actions" v-else>
          <span class="self-badge">Usuario actual</span>
        </div>

        <!-- Avatar -->
        <div class="usuario-card__avatar" :class="{ 'usuario-card__avatar--admin': esAdmin(usuario) }">
          {{ getInitials(usuario.nombre) }}
        </div>

        <!-- Info -->
        <h3 class="usuario-card__name">{{ usuario.nombre }}</h3>
        <p class="usuario-card__email">
          <q-icon name="email" size="12px" />
          {{ usuario.email }}
        </p>

        <!-- Detalles -->
        <div class="usuario-card__details">
          <div class="detail-item">
            <span class="detail-item__label">Nacimiento</span>
            <span class="detail-item__value">{{ formatDate(usuario.fechaNacimiento) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-item__label">Rol</span>
            <span class="detail-item__value" :class="{ 'text-orange': esAdmin(usuario) }">
              {{ formatearRol(usuario.rol) }}
            </span>
          </div>
        </div>

        <!-- Badge estado -->
        <span class="usuario-card__badge" :class="'badge--' + usuario.estado">
          {{ formatearEstado(usuario.estado) }}
        </span>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-if="!loading && filteredUsuarios.length === 0" class="no-results">
      <q-icon name="search_off" size="32px" color="#6a6a88" />
      <p>No se encontraron usuarios.</p>
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

    <!-- Dialog confirmar eliminación -->
    <q-dialog v-model="showDeleteDialog">
      <q-card class="delete-dialog" dark>
        <q-card-section>
          <h3 class="delete-dialog__title">Confirmar eliminación</h3>
          <p class="delete-dialog__text">
            ¿Eliminar a <strong>{{ userToDelete?.nombre }}</strong>?
            Esta acción no se puede revertir.
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey" v-close-popup />
          <q-btn
            flat
            label="Eliminar"
            color="negative"
            @click="executeDelete"
            :loading="deleting"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/store/auth.js";
import { getData, putData, deleteData } from "@/services/apiClient.js";
import { useNotifications } from "@/composables/useNotifications.js";

const authStore = useAuthStore();
const notify = useNotifications();

// Verificar si es el admin logueado
function isCurrentAdmin(usuario) {
  return usuario._id === authStore.usuario?.id || usuario._id === authStore.usuario?._id;
}

const usuarios = ref([]);
const loading = ref(true);
const searchQuery = ref("");
const filterEstado = ref("todos");
const currentPage = ref(1);
const perPage = 6;

const showDeleteDialog = ref(false);
const userToDelete = ref(null);
const deleting = ref(false);

const estadoOptions = [
  { label: "Todos", value: "todos" },
  { label: "Activos", value: "activo" },
  { label: "Inactivos", value: "inactivo" },
];

onMounted(async () => {
  await loadUsuarios();
});

async function loadUsuarios() {
  loading.value = true;
  try {
    const res = await getData("admin/usuarios");
    usuarios.value = res.usuarios || [];
  } catch (error) {
    notify.error("Error al cargar usuarios");
  } finally {
    loading.value = false;
  }
}

// Computed
const filteredUsuarios = computed(() => {
  let result = [...usuarios.value];

  if (filterEstado.value !== "todos") {
    result = result.filter((u) => u.estado === filterEstado.value);
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (u) =>
        (u.nombre && u.nombre.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query))
    );
  }

  return result;
});

const totalPages = computed(() => Math.ceil(filteredUsuarios.value.length / perPage));

const paginatedUsuarios = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  return filteredUsuarios.value.slice(start, start + perPage);
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

// Acciones
async function toggleRol(usuario) {
  const newRol = (usuario.rol === "administrador" || usuario.rol === "admin") ? "usuario" : "administrador";
  try {
    await putData(`admin/usuario/${usuario._id}/rol`, { rol: newRol });
    usuario.rol = newRol;
    notify.success(`Rol actualizado a ${newRol}`);
  } catch (error) {
    notify.error("Error al cambiar rol");
  }
}

function confirmDelete(usuario) {
  userToDelete.value = usuario;
  showDeleteDialog.value = true;
}

async function executeDelete() {
  if (!userToDelete.value) return;
  deleting.value = true;
  try {
    await deleteData(`admin/usuario/${userToDelete.value._id}`);
    usuarios.value = usuarios.value.filter((u) => u._id !== userToDelete.value._id);
    showDeleteDialog.value = false;
    notify.success("Usuario eliminado correctamente");
  } catch (error) {
    notify.error("Error al eliminar usuario");
  } finally {
    deleting.value = false;
  }
}
</script>

<style>
.admin-usuarios {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* Header */
.page-header {
  margin-bottom: 28px;
}

.page-header__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.page-header__icon {
  color: #7c3aed;
}

.page-header__desc {
  font-size: 0.85rem;
  color: #a0a0c0;
  margin: 4px 0 0 0;
}

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: rgba(18, 18, 32, 0.8);
  border: 1px solid #2a2a3a;
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.stat-card__label {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #6a6a88;
  margin-bottom: 8px;
}

.stat-card__value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
}

.stat-card__value--green {
  color: #22c55e;
}

.stat-card__value--orange {
  color: #e8842a;
}

/* Filtros */
.filters-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-search {
  flex: 1;
}

.filter-search :deep(.q-field__control) {
  background: #0a0a14;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
}

.filter-select {
  width: 160px;
}

.filter-select :deep(.q-field__control) {
  background: #0a0a14;
  border: 1px solid #2a2a3a;
  border-radius: 8px;
}

/* Grid usuarios */
.usuarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 18px;
}

.usuario-card {
  position: relative;
  padding: 24px;
  transition: all 0.2s;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
  background: rgba(18, 18, 32, 0.6);
}

.usuario-card:hover {
  border-color: #7c3aed;
  transform: translateY(-2px);
}

/* Acciones */
.usuario-card__actions {
  position: absolute;
  top: 16px;
  right: 16px;
  display: flex;
  gap: 6px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid #2a2a3a;
  background: #1a1a2a;
  color: #a0a0c0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn--edit:hover {
  background: rgba(124, 58, 237, 0.2);
  color: #7c3aed;
  border-color: #7c3aed;
}

.action-btn--delete:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.self-badge {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #e8842a;
  background: rgba(232, 132, 42, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(232, 132, 42, 0.2);
}

/* Avatar */
.usuario-card__avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #9d6cff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  margin-bottom: 14px;
  border: 2px solid #2a2a3a;
}

.usuario-card__avatar--admin {
  background: linear-gradient(135deg, #e8842a, #f59e0b);
  border-color: rgba(232, 132, 42, 0.4);
}

/* Info */
.usuario-card__name {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.usuario-card__email {
  font-size: 0.8rem;
  color: #a0a0c0;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Detalles */
.usuario-card__details {
  display: flex;
  gap: 28px;
  margin-bottom: 12px;
}

.detail-item__label {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #6a6a88;
  margin-bottom: 2px;
}

.detail-item__value {
  font-size: 0.82rem;
  color: #ffffff;
  font-weight: 500;
}

/* Badge */
.usuario-card__badge {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: capitalize;
  padding: 4px 12px;
  border-radius: 20px;
}

.badge--activo {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.badge--inactivo {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 28px;
}

.pagination__btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid #2a2a3a;
  background: #1a1a2a;
  color: #a0a0c0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  transition: all 0.2s;
}

.pagination__btn:hover:not(:disabled) {
  border-color: #7c3aed;
  color: #ffffff;
  background: #2a2a3a;
}

.pagination__btn--active {
  background: #7c3aed;
  border-color: #7c3aed;
  color: white;
}

.pagination__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Loading / No results */
.page-loading,
.no-results {
  text-align: center;
  padding: 60px;
  color: #6a6a88;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.page-loading p,
.no-results p {
  margin: 0;
  font-size: 0.9rem;
}

/* Delete Dialog */
.delete-dialog {
  background: #121220 !important;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
  min-width: 360px;
}

.delete-dialog__title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.delete-dialog__text {
  font-size: 0.85rem;
  color: #a0a0c0;
  margin: 0;
}

/* Responsive */
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

  .usuarios-grid {
    grid-template-columns: 1fr;
  }

  .delete-dialog {
    min-width: 300px;
  }
}
</style>
