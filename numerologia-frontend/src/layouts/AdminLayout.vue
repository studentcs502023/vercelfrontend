<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-sidebar" :class="{ 'admin-sidebar--collapsed': sidebarCollapsed }">
      <!-- Logo -->
      <div class="sidebar-logo">
        <img src="@/assets/icono/logo.svg" alt="Logo" class="sidebar-logo__img" />
        <span v-if="!sidebarCollapsed" class="sidebar-logo__text">NUMEROLOGÍA</span>
      </div>

      <!-- Navegación -->
      <nav class="sidebar-nav">
        <router-link 
          to="/admin" 
          class="sidebar-nav__item"
          :class="{ active: $route.path === '/admin' }"
        >
          <q-icon name="space_dashboard" size="20px" />
          <span v-if="!sidebarCollapsed">Dashboard</span>
        </router-link>

        <router-link 
          to="/admin/usuarios" 
          class="sidebar-nav__item"
          :class="{ active: $route.path === '/admin/usuarios' }"
        >
          <q-icon name="group" size="20px" />
          <span v-if="!sidebarCollapsed">Usuarios</span>
        </router-link>

        <router-link 
          to="/admin/pagos" 
          class="sidebar-nav__item"
          :class="{ active: $route.path === '/admin/pagos' }"
        >
          <q-icon name="account_balance_wallet" size="20px" />
          <span v-if="!sidebarCollapsed">Pagos</span>
        </router-link>
      </nav>

      <!-- Usuario logueado -->
      <div class="sidebar-user">
        <div class="sidebar-user__avatar">
          {{ userInitials }}
        </div>
        <div v-if="!sidebarCollapsed" class="sidebar-user__info">
          <p class="sidebar-user__name">{{ authStore.nombreUsuario }}</p>
          <p class="sidebar-user__role">Administrador</p>
        </div>
      </div>
    </aside>

    <!-- Contenido principal -->
    <div class="admin-main">
      <!-- Header -->
      <header class="admin-header">
        <button class="admin-header__toggle" @click="sidebarCollapsed = !sidebarCollapsed">
          <q-icon :name="sidebarCollapsed ? 'grid_view' : 'view_sidebar'" size="22px" />
        </button>

        <div class="admin-header__right">
          <div class="admin-header__status">
            <span class="status-dot"></span>
            <span>Servidor: Online</span>
          </div>
          <button class="admin-header__logout" @click="handleLogout" title="Cerrar sesión">
            <q-icon name="power_settings_new" size="20px" />
          </button>
        </div>
      </header>

      <!-- Vista actual -->
      <main class="admin-content">
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="admin-footer">
        <span>Sistema V.1.0</span>
        <span>|</span>
        <span>© 2025 Numerología Mística</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.js";

const router = useRouter();
const authStore = useAuthStore();
const sidebarCollapsed = ref(false);

const userInitials = computed(() => {
  const nombre = authStore.nombreUsuario || "A";
  const parts = nombre.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
});

function handleLogout() {
  authStore.logout();
  router.push("/login");
}
</script>

<style>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(180deg, #050d34 0%, #081243 48%, #07103a 100%);
}

/* ═══════ SIDEBAR ═══════ */
.admin-sidebar {
  width: 220px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(8, 18, 66, 0.98) 0%, rgba(10, 14, 44, 0.98) 100%);
  border-right: 1px solid rgba(45, 74, 188, 0.28);
  padding: 24px 14px;
  transition: width 0.3s ease;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  box-shadow: 10px 0 30px rgba(0, 0, 0, 0.18);
}

.admin-sidebar--collapsed {
  width: 68px;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 3px;
  margin-bottom: 40px;
}

.sidebar-logo__img {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 0 8px rgba(242, 201, 76, 0.18));
}

.sidebar-logo__text {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  color: #f2c94c;
}

/* Navegación */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-nav__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 10px;
  color: rgba(225, 231, 255, 0.68);
  font-size: 0.84rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s ease;
}

.sidebar-nav__item:hover {
  background: rgba(47, 94, 234, 0.12);
  color: #ffffff;
}

.sidebar-nav__item.active {
  background: linear-gradient(135deg, rgba(47, 94, 234, 0.22), rgba(124, 58, 237, 0.12));
  color: #f2c94c;
  border-left: 3px solid #f2c94c;
  box-shadow: inset 0 0 0 1px rgba(242, 201, 76, 0.06);
}

/* Usuario logueado */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 6px;
  border-top: 1px solid rgba(45, 74, 188, 0.24);
  margin-top: 16px;
}

.sidebar-user__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2f5eea, #7c3aed);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 0 14px rgba(47, 94, 234, 0.18);
}

.sidebar-user__info {
  overflow: hidden;
}

.sidebar-user__name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #f5f7ff;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-user__role {
  font-size: 0.64rem;
  color: #f2c94c;
  margin: 2px 0 0 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* ═══════ MAIN ═══════ */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 220px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
}

.admin-sidebar--collapsed ~ .admin-main {
  margin-left: 68px;
}

/* Header */
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 28px;
  background: rgba(7, 16, 58, 0.72);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(45, 74, 188, 0.2);
  position: sticky;
  top: 0;
  z-index: 50;
}

.admin-header__toggle {
  background: none;
  border: none;
  color: rgba(225, 231, 255, 0.66);
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s;
}

.admin-header__toggle:hover {
  background: rgba(47, 94, 234, 0.12);
  color: #ffffff;
}

.admin-header__right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.admin-header__status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: rgba(225, 231, 255, 0.72);
  background: rgba(34, 197, 94, 0.08);
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid rgba(34, 197, 94, 0.18);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

.admin-header__logout {
  background: none;
  border: none;
  color: rgba(225, 231, 255, 0.42);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.admin-header__logout:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Contenido */
.admin-content {
  flex: 1;
  padding: 28px;
}

/* Footer */
.admin-footer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  font-size: 0.7rem;
  color: rgba(225, 231, 255, 0.34);
  border-top: 1px solid rgba(45, 74, 188, 0.12);
}

/* ═══════ RESPONSIVE ═══════ */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 68px;
  }

  .admin-main {
    margin-left: 68px;
  }

  .sidebar-logo__text,
  .sidebar-nav__item span,
  .sidebar-user__info {
    display: none;
  }

  .admin-content {
    padding: 20px 16px;
  }
}
</style>
