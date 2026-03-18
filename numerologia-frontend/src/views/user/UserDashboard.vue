<template>
  <div class="cosmic-user-dashboard">
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

    <!-- Bienvenida -->
    <section class="welcome-section">
      <div class="welcome-badge">
        <span class="badge-dot"></span>
        <span>{{ currentDate }}</span>
      </div>
      <h1 class="welcome-title">
        <span class="title-gradient">Bienvenido a tu espacio,</span>
        <span class="welcome-name">{{ authStore.nombreUsuario }}</span>
      </h1>
      <p class="welcome-desc">
        Aquí podrás gestionar tus lecturas y acceder a tu información personal.
      </p>
    </section>

    <!-- Botón Generar Lectura -->
    <section class="reading-section" v-if="!lecturaPrincipal">
      <div class="reading-orb" @click="handleGenerarLectura" :class="{ 'reading-orb--loading': generando }">
        <div class="reading-orb__aura"></div>
        <div class="reading-orb__inner">
          <span class="reading-orb__emoji" v-if="!generando">🔮</span>
          <q-spinner-dots v-else color="white" size="32px" />
          <span class="reading-orb__text">{{ generando ? 'PROCESANDO...' : 'GENERAR LECTURA' }}</span>
          <span class="reading-orb__sub">GRATUITA</span>
        </div>
      </div>

      <div class="reading-tags">
        <span class="reading-tag">✦ PERSONALIDAD</span>
        <span class="reading-tag-dot">•</span>
        <span class="reading-tag">✦ VOCACIÓN</span>
        <span class="reading-tag-dot">•</span>
        <span class="reading-tag">✦ RELACIONES</span>
      </div>
    </section>

    <!-- Lectura ya generada -->
    <section class="existing-reading" v-if="lecturaPrincipal && !showReadingModal">
      <div class="glass-card existing-reading__card" @click="showReadingModal = true">
        <div class="card-accent"></div>
        <div class="existing-reading__header">
          <div class="header-icon">
            <q-icon name="auto_awesome" size="20px" />
          </div>
          <span>Tu Lectura Principal</span>
        </div>
        <p class="existing-reading__preview">
          {{ lecturaPrincipal.contenido?.substring(0, 120) }}...
        </p>
        <div class="existing-reading__footer">
          <span class="existing-reading__cta">Ver lectura completa →</span>
        </div>
      </div>
    </section>

    <!-- Sección Lectura Diaria (bloqueada) -->
    <section class="daily-section">
      <div class="section-header">
        <h2 class="section-title">
          <span class="title-icon">🌙</span>
          Lectura Diaria
        </h2>
        <p class="section-desc">Actualizaciones diarias para tu perfil.</p>
      </div>

      <div class="glass-card daily-locked">
        <div class="daily-locked__blur">
          <div class="blur-line"></div>
          <div class="blur-line blur-line--short"></div>
          <div class="blur-line"></div>
        </div>

        <div class="daily-locked__overlay">
          <div class="lock-orb">
            <span class="lock-emoji">🔒</span>
          </div>
          <h3 class="lock-title">Contenido Exclusivo</h3>
          <p class="lock-desc">
            Accede a lecturas diarias, semanales y mensuales actualizadas según tu perfil numerológico.
          </p>
          <button class="premium-button" @click="handlePremiumClick">
            <span>Ver Planes Premium</span>
            <span class="button-arrow">→</span>
          </button>
          <p class="lock-price">Desde $9.99/mes</p>
        </div>
      </div>
    </section>

    <!-- Perfil del usuario -->
    <section class="profile-section">
      <div class="glass-card profile-card">
        <div class="profile-header">
          <h3 class="profile-title">
            <span class="title-icon">⚡</span>
            Tu Cuenta
          </h3>
          <div class="profile-badge" :class="isActive ? 'badge-premium' : 'badge-free'">
            <span class="badge-dot-small" :class="isActive ? 'dot-premium' : 'dot-free'"></span>
            {{ isActive ? 'Premium' : 'Gratuito' }}
          </div>
        </div>

        <div class="profile-grid">
          <div class="profile-field">
            <span class="field-label">Nombre</span>
            <span class="field-value">{{ authStore.nombreUsuario }}</span>
          </div>
          <div class="profile-field">
            <span class="field-label">Email</span>
            <span class="field-value">{{ authStore.usuario?.email }}</span>
          </div>
          <div class="profile-field">
            <span class="field-label">Registro</span>
            <span class="field-value">{{ memberSince }}</span>
          </div>
          <div class="profile-field">
            <span class="field-label">Energía</span>
            <span class="field-value">
              <span class="energy-dots">
                <span class="energy-dot" :class="{ 'energy-dot--active': isActive }"></span>
                <span class="energy-dot" :class="{ 'energy-dot--active': isActive }"></span>
                <span class="energy-dot" :class="{ 'energy-dot--active': isActive }"></span>
                <span class="energy-dot" :class="{ 'energy-dot--active': isActive }"></span>
              </span>
            </span>
          </div>
        </div>

        <router-link to="/usuario/perfil" class="profile-edit">
          <q-icon name="edit" size="14px" />
          Configurar Perfil
          <span class="edit-arrow">→</span>
        </router-link>
      </div>
    </section>

    <!-- Modal Lectura -->
    <transition name="modal-fade">
      <div v-if="showReadingModal" class="modal-overlay" @click.self="showReadingModal = false">
        <div class="modal-content">
          <button class="modal-close" @click="showReadingModal = false">
            <span>×</span>
          </button>

          <div class="modal-header">
            <div class="modal-badge">LECTURA PRINCIPAL</div>
            <h2 class="modal-title">Tu Mapa Numerológico</h2>
            <p class="modal-date">{{ formatDate(lecturaPrincipal?.fecha_lectura) }}</p>
          </div>

          <div class="modal-orb">
            <span class="modal-emoji">🔮</span>
          </div>

          <div class="modal-body" v-html="formattedReading"></div>

          <div class="modal-footer">
            <button class="modal-button" @click="showReadingModal = false">
              Cerrar
            </button>
            <button class="modal-button modal-button--regen" @click="handleRegenerarLectura" :disabled="regenerando">
              <span v-if="regenerando" class="button-spinner">
                <q-spinner-dots color="#b388ff" size="16px" />
              </span>
              <span v-else>Regenerar Lectura</span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.js";
