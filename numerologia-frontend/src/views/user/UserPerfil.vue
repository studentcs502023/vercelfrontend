<template>
  <div class="cosmic-perfil">
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

    <!-- Header místico -->
    <header class="perfil-header">
      <div class="header-badge">
        <span class="badge-dot"></span>
        <span>PERFIL ENERGÉTICO</span>
      </div>
      <h1 class="header-title">
        <span class="title-gradient">Portal de Energía</span>
        <span class="title-emoji">⚡</span>
      </h1>
      <p class="header-desc">Refina tu esencia y eleva tu vibración</p>
    </header>

    <!-- Card principal -->
    <div class="glass-card perfil-card">
      <!-- Avatar cósmico -->
      <div class="perfil-avatar">
        <div class="avatar-container">
          <div class="avatar-aura"></div>
          <div class="avatar-circle">
            <span class="avatar-initials">{{ initials }}</span>
          </div>
        </div>
        <div class="avatar-info">
          <h2 class="avatar-name">{{ authStore.nombreUsuario }}</h2>
          <div class="avatar-badge" :class="isActive ? 'badge-premium' : 'badge-free'">
            <span class="badge-dot-small" :class="isActive ? 'dot-premium' : 'dot-free'"></span>
            {{ isActive ? 'Alma Premium' : 'Espíritu Libre' }}
          </div>
        </div>
      </div>

      <!-- Datos fijos -->
      <div class="fixed-data">
        <div class="data-item">
          <span class="data-label">ID Cósmico</span>
          <span class="data-value">#{{ authStore.usuario?.id?.slice(-6) || '000000' }}</span>
        </div>
        <div class="data-item">
          <span class="data-label">Miembro desde</span>
          <span class="data-value">{{ formatJoinDate }}</span>
        </div>
      </div>

      <!-- Formulario de alineación -->
      <q-form @submit.prevent="handleSave" class="perfil-form">
        <div class="form-grid">
          <CosmicInput
            v-model="nombre"
            icon="badge"
            label="Nombre Espiritual"
            type="text"
            placeholder="Cómo deseas brillar"
            :error="errors.nombre"
            @update:model-value="errors.nombre = ''"
          />

          <CosmicInput
            v-model="email"
            icon="mail"
            label="Correo Astral"
            type="email"
            placeholder="tu@universo.com"
            :error="errors.email"
            @update:model-value="errors.email = ''"
          />

          <CosmicInput
            v-model="fechaNacimiento"
            icon="calendar_month"
            label="Día de Llegada"
            type="date"
            :error="errors.fechaNacimiento"
            @update:model-value="errors.fechaNacimiento = ''"
          />
        </div>

        <!-- Acciones -->
        <div class="form-actions">
          <button type="submit" class="btn-save" :disabled="saving">
            <span v-if="saving" class="btn-spinner">
              <q-spinner-dots color="white" size="20px" />
            </span>
            <span v-else>✨ Actualizar energía</span>
          </button>
          
          <button type="button" class="btn-password" @click="handleChangePassword">
            <q-icon name="lock" size="16px" />
            Renovar clave
          </button>
        </div>
      </q-form>

      <!-- Barra de vibración -->
      <div class="vibration-section">
        <div class="vibration-header">
          <span class="vibration-label">Nivel de vibración</span>
          <span class="vibration-value">{{ energyLevel }}%</span>
        </div>
        <div class="vibration-track">
          <div class="vibration-fill" :style="{ width: energyLevel + '%' }">
            <div class="vibration-glow"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navegación estelar -->
    <nav class="perfil-nav">
      <router-link :to="isActive ? '/usuario/premium' : '/usuario'" class="nav-link nav-back">
        <q-icon name="chevron_left" size="18px" />
        Regresar al cosmos
      </router-link>
      
      <router-link to="/actividad" class="nav-link nav-activity">
        Ver historial estelar
        <q-icon name="chevron_right" size="18px" />
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/store/auth.js";
import { getData, putData } from "@/services/apiClient.js";
import { useNotifications } from "@/composables/useNotifications.js";
import CosmicInput from "@/components/Auth/CosmicInput.vue";

const authStore = useAuthStore();
const notify = useNotifications();

const nombre = ref("");
const email = ref("");
const fechaNacimiento = ref("");
const saving = ref(false);
const errors = ref({ nombre: "", email: "", fechaNacimiento: "" });

const isActive = computed(() => authStore.usuario?.estado === "activo");

