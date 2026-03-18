<template>
  <div class="membresia-view">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-header__title">
        <q-icon name="workspace_premium" size="28px" class="page-header__icon" />
        Plan Premium
      </h1>
      <p class="page-header__desc">Accede a todas las funciones y contenido exclusivo.</p>
    </div>

    <!-- Card principal -->
    <div class="membresia-layout">
      <!-- Panel izquierdo: beneficios -->
      <div class="glass-card benefits-card">
        <p class="benefits-card__eyebrow">PLAN PREMIUM</p>
        <h2 class="benefits-card__title">Todo lo que incluye</h2>
        <p class="benefits-card__desc">
          Suscripción mensual con renovación automática. Cancela cuando quieras.
        </p>

        <ul class="benefits-list">
          <li class="benefit-item" v-for="b in beneficios" :key="b.text">
            <div class="benefit-item__icon">
              <q-icon :name="b.icon" size="18px" />
            </div>
            <div>
              <p class="benefit-item__title">{{ b.title }}</p>
              <p class="benefit-item__desc">{{ b.desc }}</p>
            </div>
          </li>
        </ul>

        <div class="benefits-card__guarantee">
          <q-icon name="verified" size="16px" />
          <span>Garantía de 7 días</span>
        </div>
      </div>

      <!-- Panel derecho: precio + acción -->
      <div class="glass-card checkout-card">
        <!-- Si ya tiene membresía activa -->
        <div v-if="yaEsActivo" class="already-active">
          <div class="already-active__icon">
            <q-icon name="check_circle" size="36px" color="#22c55e" />
          </div>
          <h3 class="already-active__title">Membresía activa</h3>
          <p class="already-active__desc">Ya tienes acceso a todas las funciones Premium.</p>
          <button class="btn-premium" @click="router.push('/usuario/premium')">
            Ir al Panel Premium →
          </button>
        </div>

        <!-- Formulario de activación -->
        <div v-else>
          <p class="checkout-card__eyebrow">MEMBRESÍA MENSUAL</p>

          <div class="price-block">
            <span class="price-block__currency">$</span>
            <span class="price-block__amount">9.900</span>
            <span class="price-block__period">/mes</span>
          </div>
          <p class="price-block__note">Precio en pesos colombianos</p>

          <div class="checkout-divider"></div>

          <!-- Método de pago -->
          <p class="checkout-label">Pagar con</p>
          <div class="metodo-selector">
            <div class="metodo-btn metodo-btn--active">
              <q-icon name="credit_card" size="16px" />
              Tarjeta de crédito/débito
            </div>
          </div>

          <div class="checkout-divider"></div>

          <!-- Resumen -->
          <div class="resumen">
            <div class="resumen__row">
              <span>Suscripción mensual</span>
              <span>$9.900</span>
            </div>
            <div class="resumen__row resumen__row--total">
              <span>Total a pagar</span>
              <span>$9.900</span>
            </div>
          </div>

          <!-- Botón activar -->
          <button class="btn-premium" :class="{ 'btn-premium--loading': activando }" :disabled="activando"
            @click="handlePagar">
            <q-spinner-dots v-if="activando" color="white" size="20px" />
            <span v-else>
              <q-icon name="payment" size="18px" style="margin-right:6px;" />
              Pagar y Activar
            </span>
          </button>

          <p class="checkout-card__terms">
            Al continuar, aceptas nuestros términos y condiciones.
            La membresía se activará inmediatamente después del pago.
          </p>
        </div>
      </div>
    </div>

    <!-- Back -->
    <p class="membresia-back">
      <router-link to="/usuario" class="back-link">
        <q-icon name="arrow_back" size="16px" />
        Volver al Dashboard
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth.js";
import { postData } from "@/services/apiClient.js";
import { useNotifications } from "@/composables/useNotifications.js";

const router = useRouter();
const authStore = useAuthStore();
const notify = useNotifications();

const activando = ref(false);

const yaEsActivo = computed(() => authStore.usuario?.estado === "activo");

const beneficios = [
  {
    icon: "calendar_today",
    title: "Lectura Diaria Personalizada",
    desc: "Insights energéticos para cada día de tu ciclo numerológico.",
  },
  {
    icon: "history",
    title: "Historial Completo",
    desc: "Acceso a todas tus lecturas anteriores sin límite.",
  },
  {
    icon: "auto_awesome",
    title: "Análisis Profundo",
    desc: "Lecturas semanales y mensuales con mayor detalle.",
  },
  {
    icon: "insights",
    title: "Compatibilidad Numerológica",
    desc: "Descubre tu afinidad cósmica con otras personas.",
  },
  {
    icon: "support_agent",
    title: "Soporte Prioritario",
    desc: "Atención personalizada para tus consultas.",
  },
];

