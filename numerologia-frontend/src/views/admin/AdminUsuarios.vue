<template>
  <div class="cosmic-usuarios">
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
        <span class="title-gradient">Usuarios Registrados</span>
        <span class="title-emoji">👥</span>
      </h1>
      <p class="page-header__desc">Lista de almas conectadas al sistema.</p>
    </div>

    <!-- Stats cósmicas -->
    <div class="stats-grid">
      <div class="stat-card stat-card--total">
        <div class="stat-card__glow"></div>
        <div class="stat-card__content">
          <span class="stat-card__label">Total almas</span>
          <span class="stat-card__value">{{ usuarios.length }}</span>
          <span class="stat-card__trend">✦ conectadas</span>
        </div>
      </div>

      <div class="stat-card stat-card--activos">
        <div class="stat-card__glow"></div>
        <div class="stat-card__content">
          <span class="stat-card__label">Almas activas</span>
          <span class="stat-card__value">{{ usuarios.filter(u => u.estado === 'activo').length }}</span>
          <span class="stat-card__trend">✨ energía positiva</span>
        </div>
      </div>

      <div class="stat-card stat-card--admins">
        <div class="stat-card__glow"></div>
        <div class="stat-card__content">
          <span class="stat-card__label">Administradores</span>
          <span class="stat-card__value">{{ usuarios.filter(u => u.rol === 'administrador' || u.rol === 'admin').length }}</span>
          <span class="stat-card__trend">⚡ guías</span>
        </div>
      </div>
    </div>

    <!-- Filtros mejorados -->
    <div class="filters-section">
      <div class="search-wrapper">
        <q-input
          v-model="searchQuery"
          placeholder="Buscar por nombre o email..."
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
      <p>Cargando almas conectadas...</p>
    </div>

    <!-- Grid de usuarios -->
    <div v-else class="usuarios-grid">
      <div
        v-for="usuario in paginatedUsuarios"
        :key="usuario._id"
        class="usuario-card glass-card"
        :class="{ 'usuario-card--admin': esAdmin(usuario) }"
      >
        <!-- Acciones -->
        <div class="usuario-card__actions" v-if="!isCurrentAdmin(usuario)">
          <button
            class="action-btn action-btn--edit"
            @click="toggleRol(usuario)"
            :title="esAdmin(usuario) ? 'Cambiar a usuario' : 'Elevar a admin'"
          >
            <q-icon name="admin_panel_settings" size="16px" />
          </button>
          <button
            class="action-btn action-btn--delete"
            @click="confirmDelete(usuario)"
            title="Liberar alma"
          >
            <q-icon name="delete" size="16px" />
          </button>
        </div>
        <div class="usuario-card__actions" v-else>
          <span class="self-badge">
            <span class="badge-dot-small"></span>
            Tú
          </span>
        </div>

        <!-- Avatar cósmico -->
        <div class="usuario-avatar" :class="{ 'usuario-avatar--admin': esAdmin(usuario) }">
          <div class="avatar-aura"></div>
          <div class="avatar-circle">
            {{ getInitials(usuario.nombre) }}
          </div>
        </div>

        <!-- Info -->
        <h3 class="usuario-name">{{ usuario.nombre }}</h3>
        <p class="usuario-email">
          <q-icon name="email" size="12px" class="email-icon" />
          {{ usuario.email }}
        </p>

        <!-- Detalles cósmicos -->
        <div class="usuario-details">
          <div class="detail-item">
            <span class="detail-label">Llegada</span>
            <span class="detail-value">{{ formatDate(usuario.fechaNacimiento) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Rol</span>
            <span class="detail-value" :class="{ 'role-admin': esAdmin(usuario) }">
              {{ formatearRol(usuario.rol) }}
            </span>
          </div>
        </div>

        <!-- Badge estado con energía -->
        <span class="usuario-badge" :class="'badge--' + usuario.estado">
          <span class="badge-dot-energy" :class="'dot--' + usuario.estado"></span>
          {{ formatearEstado(usuario.estado) }}
        </span>
      </div>
    </div>

    <!-- Sin resultados -->
    <div v-if="!loading && filteredUsuarios.length === 0" class="no-results">
      <div class="no-results__orb">
        <span class="no-results__emoji">🌙</span>
      </div>
      <p>No se encontraron almas en esta dimensión.</p>
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

    <!-- Dialog confirmar eliminación -->
    <q-dialog v-model="showDeleteDialog">
      <q-card class="delete-dialog" dark>
        <div class="delete-dialog__orb">
          <span class="delete-dialog__emoji">⚠️</span>
        </div>
        
        <q-card-section class="delete-dialog__content">
          <h3 class="delete-dialog__title">Liberar alma</h3>
          <p class="delete-dialog__text">
            ¿Estás seguro de liberar a <strong>{{ userToDelete?.nombre }}</strong>?
            Esta acción es irreversible y su energía se perderá.
          </p>
        </q-card-section>
        
        <q-card-actions align="center" class="delete-dialog__actions">
          <button class="dialog-btn dialog-btn--cancel" v-close-popup>
            Cancelar
          </button>
          <button 
            class="dialog-btn dialog-btn--delete" 
            @click="executeDelete"
            :disabled="deleting"
          >
            <span v-if="deleting" class="btn-spinner">
              <q-spinner-dots color="white" size="16px" />
            </span>
            <span v-else>Liberar alma</span>
          </button>
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

function esAdmin(usuario) {
  return usuario.rol === "administrador" || usuario.rol === "admin";
}

function formatearRol(rol) {
  if (rol === "administrador" || rol === "admin") return "Guía";
  return "Alma";
}

function formatearEstado(estado) {
  return estado === "activo" ? "Activa" : "Inactiva";
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
  { label: "Todas las almas", value: "todos" },
  { label: "Activas", value: "activo" },
  { label: "Inactivas", value: "inactivo" },
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
    notify.error("Error al cargar almas");
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
  const newRol = esAdmin(usuario) ? "usuario" : "administrador";
  try {
    await putData(`admin/usuario/${usuario._id}/rol`, { rol: newRol });
    usuario.rol = newRol;
    notify.success(`Rol actualizado a ${newRol === "administrador" ? "Guía" : "Alma"}`);
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
    notify.success("Alma liberada correctamente");
  } catch (error) {
    notify.error("Error al liberar alma");
  } finally {
    deleting.value = false;
  }
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
  --color-admin: #ff9f4a;
  --color-admin-glow: rgba(255, 159, 74, 0.3);
  --color-text: #ffffff;
  --color-text-secondary: #a0a0c0;
  --border-radius: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cosmic-usuarios {
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

.stat-card--activos {
  background: linear-gradient(145deg, #1a1f2a, #13161f);
}

.stat-card--admins {
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

/* Grid de usuarios */
.usuarios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 2;
}

.usuario-card {
  position: relative;
  padding: 2rem 1.5rem;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: var(--border-radius);
  transition: var(--transition);
  overflow: hidden;
}

.usuario-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: 0 20px 40px -12px var(--color-primary-glow);
}

.usuario-card--admin:hover {
  border-color: var(--color-admin);
  box-shadow: 0 20px 40px -12px var(--color-admin-glow);
}

/* Acciones */
.usuario-card__actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 3;
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
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

.action-btn--edit:hover {
  background: rgba(179, 136, 255, 0.2);
  color: var(--color-primary);
  border-color: var(--color-primary);
  transform: scale(1.1);
}

.action-btn--delete:hover {
  background: rgba(255, 107, 74, 0.2);
  color: var(--color-danger);
  border-color: var(--color-danger);
  transform: scale(1.1);
}

.self-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-admin);
  background: rgba(255, 159, 74, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid rgba(255, 159, 74, 0.3);
}

.badge-dot-small {
  width: 6px;
  height: 6px;
  background: var(--color-admin);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* Avatar cósmico */
.usuario-avatar {
  position: relative;
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
}

.avatar-aura {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-primary-glow), transparent 70%);
  animation: pulse 3s infinite;
}

.usuario-avatar--admin .avatar-aura {
  background: radial-gradient(circle, var(--color-admin-glow), transparent 70%);
}

.avatar-circle {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c4dff, #b388ff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 20px rgba(124, 77, 255, 0.5);
}

.usuario-avatar--admin .avatar-circle {
  background: linear-gradient(135deg, #ff9f4a, #ff6b4a);
  box-shadow: 0 0 20px rgba(255, 159, 74, 0.5);
}

/* Info usuario */
.usuario-name {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem;
}

.usuario-email {
  text-align: center;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.email-icon {
  color: var(--color-primary);
}

/* Detalles */
.usuario-details {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(179, 136, 255, 0.1);
}

.detail-item {
  text-align: center;
}

.detail-label {
  display: block;
  font-size: 0.6rem;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.detail-value {
  font-size: 0.85rem;
  color: white;
  font-weight: 500;
}

.role-admin {
  color: var(--color-admin) !important;
  font-weight: 700;
}

/* Badge estado */
.usuario-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 0.5rem;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: rgba(0, 0, 0, 0.2);
}

.badge--activo {
  color: var(--color-success);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.badge--inactivo {
  color: var(--color-danger);
  border: 1px solid rgba(255, 107, 74, 0.3);
}

.badge-dot-energy {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot--activo {
  background: var(--color-success);
  box-shadow: 0 0 10px var(--color-success);
  animation: pulse 2s infinite;
}

.dot--inactivo {
  background: var(--color-danger);
  box-shadow: 0 0 10px var(--color-danger);
}

/* No results */
.no-results {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 4rem;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: var(--border-radius);
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

/* Delete Dialog */
.delete-dialog {
  background: linear-gradient(145deg, #1a1a2a, #121220) !important;
  border: 1px solid rgba(179, 136, 255, 0.3);
  border-radius: 24px;
  min-width: 360px;
  padding: 1.5rem;
  box-shadow: 0 30px 50px rgba(0, 0, 0, 0.6);
}

.delete-dialog__orb {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(255, 107, 74, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

.delete-dialog__emoji {
  font-size: 2rem;
  filter: drop-shadow(0 0 20px rgba(255, 107, 74, 0.5));
}

.delete-dialog__content {
  text-align: center;
  padding: 1rem 0;
}

.delete-dialog__title {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #fff, var(--color-danger));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.delete-dialog__text {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.delete-dialog__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding: 1rem 0 0;
}

.dialog-btn {
  min-width: 120px;
  padding: 0.75rem 1.5rem;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.dialog-btn--cancel {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-secondary);
  border: 1px solid rgba(179, 136, 255, 0.2);
}

.dialog-btn--cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: var(--color-primary);
}

.dialog-btn--delete {
  background: linear-gradient(135deg, #ff6b4a, #ff8a6b);
  color: white;
  box-shadow: 0 10px 20px -5px rgba(255, 107, 74, 0.4);
}

.dialog-btn--delete:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(255, 107, 74, 0.6);
}

.dialog-btn--delete:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* Responsive */
@media (max-width: 768px) {
  .cosmic-usuarios {
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

  .usuarios-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .delete-dialog {
    min-width: 300px;
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
</style>