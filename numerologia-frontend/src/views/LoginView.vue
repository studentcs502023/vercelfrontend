<template>
  <div class="cosmic-login">
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
    <AuthHeader title="PORTAL DE " highlight="USUARIO" subtitle="Ingresa a tu lectura numerológica" />

    <!-- Card Login -->
    <div class="glass-card login-card">
      <!-- Orbe flotante -->
      <div class="card-orb">
        <div class="orb-inner">
          <span class="orb-emoji">🔮</span>
        </div>
      </div>

      <h2 class="login-card__title">Acceso al Portal</h2>
      <p class="login-card__desc">Ingresa tus credenciales para continuar tu viaje</p>

      <!-- Formulario -->
      <q-form @submit.prevent="handleLogin" class="login-form">
        <CosmicInput 
          v-model="email" 
          icon="alternate_email" 
          label="Correo Electrónico" 
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
          placeholder="••••••••"
          :error="errors.password" 
          @update:model-value="clearError('password')" 
        />

        <!-- Olvidé contraseña -->
        <div class="login-card__forgot">
          <router-link to="/recuperar" class="forgot-link">
            <span class="link-icon">✨</span>
            ¿Olvidaste tu contraseña?
          </router-link>
        </div>

        <!-- Botón Login -->
        <button type="submit" class="login-button" :disabled="loading">
          <span v-if="loading" class="button-spinner">
            <q-spinner-dots color="white" size="20px" />
            <span>Verificando...</span>
          </span>
          <span v-else class="button-text">
            Iniciar Sesión
            <span class="button-arrow">→</span>
          </span>
        </button>
      </q-form>

      <!-- Separador -->
      <div class="login-card__divider">
        <span>✦</span>
      </div>

      <!-- Link a registro -->
      <router-link to="/registro" class="register-link">
        <span>¿Aún no tienes cuenta?</span>
        <span class="register-highlight">Registrarse →</span>
      </router-link>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <span>DESTINO</span>
      <span class="footer-dot">✦</span>
      <span>ENERGÍA</span>
      <span class="footer-dot">✦</span>
      <span>CONEXIÓN</span>
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
const { errors, setErrors, clearError, validateRequiredEmail, validateRequired } = useAuthForm();
const notify = useNotifications();

const email = ref("");
const password = ref("");
const loading = ref(false);

async function handleLogin() {
  const newErrors = {};
  if (validateRequiredEmail(email.value)) newErrors.email = validateRequiredEmail(email.value);
  if (validateRequired(password.value, "Contraseña")) newErrors.password = validateRequired(password.value, "Contraseña");

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  loading.value = true;

  try {
    const res = await postData("usuarios/login", { email: email.value, password: password.value });

    authStore.setAuth({
      token: res.token,
      usuario: res.usuario,
    });

    notify.success(`Bienvenido, ${res.usuario.nombre}`);

    if (res.usuario.rol === "administrador" || res.usuario.rol === "admin") {
      router.push("/admin");
    } else if (res.usuario.estado === "activo") {
      router.push("/usuario/premium");
    } else {
      router.push("/usuario");
    }
  } catch (error) {
    const msg = error.response?.data?.msg || error.response?.data?.error || "Error al conectar con el servidor";
    notify.error(msg);
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

.cosmic-login {
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
.glass-card.login-card {
  width: 100%;
  max-width: 420px;
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

.glass-card.login-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 30px 50px -15px var(--color-primary-glow);
}

.glass-card.login-card::after {
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
.login-card__title {
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: 2px;
  text-align: center;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #fff, var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-transform: uppercase;
  position: relative;
  z-index: 2;
}

.login-card__desc {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  margin-bottom: 2rem;
  font-weight: 300;
  letter-spacing: 1px;
  position: relative;
  z-index: 2;
}

/* Formulario */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  position: relative;
  z-index: 2;
}

/* Estilos para inputs - Adaptados a la paleta cósmica */
.login-card :deep(.cosmic-input-wrapper) {
  width: 100%;
}

.login-card :deep(.cosmic-input .q-field__control) {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 1px solid rgba(179, 136, 255, 0.2) !important;
  border-radius: 16px !important;
  min-height: 54px !important;
  transition: var(--transition) !important;
}

.login-card :deep(.cosmic-input .q-field--focused .q-field__control) {
  border-color: var(--color-primary) !important;
  box-shadow: 0 0 20px var(--color-primary-glow) !important;
  background: rgba(0, 0, 0, 0.4) !important;
}

.login-card :deep(.cosmic-input .q-field__native) {
  color: white !important;
  font-size: 0.95rem !important;
  padding: 0 1rem !important;
}

.login-card :deep(.cosmic-input .q-field__native::placeholder) {
  color: rgba(255, 255, 255, 0.3) !important;
}

.login-card :deep(.cosmic-input__label) {
  color: var(--color-primary) !important;
  font-size: 0.7rem !important;
  letter-spacing: 1px !important;
  margin-bottom: 0.5rem !important;
  display: block !important;
}

.login-card :deep(.cosmic-input__icon) {
  color: var(--color-primary) !important;
  font-size: 1.2rem !important;
}

/* Forgot password */
.login-card__forgot {
  text-align: right;
  margin: 0.25rem 0 0.5rem;
}

.forgot-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  transition: var(--transition);
  border-bottom: 1px dotted transparent;
}

.forgot-link:hover {
  color: var(--color-primary);
  border-bottom-color: var(--color-primary);
}

.link-icon {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* Botón de login */
.login-button {
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
  margin-top: 0.5rem;
  position: relative;
  overflow: hidden;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.login-button:hover::before {
  left: 100%;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(124, 77, 255, 0.6);
}

.login-button:disabled {
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

.login-button:hover .button-arrow {
  transform: translateX(4px);
}

/* Separador */
.login-card__divider {
  margin: 1.5rem 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-primary);
  font-size: 0.8rem;
  position: relative;
  z-index: 2;
}

.login-card__divider::before,
.login-card__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
}

/* Register link */
.register-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  text-align: center;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  letter-spacing: 1px;
  padding: 0.75rem;
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: 16px;
  transition: var(--transition);
  position: relative;
  z-index: 2;
}

.register-link:hover {
  border-color: var(--color-primary);
  background: rgba(179, 136, 255, 0.05);
  transform: translateY(-2px);
}

.register-highlight {
  color: var(--color-primary);
  font-weight: 600;
  transition: transform 0.2s;
}

.register-link:hover .register-highlight {
  transform: translateX(4px);
}

/* Footer */
.login-footer {
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
@media (max-width: 480px) {
  .glass-card.login-card {
    padding: 2rem 1.5rem;
  }
  
  .login-card__title {
    font-size: 1.8rem;
  }

  .card-orb {
    width: 80px;
    height: 80px;
  }

  .orb-emoji {
    font-size: 1.8rem;
  }

  .login-footer {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
}
</style>