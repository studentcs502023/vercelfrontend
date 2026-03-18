<template>
  <div class="cosmic-register">
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
    <AuthHeader 
      title="Registro " 
      highlight="Numerológico" 
      subtitle="Completa tus datos para descubrir tu perfil numerológico." 
    />

    <!-- Card Registro -->
    <div class="glass-card register-card">
      <!-- Orbe decorativo -->
      <div class="card-orb">
        <div class="orb-inner">
          <span class="orb-emoji">⭐</span>
        </div>
      </div>

      <h2 class="register-card__title">Crear nueva cuenta</h2>
      <p class="register-card__desc">
        Ingresa tu información para comenzar tu viaje cósmico
      </p>

      <!-- Formulario -->
      <q-form @submit.prevent="handleRegister" class="register-form">
        <CosmicInput 
          v-model="nombre" 
          icon="person" 
          label="Nombre completo"
          placeholder="Ej: Nombre" 
          :error="errors.nombre"
          @update:model-value="clearError('nombre')" 
        />

        <CosmicInput 
          v-model="email" 
          icon="email" 
          label="Correo electrónico" 
          type="email"
          placeholder="tu@cosmos.com" 
          :error="errors.email" 
          @update:model-value="clearError('email')" 
        />

        <CosmicInput 
          v-model="password" 
          icon="lock" 
          label="Contraseña" 
          type="password" 
          placeholder="Mínimo 6 caracteres"
          :error="errors.password" 
          @update:model-value="clearError('password')" 
        />

        <!-- Fecha de nacimiento mejorada -->
        <div class="register-card__date-field">
          <label class="date-label">
            <span class="label-icon">🌙</span>
            Fecha de nacimiento
          </label>
          <div class="date-input-wrapper">
            <q-input 
              v-model="fechaNacimiento" 
              type="date" 
              outlined 
              dark 
              class="cosmic-date-input"
              :class="{ 'cosmic-date-input--error': !!errors.fechaNacimiento }" 
              :error="!!errors.fechaNacimiento"
              :error-message="errors.fechaNacimiento" 
              hide-bottom-space
              @update:model-value="clearError('fechaNacimiento')"
            >
              <template #prepend>
                <q-icon name="calendar_month" class="date-icon" />
              </template>
            </q-input>
          </div>
          <p class="date-hint">
            <span class="hint-icon">✨</span>
            La fecha determina tu número de vida
          </p>
        </div>

        <!-- Botón Registro mejorado -->
        <button type="submit" class="register-button" :disabled="loading">
          <span v-if="loading" class="button-spinner">
            <q-spinner-dots color="white" size="20px" />
            <span>Procesando...</span>
          </span>
          <span v-else class="button-text">
            Registrarme
            <span class="button-arrow">→</span>
          </span>
        </button>
      </q-form>

      <!-- Separador -->
      <div class="register-card__divider">
        <span>✦</span>
      </div>

      <!-- Link a login -->
      <p class="register-card__login">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="login-link">
          Inicia sesión aquí
          <span class="link-arrow">→</span>
        </router-link>
      </p>
    </div>

    <!-- Footer -->
    <div class="register-footer">
      <span>PRIVACIDAD</span>
      <span class="footer-dot">✦</span>
      <span>TÉRMINOS</span>
      <span class="footer-dot">✦</span>
      <span>AYUDA</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.js";
import { useAuthForm } from "@/composables/useAuthForm.js";
import { useNotifications } from "@/composables/useNotifications.js";
import { postData } from "@/services/apiClient.js";
import AuthHeader from "@/components/Auth/AuthHeader.vue";
import CosmicInput from "@/components/Auth/CosmicInput.vue";

const router = useRouter();
const authStore = useAuthStore();
const { errors, setErrors, clearError, validateRequired, validateRequiredEmail } = useAuthForm();
const notify = useNotifications();

const nombre = ref("");
const email = ref("");
const password = ref("");
const fechaNacimiento = ref("");
const loading = ref(false);

