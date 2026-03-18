<template>
  <div class="cosmic-membresia">
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
    <div class="page-header">
      <div class="header-badge">
        <span class="badge-dot"></span>
        <span>ENERGÍA PREMIUM</span>
      </div>
      <h1 class="page-header__title">
        <span class="title-gradient">Plan Premium</span>
        <span class="title-emoji">⭐</span>
      </h1>
      <p class="page-header__desc">Accede a todas las funciones y contenido exclusivo.</p>
    </div>

    <!-- Card principal -->
    <div class="membresia-layout">
      <!-- Panel izquierdo: beneficios -->
      <div class="glass-card benefits-card">
        <div class="card-orb">
          <div class="orb-inner">
            <span class="orb-emoji">✨</span>
          </div>
        </div>

        <p class="benefits-card__eyebrow">PLAN PREMIUM</p>
        <h2 class="benefits-card__title">Todo lo que incluye</h2>
        <p class="benefits-card__desc">
          Suscripción mensual con renovación automática. Cancela cuando quieras.
        </p>

        <ul class="benefits-list">
          <li class="benefit-item" v-for="(b, index) in beneficios" :key="index">
            <div class="benefit-item__icon" :class="`benefit-icon--${index + 1}`">
              <q-icon :name="b.icon" size="18px" />
            </div>
            <div>
              <p class="benefit-item__title">{{ b.title }}</p>
              <p class="benefit-item__desc">{{ b.desc }}</p>
            </div>
          </li>
        </ul>

        <div class="benefits-card__guarantee">
          <div class="guarantee-icon">
            <q-icon name="verified" size="16px" />
          </div>
          <span>Garantía de 7 días cósmicos</span>
        </div>
      </div>

      <!-- Panel derecho: precio + acción -->
      <div class="glass-card checkout-card">
        <div class="card-orb-right">
          <div class="orb-inner">
            <span class="orb-emoji">💰</span>
          </div>
        </div>

        <!-- Si ya tiene membresía activa -->
        <div v-if="yaEsActivo" class="already-active">
          <div class="already-active__orb">
            <span class="already-active__emoji">✨</span>
          </div>
          <h3 class="already-active__title">Membresía activa</h3>
          <p class="already-active__desc">Ya tienes acceso a todas las funciones Premium.</p>
          <button class="btn-premium" @click="router.push('/usuario/premium')">
            <span>Ir al Panel Premium</span>
            <span class="btn-arrow">→</span>
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
              <span class="resumen__value">$9.900</span>
            </div>
            <div class="resumen__row resumen__row--total">
              <span>Total a pagar</span>
              <span class="resumen__total">$9.900</span>
            </div>
          </div>

          <!-- Botón activar -->
          <button class="btn-premium" :class="{ 'btn-premium--loading': activando }" :disabled="activando"
            @click="handlePagar">
            <q-spinner-dots v-if="activando" color="white" size="20px" />
            <span v-else class="btn-content">
              <q-icon name="payment" size="18px" class="btn-icon" />
              Pagar y Activar
              <span class="btn-arrow">→</span>
            </span>
          </button>

          <p class="checkout-card__terms">
            Al continuar, aceptas nuestros términos y condiciones cósmicas.
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
    await postData("pagos", {
      usuario_id: authStore.usuario._id || authStore.usuario.id,
      monto: 19900,
      metodo: "tarjeta",
    });

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

