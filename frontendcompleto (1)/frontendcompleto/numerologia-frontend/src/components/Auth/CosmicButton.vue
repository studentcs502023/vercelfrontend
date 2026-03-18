<template>
  <q-btn
    :label="label"
    :loading="loading"
    :disable="loading"
    :type="type"
    no-caps
    unelevated
    class="cosmic-btn"
    :class="[`cosmic-btn--${variant}`]"
    @click="$emit('click')"
  >
    <template #loading>
      <div class="cosmic-btn__loader">
        <span class="cosmic-btn__spinner">✦</span>
        <span>{{ loadingText }}</span>
      </div>
    </template>
    <template v-if="icon" #append>
      <q-icon :name="icon" class="cosmic-btn__icon" />
    </template>
  </q-btn>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  loading: { type: Boolean, default: false },
  icon: { type: String, default: "" },
  variant: { type: String, default: "primary" }, // primary | orange
  loadingText: { type: String, default: "Conectando..." },
  type: { type: String, default: "submit" },
});

defineEmits(["click"]);
</script>

<style scoped>
.cosmic-btn {
  width: 100%;
  padding: 14px 24px;
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

/* Variante primary → gradiente violeta/púrpura */
.cosmic-btn--primary {
  background: linear-gradient(135deg, var(--violet-accent), var(--violet-mid));
  color: var(--text-primary);
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.3);
}

.cosmic-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(124, 58, 237, 0.5);
}

/* Variante orange → gradiente naranja cálido */
.cosmic-btn--orange {
  background: linear-gradient(135deg, var(--orange-primary), var(--orange-light));
  color: #1a0a2e;
  box-shadow: 0 4px 20px rgba(232, 132, 42, 0.3);
}

.cosmic-btn--orange:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(232, 132, 42, 0.5);
}

/* Active state */
.cosmic-btn:active {
  transform: translateY(0) !important;
}

/* Loader */
.cosmic-btn__loader {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
}

.cosmic-btn__spinner {
  animation: spin 1.5s linear infinite;
  font-size: 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Ícono append */
.cosmic-btn__icon {
  font-size: 1rem;
  margin-left: 4px;
}
</style>