const initials = computed(() => {
  const name = authStore.nombreUsuario;
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
});

const formatJoinDate = computed(() => {
  const fecha = authStore.usuario?.createdAt;
  if (!fecha) return "Recién llegado";
  return new Date(fecha).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric"
  }).replace(/^\w/, c => c.toUpperCase());
});

const energyLevel = computed(() => {
  // Nivel de energía basado en completitud del perfil
  let level = 50;
  if (nombre.value) level += 10;
  if (email.value) level += 10;
  if (fechaNacimiento.value) level += 15;
  if (isActive.value) level += 15;
  return Math.min(level, 100);
});

onMounted(async () => {
  nombre.value = authStore.nombreUsuario || "";
  email.value = authStore.usuario?.email || "";

  try {
    const res = await getData("usuarios/perfil");
    const perfil = res.usuario || res;
    if (perfil.fechaNacimiento) {
      fechaNacimiento.value = new Date(perfil.fechaNacimiento).toISOString().split("T")[0];
    }
    if (perfil.nombre) nombre.value = perfil.nombre;
    if (perfil.email) email.value = perfil.email;
  } catch (e) {
    const fecha = authStore.usuario?.fechaNacimiento;
    if (fecha) {
      fechaNacimiento.value = new Date(fecha).toISOString().split("T")[0];
    }
  }
});

async function handleSave() {
  errors.value = { nombre: "", email: "", fechaNacimiento: "" };

  if (!nombre.value.trim()) {
    errors.value.nombre = "El nombre es obligatorio";
    return;
  }
  if (!email.value.trim() || !/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = "Ingresa un correo válido";
    return;
  }
  if (!fechaNacimiento.value) {
    errors.value.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    return;
  }

  const userId = authStore.usuario?.id || authStore.usuario?._id;
  if (!userId) return;

  saving.value = true;
  try {
    await putData(`usuarios/${userId}`, {
      nombre: nombre.value.trim(),
      email: email.value.trim(),
      fechaNacimiento: fechaNacimiento.value,
    });

    authStore.setAuth({
      token: authStore.token,
      usuario: {
        ...authStore.usuario,
        nombre: nombre.value.trim(),
        email: email.value.trim(),
        fechaNacimiento: fechaNacimiento.value,
      },
    });

    notify.success("Perfil actualizado exitosamente ✦");
  } catch (error) {
    notify.error(error.response?.data?.msg || error.response?.data?.error || "Error al actualizar perfil");
  } finally {
    saving.value = false;
  }
}

function handleChangePassword() {
  notify.info("Funcionalidad en desarrollo");
}
</script>

<style>
/* Variables de color - Misma paleta que el dashboard */
:root {
  --color-bg: #0a0a14;
  --color-surface: rgba(18, 18, 32, 0.8);
  --color-surface-hover: rgba(28, 28, 48, 0.9);
  --color-primary: #b388ff;
  --color-primary-glow: rgba(179, 136, 255, 0.3);
  --color-daily: #7c4dff;
  --color-principal: #ff6b4a;
  --color-text: #ffffff;
  --color-text-secondary: #a0a0c0;
  --border-radius: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cosmic-perfil {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  position: relative;
  overflow-x: hidden;
  padding: 2rem 1.5rem;
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
.perfil-header {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto 2rem;
  text-align: center;
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

.header-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 0 0.5rem;
}

.title-gradient {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, #b388ff, #ff6b4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-emoji {
  font-size: 2.5rem;
  animation: spin 4s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.header-desc {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

/* Card principal */
.perfil-card {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto 2rem;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.1);
  border-radius: var(--border-radius);
  padding: 2rem;
  transition: var(--transition);
}

.perfil-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 20px 40px -12px var(--color-primary-glow);
  background: var(--color-surface-hover);
}

/* Avatar */
.perfil-avatar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(179, 136, 255, 0.1);
}

.avatar-container {
  position: relative;
  width: 90px;
  height: 90px;
}

.avatar-aura {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-primary-glow), transparent 70%);
  animation: pulse 3s infinite;
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
  border: 3px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 30px rgba(124, 77, 255, 0.5);
}

