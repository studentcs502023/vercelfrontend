<template>
  <div class="recuperar-view">
    <!-- PASO 1: Solicitar código -->
    <div v-if="step === 1" class="step-container">
      <AuthHeader 
        title="Recupera tu " 
        highlight="Acceso"
        subtitle="Ingresa tu correo electrónico y te enviaremos un código de verificación." 
      />

      <div class="glass-card recovery-card">
        <h2 class="recovery-card__title">Restablecer Contraseña</h2>

        <q-form @submit.prevent="handleSendCode">
          <CosmicInput 
            v-model="email" 
            icon="email" 
            label="Correo Electrónico" 
            type="email"
            placeholder="usuario@ejemplo.com" 
            :error="errors.email" 
            @update:model-value="errors.email = ''" 
          />

          <CosmicButton 
            label="Enviar Código" 
            variant="orange" 
            :loading="loading" 
            loading-text="Enviando..." 
          />
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
        <h2 class="recovery-card__title">Código de Verificación</h2>

        <q-form @submit.prevent="handleVerifyCode">
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
          <p class="code-timer" v-if="timerSeconds > 0">
            El código expirará en <strong>{{ formatTimer }}</strong>
          </p>
          <p class="code-timer code-timer--expired" v-else>
            El código ha expirado. 
            <button class="resend-link" @click="handleResend">Solicitar nuevo código</button>
          </p>

          <CosmicButton 
            label="Verificar Código" 
            variant="orange" 
            :loading="loading" 
            loading-text="Verificando..." 
          />
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
        <h2 class="recovery-card__title">Actualizar Contraseña</h2>

        <q-form @submit.prevent="handleChangePassword">
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

          <!-- Indicador de seguridad -->
          <div class="strength-indicator" v-if="newPassword">
            <div class="strength-bar">
              <div class="strength-bar__fill" :class="`strength--${passwordStrength}`" :style="{ width: strengthPercentage + '%' }"></div>
            </div>
            <p class="strength-text">
              Seguridad: <span :class="`strength--${passwordStrength}`">{{ strengthLabel }}</span>
            </p>
          </div>

          <CosmicButton 
            label="Guardar Contraseña" 
            variant="orange" 
            :loading="loading"
            loading-text="Actualizando..." 
          />
        </q-form>

        <div class="recovery-card__footer">
          <router-link to="/login" class="back-link">Cancelar</router-link>
        </div>
      </div>
    </div>

    <!-- PASO 4: Confirmación -->
    <div v-if="step === 4" class="step-container">
      <div class="glass-card recovery-card success-card">
        <div class="success-icon">
          <q-icon name="check_circle" size="48px" color="green" />
        </div>

        <h2 class="success-title">¡Contraseña Actualizada!</h2>
        <p class="success-desc">
          Tu contraseña se ha cambiado correctamente. Ya puedes iniciar sesión con tu nueva clave.
        </p>

        <CosmicButton 
          label="Iniciar Sesión" 
          variant="orange" 
          @click="$router.push('/login')" 
        />

        <p class="success-footer">
          © 2025 Numerología Service
        </p>
      </div>
    </div>

    <!-- Footer informativo -->
    <div class="recovery-footer" v-if="step !== 4">
      <span>Recuperación de cuenta</span>
      <span class="footer-separator">•</span>
      <span>Asistencia</span>
      <span class="footer-separator">•</span>
      <span>Soporte</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick } from "vue";
import AuthHeader from "@/components/Auth/AuthHeader.vue";
import CosmicInput from "@/components/Auth/CosmicInput.vue";
import CosmicButton from "@/components/Auth/CosmicButton.vue";
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
    notify.success("Código verificado correctamente ");
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
    notify.success("Código reenviado a tu correo");
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
const passwordStrength = computed(() => {
  const p = newPassword.value;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 6) score++;
  if (p.length >= 10) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score++;
  return score;
});