import { getData, postData, deleteData } from "@/services/apiClient.js";
import { useNotifications } from "@/composables/useNotifications.js";

const router = useRouter();
const authStore = useAuthStore();
const notify = useNotifications();

const lecturaPrincipal = ref(null);
const generando = ref(false);
const regenerando = ref(false);
const showReadingModal = ref(false);

const isActive = computed(() => authStore.usuario?.estado === "activo");

const currentDate = computed(() => {
  return new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).replace(/^\w/, c => c.toUpperCase());
});

const memberSince = computed(() => {
  return new Date().toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
});

// Formatear contenido markdown a HTML
const formattedReading = computed(() => {
  if (!lecturaPrincipal.value?.contenido) return "";
  let text = lecturaPrincipal.value.contenido;

  text = text.replace(/\*\*(.+?)\*\*/g, '<strong class="reading-bold">$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  text = text.replace(/^### (.+)$/gm, '<h4 class="reading-h4">$1</h4>');
  text = text.replace(/^## (.+)$/gm, '<h3 class="reading-h3">$1</h3>');
  text = text.replace(/^# (.+)$/gm, '<h2 class="reading-h2">$1</h2>');
  text = text.replace(/\n\n/g, '</p><p>');
  text = text.replace(/\n/g, '<br>');
  text = `<p>${text}</p>`;

  return text;
});

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// Cargar lectura existente
onMounted(async () => {
  const userId = authStore.usuario?.id || authStore.usuario?._id;
  if (!userId) return;

  try {
    const res = await getData(`lecturas/usuario/${userId}`);
    const lecturas = res.data || [];
    const principal = lecturas.find(l => l.tipo === "principal");
    if (principal) {
      lecturaPrincipal.value = principal;
    }
  } catch (error) {
    console.error("Error al cargar lecturas:", error);
  }
});

// Generar lectura principal
async function handleGenerarLectura() {
  if (generando.value || lecturaPrincipal.value) return;

  const userId = authStore.usuario?.id || authStore.usuario?._id;
  if (!userId) return;

  generando.value = true;

  try {
    const res = await postData(`lecturas/principal/${userId}`);
    lecturaPrincipal.value = res.data;
    showReadingModal.value = true;
    notify.success("✦ Tu lectura ha sido revelada");
  } catch (error) {
    if (error.response?.status === 409) {
      try {
        const res = await getData(`lecturas/usuario/${userId}`);
        const lecturas = res.data || [];
        const principal = lecturas.find(l => l.tipo === "principal");
        if (principal) {
          lecturaPrincipal.value = principal;
          showReadingModal.value = true;
        }
      } catch (e) {
        notify.error("Ya tienes una lectura generada pero no pudimos cargarla.");
      }
    } else {
      notify.error(error.response?.data?.mensaje || error.response?.data?.error || "Error al generar la lectura. Intenta más tarde.");
    }
  } finally {
    generando.value = false;
  }
}

async function handleRegenerarLectura() {
  if (regenerando.value) return;
  const userId = authStore.usuario?.id || authStore.usuario?._id;
  if (!userId) return;

  regenerando.value = true;
  try {
    await deleteData(`lecturas/principal/${userId}`);
    lecturaPrincipal.value = null;
    showReadingModal.value = false;
    notify.success("Lectura eliminada. Genera una nueva.");
  } catch (error) {
    notify.error("Error al resetear la lectura. Intenta de nuevo.");
  } finally {
    regenerando.value = false;
  }
}

function handlePremiumClick() {
  router.push("/usuario/membresia");
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
  --color-premium: #ff9f4a;
  --color-premium-glow: rgba(255, 159, 74, 0.3);
  --color-success: #22c55e;
  --color-success-glow: rgba(34, 197, 94, 0.3);
  --color-text: #ffffff;
  --color-text-secondary: #a0a0c0;
  --border-radius: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cosmic-user-dashboard {
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
    radial-gradient(circle at 70% 30%, rgba(255, 159, 74, 0.1) 0%, transparent 50%);
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
  background: #ff9f4a;
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

/* Welcome section */
.welcome-section {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-badge {
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
  margin-bottom: 1.5rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  line-height: 1.2;
}

.title-gradient {
  background: linear-gradient(135deg, #fff, var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}

.welcome-name {
  display: block;
  background: linear-gradient(135deg, var(--color-premium), #ff6b4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2rem;
}

.welcome-desc {
  color: var(--color-text-secondary);
  font-size: 1rem;
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Reading orb */
.reading-section {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-bottom: 3rem;
}

.reading-orb {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 1.5rem;
  cursor: pointer;
}

.reading-orb__aura {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-premium-glow), transparent 70%);
  animation: pulse-aura 3s infinite;
}

.reading-orb__inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff9f4a, #ff6b4a);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  box-shadow: 0 10px 30px rgba(255, 159, 74, 0.4);
  transition: var(--transition);
}

.reading-orb:hover .reading-orb__inner {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(255, 159, 74, 0.6);
}

.reading-orb--loading {
  pointer-events: none;
  opacity: 0.8;
}

.reading-orb__emoji {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  animation: float-emoji 3s infinite;
}

.reading-orb__text {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: white;
}

.reading-orb__sub {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes pulse-aura {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.5; }
}

/* Reading tags */
.reading-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 1px;
  color: var(--color-text-secondary);
}

.reading-tag-dot {
  color: var(--color-primary);
  opacity: 0.4;
}

/* Existing reading card */
.existing-reading {
  position: relative;
  z-index: 2;
  margin-bottom: 3rem;
}

.existing-reading__card {
  position: relative;
  padding: 2rem;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: var(--transition);
  overflow: hidden;
}

.existing-reading__card:hover {
  border-color: var(--color-premium);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -12px var(--color-premium-glow);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, var(--color-premium), #ff6b4a);
}

.existing-reading__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 1rem;
}

.header-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 159, 74, 0.1);
  border: 1px solid rgba(255, 159, 74, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-premium);
}

.existing-reading__header span {
  color: var(--color-premium);
  font-weight: 600;
  font-size: 0.9rem;
}

.existing-reading__preview {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 1rem;
}

.existing-reading__cta {
  color: var(--color-premium);
  font-size: 0.8rem;
  font-weight: 600;
  transition: var(--transition);
}

.existing-reading__card:hover .existing-reading__cta {
  transform: translateX(4px);
  display: inline-block;
}

/* Daily section */
.daily-section {
  position: relative;
  z-index: 2;
  margin-bottom: 3rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem;
}

.title-icon {
  font-size: 1.5rem;
}

.section-desc {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  margin: 0;
}

/* Daily locked card */
.daily-locked {
  position: relative;
  padding: 3rem 2rem;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: var(--border-radius);
  overflow: hidden;
  text-align: center;
}

.daily-locked__blur {
  filter: blur(8px);
  opacity: 0.1;
  margin-bottom: 2rem;
}

.blur-line {
  height: 12px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  border-radius: 6px;
  margin: 0.5rem 0;
}

.blur-line--short {
  width: 60%;
  margin: 0.5rem auto;
}

.lock-orb {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(179, 136, 255, 0.1);
  border: 1px solid rgba(179, 136, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

.lock-emoji {
  font-size: 1.8rem;
  filter: drop-shadow(0 0 10px rgba(179, 136, 255, 0.5));
}

.lock-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
}

.lock-desc {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  max-width: 400px;
  margin: 0 auto 1.5rem;
}

.premium-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #ff9f4a, #ff6b4a);
  border: none;
  border-radius: 30px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 10px 20px -5px rgba(255, 159, 74, 0.4);
}

.premium-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(255, 159, 74, 0.6);
}

.button-arrow {
  transition: transform 0.2s;
}

.premium-button:hover .button-arrow {
  transform: translateX(4px);
}

.lock-price {
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  margin-top: 1rem;
}

/* Profile section */
.profile-section {
  position: relative;
  z-index: 2;
  margin-bottom: 2rem;
}

.profile-card {
  padding: 2rem;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: var(--border-radius);
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(179, 136, 255, 0.1);
}

.profile-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.profile-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 30px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.badge-premium {
  background: rgba(255, 159, 74, 0.1);
  border: 1px solid rgba(255, 159, 74, 0.3);
  color: var(--color-premium);
}

.badge-free {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-secondary);
}

.badge-dot-small {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-premium {
  background: var(--color-premium);
  box-shadow: 0 0 10px var(--color-premium);
}

.dot-free {
  background: var(--color-text-secondary);
}

.profile-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.profile-field {
  text-align: left;
}

.field-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.65rem;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.field-value {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
}

.energy-dots {
  display: flex;
  gap: 4px;
}

.energy-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transition: var(--transition);
}

.energy-dot--active {
  background: var(--color-premium);
  box-shadow: 0 0 10px var(--color-premium);
  animation: pulse 2s infinite;
}

.profile-edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: 30px;
  transition: var(--transition);
}