async function handlePagar() {
  if (activando.value || yaEsActivo.value) return;

  activando.value = true;
  try {
    // Simular pago: usa el endpoint existente POST /api/pagos
    await postData("pagos", {
      usuario_id: authStore.usuario._id || authStore.usuario.id,
      monto: 19900,
      metodo: "tarjeta",
    });

    // Actualizar estado local del usuario a activo
    authStore.setAuth({
      token: authStore.token,
      usuario: { ...authStore.usuario, estado: "activo" },
    });

    notify.success("¡Pago exitoso! Tu membresía Premium ha sido activada.");
    setTimeout(() => router.push("/usuario/premium"), 1500);
  } catch (error) {
    if (error.response?.status === 409) {
      notify.warning("Ya tienes una membresía activa.");
      authStore.setAuth({
        token: authStore.token,
        usuario: { ...authStore.usuario, estado: "activo" },
      });
      setTimeout(() => router.push("/usuario/premium"), 1000);
    } else {
      notify.error(
        error.response?.data?.error ||
          "Error al activar la membresía. Intenta de nuevo."
      );
    }
  } finally {
    activando.value = false;
  }
}
</script>

<style >
.membresia-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px 16px;
}

/* Header */
.page-header {
  margin-bottom: 32px;
}

.page-header__title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.page-header__icon {
  color: #e8842a;
}

.page-header__desc {
  font-size: 0.85rem;
  color: #a0a0c0;
  margin: 4px 0 0 0;
}

/* Layout */
.membresia-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
  align-items: start;
  margin-bottom: 24px;
}

/* Benefits card */
.benefits-card {
  padding: 36px 32px;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
}

.benefits-card__eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #e8842a;
  margin: 0 0 12px 0;
}

.benefits-card__title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 10px 0;
  line-height: 1.2;
}

.benefits-card__desc {
  font-size: 0.85rem;
  color: #a0a0c0;
  line-height: 1.6;
  margin: 0 0 28px 0;
}

/* Benefits list */
.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 28px 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.benefit-item__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(232, 132, 42, 0.1);
  border: 1px solid rgba(232, 132, 42, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e8842a;
  flex-shrink: 0;
}

.benefit-item__title {
  font-size: 0.88rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 2px 0;
}

.benefit-item__desc {
  font-size: 0.78rem;
  color: #a0a0c0;
  margin: 0;
  line-height: 1.4;
}

.benefits-card__guarantee {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: #6a6a88;
  border-top: 1px solid #2a2a3a;
  padding-top: 20px;
}

/* Checkout card */
.checkout-card {
  padding: 32px 28px;
  position: sticky;
  top: 100px;
  border: 1px solid #2a2a3a;
  border-radius: 16px;
}

.checkout-card__eyebrow {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #6a6a88;
  margin: 0 0 12px 0;
}

/* Price */
.price-block {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 2px;
}

.price-block__currency {
  font-size: 1.4rem;
  font-weight: 700;
  color: #ffffff;
}

.price-block__amount {
  font-size: 2.8rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.price-block__period {
  font-size: 0.85rem;
  color: #6a6a88;
  margin-left: 4px;
}

.price-block__note {
  font-size: 0.7rem;
  color: #6a6a88;
  margin: 0 0 20px 0;
}

.checkout-divider {
  height: 1px;
  background: #2a2a3a;
  margin: 20px 0;
}

/* Método selector */
.checkout-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #6a6a88;
  margin: 0 0 10px 0;
}

.metodo-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.metodo-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  border: 1px solid #2a2a3a;
  background: transparent;
  color: #a0a0c0;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.metodo-btn:hover {
  border-color: #7c3aed;
  color: #ffffff;
}

.metodo-btn--active {
  border-color: #e8842a;
  color: #e8842a;
  background: rgba(232, 132, 42, 0.08);
}

/* Resumen */
.resumen {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}

.resumen__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #a0a0c0;
}

.resumen__row--total {
  font-weight: 700;
  color: #ffffff;
  font-size: 0.88rem;
  border-top: 1px solid #2a2a3a;
  padding-top: 8px;
  margin-top: 4px;
}

/* Botón principal */
.btn-premium {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #e8842a, #f59e0b);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(232, 132, 42, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  margin-bottom: 14px;
}

.btn-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 132, 42, 0.4);
}

.btn-premium:disabled,
.btn-premium--loading {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.checkout-card__terms {
  font-size: 0.7rem;
  color: #6a6a88;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

/* Already active */
.already-active {
  text-align: center;
  padding: 16px 0;
}

.already-active__icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(232, 132, 42, 0.1);
  border: 1px solid rgba(232, 132, 42, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #e8842a;
}

.already-active__title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.already-active__desc {
  font-size: 0.85rem;
  color: #a0a0c0;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

/* Back link */
.membresia-back {
  text-align: center;
  margin-top: 8px;
}

.back-link {
  font-size: 0.82rem;
  color: #a0a0c0;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.back-link:hover {
  color: #e8842a;
}

/* Responsive */
@media (max-width: 768px) {
  .membresia-layout {
    grid-template-columns: 1fr;
  }

  .checkout-card {
    position: static;
  }

  .benefits-card {
    padding: 28px 20px;
  }

  .price-block__amount {
    font-size: 2.2rem;
  }
}
</style>