const strengthText = computed(() => {
  const texts = ["", "Débil", "Moderada", "Fuerte", "Muy Fuerte"];
  return texts[passwordStrength.value] || "";
});

function strengthClass(level) {
  return passwordStrength.value >= level ? `strength--${passwordStrength.value}` : "";
}

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
    await postData("usuarios/cambiar-contrasena", { email: email.value, codigo: code, nueva_contraseña: newPassword.value });
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
.recuperar-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
  padding: 20px;
}

.glass-card.recovery-card {
  max-width: 460px;
  margin: 0 auto;
  background: rgba(18, 18, 32, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(232, 132, 42, 0.15);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.recovery-card {
  position: relative;
  padding: 32px 28px;
}

.recovery-card__title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 20px 0;
  text-align: center;
  letter-spacing: -0.02em;
}

.code-inputs {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin: 24px 0 16px;
}

.code-input {
  width: 48px;
  height: 56px;
  background: rgba(10, 10, 20, 0.8);
  border: 2px solid #2a2a3a;
  border-radius: 12px;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  text-align: center;
  transition: all 0.2s ease;
}

.code-input:focus {
  border-color: #e8842a;
  outline: none;
  box-shadow: 0 0 0 3px rgba(232, 132, 42, 0.2);
}

.code-input--filled {
  border-color: #e8842a;
  background: rgba(232, 132, 42, 0.1);
}

.code-timer {
  text-align: center;
  font-size: 0.85rem;
  color: #8a8aa8;
  margin: 8px 0 20px;
}

.timer-value {
  color: #e8842a;
  font-weight: 600;
}

.resend-link {
  background: none;
  border: none;
  color: #e8842a;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: inherit;
}

.resend-link:hover {
  text-decoration: underline;
}

.strength-bar {
  height: 4px;
  background: #2a2a3a;
  border-radius: 2px;
  margin: 16px 0 6px;
  overflow: hidden;
}

.strength-bar__fill {
  height: 100%;
  transition: width 0.3s ease, background 0.3s ease;
}

.strength--weak {
  width: 25%;
  background: #ef4444;
}

.strength--fair {
  width: 50%;
  background: #f59e0b;
}

.strength--good {
  width: 75%;
  background: #22c55e;
}

.strength--strong {
  width: 100%;
  background: #22c55e;
}

.strength-text {
  font-size: 0.75rem;
  color: #8a8aa8;
  margin: 6px 0 20px;
}

.strength-text span {
  font-weight: 600;
}

.success-card {
  text-align: center;
  padding: 48px 32px;
}

.success-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #e8842a, #f59e0b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 10px 30px rgba(232, 132, 42, 0.3);
}

.success-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 12px;
}

.success-desc {
  font-size: 0.9rem;
  color: #a0a0c0;
  line-height: 1.6;
  margin: 0 0 28px;
}

.success-footer {
  font-size: 0.7rem;
  color: #6a6a88;
  margin-top: 24px;
  letter-spacing: 0.5px;
}

.recovery-card__footer {
  margin-top: 24px;
  text-align: center;
  border-top: 1px solid rgba(232, 132, 42, 0.15);
  padding-top: 20px;
}

.recovery-card__footer p {
  margin: 0 0 8px;
  color: #8a8aa8;
  font-size: 0.85rem;
}

.back-link {
  color: #8a8aa8;
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.back-link:hover {
  color: #e8842a;
}

.recovery-footer {
  text-align: center;
  margin-top: 24px;
  color: #5a5a78;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}

.footer-separator {
  margin: 0 8px;
}

@media (max-width: 520px) {
  .recuperar-view {
    padding: 12px;
  }
  
  .recovery-card {
    padding: 24px 16px;
  }
  
  .code-input {
    width: 40px;
    height: 48px;
    font-size: 1.2rem;
  }
  
  .success-title {
    font-size: 1.4rem;
  }
}
</style>
