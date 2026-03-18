<template>
  <div class="premium-dashboard">
    <!-- Bienvenida Premium -->
    <section class="premium-welcome">
      <div class="premium-welcome__badge">
        <q-icon name="workspace_premium" size="14px" />
        PLAN PREMIUM
      </div>
      <p class="premium-welcome__date">{{ currentDate }}</p>
      <h1 class="premium-welcome__title">
        Hola de nuevo,
        <span class="premium-welcome__name">{{ authStore.nombreUsuario }}.</span>
      </h1>
      <p class="premium-welcome__desc">
        Aquí encontrarás tus lecturas y análisis numerológico personalizado.
      </p>
    </section>

    <!-- Lectura Diaria -->
    <section class="daily-reading">
      <div class="section-header">
        <h2 class="section-header__title">
          <q-icon name="today" size="22px" />
          Lectura del Día
        </h2>
        <p class="section-header__desc">Tu predicción numerológica para hoy.</p>
      </div>

      <div v-if="!lecturaDiaria" class="daily-generate">
        <div class="daily-orb" @click="handleGenerarDiaria" :class="{ 'daily-orb--loading': generandoDiaria }">
          <div class="daily-orb__glow"></div>
          <div class="daily-orb__inner">
            <q-spinner-dots v-if="generandoDiaria" color="white" size="28px" />
            <q-icon v-else name="auto_awesome" size="32px" color="white" />
            <span class="daily-orb__text">{{ generandoDiaria ? 'GENERANDO...' : 'OBTENER LECTURA' }}</span>
            <span class="daily-orb__sub">DIARIA</span>
          </div>
        </div>
      </div>

      <div v-else class="glass-card daily-card" @click="openReading(lecturaDiaria)">
        <div class="daily-card__header">
          <div class="daily-card__badge">
            <q-icon name="today" size="14px" />
            Hoy
          </div>
          <span class="daily-card__date">{{ formatDate(lecturaDiaria.fecha_lectura) }}</span>
        </div>
        <p class="daily-card__preview">
          {{ lecturaDiaria.contenido?.substring(0, 180) }}...
        </p>
        <span class="daily-card__cta">Ver lectura completa →</span>
      </div>
    </section>

    <!-- Lectura Principal -->
    <section v-if="lecturaPrincipal" class="principal-section">
      <div class="section-header">
        <h2 class="section-header__title">
          <q-icon name="assignment" size="22px" />
          Análisis Principal
        </h2>
        <p class="section-header__desc">Tu estudio numerológico completo.</p>
      </div>

      <div class="glass-card principal-card" @click="openReading(lecturaPrincipal)">
        <div class="principal-card__header">
          <div class="principal-card__badge">
            <q-icon name="assignment" size="14px" />
            Completo
          </div>
        </div>
        <p class="principal-card__preview">
          {{ lecturaPrincipal.contenido?.substring(0, 140) }}...
        </p>
        <span class="principal-card__cta">Ver análisis completo →</span>
      </div>
    </section>

    <!-- Historial de Lecturas -->
    <section class="history-section">
      <div class="section-header">
        <h2 class="section-header__title">
          <q-icon name="history" size="22px" />
          Historial
        </h2>
        <p class="section-header__desc">Todas tus lecturas anteriores.</p>
      </div>

      <div v-if="loadingHistory" class="history-loading">
        <q-spinner-dots color="white" size="32px" />
        <span>Cargando historial...</span>
      </div>

      <div v-else-if="historial.length === 0" class="glass-card history-empty">
        <q-icon name="auto_stories" size="40px" class="history-empty__icon" />
        <p class="history-empty__text">No hay lecturas disponibles. Genera tu primera lectura diaria.</p>
      </div>

      <div v-else class="history-list">
        <div v-for="lectura in historial" :key="lectura._id" class="glass-card history-item"
          @click="openReading(lectura)">
          <div class="history-item__left">
            <div class="history-item__type"
              :class="lectura.tipo === 'principal' ? 'history-item__type--principal' : 'history-item__type--diaria'">
              <q-icon :name="lectura.tipo === 'principal' ? 'assignment' : 'today'" size="16px" />
            </div>
            <div class="history-item__info">
              <span class="history-item__badge">{{ lectura.tipo === 'principal' ? 'Análisis' : 'Diaria' }}</span>
              <span class="history-item__date">{{ formatDate(lectura.fecha_lectura) }}</span>
            </div>
          </div>

          <p class="history-item__preview">{{ lectura.contenido?.substring(0, 100) }}...</p>
          <q-icon name="chevron_right" size="18px" class="history-item__arrow" />
        </div>
      </div>
    </section>

    <!-- Perfil Rápido -->
    <section class="profile-section">
      <div class="glass-card profile-card">
        <h3 class="profile-card__title">
          <q-icon name="account_circle" size="20px" />
          Tu Cuenta
        </h3>

        <div class="profile-card__grid">
          <div class="profile-field">
            <span class="profile-field__label">Nombre</span>
            <span class="profile-field__value">{{ authStore.nombreUsuario }}</span>
          </div>
          <div class="profile-field">
            <span class="profile-field__label">Email</span>
            <span class="profile-field__value">{{ authStore.usuario?.email }}</span>
          </div>
          <div class="profile-field">
            <span class="profile-field__label">Plan</span>
            <span class="profile-field__value">
              <span class="status-dot status-dot--active"></span>
              Premium
            </span>
          </div>
          <div class="profile-field">
            <span class="profile-field__label">Lecturas</span>
            <span class="profile-field__value">{{ historial.length }}</span>
          </div>
        </div>

        <router-link to="/usuario/perfil" class="profile-card__edit">
          <q-icon name="edit" size="14px" />
          Configurar perfil
        </router-link>
      </div>
    </section>

    <!-- Modal Lectura -->
    <transition name="modal">
      <div v-if="selectedReading" class="reading-modal-overlay" @click.self="selectedReading = null">
        <div class="reading-modal">
          <button class="reading-modal__close" @click="selectedReading = null">
            <q-icon name="close" size="24px" />
          </button>

          <div class="reading-modal__header">
            <p class="reading-modal__badge">
              {{ selectedReading.tipo === 'principal' ? 'ANÁLISIS COMPLETO' : 'LECTURA DIARIA' }}
            </p>
            <h2 class="reading-modal__title">
              {{ selectedReading.tipo === 'principal' ? 'Resultado del Análisis' : 'Predicción del Día' }}
            </h2>
            <p class="reading-modal__subtitle">
              {{ formatDate(selectedReading.fecha_lectura) }}
            </p>
          </div>

          <div class="reading-modal__orb">
            <img src="@/assets/icono/logo.svg" alt="Logo" class="reading-modal__orb-icon" />
          </div>

          <div class="reading-modal__content" v-html="formatContent(selectedReading.contenido)"></div>

          <div class="reading-modal__footer">
            <button class="reading-modal__close-btn" @click="selectedReading = null">
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
    year: "numeric",
    month: "long",
    day: "numeric",
  }).replace(/^\w/, c => c.toUpperCase());
});

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-CO", {
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

