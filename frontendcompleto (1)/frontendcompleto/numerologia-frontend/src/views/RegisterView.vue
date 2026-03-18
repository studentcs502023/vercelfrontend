<template>
  <div class="register-view">
    <!-- Header -->
    <AuthHeader 
      title="Registro " 
      highlight="Numerológico" 
      subtitle="Completa tus datos para descubrir tu perfil numerológico." 
    />

    <!-- Card Registro -->
    <div class="glass-card register-card">
      <h2 class="register-card__title">Crear nueva cuenta</h2>
      <p class="register-card__desc">
        Ingresa tu información para comenzar.
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
          placeholder="usuario@ejemplo.com" 
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

        <div class="register-card__date-field">
          <label class="date-label">Fecha de nacimiento</label>
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
          <p class="date-hint">La fecha determina tu número de vida.</p>
        </div>

        <!-- Botón Registro -->
        <CosmicButton 
          label="Registrarme" 
          variant="primary" 
          :loading="loading" 
          loading-text="Procesando..." 
        />
      </q-form>

      <!-- Separador -->
      <div class="register-card__divider">
        <span>✦</span>
      </div>

      <!-- Link a login -->
      <p class="register-card__login">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="login-link">Inicia sesión aquí</router-link>
      </p>
    </div>

    <!-- Footer -->
    <div class="register-footer">
      <span>PRIVACIDAD</span>
      <span class="footer-dot">•</span>
      <span>TÉRMINOS</span>
      <span class="footer-dot">•</span>
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
import CosmicButton from "@/components/Auth/CosmicButton.vue";

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

<style >
.register-view {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
  padding: 20px;
}

.glass-card.register-card {
  max-width: 460px;
  margin: 0 auto;
  background: rgba(18, 18, 32, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(232, 132, 42, 0.15);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.register-card {
  padding: 32px 28px;
}

.register-card__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.register-card__desc {
  font-size: 0.85rem;
  color: #a0a0c0;
  margin: 0 0 24px 0;
}

.register-card__date-field {
  margin-bottom: 16px;
}

.date-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #e8842a;
  margin-bottom: 6px;
}

.cosmic-date-input :deep(.q-field__control) {
  background: rgba(10, 10, 20, 0.8);
  border: 1px solid #2a2a3a;
  border-radius: 10px;
  padding: 4px 12px;
}

.cosmic-date-input :deep(.q-field--focused .q-field__control) {
  border-color: #e8842a;
}

.cosmic-date-input :deep(.q-field__native) {
  color: #ffffff;
  font-size: 0.95rem;
}

.cosmic-date-input--error :deep(.q-field__control) {
  border-color: #ef4444 !important;
}

.date-icon {
  color: #6a6a88;
  font-size: 1.1rem;
}

.date-hint {
  font-size: 0.75rem;
  color: #e8842a;
  font-style: italic;
  margin: 6px 0 0 0;
  opacity: 0.8;
}

.register-card__divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 24px 0;
  color: #6a6a88;
}

.register-card__divider::before,
.register-card__divider::after {
  content: "";
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, #2a2a3a, transparent);
}

.register-card__divider span {
  padding: 0 16px;
  font-size: 1rem;
}

.register-card__login {
  text-align: center;
  font-size: 0.85rem;
  color: #a0a0c0;
  margin: 0;
}

.login-link {
  font-weight: 600;
  color: #e8842a;
  margin-left: 4px;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

.register-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #5a5a78;
}

.footer-dot {
  color: #e8842a;
  opacity: 0.5;
}

@media (max-width: 520px) {
  .register-view {
    padding: 12px;
  }
  
  .register-card {
    padding: 24px 16px;
  }
  
  .register-card__title {
    font-size: 1.4rem;
  }
}
</style>
