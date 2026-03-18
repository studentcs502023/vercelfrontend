<template>
  <div class="cosmic-recuperar">
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

    <!-- PASO 1: Solicitar código -->
    <div v-if="step === 1" class="step-container">
      <AuthHeader 
        title="Recupera tu " 
        highlight="Acceso"
        subtitle="Ingresa tu correo electrónico y te enviaremos un código de verificación." 
      />

      <div class="glass-card recovery-card">
        <!-- Orbe decorativo -->
        <div class="card-orb">
          <div class="orb-inner">
            <span class="orb-emoji">✨</span>
          </div>
        </div>

        <h2 class="recovery-card__title">Restablecer Contraseña</h2>

        <q-form @submit.prevent="handleSendCode" class="recovery-form">
          <CosmicInput 
            v-model="email" 
            icon="email" 
            label="Correo Electrónico" 
            type="email"
            placeholder="tu@cosmos.com" 
            :error="errors.email" 
            @update:model-value="errors.email = ''" 
          />

          <button type="submit" class="recovery-button" :disabled="loading">
            <span v-if="loading" class="button-spinner">
              <q-spinner-dots color="white" size="20px" />
              <span>Enviando...</span>
            </span>
            <span v-else class="button-text">
              Enviar Código
              <span class="button-arrow">→</span>
            </span>
          </button>
        </q-form>

        <div class="recovery-card__footer">
          <router-link to="/login" class="back-link">
            <q-icon name="arrow_back" size="16px" />
            Volver al inicio de sesión
          </router-link>
        </div>
      </div>
    </div>

    <!-- PASO 2: Verificar código -->
    <div v-if="step === 2" class="step-container">
      <AuthHeader 
        title="Verifica tu " 
        highlight="Identidad"
        subtitle="Ingresa el código de 6 dígitos que enviamos a tu correo." 
      />

      <div class="glass-card recovery-card">
        <div class="card-orb">
          <div class="orb-inner">
            <span class="orb-emoji">🔢</span>
          </div>
        </div>

        <h2 class="recovery-card__title">Código de Verificación</h2>

        <q-form @submit.prevent="handleVerifyCode" class="recovery-form">
          <!-- Inputs de código -->
          <div class="code-inputs">
            <input 
              v-for="(digit, index) in codeDigits" 
              :key="index" 
              :ref="el => codeRefs[index] = el" 
              type="text"
              maxlength="1" 
              class="code-input" 
              :class="{ 'code-input--filled': digit }" 
              :value="digit"
              @input="handleCodeInput(index, $event)" 
              @keydown="handleCodeKeydown(index, $event)"
              @paste="handleCodePaste($event)" 
              inputmode="numeric" 
              :aria-label="`Dígito ${index + 1}`"
            />
          </div>

          <!-- Temporizador -->
          <div class="code-timer" :class="{ 'code-timer--expired': timerSeconds === 0 }">
            <span class="timer-icon">⏳</span>
            <p v-if="timerSeconds > 0">
              El código expirará en <strong>{{ formatTimer }}</strong>
            </p>
            <p v-else>
              El código ha expirado. 
              <button class="resend-link" @click="handleResend">Solicitar nuevo</button>
            </p>
          </div>

          <button type="submit" class="recovery-button" :disabled="loading">
            <span v-if="loading" class="button-spinner">
              <q-spinner-dots color="white" size="20px" />
              <span>Verificando...</span>
            </span>
            <span v-else class="button-text">
              Verificar Código
              <span class="button-arrow">→</span>
            </span>
          </button>
        </q-form>

        <div class="recovery-card__footer">
          <p>
            ¿No recibiste el código? 
            <button class="resend-link" @click="handleResend">Reenviar</button>
          </p>
          <router-link to="/login" class="back-link">Cancelar</router-link>
        </div>
      </div>
    </div>

    <!-- PASO 3: Nueva contraseña -->
    <div v-if="step === 3" class="step-container">
      <AuthHeader 
        title="Crea una " 
        highlight="Nueva Contraseña"
        subtitle="Establece una contraseña segura para tu cuenta." 
      />

      <div class="glass-card recovery-card">
        <div class="card-orb">
          <div class="orb-inner">
            <span class="orb-emoji">🔒</span>
          </div>
        </div>

        <h2 class="recovery-card__title">Actualizar Contraseña</h2>

        <q-form @submit.prevent="handleChangePassword" class="recovery-form">
          <CosmicInput 
            v-model="newPassword" 
            icon="lock" 
            label="Nueva Contraseña" 
            type="password" 
            placeholder="Mínimo 8 caracteres"
            :error="errors.password" 
            @update:model-value="errors.password = ''" 
          />

          <CosmicInput 
            v-model="confirmPassword" 
            icon="lock_clock" 
            label="Confirmar Contraseña" 
            type="password"
            placeholder="Repite tu contraseña" 
            :error="errors.confirm" 
            @update:model-value="errors.confirm = ''" 
          />

          <!-- Indicador de seguridad mejorado -->
          <div class="strength-container" v-if="newPassword">
            <div class="strength-header">
              <span class="strength-label">Nivel de seguridad</span>
              <span class="strength-value" :class="`strength-text--${passwordStrength}`">
                {{ strengthLabel }}
              </span>
            </div>
            <div class="strength-bars">
              <div 
                v-for="level in 4" 
                :key="level"
                class="strength-bar"
                :class="{
                  'strength-bar--active': passwordStrength >= level,
                  [`strength-bar--level-${passwordStrength}`]: passwordStrength >= level
                }"
              ></div>
            </div>
          </div>

          <button type="submit" class="recovery-button" :disabled="loading">
            <span v-if="loading" class="button-spinner">
              <q-spinner-dots color="white" size="20px" />
              <span>Actualizando...</span>
            </span>
            <span v-else class="button-text">
              Guardar Contraseña
              <span class="button-arrow">→</span>
            </span>
          </button>
        </q-form>

        <div class="recovery-card__footer">
          <router-link to="/login" class="back-link">Cancelar</router-link>
        </div>
      </div>
    </div>

    <!-- PASO 4: Confirmación -->
    <div v-if="step === 4" class="step-container">
      <div class="glass-card recovery-card success-card">
        <div class="success-orb">
          <div class="success-orb__inner">
            <span class="success-emoji">✨</span>
          </div>
        </div>

        <h2 class="success-title">¡Contraseña Actualizada!</h2>
        <p class="success-desc">
          Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión con tu nueva clave.
        </p>

        <button class="success-button" @click="$router.push('/login')">
          Iniciar Sesión
          <span class="button-arrow">→</span>
        </button>

        <p class="success-footer">
          © 2025 Portal Cósmico
        </p>
      </div>
    </div>

    <!-- Footer informativo -->
    <div class="recovery-footer" v-if="step !== 4">
      <span>Recuperación</span>
      <span class="footer-dot">✦</span>
      <span>Asistencia</span>
      <span class="footer-dot">✦</span>
      <span>Soporte</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick } from "vue";