<style>
/* Variables de color - Misma paleta cósmica */
:root {
  --color-bg: #0a0a14;
  --color-surface: rgba(18, 18, 32, 0.8);
  --color-surface-hover: rgba(28, 28, 48, 0.9);
  --color-primary: #b388ff;
  --color-primary-glow: rgba(179, 136, 255, 0.3);
  --color-premium: #ff9f4a;
  --color-premium-glow: rgba(255, 159, 74, 0.3);
  --color-success: #22c55e;
  --color-success-glow: rgba(34, 197, 94, 0.3);
  --color-text: #ffffff;
  --color-text-secondary: #a0a0c0;
  --border-radius: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cosmic-membresia {
  min-height: 100vh;
  padding: 2rem 1.5rem;
  background: var(--color-bg);
  position: relative;
  overflow-x: hidden;
  max-width: 1200px;
  margin: 0 auto;
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
    radial-gradient(circle at 70% 30%, rgba(255, 159, 74, 0.1) 0%, transparent 50%);
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
  background: #ff9f4a;
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

/* Header */
.page-header {
  position: relative;
  z-index: 2;
  margin-bottom: 2.5rem;
  text-align: center;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 20px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 159, 74, 0.3);
  border-radius: 100px;
  color: var(--color-premium);
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 2px;
  backdrop-filter: blur(8px);
  margin-bottom: 1rem;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: var(--color-premium);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.page-header__title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 0 0.5rem;
}

.title-gradient {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff, var(--color-premium));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-emoji {
  font-size: 2.5rem;
  animation: float-emoji 3s infinite;
}

@keyframes float-emoji {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.page-header__desc {
  color: var(--color-text-secondary);
  font-size: 1rem;
  max-width: 500px;
  margin: 0 auto;
}

/* Layout */
.membresia-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
  margin-bottom: 2rem;
  position: relative;
  z-index: 2;
}

/* Cards base */
.glass-card {
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 159, 74, 0.2);
  border-radius: var(--border-radius);
  position: relative;
  overflow: hidden;
  transition: var(--transition);
}

.glass-card:hover {
  border-color: var(--color-premium);
  box-shadow: 0 20px 40px -12px var(--color-premium-glow);
}

/* Orbes decorativos */
.card-orb, .card-orb-right {
  position: absolute;
  width: 120px;
  height: 120px;
  pointer-events: none;
  z-index: 1;
}

.card-orb {
  top: -20px;
  left: -20px;
}

.card-orb-right {
  top: -20px;
  right: -20px;
}

.orb-inner {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 159, 74, 0.2), transparent 70%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-orb 3s infinite;
}

.orb-emoji {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 20px rgba(255, 159, 74, 0.5));
  transform: rotate(10deg);
}

@keyframes pulse-orb {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

/* Benefits card */
.benefits-card {
  padding: 2.5rem 2rem;
}

.benefits-card__eyebrow {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-premium);
  margin: 0 0 0.5rem;
  position: relative;
  z-index: 2;
}

.benefits-card__title {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.75rem;
  position: relative;
  z-index: 2;
}

.benefits-card__desc {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0 0 2rem;
  position: relative;
  z-index: 2;
}

/* Benefits list */
.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  position: relative;
  z-index: 2;
}

.benefit-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.benefit-item__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.benefit-icon--1 {
  background: rgba(255, 159, 74, 0.1);
  color: var(--color-premium);
  border: 1px solid rgba(255, 159, 74, 0.3);
}

.benefit-icon--2 {
  background: rgba(124, 77, 255, 0.1);
  color: #7c4dff;
  border: 1px solid rgba(124, 77, 255, 0.3);
}

.benefit-icon--3 {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.benefit-icon--4 {
  background: rgba(255, 107, 74, 0.1);
  color: #ff6b4a;
  border: 1px solid rgba(255, 107, 74, 0.3);
}

.benefit-icon--5 {
  background: rgba(179, 136, 255, 0.1);
  color: #b388ff;
  border: 1px solid rgba(179, 136, 255, 0.3);
}

.benefit-item__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  margin: 0 0 0.25rem;
}

.benefit-item__desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.5;
}

.benefits-card__guarantee {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  border-top: 1px solid rgba(255, 159, 74, 0.2);
  padding-top: 1.5rem;
  position: relative;
  z-index: 2;
}

.guarantee-icon {
  color: var(--color-premium);
}

/* Checkout card */
.checkout-card {
  padding: 2rem;
  position: sticky;
  top: 100px;
}

