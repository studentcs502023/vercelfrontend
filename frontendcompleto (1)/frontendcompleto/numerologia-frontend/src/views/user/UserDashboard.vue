<template>
  <div class="user-dashboard">
    <!-- Bienvenida -->
    <section class="welcome-section">
      <p class="welcome-date">{{ currentDate }}</p>
      <h1 class="welcome-title">
        Bienvenido a tu espacio,
        <span class="welcome-name">{{ authStore.nombreUsuario }}.</span>
      </h1>
      <p class="welcome-desc">
        Aquí podrás gestionar tus lecturas y acceder a tu información personal.
      </p>
    </section>

    <!-- Botón Generar Lectura -->
<!-- Botón Generar Lectura -->
<section class="reading-section" v-if="!lecturaPrincipal">
  <button class="reading-button" @click="handleGenerarLectura" :disabled="generando">
    <span class="reading-button__text">{{ generando ? 'PROCESANDO...' : 'GENERAR LECTURA' }}</span>
    <span class="reading-button__sub">GRATUITA</span>
  </button>

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
        <div class="existing-reading__header">
          <q-icon name="auto_awesome" size="20px" class="existing-reading__icon" />
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
      <div class="daily-section__header">
        <h2 class="daily-section__title">
          <q-icon name="today" size="20px" />
          Lectura Diaria
        </h2>
        <p class="daily-section__desc">Actualizaciones diarias para tu perfil.</p>
      </div>

      <div class="glass-card daily-locked">
        <div class="daily-locked__blur">
          <div class="daily-locked__fake-text"></div>
          <div class="daily-locked__fake-text daily-locked__fake-text--short"></div>
          <div class="daily-locked__fake-text"></div>
        </div>

        <div class="daily-locked__overlay">
          <div class="daily-locked__lock">
            <q-icon name="lock" size="28px" />
          </div>
          <h3 class="daily-locked__title">Contenido Exclusivo</h3>
          <p class="daily-locked__desc">
            Accede a lecturas diarias, semanales y mensuales actualizadas según tu perfil numerológico.
          </p>
          <button class="premium-cta" @click="handlePremiumClick">
            Ver Planes Premium →
          </button>
          <p class="daily-locked__price">Desde $9.99/mes</p>
        </div>
      </div>
    </section>

    <!-- Perfil del usuario -->
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
              <span class="status-dot" :class="isActive ? 'status-dot--active' : 'status-dot--inactive'"></span>
              {{ isActive ? 'Premium' : 'Gratuito' }}
            </span>
          </div>
          <div class="profile-field">
            <span class="profile-field__label">Registro</span>
            <span class="profile-field__value">{{ memberSince }}</span>
          </div>
        </div>

        <router-link to="/usuario/perfil" class="profile-card__edit">
          <q-icon name="edit" size="14px" />
          Configurar Perfil
        </router-link>
      </div>
    </section>
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
  // Intentar usar fechaRegistro si existe, si no, usar fecha actual
  return new Date().toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });
});

// Formatear contenido markdown a HTML
const formattedReading = computed(() => {
  if (!lecturaPrincipal.value?.contenido) return "";
  let text = lecturaPrincipal.value.contenido;

  // Convertir markdown básico a HTML
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

<style >
.user-dashboard {
  max-width: 900px;
  margin: 0 auto;
}

/* ═══ Bienvenida ═══ */
.welcome-section {
  text-align: center;
  margin-bottom: 48px;
}

.welcome-date {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--orange-primary);
  margin: 0 0 16px 0;
}

.welcome-title {
  font-family: var(--font-heading);
  font-size: 2.6rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0 0 16px 0;
}

.welcome-name {
  display: block;
  color: var(--text-primary);
}

.welcome-desc {
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;
}

/* ═══ Reading Orb ═══ */
.reading-section {
  text-align: center;
  margin-bottom: 56px;
}

.reading-orb {
  position: relative;
  width: 180px;
  height: 180px;
  margin: 0 auto 24px;
  cursor: pointer;
}

.reading-orb__glow {
  position: absolute;
  inset: -20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232, 132, 42, 0.25) 0%, transparent 70%);
  animation: pulse-orb 3s ease-in-out infinite;
}

.reading-orb__inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--orange-primary), #f59e0b);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s ease;
  box-shadow: 0 8px 40px rgba(232, 132, 42, 0.35);
}

.reading-orb:hover .reading-orb__inner {
  transform: scale(1.05);
  box-shadow: 0 12px 50px rgba(232, 132, 42, 0.5);
}

.reading-orb--loading {
  pointer-events: none;
}

.reading-orb--loading .reading-orb__inner {
  opacity: 0.8;
}

.reading-orb__icon {
  width: 28px;
  height: 28px;
  color: white;
  margin-bottom: 4px;
}

.reading-orb__text {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: white;
}

.reading-orb__sub {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.7);
}

@keyframes pulse-orb {

  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }

  50% {
    transform: scale(1.15);
    opacity: 0.6;
  }
}