import AuthHeader from "@/components/Auth/AuthHeader.vue";
import CosmicInput from "@/components/Auth/CosmicInput.vue";
import { postData } from "@/services/apiClient.js";
import { useNotifications } from "@/composables/useNotifications.js";

// Estado general
const step = ref(1);
const loading = ref(false);
const notify = useNotifications();
const errors = ref({ email: "", password: "", confirm: "" });

// Paso 1
const email = ref("");

// Paso 2
const codeDigits = ref(["", "", "", "", "", ""]);
const codeRefs = ref([]);
const timerSeconds = ref(600); // 10 minutos
let timerInterval = null;

// Paso 3
const newPassword = ref("");
const confirmPassword = ref("");

// Timer
const formatTimer = computed(() => {
  const min = Math.floor(timerSeconds.value / 60);
  const sec = timerSeconds.value % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
});

// Fuerza de contraseña
const passwordStrength = computed(() => {
  const p = newPassword.value;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;
  return Math.min(score, 4);
});

const strengthLabel = computed(() => {
  const labels = ["", "Débil", "Moderada", "Fuerte", "Muy Fuerte"];
  return labels[passwordStrength.value] || "";
});

function startTimer() {
  clearInterval(timerInterval);
  timerSeconds.value = 600;
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--;
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

onUnmounted(() => clearInterval(timerInterval));

// ═══ Paso 1: Enviar código ═══
async function handleSendCode() {
  errors.value.email = "";

  if (!email.value.trim()) {
    errors.value.email = "El correo es obligatorio";
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email.value)) {
    errors.value.email = "Ingresa un correo válido";
    return;
  }

  loading.value = true;
  try {
    await postData("usuarios/olvide-contrasena", { email: email.value });
    notify.success("Código enviado a tu correo ✦");
    step.value = 2;
    startTimer();
    await nextTick();
    codeRefs.value[0]?.focus();
  } catch (error) {
    notify.error(error.response?.data?.msg || "Error al enviar código");
  } finally {
    loading.value = false;
  }
}

