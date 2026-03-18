<template>
  <div class="user-perfil">
    <!-- Encabezado místico -->
    <div class="page-header">
      <div class="header-glow"></div>
      <h1 class="page-header__title">
        <q-icon name="stars" size="28px" class="page-header__icon" />
        Portal de Energía
      </h1>
      <p class="page-header__desc">Refina tu esencia y eleva tu vibración.</p>
    </div>

    <!-- Contenedor de energía cósmica -->
    <div class="glass-card perfil-card">
      <!-- Símbolo zodiacal y avatar -->
      <div class="perfil-avatar">
        <div class="avatar-cosmic">
          <div class="avatar-aura"></div>
          <span class="avatar-symbol">{{ initials }}</span>
        </div>
        <div class="perfil-avatar__info">
          <h2 class="perfil-avatar__name">{{ authStore.nombreUsuario }}</h2>
          <span class="perfil-avatar__badge" :class="isActive ? 'badge--active' : 'badge--free'">
            <q-icon :name="isActive ? 'workspace_premium' : 'radio_button_unchecked'" size="14px" />
            {{ isActive ? 'Alma Premium' : 'Espíritu Libre' }}
          </span>
        </div>
      </div>

      <!-- Formulario de alineación -->
      <q-form @submit.prevent="handleSave" class="perfil-form">
        <div class="form-campos">
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

        <!-- Acciones cósmicas -->
        <div class="perfil-actions">
          <CosmicButton
            label="Actualizar  ✦"
            variant="orange"
            :loading="saving"
            loading-text="Sincronizando..."
            @click="handleSave"
          />
          
          <button type="button" class="btn-energia" @click="handleChangePassword">
            <q-icon name="lock" size="16px" />
            Renovar clave
          </button>
        </div>
      </q-form>

      <!-- Barra de vibración -->
      <div class="vibration-bar">
        <div class="vibration-info">
          
        </div>
        <div class="vibration-track">
          <div class="vibration-fill" :style="{ width: energyLevel + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Navegación estelar -->
    <div class="perfil-back">
      <router-link :to="isActive ? '/usuario/premium' : '/usuario'" class="back-link">
        <q-icon name="chevron_left" size="18px" />
        Regresar al cosmos
      </router-link>
      
      <router-link to="/actividad" class="activity-link">
        Ver historial estelar
        <q-icon name="chevron_right" size="18px" />
      </router-link>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/store/auth.js";
import { getData, putData } from "@/services/apiClient.js";
import { useNotifications } from "@/composables/useNotifications.js";
import CosmicInput from "@/components/Auth/CosmicInput.vue";
import CosmicButton from "@/components/Auth/CosmicButton.vue";

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

onMounted(async () => {
  nombre.value = authStore.nombreUsuario || "";
  email.value = authStore.usuario?.email || "";

  // Cargar perfil completo del backend (incluye fechaNacimiento)
  try {
    const res = await getData("usuarios/perfil");
    const perfil = res.usuario || res;
    if (perfil.fechaNacimiento) {
      fechaNacimiento.value = new Date(perfil.fechaNacimiento).toISOString().split("T")[0];
    }
    if (perfil.nombre) nombre.value = perfil.nombre;
    if (perfil.email) email.value = perfil.email;
  } catch (e) {
    // Si falla, usar lo que hay en el store
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

    // Actualizar store
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
</script>

<style>
.user-perfil {
  max-width: 720px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 22px;
}

.page-header__title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.page-header__icon {
  color: var(--orange-primary);
}

.page-header__desc {
  margin: 6px 0 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.perfil-card {
  padding: 28px 24px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(9, 18, 58, 0.96), rgba(15, 10, 34, 0.96));
  border: 1px solid var(--glass-border);
  box-shadow: var(--shadow-card);
}

.perfil-avatar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 18px;
  border-bottom: 1px solid var(--border-subtle);
}

.perfil-avatar__circle {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--violet-accent), var(--violet-mid));
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  border: 2px solid rgba(192, 132, 252, 0.2);
  box-shadow: 0 0 18px rgba(124, 58, 237, 0.2);
}

.perfil-avatar__name {
  margin: 0 0 8px;
  font-family: var(--font-heading);
  font-size: 1.2rem;
  color: var(--text-primary);
}

.perfil-avatar__badge {
  display: inline-flex;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.badge--active {
  color: var(--orange-primary);
  background: rgba(232, 132, 42, 0.12);
  border: 1px solid rgba(232, 132, 42, 0.26);
}

.badge--free {
  color: var(--text-muted);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
}

.perfil-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 18px;
}

.perfil-readonly {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 22px;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border-subtle);
}

.readonly-field__label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.readonly-field__value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: capitalize;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot--active {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.45);
}

.status-dot--inactive {
  background: rgba(255, 255, 255, 0.25);
}

.perfil-actions {
  margin-bottom: 10px;
}

.perfil-back {
  margin-top: 16px;
  text-align: center;
}

.back-link {
  font-size: 0.84rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.back-link:hover {
  color: var(--orange-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 520px) {
  .perfil-card {
    padding: 22px 16px;
  }

  .perfil-readonly {
    grid-template-columns: 1fr;
  }

  .page-header__title {
    font-size: 1.45rem;
  }
}
</style>