// Cargar lecturas al montar
onMounted(async () => {
  const userId = authStore.usuario?.id || authStore.usuario?._id;
  if (!userId) return;

  try {
    const res = await getData(`lecturas/usuario/${userId}`);
    const lecturas = res.data || [];

    // Separar lecturas
    lecturaPrincipal.value = lecturas.find(l => l.tipo === "principal") || null;

    // Buscar lectura diaria de hoy
    const hoy = new Date().toDateString();
    const diariaHoy = lecturas.find(l =>
      l.tipo === "diaria" && new Date(l.fecha_lectura).toDateString() === hoy
    );
    lecturaDiaria.value = diariaHoy || null;

    // Historial completo
    historial.value = lecturas;
  } catch (error) {
    notify.error("Error al cargar tus lecturas");
  } finally {
    loadingHistory.value = false;
  }
});

// Generar lectura diaria
async function handleGenerarDiaria() {
  if (generandoDiaria.value) return;

  const userId = authStore.usuario?.id || authStore.usuario?._id;
  if (!userId) return;

  generandoDiaria.value = true;

  try {
    const res = await postData(`lecturas/diaria/${userId}`);
    lecturaDiaria.value = res.data;
    // Agregar al historial en la primera posición
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

<style >
.premium-dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* Bienvenida Premium */
.premium-welcome {
  text-align: center;
  margin-bottom: 48px;
}

.premium-welcome__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #e8842a;
  background: rgba(232, 132, 42, 0.1);
  border: 1px solid rgba(232, 132, 42, 0.2);
  padding: 6px 16px;
  border-radius: 30px;
  margin-bottom: 16px;
}

.premium-welcome__date {
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 1px;
  color: #7c3aed;
  margin: 0 0 16px 0;
}

.premium-welcome__title {
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  margin: 0 0 16px 0;
}

.premium-welcome__name {
  display: block;
  color: #e8842a;
}

.premium-welcome__desc {
  font-size: 0.9rem;
  color: #a0a0c0;
  line-height: 1.6;
  max-width: 520px;
  margin: 0 auto;
}

/* Section Header */
.section-header {
  margin-bottom: 20px;
}

.section-header__title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.section-header__desc {
  font-size: 0.8rem;
  color: #a0a0c0;
  margin: 4px 0 0 0;
}

/* Daily Reading */
.daily-reading {
  margin-bottom: 48px;
}

.daily-generate {
  text-align: center;
}

.daily-orb {
  position: relative;
  width: 160px;
  height: 160px;
  margin: 0 auto;
  cursor: pointer;
}

.daily-orb__glow {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%);
  animation: pulse 3s ease infinite;
}