/* Tags */
.reading-tags {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.reading-tag-dot {
  color: var(--violet-accent);
  opacity: 0.4;
}

/* ═══ Existing reading card ═══ */
.existing-reading {
  margin-bottom: 48px;
}

.existing-reading__card {
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid var(--border-subtle);
}

.existing-reading__card:hover {
  border-color: var(--violet-accent);
  transform: translateY(-2px);
}

.existing-reading__header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--orange-primary);
  margin-bottom: 10px;
}

.existing-reading__icon {
  color: var(--orange-primary);
}

.existing-reading__preview {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.existing-reading__cta {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--violet-soft);
  letter-spacing: 0.03em;
}

.existing-reading__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.existing-reading__regen {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 5px 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.existing-reading__regen:hover:not(:disabled) {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.06);
}

.existing-reading__regen:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ═══ Daily Section (locked) ═══ */
.daily-section {
  margin-bottom: 48px;
}

.daily-section__header {
  margin-bottom: 16px;
}

.daily-section__title {
  font-family: var(--font-body);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

.daily-section__desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

.daily-locked {
  position: relative;
  padding: 48px 32px;
  overflow: hidden;
  text-align: center;
}

.daily-locked__blur {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  filter: blur(4px);
  opacity: 0.15;
}

.daily-locked__fake-text {
  height: 14px;
  background: linear-gradient(to right, var(--border-subtle), rgba(255, 255, 255, 0.08), var(--border-subtle));
  border-radius: 4px;
}

.daily-locked__fake-text--short {
  width: 60%;
  margin: 0 auto;
}

.daily-locked__overlay {
  position: relative;
}

.daily-locked__lock {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: var(--violet-soft);
}

.daily-locked__title {
  font-family: var(--font-body);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}

.daily-locked__desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.6;
  max-width: 450px;
  margin: 0 auto 24px;
}

.premium-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 14px 40px;
  background: linear-gradient(135deg, var(--orange-primary), #f59e0b);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 24px rgba(232, 132, 42, 0.3);
}

.premium-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 32px rgba(232, 132, 42, 0.45);
}

.daily-locked__price {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 12px 0 0 0;
}

/* ═══ Profile Section ═══ */
.profile-section {
  margin-bottom: 24px;
}

.profile-card {
  padding: 28px;
}

.profile-card__title {
  font-family: var(--font-body);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
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
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.profile-field__value {
  font-size: 0.88rem;
  color: var(--text-primary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.profile-card__edit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--orange-primary);
  text-decoration: none;
  transition: color 0.2s;
}

/* ═══ Reading Modal ═══ */
.reading-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5, 3, 18, 0.85);
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
  background:
    linear-gradient(135deg, rgba(124, 58, 237, 0.08) 0%, rgba(232, 132, 42, 0.04) 100%),
    var(--cosmic-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  padding: 48px 40px;
  box-shadow: 0 20px 80px rgba(0, 0, 0, 0.6);
}

.reading-modal__close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.reading-modal__close:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.reading-modal__header {
  text-align: center;
  margin-bottom: 32px;
}

.reading-modal__badge {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--orange-primary);
  margin: 0 0 12px 0;
}

.reading-modal__title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 10px 0;
}

.reading-modal__subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
  max-width: 480px;
  margin: 0 auto;
}

/* Orbe decorativo */
.reading-button {
  background: linear-gradient(135deg, #e8842a, #f59e0b);
  border: none;
  border-radius: 40px;
  padding: 16px 48px;
  margin: 0 auto 24px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(232, 132, 42, 0.3);
  transition: all 0.2s;
}

.reading-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 132, 42, 0.4);
}

.reading-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.reading-button__text {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 1px;
  color: white;
}

.reading-button__sub {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.8);
}

.reading-modal__content :deep(.reading-h2) {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--orange-primary);
  margin: 28px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(232, 132, 42, 0.15);
}

.reading-modal__content :deep(.reading-h3) {
  font-family: var(--font-body);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--violet-soft);
  margin: 24px 0 10px;
}

.reading-modal__content :deep(.reading-h4) {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 20px 0 8px;
}

.reading-modal__content :deep(.reading-bold) {
  color: var(--text-primary);
  font-weight: 700;
}

.reading-modal__content :deep(p) {
  margin: 0 0 12px;
}

/* Footer modal */
.reading-modal__footer {
  text-align: center;
  margin-top: 36px;
  padding-top: 24px;
  border-top: 1px solid var(--border-subtle);
}

.reading-modal__close-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 32px;
  background: rgba(124, 58, 237, 0.15);
  border: 1px solid rgba(124, 58, 237, 0.3);
  border-radius: 10px;
  color: var(--violet-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reading-modal__close-btn:hover {
  background: rgba(124, 58, 237, 0.25);
}

/* ═══ Error ═══ */
.dashboard-error {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 600;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.dashboard-error__close {
  background: none;
  border: none;
  color: #fca5a5;
  cursor: pointer;
  margin-left: 8px;
  font-size: 0.9rem;
}

/* ═══ Responsive ═══ */
@media (max-width: 768px) {
  .welcome-title {
    font-size: 1.8rem;
  }

  .reading-orb {
    width: 150px;
    height: 150px;
  }

  .profile-card__grid {
    grid-template-columns: 1fr;
  }

  .reading-modal {
    padding: 32px 20px;
  }

  .reading-modal__title {
    font-size: 1.5rem;
  }
}
</style>