.avatar-initials {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.avatar-info {
  flex: 1;
}

.avatar-name {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #fff, #e0b0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.avatar-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.badge-premium {
  background: rgba(124, 77, 255, 0.15);
  border: 1px solid rgba(124, 77, 255, 0.3);
  color: #b388ff;
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
  background: #b388ff;
  box-shadow: 0 0 10px #b388ff;
}

.dot-free {
  background: var(--color-text-secondary);
}

/* Fixed data */
.fixed-data {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(179, 136, 255, 0.1);
}

.data-item {
  text-align: center;
}

.data-label {
  display: block;
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  letter-spacing: 1px;
}

.data-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-primary);
}

/* Form */
.perfil-form {
  margin-bottom: 2rem;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Estilos para inputs */
:deep(.cosmic-input-wrapper) {
  width: 100%;
}

:deep(.cosmic-input .q-field__control) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(179, 136, 255, 0.2) !important;
  border-radius: 16px !important;
  min-height: 54px !important;
  transition: var(--transition) !important;
}

:deep(.cosmic-input .q-field--focused .q-field__control) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 20px var(--color-primary-glow) !important;
  background: rgba(0, 0, 0, 0.4) !important;
}

:deep(.cosmic-input .q-field__native) {
  color: white !important;
  font-size: 0.95rem !important;
  padding: 0 1rem !important;
}

:deep(.cosmic-input .q-field__native::placeholder) {
  color: rgba(255, 255, 255, 0.3) !important;
}

:deep(.cosmic-input__label) {
  color: var(--color-primary) !important;
  font-size: 0.7rem !important;
  letter-spacing: 1px !important;
  margin-bottom: 0.5rem !important;
  display: block !important;
}

:deep(.cosmic-input__icon) {
  color: var(--color-primary) !important;
  font-size: 1.2rem !important;
}

/* Form actions */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-save {
  width: 100%;
  min-height: 54px;
  background: linear-gradient(135deg, #7c4dff, #b388ff);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 1px;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 10px 20px -5px rgba(124, 77, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(124, 77, 255, 0.6);
}

.btn-save:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-password {
  width: 100%;
  min-height: 44px;
  background: transparent;
  border: 1px solid rgba(179, 136, 255, 0.3);
  border-radius: 16px;
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-password:hover {
  background: rgba(179, 136, 255, 0.1);
  border-color: var(--color-primary);
}

.btn-spinner {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Vibration bar */
.vibration-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(179, 136, 255, 0.1);
}

.vibration-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.vibration-label {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  letter-spacing: 1px;
}

.vibration-value {
  color: var(--color-primary);
  font-weight: 700;
  font-size: 1.1rem;
}

.vibration-track {
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(179, 136, 255, 0.2);
}

.vibration-fill {
  height: 100%;
  background: linear-gradient(90deg, #7c4dff, #b388ff);
  border-radius: 4px;
  position: relative;
  transition: width 0.5s ease;
}

.vibration-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: white;
  filter: blur(10px);
  opacity: 0.5;
  animation: glow-move 2s linear infinite;
}

@keyframes glow-move {
  from { transform: translateX(-100%); }
  to { transform: translateX(400%); }
}

/* Navigation */
.perfil-nav {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 30px;
  text-decoration: none;
  font-size: 0.85rem;
  transition: var(--transition);
}

.nav-back {
  color: var(--color-text-secondary);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(179, 136, 255, 0.1);
}

.nav-activity {
  color: var(--color-primary);
  background: rgba(124, 77, 255, 0.1);
  border: 1px solid rgba(124, 77, 255, 0.2);
}

.nav-link:hover {
  transform: translateX(var(--hover-offset, 4px));
  border-color: var(--color-primary);
  background: rgba(179, 136, 255, 0.1);
}

.nav-back:hover {
  --hover-offset: -4px;
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

/* Responsive */
@media (max-width: 768px) {
  .cosmic-perfil {
    padding: 1rem;
  }

  .title-gradient {
    font-size: 1.8rem;
  }

  .title-emoji {
    font-size: 1.8rem;
  }

  .perfil-card {
    padding: 1.5rem;
  }

  .perfil-avatar {
    flex-direction: column;
    text-align: center;
  }

  .avatar-info {
    text-align: center;
  }

  .avatar-name {
    font-size: 1.3rem;
  }

  .fixed-data {
    grid-template-columns: 1fr;
  }

  .perfil-nav {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-link {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .header-badge {
    font-size: 0.6rem;
  }

  .title-gradient {
    font-size: 1.5rem;
  }

  .avatar-container {
    width: 70px;
    height: 70px;
  }

  .avatar-initials {
    font-size: 1.5rem;
  }
}
</style>