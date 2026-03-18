<template>
  <div class="premium-dashboard">
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

    <!-- Header con perfil -->
    <header class="dashboard-header">
      <div class="dashboard-header__top">
        <div class="dashboard-header__badge">
          <span class="badge-dot"></span>
          <span>PREMIUM</span>
        </div>
        <div class="dashboard-header__profile">
          <div class="profile-avatar">
            {{ authStore.nombreUsuario?.charAt(0) || 'U' }}
          </div>
        </div>
      </div>
      
      <div class="dashboard-header__welcome">
        <p class="welcome-greeting">Bienvenido de nuevo</p>
        <h1 class="welcome-title">
          {{ authStore.nombreUsuario }} 
          <span class="title-wave">✨</span>
        </h1>
        <p class="welcome-date">{{ currentDate }}</p>
      </div>
    </header>

    <!-- Tarjetas principales -->
    <div class="main-cards">
      <!-- Lectura Diaria -->
      <div v-if="!lecturaDiaria" class="daily-card create-card" @click="handleGenerarDiaria">
        <div class="card-glow"></div>
        <div class="card-content">
          <div class="card-icon-wrapper">
            <div class="card-icon" :class="{ 'card-icon--loading': generandoDiaria }">
              <q-spinner-dots v-if="generandoDiaria" color="#b388ff" size="32px" />
              <span v-else class="icon-emoji">✨</span>
            </div>
          </div>
          <h3 class="card-title">Lectura del Día</h3>
          <p class="card-desc">Descubre lo que los números tienen para ti hoy</p>
          <span class="card-badge">GRATIS</span>
        </div>
      </div>

      <div v-else class="daily-card active-card" @click="openReading(lecturaDiaria)">
        <div class="card-accent accent-daily"></div>
        <div class="card-content">
          <div class="card-header">
            <span class="card-label">Hoy</span>
            <span class="card-date">{{ formatDate(lecturaDiaria.fecha_lectura, 'short') }}</span>
          </div>
          <p class="card-preview">{{ lecturaDiaria.contenido?.substring(0, 100) }}...</p>
          <span class="card-link">Ver predicción →</span>
        </div>
      </div>

      <!-- Lectura Principal -->
      <div v-if="lecturaPrincipal" class="principal-card active-card" @click="openReading(lecturaPrincipal)">
        <div class="card-accent accent-principal"></div>
        <div class="card-content">
          <div class="card-header">
            <span class="card-label">Análisis Completo</span>
            <span class="card-date">{{ formatDate(lecturaPrincipal.fecha_lectura, 'short') }}</span>
          </div>
          <p class="card-preview">{{ lecturaPrincipal.contenido?.substring(0, 100) }}...</p>
          <span class="card-link">Ver análisis →</span>
        </div>
      </div>

      <!-- Stats rápidos -->
      <div class="stats-card">
        <div class="stat-item">
          <span class="stat-value">{{ historial.length }}</span>
          <span class="stat-label">Lecturas</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ authStore.usuario?.plan || 'Premium' }}</span>
          <span class="stat-label">Plan</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">✨</span>
          <span class="stat-label">Energía</span>
        </div>
      </div>
    </div>

    <!-- Historial de lecturas -->
    <section class="history-section">
      <div class="section-header">
        <h2 class="section-title">
          <span>Tu Viaje Cósmico</span>
          <span class="section-emoji">🌙</span>
        </h2>
        <p class="section-subtitle">Historial de lecturas y revelaciones</p>
      </div>

      <div v-if="loadingHistory" class="history-loading">
        <div class="loading-orb">
          <q-spinner-dots color="#b388ff" size="40px" />
        </div>
        <p>Cargando tus lecturas...</p>
      </div>

      <div v-else-if="historial.length === 0" class="history-empty">
        <div class="empty-illustration">
          <span class="empty-emoji">🔮</span>
        </div>
        <h3 class="empty-title">Aún no hay lecturas</h3>
        <p class="empty-desc">Genera tu primera lectura diaria para comenzar</p>
        <button class="empty-button" @click="handleGenerarDiaria">
          Comenzar ahora
        </button>
      </div>

      <div v-else class="history-timeline">
        <div v-for="(lectura, index) in historial" :key="lectura._id" 
             class="timeline-item" 
             :class="`timeline-item--${lectura.tipo}`"
             @click="openReading(lectura)">
          <div class="timeline-marker">
            <div class="marker-dot"></div>
            <div class="marker-line" v-if="index < historial.length - 1"></div>
          </div>
          <div class="timeline-card">
            <div class="timeline-header">
              <div class="timeline-type">
                <span class="type-icon">{{ lectura.tipo === 'principal' ? '📊' : '✨' }}</span>
                <span class="type-text">{{ lectura.tipo === 'principal' ? 'Análisis' : 'Diaria' }}</span>
              </div>
              <span class="timeline-date">{{ formatDate(lectura.fecha_lectura, 'full') }}</span>
            </div>
            <p class="timeline-preview">{{ lectura.contenido?.substring(0, 120) }}...</p>
            <span class="timeline-link">Continuar leyendo →</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal de lectura -->
    <transition name="modal-fade">
      <div v-if="selectedReading" class="modal-overlay" @click.self="selectedReading = null">
        <div class="modal-content" :class="`modal-content--${selectedReading.tipo}`">
          <button class="modal-close" @click="selectedReading = null">
            <span>×</span>
          </button>

          <div class="modal-header">
            <div class="modal-badge">
              {{ selectedReading.tipo === 'principal' ? 'Análisis Completo' : 'Lectura Diaria' }}
            </div>
            <h2 class="modal-title">
              {{ selectedReading.tipo === 'principal' ? 'Tu Mapa Numerológico' : 'La Energía del Día' }}
            </h2>
            <div class="modal-meta">
              <span class="modal-date">{{ formatDate(selectedReading.fecha_lectura, 'full') }}</span>
            </div>
          </div>

          <div class="modal-body">
            <div class="modal-orb">
              <div class="orb-inner">
                <span class="orb-emoji">🔮</span>
              </div>
            </div>
            <div class="modal-text" v-html="formatContent(selectedReading.contenido)"></div>
          </div>

          <div class="modal-footer">
            <button class="modal-button" @click="selectedReading = null">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/store/auth.js";