.profile-edit:hover {
  border-color: var(--color-primary);
  background: rgba(179, 136, 255, 0.05);
}

.edit-arrow {
  transition: transform 0.2s;
}

.profile-edit:hover .edit-arrow {
  transform: translateX(4px);
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
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  background: linear-gradient(145deg, #1a1a2a, #121220);
  border: 1px solid rgba(179, 136, 255, 0.3);
  border-radius: 32px;
  padding: 2.5rem;
  position: relative;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
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
  background: rgba(255, 107, 74, 0.1);
  color: #ff6b4a;
  border-color: #ff6b4a;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-badge {
  display: inline-block;
  padding: 0.25rem 1rem;
  background: rgba(255, 159, 74, 0.1);
  border: 1px solid rgba(255, 159, 74, 0.3);
  border-radius: 30px;
  color: var(--color-premium);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #fff, var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modal-date {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.modal-orb {
  width: 80px;
  height: 80px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(179, 136, 255, 0.2), transparent 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-orb 3s infinite;
}

.modal-emoji {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 20px rgba(179, 136, 255, 0.5));
}

.modal-body {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.8;
  max-width: 550px;
  margin: 0 auto;
}

.modal-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(179, 136, 255, 0.1);
}

.modal-button {
  padding: 0.75rem 2rem;
  border-radius: 30px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  background: rgba(179, 136, 255, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(179, 136, 255, 0.2);
}

.modal-button:hover {
  background: rgba(179, 136, 255, 0.2);
  border-color: var(--color-primary);
}

.modal-button--regen {
  background: rgba(255, 107, 74, 0.1);
  color: #ff6b4a;
  border-color: rgba(255, 107, 74, 0.3);
}

.modal-button--regen:hover {
  background: rgba(255, 107, 74, 0.2);
  border-color: #ff6b4a;
}

.button-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
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

/* Reading content styles */
.reading-bold {
  color: var(--color-premium);
  font-weight: 700;
}

.reading-h2 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 2rem 0 0.75rem;
}

.reading-h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-premium);
  margin: 1.5rem 0 0.5rem;
}

.reading-h4 {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin: 1rem 0 0.25rem;
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

@keyframes pulse-orb {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes float-emoji {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(5deg); }
  75% { transform: translateY(5px) rotate(-5deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .cosmic-user-dashboard {
    padding: 1rem;
  }

  .welcome-title {
    font-size: 2rem;
  }

  .welcome-name {
    font-size: 1.6rem;
  }

  .reading-orb {
    width: 150px;
    height: 150px;
  }

  .profile-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .modal-footer {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.6rem;
  }

  .welcome-name {
    font-size: 1.3rem;
  }

  .reading-tags {
    flex-direction: column;
    gap: 0.25rem;
  }

  .reading-tag-dot {
    display: none;
  }

  .daily-locked {
    padding: 2rem 1rem;
  }

  .lock-title {
    font-size: 1.1rem;
  }
}
</style>