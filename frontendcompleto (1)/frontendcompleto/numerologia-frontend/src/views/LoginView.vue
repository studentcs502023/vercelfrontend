<template>
  <div class="login-view">
    <!-- Header -->
    <AuthHeader title="PORTAL DE " highlight="USUARIO" subtitle="Ingresa a tu lectura numerológica" />

    <!-- Card Login -->
    <div class="glass-card login-card">
      <!-- Decoraciones -->

      <span class="card-deco card-deco--star"></span>

      <h2 class="login-card__title">Acceso al Portal</h2>
      <p class="login-card__desc">Ingresa tus credenciales para continuar tu viaje.</p>

      <!-- Formulario -->
      <q-form @submit.prevent="handleLogin" class="login-form">
        <CosmicInput v-model="email" icon="alternate_email" label="Correo Electrónico" type="email"
          placeholder="tu@cosmos.com" :error="errors.email" @update:model-value="clearError('email')" />

        <CosmicInput v-model="password" icon="lock" label="Contraseña" type="password" placeholder="••••••••"
          :error="errors.password" @update:model-value="clearError('password')" />

        <!-- Olvidé contraseña -->
        <div class="login-card__forgot">
          <router-link to="/recuperar" class="forgot-link">¿Olvidaste tu contraseña?</router-link>
        </div>

        <!-- Botón Login -->
        <CosmicButton label="Iniciar Sesión →" variant="orange" :loading="loading" loading-text="Verificando..." />


      </q-form>

      <!-- Separador -->
      <div class="login-card__divider">
        <span>◇</span>
      </div>

      <!-- Link a registro -->
      <p class="login-card__register">
        ¿Aún no tienes cuenta?
        <router-link to="/registro" class="register-link">Registrarse</router-link>
      </p>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <span>DESTINO</span>
      <span class="footer-dot">•</span>
      <span>ENERGÍA</span>
      <span class="footer-dot">•</span>
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
import CosmicButton from "@/components/Auth/CosmicButton.vue";

const router = useRouter();
const authStore = useAuthStore();
const { errors, setErrors, clearError, validateRequiredEmail, validateRequired } = useAuthForm();
const notify = useNotifications();

const email = ref("");
const password = ref("");
const loading = ref(false);

async function handleLogin() {
  // Validación UX mínima
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

    // Guardar en store
    authStore.setAuth({
      token: res.token,
      usuario: res.usuario,
    });

    notify.success(` Bienvenido, ${res.usuario.nombre}`);

    // Redirigir según rol
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
.login-view {
  min-height: 100vh;
  padding: 40px 16px 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 18%, rgba(32, 58, 180, 0.14), transparent 22%),
    linear-gradient(180deg, #050d34 0%, #081243 48%, #07103a 100%);
  position: relative;
  overflow: hidden;
}

.login-view::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.05) 0.8px, transparent 0.8px);
  background-size: 28px 28px;
  opacity: 0.18;
  pointer-events: none;
}

.login-view .glass-card.login-card {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  position: relative;
  padding: 88px 28px 28px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(7, 16, 58, 0.96) 0%, rgba(8, 18, 66, 0.98) 100%);
  border: 1px solid rgba(26, 59, 182, 0.45);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.42),
    0 0 0 1px rgba(255, 255, 255, 0.015) inset,
    0 0 28px rgba(24, 61, 191, 0.18);
  overflow: hidden;
}

.login-view .glass-card.login-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.015), transparent 22%);
  pointer-events: none;
}

.card-deco {
  position: absolute;
  opacity: 1;
}