async function handleRegister() {
  // Validación UX mínima
  const newErrors = {};
  if (validateRequired(nombre.value, "Nombre")) newErrors.nombre = validateRequired(nombre.value, "Nombre");
  if (validateRequiredEmail(email.value)) newErrors.email = validateRequiredEmail(email.value);
  if (validateRequired(password.value, "Contraseña")) newErrors.password = validateRequired(password.value, "Contraseña");
  if (validateRequired(fechaNacimiento.value, "Fecha de nacimiento")) newErrors.fechaNacimiento = validateRequired(fechaNacimiento.value, "Fecha de nacimiento");

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  loading.value = true;

  try {
    const res = await postData("usuarios", {
      nombre: nombre.value,
      email: email.value,
      password: password.value,
      fechaNacimiento: fechaNacimiento.value,
    });

    // Guardar en store
    authStore.setAuth({
      token: res.token,
      usuario: res.usuario,
    });

    notify.success("¡Cuenta creada exitosamente! Redirigiendo...");

    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      router.push("/login");
    }, 2000);
  } catch (error) {
    if (error.response?.data?.error) {
      notify.error(error.response.data.error);
    } else if (error.response?.data?.errors) {
      const backendErrors = error.response.data.errors;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        notify.error(backendErrors[0].msg);
      }
    } else {
      notify.error("Error al conectar con el servidor");
    }
  } finally {
    loading.value = false;
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
  --color-daily: #7c4dff;
  --color-principal: #ff6b4a;
  --color-text: #ffffff;
  --color-text-secondary: #a0a0c0;
  --border-radius: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cosmic-register {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  background: var(--color-bg);
  position: relative;
  overflow: hidden;
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

/* Card principal */
.glass-card.register-card {
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  padding: 2.5rem 2rem;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: var(--border-radius);
  box-shadow: 0 25px 40px -15px rgba(0, 0, 0, 0.6);
  position: relative;
  z-index: 2;
  overflow: hidden;
  transition: var(--transition);
}

.glass-card.register-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 30px 50px -15px var(--color-primary-glow);
}

.glass-card.register-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--border-radius);
  padding: 2px;
  background: linear-gradient(145deg, rgba(179, 136, 255, 0.3), transparent 60%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

/* Orbe decorativo */
.card-orb {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  pointer-events: none;
  z-index: 1;
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
  transform: rotate(10deg);
}

@keyframes pulse-orb {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Títulos */
.register-card__title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  background: linear-gradient(135deg, #fff, var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  z-index: 2;
}

.register-card__desc {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  margin: 0 0 1.5rem;
  position: relative;
  z-index: 2;
}

/* Formulario */
.register-form {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Estilos para inputs - Heredados de CosmicInput pero mejorados */
.register-card :deep(.cosmic-input-wrapper) {
  width: 100%;
}

.register-card :deep(.cosmic-input .q-field__control) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(179, 136, 255, 0.2) !important;
  border-radius: 16px !important;
  min-height: 54px !important;
  transition: var(--transition) !important;
}

.register-card :deep(.cosmic-input .q-field--focused .q-field__control) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 20px var(--color-primary-glow) !important;
  background: rgba(0, 0, 0, 0.4) !important;
}

.register-card :deep(.cosmic-input .q-field__native) {
  color: white !important;
  font-size: 0.95rem !important;
  padding: 0 1rem !important;
}

.register-card :deep(.cosmic-input .q-field__native::placeholder) {
  color: rgba(255, 255, 255, 0.3) !important;
}

.register-card :deep(.cosmic-input__label) {
  color: var(--color-primary) !important;
  font-size: 0.7rem !important;
  letter-spacing: 1px !important;
  margin-bottom: 0.5rem !important;
  display: block !important;
}

.register-card :deep(.cosmic-input__icon) {
  color: var(--color-primary) !important;
  font-size: 1.2rem !important;
}

/* Campo de fecha mejorado */
.register-card__date-field {
  margin-bottom: 0.5rem;
}

.date-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-primary);
  font-size: 0.7rem;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.label-icon {
  font-size: 0.9rem;
}

.date-input-wrapper {
  position: relative;
}

.cosmic-date-input :deep(.q-field__control) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(179, 136, 255, 0.2) !important;
  border-radius: 16px !important;
  min-height: 54px !important;
  transition: var(--transition) !important;
}

.cosmic-date-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 20px var(--color-primary-glow) !important;
  background: rgba(0, 0, 0, 0.4) !important;
}

.cosmic-date-input :deep(.q-field__native) {
  color: white !important;
  font-size: 0.95rem !important;
  padding: 0 1rem !important;
}

.cosmic-date-input--error :deep(.q-field__control) {
  border-color: #ff6b4a !important;
}

.date-icon {
  color: var(--color-primary) !important;
  font-size: 1.1rem !important;
}

.date-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin: 0.5rem 0 0 0;
}

.hint-icon {
  font-size: 0.8rem;
  color: var(--color-primary);
}

/* Botón de registro */
.register-button {
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
  position: relative;
  overflow: hidden;
  margin-top: 1rem;
}

.register-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.register-button:hover::before {
  left: 100%;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(124, 77, 255, 0.6);
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-arrow {
  transition: transform 0.2s;
}

.register-button:hover .button-arrow {
  transform: translateX(4px);
}

/* Separador */
.register-card__divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1.5rem 0 1rem;
  color: var(--color-primary);
  font-size: 0.8rem;
}

.register-card__divider::before,
.register-card__divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, var(--color-primary), transparent);
}

/* Link a login */
.register-card__login {
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0;
  position: relative;
  z-index: 2;
}

.login-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  color: var(--color-primary);
  margin-left: 4px;
  text-decoration: none;
  transition: var(--transition);
}

.login-link:hover {
  color: #b388ff;
  transform: translateX(4px);
}

.link-arrow {
  font-size: 1rem;
  transition: transform 0.2s;
}

.login-link:hover .link-arrow {
  transform: translateX(4px);
}

/* Footer */
.register-footer {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
  color: rgba(179, 136, 255, 0.3);
  font-size: 0.7rem;
  letter-spacing: 2px;
  font-weight: 300;
  position: relative;
  z-index: 2;
}

.footer-dot {
  color: rgba(179, 136, 255, 0.4);
  font-size: 0.5rem;
}

/* Responsive */
@media (max-width: 520px) {
  .cosmic-register {
    padding: 1rem;
  }
  
  .glass-card.register-card {
    padding: 2rem 1.5rem;
  }
  
  .card-orb {
    width: 80px;
    height: 80px;
  }

  .orb-emoji {
    font-size: 1.8rem;
  }
  
  .register-card__title {
    font-size: 1.5rem;
  }

  .register-footer {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
}
</style>