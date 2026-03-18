<template>
  <div class="admin-dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-badge">
        <q-icon name="verified" size="18px" />
        <span>Admin</span>
      </div>
      <h1 class="dashboard-header__title">
        Panel de Administración
      </h1>
      <p class="dashboard-header__desc">
        Gestiona usuarios, pagos y contenido de la plataforma.
      </p>
    </div>

    <!-- Cards de acceso rápido -->
    <div class="dashboard-cards">
      <router-link to="/admin/pagos" class="dashboard-card">
        <div class="dashboard-card__icon dashboard-card__icon--pagos">
          <q-icon name="payments" size="28px" />
        </div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">Pagos</h3>
          <p class="dashboard-card__desc">Historial de transacciones</p>
        </div>
        <q-icon name="arrow_forward" size="18px" class="dashboard-card__arrow" />
      </router-link>

      <router-link to="/admin/usuarios" class="dashboard-card">
        <div class="dashboard-card__icon dashboard-card__icon--usuarios">
          <q-icon name="group" size="28px" />
        </div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">Usuarios</h3>
          <p class="dashboard-card__desc">Cuentas y perfiles</p>
        </div>
        <q-icon name="arrow_forward" size="18px" class="dashboard-card__arrow" />
      </router-link>
    </div>

    <!-- Stats footer -->
    <div class="dashboard-stats" v-if="stats">
      <div class="dashboard-stat">
        <span class="dashboard-stat__value">{{ stats.usuarios?.total || 0 }}</span>
        <span class="dashboard-stat__label">Usuarios</span>
      </div>
      <div class="dashboard-stat">
        <span class="dashboard-stat__value">{{ stats.pagos?.total || 0 }}</span>
        <span class="dashboard-stat__label">Pagos</span>
      </div>
      <div class="dashboard-stat">
        <span class="dashboard-stat__value">${{ formatNumber(stats.pagos?.ingresoTotal || 0) }}</span>
        <span class="dashboard-stat__label">Ingresos</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="dashboard-loading">
      <q-spinner-dots color="#e8842a" size="36px" />
      <p>Cargando datos...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getData } from "@/services/apiClient.js";

const stats = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await getData("admin/dashboard");
    stats.value = res.estadisticas;
  } catch (error) {
    console.error("Error al cargar dashboard:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style >
.admin-dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px;
}

/* Header */
.dashboard-header {
  text-align: center;
  margin-bottom: 40px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(232, 132, 42, 0.1);
  border: 1px solid rgba(232, 132, 42, 0.2);
  border-radius: 30px;
  padding: 6px 16px;
  margin-bottom: 16px;
  color: #e8842a;
  font-size: 0.8rem;
  font-weight: 500;
}

.dashboard-header__title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.dashboard-header__desc {
  font-size: 0.9rem;
  color: #a0a0c0;
  max-width: 500px;
  margin: 0 auto;
}

/* Cards */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 40px;
}

.dashboard-card {
  background: #121220;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
  padding: 24px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.dashboard-card:hover {
  border-color: #7c3aed;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(124, 58, 237, 0.15);
}

.dashboard-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dashboard-card__icon--pagos {
  background: rgba(232, 132, 42, 0.1);
  color: #e8842a;
}

.dashboard-card__icon--usuarios {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
}

.dashboard-card__content {
  flex: 1;
}

.dashboard-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.dashboard-card__desc {
  font-size: 0.75rem;
  color: #a0a0c0;
  margin: 0;
  line-height: 1.4;
}

.dashboard-card__arrow {
  color: #6a6a88;
  transition: transform 0.2s;
}

.dashboard-card:hover .dashboard-card__arrow {
  transform: translateX(4px);
  color: #7c3aed;
}

/* Stats */
.dashboard-stats {
  display: flex;
  justify-content: space-between;
  background: #121220;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
  padding: 24px 32px;
  margin-top: 20px;
}

.dashboard-stat {
  text-align: center;
  flex: 1;
}

.dashboard-stat__value {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
}

.dashboard-stat__label {
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #e8842a;
  margin-top: 4px;
}

/* Loading */
.dashboard-loading {
  text-align: center;
  padding: 60px;
  color: #6a6a88;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.dashboard-loading p {
  margin: 0;
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 640px) {
  .dashboard-cards {
    grid-template-columns: 1fr;
  }

  .dashboard-stats {
    flex-direction: column;
    gap: 20px;
    padding: 20px;
  }

  .dashboard-header__title {
    font-size: 1.8rem;
  }
}
</style>