.card-deco--moon {
  top: 26px;
  left: 50%;
  transform: translateX(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f2c94c;
  font-size: 1rem;
  border: 1px solid rgba(242, 201, 76, 0.25);
  background: rgba(242, 201, 76, 0.03);
  box-shadow: 0 0 18px rgba(242, 201, 76, 0.06);
}

.login-card__title {
  margin: 0 0 10px;
  text-align: center;
  text-transform: uppercase;
  font-family: var(--font-body);
  font-size: 2.2rem;
  line-height: 1;
  letter-spacing: 0.03em;
  font-weight: 900;
  color: #f2c94c;
}

.login-card__desc {
  margin: 0 0 24px;
  text-align: center;
  font-size: 0.77rem;
  line-height: 1.5;
  font-style: italic;
  color: rgba(230, 234, 255, 0.56);
}

.login-card .cosmic-input-wrapper {
  margin-bottom: 14px;
}

.login-card .cosmic-input__label,
.login-card label {
  display: block;
  margin-bottom: 8px;
  color: #f2c94c;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.login-card .cosmic-input .q-field__control,
.login-card .q-field__control {
  min-height: 42px !important;
  background: rgba(8, 18, 64, 0.96) !important;
  border: 1px solid rgba(27, 62, 187, 0.52) !important;
  border-radius: 8px !important;
  box-shadow: none !important;
}

.login-card .cosmic-input .q-field__native,
.login-card .q-field__native,
.login-card input {
  color: #eaf0ff !important;
  font-size: 0.84rem !important;
}

.login-card .cosmic-input .q-field__native::placeholder,
.login-card input::placeholder {
  color: rgba(205, 213, 240, 0.34) !important;
}

.login-card .cosmic-input .q-field--focused .q-field__control,
.login-card .q-field--focused .q-field__control {
  border-color: rgba(242, 201, 76, 0.42) !important;
  box-shadow: 0 0 0 2px rgba(242, 201, 76, 0.04) !important;
}

.login-card .cosmic-input__icon,
.login-card .cosmic-input__toggle {
  color: rgba(227, 232, 255, 0.45);
  font-size: 1rem;
}

.password-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.password-header__label {
  margin: 0;
  color: #f2c94c;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.forgot-link {
  text-decoration: none;
  color: rgba(210, 217, 244, 0.52);
  font-size: 0.52rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.forgot-link:hover {
  color: #f2c94c;
}

.remember-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0 16px;
}

.remember-label {
  color: rgba(210, 217, 244, 0.62);
  font-size: 0.72rem;
}

.login-card .q-btn,
.login-card .cosmic-button,
.login-card button[type="submit"] {
  width: 100%;
  min-height: 44px;
  border-radius: 8px !important;
  background: linear-gradient(180deg, #2f5eea 0%, #2144da 100%) !important;
  color: #ffffff !important;
  border: 1px solid rgba(80, 119, 255, 0.42) !important;
  box-shadow: 0 10px 22px rgba(33, 68, 218, 0.28);
  font-size: 0.88rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.login-card .q-btn:hover,
.login-card .cosmic-button:hover,
.login-card button[type="submit"]:hover {
  transform: translateY(-1px);
}

.login-card__divider {
  margin: 18px 0 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: rgba(202, 209, 235, 0.28);
  font-size: 0.62rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.login-card__divider::before,
.login-card__divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(45, 74, 188, 0.35), transparent);
}

.login-card__divider span {
  padding: 0 12px;
}

.register-link {
  display: block;
  margin-top: 14px;
  text-decoration: none;
  text-align: center;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid rgba(242, 201, 76, 0.5);
  color: #f2c94c;
  background: transparent;
  font-size: 0.84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
}

.register-link:hover {
  background: rgba(242, 201, 76, 0.04);
  border-color: rgba(242, 201, 76, 0.72);
}

.login-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  margin-top: 20px;
  color: rgba(242, 201, 76, 0.18);
  font-size: 0.74rem;
}

.footer-dot {
  color: rgba(242, 201, 76, 0.24);
}

@media (max-width: 480px) {
  .login-view {
    padding: 24px 12px 18px;
  }

  .login-view .glass-card.login-card {
    max-width: 100%;
    padding: 82px 20px 22px;
  }

  .login-card__title {
    font-size: 1.9rem;
  }
}
</style>