import { getData, postData } from "@/services/apiClient.js";
import { useNotifications } from "@/composables/useNotifications.js";

const authStore = useAuthStore();
const notify = useNotifications();

const lecturaPrincipal = ref(null);
const lecturaDiaria = ref(null);
const historial = ref([]);
const generandoDiaria = ref(false);
const loadingHistory = ref(true);
const selectedReading = ref(null);

const currentDate = computed(() => {
  return new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long"
  }).replace(/^\w/, c => c.toUpperCase());
});

function formatDate(dateStr, format = 'full') {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (format === 'short') {
    return date.toLocaleDateString("es-CO", { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).replace(/^\w/, c => c.toUpperCase());
}

function formatContent(text) {
  if (!text) return "";
  let html = text;
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="reading-bold">$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/^### (.+)$/gm, '<h4 class="reading-h4">$1</h4>');
  html = html.replace(/^## (.+)$/gm, '<h3 class="reading-h3">$1</h3>');
  html = html.replace(/^# (.+)$/gm, '<h2 class="reading-h2">$1</h2>');
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  html = `<p>${html}</p>`;
  return html;
}

function openReading(lectura) {
  selectedReading.value = lectura;
}

onMounted(async () => {
  const userId = authStore.usuario?.id || authStore.usuario?._id;
  if (!userId) return;

  try {
    const res = await getData(`lecturas/usuario/${userId}`);
    const lecturas = res.data || [];

    lecturaPrincipal.value = lecturas.find(l => l.tipo === "principal") || null;

    const hoy = new Date().toDateString();
    const diariaHoy = lecturas.find(l =>
      l.tipo === "diaria" && new Date(l.fecha_lectura).toDateString() === hoy
    );
    lecturaDiaria.value = diariaHoy || null;

    historial.value = lecturas.sort((a, b) => 
      new Date(b.fecha_lectura) - new Date(a.fecha_lectura)
    );
  } catch (error) {
    notify.error("Error al cargar tus lecturas");
  } finally {
    loadingHistory.value = false;
  }
});

async function handleGenerarDiaria() {
  if (generandoDiaria.value) return;

  const userId = authStore.usuario?.id || authStore.usuario?._id;
  if (!userId) return;

  generandoDiaria.value = true;

  try {
    const res = await postData(`lecturas/diaria/${userId}`);
    lecturaDiaria.value = res.data;
    historial.value.unshift(res.data);
    notify.success("Tu lectura diaria ha sido revelada");
    selectedReading.value = res.data;
  } catch (error) {
    if (error.response?.status === 409) {
      notify.warning("Ya generaste tu lectura diaria. Vuelve mañana.");
    } else {
      notify.error(
        error.response?.data?.error ||
        error.response?.data?.mensaje ||
        "Error al generar la lectura diaria"
      );
    }
  } finally {
    generandoDiaria.value = false;
  }
}
</script>

<style>
/* Variables y reset */
:root {
  --color-bg: #0a0a14;
  --color-surface: rgba(18, 18, 32, 0.6);
  --color-surface-hover: rgba(28, 28, 48, 0.8);
  --color-primary: #b388ff;
  --color-primary-glow: rgba(179, 136, 255, 0.3);
  --color-daily: #7c4dff;
  --color-principal: #ff6b4a;
  --color-text: #ffffff;
  --color-text-secondary: #a0a0c0;
  --border-radius: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.premium-dashboard {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
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
  background-image: radial-gradient(2px 2px at 20px 30px, #fff, rgba(0,0,0,0)),
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
  background: radial-gradient(circle at 30% 50%, rgba(179, 136, 255, 0.1) 0%, transparent 50%),
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
  padding: 2rem 2rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header__badge {
  display: flex;
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
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.profile-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #7c4dff, #b388ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: white;
  box-shadow: 0 4px 15px rgba(124, 77, 255, 0.3);
}

.dashboard-header__welcome {
  text-align: center;
}

.welcome-greeting {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.welcome-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #fff, #e0b0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-wave {
  animation: wave 2s infinite;
  display: inline-block;
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
}

.welcome-date {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

/* Main Cards */
.main-cards {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto 3rem;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Card base */
.active-card, .create-card, .stats-card {
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.1);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.active-card:hover, .create-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary);
  box-shadow: 0 20px 40px -12px var(--color-primary-glow);
  background: var(--color-surface-hover);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.accent-daily {
  background: linear-gradient(to bottom, #7c4dff, #b388ff);
}

.accent-principal {
  background: linear-gradient(to bottom, #ff6b4a, #ff9f4a);
}

.card-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 0%, var(--color-primary-glow), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.create-card:hover .card-glow {
  opacity: 1;
}

/* Create card */
.create-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: linear-gradient(145deg, rgba(124, 77, 255, 0.1), rgba(18, 18, 32, 0.8));
}

.card-icon-wrapper {
  margin-bottom: 1rem;
}

.card-icon {
  width: 80px;
  height: 80px;
  background: rgba(124, 77, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  border: 2px solid rgba(124, 77, 255, 0.3);
  transition: var(--transition);
}

.create-card:hover .card-icon {
  border-color: var(--color-primary);
  transform: scale(1.1);
  box-shadow: 0 0 30px var(--color-primary-glow);
}

.icon-emoji {
  font-size: 2.5rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.card-desc {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  margin: 0 0 1rem;
}

.card-badge {
  background: rgba(124, 77, 255, 0.2);
  color: var(--color-primary);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
}

/* Active card */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
}

.card-date {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.card-preview {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0 0 1rem;
}

.card-link {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-primary);
  transition: var(--transition);
}

.card-link:hover {
  gap: 8px;
}

/* Stats card */
.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: default;
  background: linear-gradient(145deg, rgba(18, 18, 32, 0.8), rgba(28, 28, 48, 0.8));
}

.stats-card:hover {
  transform: none;
  border-color: rgba(179, 136, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
}

/* History section */
.history-section {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
}

.section-header {
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.6rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: var(--color-text);
}

.section-emoji {
  font-size: 1.8rem;
  animation: spin 4s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.section-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  margin: 0;
}

/* Timeline */
.history-timeline {
  position: relative;
}

.timeline-item {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
}

.timeline-marker {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1.2rem;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 20px var(--color-primary);
  position: relative;
  z-index: 2;
}

.timeline-item--diaria .marker-dot {
  background: #7c4dff;
}

.timeline-item--principal .marker-dot {
  background: #ff6b4a;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: linear-gradient(to bottom, var(--color-primary), transparent);
  margin: 4px 0;
}

.timeline-card {
  flex: 1;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.1);
  border-radius: 20px;
  padding: 1.2rem;
  transition: var(--transition);
}

.timeline-card:hover {
  transform: translateX(8px);
  border-color: var(--color-primary);
  background: var(--color-surface-hover);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.timeline-type {
  display: flex;
  align-items: center;
  gap: 6px;
}

.type-icon {
  font-size: 1.1rem;
}

.type-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
}

.timeline-item--diaria .type-text {
  color: #7c4dff;
}

.timeline-item--principal .type-text {
  color: #ff6b4a;
}

.timeline-date {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.timeline-preview {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  line-height: 1.6;
  margin: 0 0 0.8rem;
}

.timeline-link {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-primary);
}

/* Empty state */
.history-empty {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--color-surface);
  border-radius: var(--border-radius);
  border: 1px solid rgba(179, 136, 255, 0.1);
  backdrop-filter: blur(12px);
}

.empty-illustration {
  margin-bottom: 1.5rem;
}

.empty-emoji {
  font-size: 4rem;
  animation: float 3s infinite;
}

.empty-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.empty-desc {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
}

.empty-button {
  background: linear-gradient(135deg, #7c4dff, #b388ff);
  border: none;
  padding: 12px 32px;
  border-radius: 30px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 8px 20px rgba(124, 77, 255, 0.3);
}

.empty-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(124, 77, 255, 0.4);
}

/* Loading */
.history-loading {
  text-align: center;
  padding: 4rem;
  background: var(--color-surface);
  border-radius: var(--border-radius);
  border: 1px solid rgba(179, 136, 255, 0.1);
  backdrop-filter: blur(12px);
}

.loading-orb {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(124, 77, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

.history-loading p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.modal-content {
  max-width: 800px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  background: linear-gradient(145deg, #121220, #1a1a2a);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: 32px;
  padding: 2.5rem;
  position: relative;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
}

.modal-content--diaria {
  border-top: 4px solid #7c4dff;
}

.modal-content--principal {
  border-top: 4px solid #ff6b4a;
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(179, 136, 255, 0.2);
  color: var(--color-text-secondary);
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: var(--color-primary);
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-badge {
  display: inline-block;
  padding: 4px 16px;
  background: rgba(179, 136, 255, 0.1);
  border-radius: 30px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #fff, #b388ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modal-date {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.modal-body {
  position: relative;
}

.modal-orb {
  position: absolute;
  top: -1rem;
  right: -1rem;
  width: 120px;
  height: 120px;
  pointer-events: none;
}

.orb-inner {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, rgba(179, 136, 255, 0.2), transparent 70%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-orb 3s infinite;
}

.orb-emoji {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 20px rgba(179, 136, 255, 0.5));
}

@keyframes pulse-orb {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.modal-text {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
}

.modal-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(179, 136, 255, 0.1);
}

.modal-button {
  padding: 10px 40px;
  background: rgba(179, 136, 255, 0.1);
  border: 1px solid rgba(179, 136, 255, 0.3);
  border-radius: 30px;
  color: var(--color-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: var(--transition);
}

.modal-button:hover {
  background: rgba(179, 136, 255, 0.2);
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

/* Modal transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.3s;
}

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content {
  transform: scale(0.9) translateY(20px);
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .main-cards {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }

  .history-section {
    padding: 0 1rem 2rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.8rem;
  }

  .modal-orb {
    width: 80px;
    height: 80px;
  }

  .orb-emoji {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.6rem;
  }

  .stats-card {
    flex-direction: column;
    gap: 1rem;
  }

  .stat-divider {
    width: 80%;
    height: 1px;
  }

  .timeline-item {
    gap: 0.8rem;
  }

  .modal-orb {
    position: relative;
    top: 0;
    right: 0;
    margin: 0 auto 1rem;
  }
}
</style>