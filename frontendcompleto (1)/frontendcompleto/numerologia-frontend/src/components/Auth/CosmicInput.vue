<template>
  <div class="cosmic-input-wrapper">
    <label v-if="label" class="cosmic-input__label">{{ label }}</label>
    <q-input :model-value="modelValue" @update:model-value="handleInput" :type="computedType" :placeholder="placeholder"
      :error="!!error" :error-message="error" hide-bottom-space outlined dark class="cosmic-input"
      :class="{ 'cosmic-input--has-error': !!error }">
      <template #prepend>
        <q-icon :name="icon" class="cosmic-input__icon" />
      </template>
      <template v-if="type === 'password'" #append>
        <q-icon :name="showPassword ? 'visibility_off' : 'visibility'" class="cosmic-input__toggle"
          @click="showPassword = !showPassword" />
      </template>
    </q-input>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  modelValue: { type: [String, null], default: "" },
  icon: { type: String, default: "person" },
  label: { type: String, default: "" },
  type: { type: String, default: "text" },
  placeholder: { type: String, default: "" },
  error: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const showPassword = ref(false);

const computedType = computed(() =>
  props.type === 'password' ? (showPassword.value ? 'text' : 'password') : props.type
);

const handleInput = (value) => {
  emit("update:modelValue", value);
};
</script>

<style >
.cosmic-input-wrapper {
  margin-bottom: 8px;
}

.cosmic-input__label {
  display: block;
  font-family: var(--font-body);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--orange-primary);
  margin-bottom: 8px;
}

/* Estilos del q-input */
.cosmic-input :deep(.q-field__control) {
  background: rgba(15, 14, 36, 0.8);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  padding: 4px 12px;
  transition: all 0.3s ease;
}

.cosmic-input :deep(.q-field__control:hover) {
  border-color: rgba(124, 58, 237, 0.4);
}

.cosmic-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--orange-primary);
  box-shadow: 0 0 20px rgba(232, 132, 42, 0.15);
}

.cosmic-input :deep(.q-field__native) {
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 0.95rem;
}

.cosmic-input :deep(.q-field__native::placeholder) {
  color: var(--text-muted);
}

/* Borde de Quasar outline removido para usar el nuestro */
.cosmic-input :deep(.q-field--outlined .q-field__control::before) {
  border: none;
}

.cosmic-input :deep(.q-field--outlined .q-field__control::after) {
  border: none;
}

/* Neutralizar el fondo blanco del autocompletado del navegador */
.cosmic-input :deep(input:-webkit-autofill),
.cosmic-input :deep(input:-webkit-autofill:hover),
.cosmic-input :deep(input:-webkit-autofill:focus),
.cosmic-input :deep(input:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0 1000px rgba(15, 14, 36, 0.95) inset !important;
  box-shadow: 0 0 0 1000px rgba(15, 14, 36, 0.95) inset !important;
  -webkit-text-fill-color: var(--text-primary) !important;
  caret-color: var(--text-primary);
  transition: background-color 9999s ease-in-out 0s;
}

/* Ícono */
.cosmic-input__icon {
  color: var(--text-muted);
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.cosmic-input :deep(.q-field--focused) .cosmic-input__icon {
  color: var(--orange-primary);
}

/* Toggle password */
.cosmic-input__toggle {
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1.1rem;
  transition: color 0.3s ease;
}

.cosmic-input__toggle:hover {
  color: var(--orange-light);
}

/* Estado de error */
.cosmic-input--has-error :deep(.q-field__control) {
  border-color: var(--border-error) !important;
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
}

.cosmic-input :deep(.q-field__messages) {
  color: #ef4444;
  font-size: 0.75rem;
  animation: slideIn 0.3s ease-out;
}

.cosmic-input :deep(.q-field--error .q-field__bottom) {
  padding-top: 4px;
}
</style>