.daily-orb__inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #9d6cff);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: transform 0.2s;
  box-shadow: 0 8px 30px rgba(124, 58, 237, 0.4);
}

.daily-orb:hover .daily-orb__inner {
  transform: scale(1.05);
  box-shadow: 0 12px 40px rgba(124, 58, 237, 0.5);
}

.daily-orb--loading {
  pointer-events: none;
  opacity: 0.8;
}

.daily-orb__text {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: white;
  margin-top: 4px;
}

.daily-orb__sub {
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.7);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.6; }
}

/* Daily Card */
.daily-card {
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
}

.daily-card:hover {
  border-color: #7c3aed;
  transform: translateY(-2px);
}

.daily-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.daily-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.daily-card__date {
  font-size: 0.7rem;
  color: #6a6a88;
}

.daily-card__preview {
  font-size: 0.85rem;
  color: #a0a0c0;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.daily-card__cta {
  font-size: 0.75rem;
  font-weight: 600;
  color: #7c3aed;
}

/* Principal Section */
.principal-section {
  margin-bottom: 48px;
}

.principal-card {
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
}

.principal-card:hover {
  border-color: #e8842a;
  transform: translateY(-2px);
}

.principal-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #e8842a;
  background: rgba(232, 132, 42, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}

.principal-card__preview {
  font-size: 0.85rem;
  color: #a0a0c0;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.principal-card__cta {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e8842a;
}

/* History */
.history-section {
  margin-bottom: 48px;
}

.history-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  color: #6a6a88;
}

.history-empty {
  text-align: center;
  padding: 40px;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
}

.history-empty__icon {
  color: #6a6a88;
  opacity: 0.4;
  margin-bottom: 12px;
}

.history-empty__text {
  font-size: 0.85rem;
  color: #a0a0c0;
  margin: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
}

.history-item:hover {
  border-color: #7c3aed;
  transform: translateX(4px);
}

.history-item__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.history-item__type {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-item__type--principal {
  background: rgba(232, 132, 42, 0.1);
  color: #e8842a;
  border: 1px solid rgba(232, 132, 42, 0.2);
}

.history-item__type--diaria {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.2);
}

.history-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.history-item__badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
}

.history-item__date {
  font-size: 0.7rem;
  color: #6a6a88;
}

.history-item__preview {
  flex: 1;
  font-size: 0.8rem;
  color: #a0a0c0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-item__arrow {
  color: #6a6a88;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.history-item:hover .history-item__arrow {
  transform: translateX(4px);
  color: #7c3aed;
}

/* Profile */
.profile-section {
  margin-bottom: 24px;
}

.profile-card {
  padding: 28px;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
}

.profile-card__title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px 0;
}

.profile-card__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-bottom: 20px;
}

.profile-field__label {
  display: block;
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #6a6a88;
  margin-bottom: 4px;
}

.profile-field__value {
  font-size: 0.85rem;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 6px;
}

.profile-card__edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #e8842a;
  text-decoration: none;
}

/* Reading Modal */
.reading-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 500;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: 40px 20px;
}

.reading-modal {
  position: relative;
  width: 100%;
  max-width: 720px;
  background: #121220;
  border: 1px solid #2a2a3a;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.reading-modal__close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #2a2a3a;
  background: #1a1a2a;
  color: #a0a0c0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.reading-modal__close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-color: #ef4444;
}

.reading-modal__header {
  text-align: center;
  margin-bottom: 32px;
}

.reading-modal__badge {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #e8842a;
  margin: 0 0 12px 0;
}

.reading-modal__title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 10px 0;
}

.reading-modal__subtitle {
  font-size: 0.85rem;
  color: #a0a0c0;
}

.reading-modal__orb {
  width: 80px;
  height: 80px;
  margin: 0 auto 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reading-modal__orb-icon {
  width: 40px;
  height: 40px;
  filter: brightness(0.8) sepia(1) hue-rotate(220deg);
}

.reading-modal__content {
  font-size: 0.9rem;
  color: #a0a0c0;
  line-height: 1.8;
}

.reading-modal__footer {
  text-align: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #2a2a3a;
}

.reading-modal__close-btn {
  padding: 10px 30px;
  background: #1a1a2a;
  border: 1px solid #2a2a3a;
  border-radius: 30px;
  color: #a0a0c0;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reading-modal__close-btn:hover {
  background: #2a2a3a;
  color: #ffffff;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .reading-modal {
  transform: translateY(20px);
}

.modal-leave-to .reading-modal {
  transform: translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .premium-welcome__title {
    font-size: 1.8rem;
  }

  .profile-card__grid {
    grid-template-columns: 1fr;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .history-item__preview {
    white-space: normal;
  }

  .history-item__arrow {
    display: none;
  }

  .reading-modal {
    padding: 32px 20px;
  }

  .reading-modal__title {
    font-size: 1.5rem;
  }
}
</style>
