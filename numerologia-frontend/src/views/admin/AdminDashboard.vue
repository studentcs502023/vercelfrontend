<template>
  <div class="cosmic-admin-dashboard">
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
    <div class="dashboard-header">
      <div class="header-badge">
        <span class="badge-dot"></span>
        <span>ADMINISTRADOR CÓSMICO</span>
      </div>
      <h1 class="dashboard-header__title">
        <span class="title-gradient">Panel de Control</span>
        <span class="title-emoji">⚡</span>
      </h1>
      <p class="dashboard-header__desc">
        Gestiona usuarios, pagos y la energía de la plataforma.
      </p>
    </div>

    <!-- Cards de acceso rápido -->
    <div class="dashboard-cards">
      <router-link to="/admin/pagos" class="dashboard-card dashboard-card--pagos">
        <div class="card-glow"></div>
        <div class="dashboard-card__icon">
          <q-icon name="payments" size="28px" />
        </div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">Pagos</h3>
          <p class="dashboard-card__desc">Flujo de transacciones</p>
        </div>
        <div class="dashboard-card__arrow">
          <q-icon name="arrow_forward" size="18px" />
        </div>
      </router-link>

      <router-link to="/admin/usuarios" class="dashboard-card dashboard-card--usuarios">
        <div class="card-glow"></div>
        <div class="dashboard-card__icon">
          <q-icon name="group" size="28px" />
        </div>
        <div class="dashboard-card__content">
          <h3 class="dashboard-card__title">Usuarios</h3>
          <p class="dashboard-card__desc">Almas registradas</p>
        </div>
        <div class="dashboard-card__arrow">
          <q-icon name="arrow_forward" size="18px" />
        </div>
      </router-link>
    </div>

    <!-- Stats cósmicas -->
    <div class="dashboard-stats" v-if="stats">
      <div class="stat-card stat-card--usuarios">
        <div class="stat-card__glow"></div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ stats.usuarios?.total || 0 }}</span>
          <span class="stat-card__label">Almas conectadas</span>
          <span class="stat-card__trend">✦ activas</span>
        </div>
      </div>

      <div class="stat-card stat-card--pagos">
        <div class="stat-card__glow"></div>
        <div class="stat-card__content">
          <span class="stat-card__value">{{ stats.pagos?.total || 0 }}</span>
          <span class="stat-card__label">Transacciones</span>
          <span class="stat-card__trend">📊 total</span>
        </div>
      </div>

      <div class="stat-card stat-card--ingresos">
        <div class="stat-card__glow"></div>
        <div class="stat-card__content">
          <span class="stat-card__value">${{ formatNumber(stats.pagos?.ingresoTotal || 0) }}</span>
          <span class="stat-card__label">Energía monetaria</span>
          <span class="stat-card__trend">💰 acumulado</span>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="cosmic-loading">
      <div class="loading-orb">
        <q-spinner-dots color="#b388ff" size="36px" />
      </div>
      <p>Sincronizando energía...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getData } from "@/services/apiClient.js";

const stats = ref(null);
const loading = ref(true);

const formatNumber = (num) => {
  return new Intl.NumberFormat('es-CO').format(num);
};

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