.checkout-card__eyebrow {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem;
  position: relative;
  z-index: 2;
}

/* Price */
.price-block {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 0.25rem;
  position: relative;
  z-index: 2;
}

.price-block__currency {
  font-size: 1.6rem;
  font-weight: 700;
  color: white;
}

.price-block__amount {
  font-size: 3rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  background: linear-gradient(135deg, #fff, var(--color-premium));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.price-block__period {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-left: 4px;
}

.price-block__note {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin: 0 0 1.5rem;
  position: relative;
  z-index: 2;
}

.checkout-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 159, 74, 0.3), transparent);
  margin: 1.5rem 0;
  position: relative;
  z-index: 2;
}

/* Método selector */
.checkout-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  margin: 0 0 0.5rem;
  position: relative;
  z-index: 2;
}

.metodo-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  position: relative;
  z-index: 2;
}

.metodo-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 159, 74, 0.2);
  background: rgba(0, 0, 0, 0.2);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: var(--transition);
  width: 100%;
}

.metodo-btn:hover {
  border-color: var(--color-premium);
  color: white;
  background: rgba(255, 159, 74, 0.05);
}

.metodo-btn--active {
  border-color: var(--color-premium);
  color: var(--color-premium);
  background: rgba(255, 159, 74, 0.1);
}

/* Resumen */
.resumen {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
}

.resumen__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.resumen__value {
  color: white;
  font-weight: 600;
}

.resumen__row--total {
  font-weight: 700;
  border-top: 1px solid rgba(255, 159, 74, 0.2);
  padding-top: 0.75rem;
  margin-top: 0.25rem;
}

.resumen__total {
  color: var(--color-premium);
  font-size: 1.1rem;
}

/* Botón premium */
.btn-premium {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ff9f4a, #ff6b4a);
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 10px 20px -5px rgba(255, 159, 74, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.btn-premium::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.btn-premium:hover::before {
  left: 100%;
}

.btn-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(255, 159, 74, 0.6);
}

.btn-premium:disabled,
.btn-premium--loading {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  color: white;
}

.btn-arrow {
  transition: transform 0.2s;
}

.btn-premium:hover .btn-arrow {
  transform: translateX(4px);
}

.checkout-card__terms {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  text-align: center;
  line-height: 1.6;
  margin: 0;
  position: relative;
  z-index: 2;
}

/* Already active */
.already-active {
  text-align: center;
  padding: 1rem 0;
  position: relative;
  z-index: 2;
}

.already-active__orb {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(34, 197, 94, 0.2), transparent 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-orb 3s infinite;
}

.already-active__emoji {
  font-size: 2.5rem;
  filter: drop-shadow(0 0 20px rgba(34, 197, 94, 0.5));
}

.already-active__title {
  font-size: 1.4rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.5rem;
}

.already-active__desc {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  margin: 0 0 1.5rem;
  line-height: 1.6;
}

/* Back link */
.membresia-back {
  text-align: center;
  margin-top: 1rem;
  position: relative;
  z-index: 2;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  border: 1px solid rgba(255, 159, 74, 0.2);
  transition: var(--transition);
}

.back-link:hover {
  border-color: var(--color-premium);
  color: var(--color-premium);
  transform: translateX(-4px);
}

/* Responsive */
@media (max-width: 768px) {
  .cosmic-membresia {
    padding: 1rem;
  }

  .membresia-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .checkout-card {
    position: static;
  }

  .title-gradient {
    font-size: 2rem;
  }

  .title-emoji {
    font-size: 2rem;
  }

  .benefits-card {
    padding: 2rem 1.5rem;
  }

  .benefits-card__title {
    font-size: 1.6rem;
  }

  .card-orb, .card-orb-right {
    width: 80px;
    height: 80px;
  }

  .orb-emoji {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .price-block__amount {
    font-size: 2.5rem;
  }

  .benefit-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .benefits-card__guarantee {
    justify-content: center;
  }
}
</style>