// ═══ Paso 2: Verificar código ═══
function handleCodeInput(index, event) {
  const value = event.target.value.replace(/\D/g, "");
  codeDigits.value[index] = value;

  if (value && index < 5) {
    codeRefs.value[index + 1]?.focus();
  }
}

function handleCodeKeydown(index, event) {
  if (event.key === "Backspace" && !codeDigits.value[index] && index > 0) {
    codeRefs.value[index - 1]?.focus();
  }
}

function handleCodePaste(event) {
  const paste = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
  paste.split("").forEach((char, i) => {
    codeDigits.value[i] = char;
  });
  const focusIndex = Math.min(paste.length, 5);
  codeRefs.value[focusIndex]?.focus();
  event.preventDefault();
}

async function handleVerifyCode() {
  const code = codeDigits.value.join("");

  if (code.length < 6) {
    notify.warning("Ingresa el código completo de 6 dígitos");
    return;
  }

  loading.value = true;
  try {
    await postData("usuarios/verificar-codigo", { email: email.value, codigo: code });
    notify.success("Código verificado correctamente ✦");
    step.value = 3;
  } catch (error) {
    notify.error(error.response?.data?.msg || "Código inválido o expirado");
  } finally {
    loading.value = false;
  }
}

async function handleResend() {
  codeDigits.value = ["", "", "", "", "", ""];
  loading.value = true;
  try {
    await postData("usuarios/olvide-contrasena", { email: email.value });
    notify.success("Código reenviado a tu correo ✦");
    startTimer();
    await nextTick();
    codeRefs.value[0]?.focus();
  } catch (error) {
    notify.error("Error al reenviar código");
  } finally {
    loading.value = false;
  }
}