<style>
/* Variables de color - Misma paleta cósmica */
:root {
  --color-bg: #0a0a14;
  --color-surface: rgba(18, 18, 32, 0.8);
  --color-surface-hover: rgba(28, 28, 48, 0.9);
  --color-primary: #b388ff;
  --color-primary-glow: rgba(179, 136, 255, 0.3);
  --color-pagos: #ff6b4a;
  --color-pagos-glow: rgba(255, 107, 74, 0.3);
  --color-usuarios: #7c4dff;
  --color-usuarios-glow: rgba(124, 77, 255, 0.3);
  --color-ingresos: #22c55e;
  --color-ingresos-glow: rgba(34, 197, 94, 0.3);
  --color-text: #ffffff;
  --color-text-secondary: #a0a0c0;
  --border-radius: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cosmic-admin-dashboard {
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: var(--color-bg);
  position: relative;
  overflow-x: hidden;
  max-width: 1200px;
  margin: 0 auto;
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
.dashboard-header {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 3rem;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(179, 136, 255, 0.3);
  border-radius: 100px;
  color: var(--color-primary);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 2px;
  backdrop-filter: blur(8px);
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.dashboard-header__title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 0 0.75rem;
}

.title-gradient {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, var(--color-primary), #ff6b4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-emoji {
  font-size: 2.5rem;
  animation: float-emoji 3s infinite;
}

@keyframes float-emoji {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.dashboard-header__desc {
  color: var(--color-text-secondary);
  font-size: 1rem;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Cards de acceso rápido */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
  position: relative;
  z-index: 2;
}

.dashboard-card {
  position: relative;
  padding: 2rem;
  border-radius: var(--border-radius);
  text-decoration: none;
  transition: var(--transition);
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
}

.dashboard-card--pagos:hover {
  border-color: var(--color-pagos);
  box-shadow: 0 20px 40px -12px var(--color-pagos-glow);
}

.dashboard-card--usuarios:hover {
  border-color: var(--color-usuarios);
  box-shadow: 0 20px 40px -12px var(--color-usuarios-glow);
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, rgba(179, 136, 255, 0.2), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.dashboard-card:hover .card-glow {
  opacity: 1;
}

.dashboard-card__icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
  transition: transform 0.3s;
}

.dashboard-card--pagos .dashboard-card__icon {
  background: linear-gradient(135deg, #ff6b4a, #ff9f4a);
  color: white;
  box-shadow: 0 8px 20px rgba(255, 107, 74, 0.4);
}

.dashboard-card--usuarios .dashboard-card__icon {
  background: linear-gradient(135deg, #7c4dff, #b388ff);
  color: white;
  box-shadow: 0 8px 20px rgba(124, 77, 255, 0.4);
}

.dashboard-card:hover .dashboard-card__icon {
  transform: scale(1.1);
}

.dashboard-card__content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.dashboard-card__title {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem;
}

.dashboard-card__desc {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.dashboard-card__arrow {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(179, 136, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  transition: var(--transition);
  position: relative;
  z-index: 1;
}

.dashboard-card--pagos:hover .dashboard-card__arrow {
  background: rgba(255, 107, 74, 0.2);
  color: var(--color-pagos);
  transform: translateX(4px);
  border-color: var(--color-pagos);
}

.dashboard-card--usuarios:hover .dashboard-card__arrow {
  background: rgba(124, 77, 255, 0.2);
  color: var(--color-usuarios);
  transform: translateX(4px);
  border-color: var(--color-usuarios);
}

/* Stats cósmicas */
.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  position: relative;
  z-index: 2;
  margin-top: 2rem;
}

.stat-card {
  position: relative;
  padding: 2rem 1.5rem;
  border-radius: 20px;
  overflow: hidden;
  transition: var(--transition);
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
}

.stat-card--usuarios:hover {
  border-color: var(--color-usuarios);
  box-shadow: 0 20px 40px -12px var(--color-usuarios-glow);
}

.stat-card--pagos:hover {
  border-color: var(--color-pagos);
  box-shadow: 0 20px 40px -12px var(--color-pagos-glow);
}

.stat-card--ingresos:hover {
  border-color: var(--color-ingresos);
  box-shadow: 0 20px 40px -12px var(--color-ingresos-glow);
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
  text-align: center;
}

.stat-card__value {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-card--usuarios .stat-card__value {
  color: var(--color-usuarios);
  text-shadow: 0 0 20px rgba(124, 77, 255, 0.5);
}

.stat-card--pagos .stat-card__value {
  color: var(--color-pagos);
  text-shadow: 0 0 20px rgba(255, 107, 74, 0.5);
}

.stat-card--ingresos .stat-card__value {
  color: var(--color-ingresos);
  text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
}

.stat-card__label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
  letter-spacing: 0.5px;
}

.stat-card__trend {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
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
  margin-top: 2rem;
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

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* Responsive */
@media (max-width: 768px) {
  .cosmic-admin-dashboard {
    padding: 1rem;
  }

  .title-gradient {
    font-size: 2rem;
  }

  .title-emoji {
    font-size: 2rem;
  }

  .dashboard-cards {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .dashboard-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .dashboard-card {
    padding: 1.5rem;
  }

  .dashboard-card__title {
    font-size: 1.2rem;
  }

  .stat-card__value {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .title-gradient {
    font-size: 1.5rem;
  }

  .title-emoji {
    font-size: 1.5rem;
  }

  .dashboard-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .dashboard-card__content {
    text-align: center;
  }

  .dashboard-card__arrow {
    width: 100%;
  }
}
</style>