// ═══ Paso 3: Nueva contraseña ═══
async function handleChangePassword() {
  errors.value.password = "";
  errors.value.confirm = "";

  if (!newPassword.value) {
    errors.value.password = "La contraseña es obligatoria";
    return;
  }
  if (newPassword.value.length < 6) {
    errors.value.password = "Mínimo 6 caracteres";
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    errors.value.confirm = "Las contraseñas no coinciden";
    return;
  }

  const code = codeDigits.value.join("");
  loading.value = true;
  try {
    await postData("usuarios/cambiar-contrasena", { 
      email: email.value, 
      codigo: code, 
      nueva_contraseña: newPassword.value 
    });
    notify.success("¡Contraseña actualizada exitosamente! ✦");
    step.value = 4;
    clearInterval(timerInterval);
  } catch (error) {
    notify.error(error.response?.data?.msg || "Error al cambiar contraseña");
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

.cosmic-recuperar {
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
.glass-card.recovery-card {
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

.glass-card.recovery-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 30px 50px -15px var(--color-primary-glow);
}

.glass-card.recovery-card::after {
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

/* Título */
.recovery-card__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 1.5rem;
  text-align: center;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 2;
  background: linear-gradient(135deg, #fff, var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Formulario */
.recovery-form {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* Inputs códigos */
.code-inputs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 0.5rem 0 1rem;
}

.code-input {
  width: 52px;
  height: 60px;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(179, 136, 255, 0.2);
  border-radius: 16px;
  color: var(--color-text);
  font-size: 1.8rem;
  font-weight: 700;
  text-align: center;
  transition: var(--transition);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.code-input:focus {
  border-color: var(--color-primary);
  outline: none;
  box-shadow: 0 0 20px var(--color-primary-glow);
  background: rgba(0, 0, 0, 0.4);
}

.code-input--filled {
  border-color: var(--color-primary);
  background: rgba(179, 136, 255, 0.1);
}

/* Timer */
.code-timer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  margin: 0.5rem 0;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 30px;
  border: 1px solid rgba(179, 136, 255, 0.1);
}

.timer-icon {
  font-size: 1rem;
}

.code-timer strong {
  color: var(--color-primary);
  font-weight: 600;
}

.code-timer--expired {
  color: #ff6b4a;
  border-color: rgba(255, 107, 74, 0.3);
}

/* Botón principal */
.recovery-button {
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
  margin-top: 0.5rem;
}

.recovery-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.recovery-button:hover::before {
  left: 100%;
}

.recovery-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(124, 77, 255, 0.6);
}

.recovery-button:disabled {
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

.recovery-button:hover .button-arrow {
  transform: translateX(4px);
}

/* Indicador de seguridad mejorado */
.strength-container {
  margin: 0.5rem 0 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(179, 136, 255, 0.1);
}

.strength-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.strength-label {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.strength-value {
  font-size: 0.8rem;
  font-weight: 600;
}

.strength-text--1 { color: #ef4444; }
.strength-text--2 { color: #f59e0b; }
.strength-text--3 { color: #22c55e; }
.strength-text--4 { color: #22c55e; }

.strength-bars {
  display: flex;
  gap: 6px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  transition: all 0.3s;
}

.strength-bar--active {
  background: linear-gradient(90deg, #7c4dff, #b388ff);
}

/* Footer */
.recovery-card__footer {
  margin-top: 1.5rem;
  text-align: center;
  border-top: 1px solid rgba(179, 136, 255, 0.1);
  padding-top: 1.5rem;
  position: relative;
  z-index: 2;
}

.recovery-card__footer p {
  margin: 0 0 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.back-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: var(--transition);
}

.back-link:hover {
  color: var(--color-primary);
  transform: translateX(-4px);
}

.resend-link {
  background: none;
  border: none;
  color: var(--color-primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
  transition: var(--transition);
}

.resend-link:hover {
  text-decoration: underline;
  color: #b388ff;
}

/* Success card */
.success-card {
  text-align: center;
  padding: 3rem 2rem;
}

.success-orb {
  width: 100px;
  height: 100px;
  margin: 0 auto 2rem;
  position: relative;
}

.success-orb__inner {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, rgba(179, 136, 255, 0.3), transparent 70%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-orb 2s infinite;
}

.success-emoji {
  font-size: 3rem;
  filter: drop-shadow(0 0 30px rgba(179, 136, 255, 0.8));
  animation: spin 4s linear infinite;
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0 0 1rem;
}

.success-desc {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0 0 2rem;
}

.success-button {
  min-width: 200px;
  min-height: 54px;
  background: linear-gradient(135deg, #7c4dff, #b388ff);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 10px 20px -5px rgba(124, 77, 255, 0.4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 2rem;
}

.success-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(124, 77, 255, 0.6);
}

.success-footer {
  font-size: 0.7rem;
  color: rgba(179, 136, 255, 0.3);
  margin-top: 2rem;
  letter-spacing: 1px;
}

/* Footer inferior */
.recovery-footer {
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

/* Animaciones */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 520px) {
  .cosmic-recuperar {
    padding: 1rem;
  }
  
  .glass-card.recovery-card {
    padding: 2rem 1.5rem;
  }
  
  .code-input {
    width: 42px;
    height: 50px;
    font-size: 1.4rem;
  }
  
  .card-orb {
    width: 80px;
    height: 80px;
  }

  .orb-emoji {
    font-size: 1.8rem;
  }
  
  .success-title {
    font-size: 1.5rem;
  }

  .success-orb {
    width: 70px;
    height: 70px;
  }

  .success-emoji {
    font-size: 2rem;
  }

  .recovery-footer {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
}

@media (max-width: 380px) {
  .code-inputs {
    gap: 4px;
  }
  
  .code-input {
    width: 36px;
    height: 44px;
    font-size: 1.2rem;
  }
}
</style>