<template>
  <div class="cosmic-pago-exitoso">
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

    <!-- Logo -->
    <div class="cosmic-logo">
      <span class="logo-text">Numerología</span>
      <span class="logo-highlight">Pro</span>
    </div>

    <!-- Check cósmico -->
    <div class="success-orb">
      <div class="success-orb__aura"></div>
      <div class="success-orb__inner">
        <span class="success-emoji">✨</span>
      </div>
    </div>

    <h1 class="cosmic-title">¡Pago Exitoso!</h1>

    <p class="cosmic-subtitle">
      Bienvenido al <span class="subtitle-highlight">Círculo Premium</span>.<br>
      Tu lectura detallada ya está disponible en el cosmos.
    </p>

    <!-- Card de resumen cósmico -->
    <div class="cosmic-card">
      <div class="card-header">
        <span class="header-label">Resumen de la Orden</span>
        <span class="header-badge">
          <span class="badge-dot"></span>
          PAGADO
        </span>
      </div>

      <div class="product-section">
        <div class="product-info">
          <div class="product-icon">🔮</div>
          <div>
            <strong class="product-title">Lectura Premium de Numerología</strong>
            <p class="product-desc">Análisis completo de vida • 12 meses</p>
          </div>
        </div>
        <div class="product-price">$49.99</div>
      </div>

      <div class="details-section">
        <div class="detail-row">
          <span class="detail-label">Subtotal</span>
          <span class="detail-value">$42.01</span>
        </div>

        <div class="detail-row">
          <span class="detail-label">IVA (19%)</span>
          <span class="detail-value">$7.98</span>
        </div>

        <div class="detail-row detail-row--discount">
          <span class="detail-label">Descuento Promocional</span>
          <span class="detail-value detail-value--discount">$0.00</span>
        </div>

        <div class="divider"></div>

        <div class="total-row">
          <span class="total-label">Total Pagado</span>
          <span class="total-value">$49.99</span>
        </div>
      </div>

      <!-- Energía del pago -->
      <div class="payment-energy">
        <div class="energy-bar">
          <div class="energy-fill" style="width: 100%"></div>
        </div>
        <span class="energy-text">✦ Energía confirmada ✦</span>
      </div>
    </div>

    <!-- Botón cósmico -->
    <button class="cosmic-button" @click="verLectura">
      <span class="button-text">Ver mi Lectura ahora</span>
      <span class="button-arrow">→</span>
      <div class="button-glow"></div>
    </button>

    <!-- Footer -->
    <p class="cosmic-footer">
      <span class="footer-icon">📧</span>
      Se ha enviado un recibo a tu correo electrónico registrado.
    </p>
  </div>
</template>

<script setup>
const verLectura = () => {
  window.location.href = "/lectura"
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
  --color-success: #22c55e;
  --color-success-glow: rgba(34, 197, 94, 0.3);
  --color-premium: #ff9f4a;
  --color-premium-glow: rgba(255, 159, 74, 0.3);
  --color-text: #ffffff;
  --color-text-secondary: #a0a0c0;
  --border-radius: 24px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.cosmic-pago-exitoso {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  position: relative;
  overflow-x: hidden;
  font-family: system-ui, -apple-system, sans-serif;
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

/* Logo */
.cosmic-logo {
  position: relative;
  z-index: 2;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 2rem;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: 100px;
  backdrop-filter: blur(8px);
}

.logo-text {
  background: linear-gradient(135deg, #fff, var(--color-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.logo-highlight {
  background: linear-gradient(135deg, var(--color-premium), #ff6b4a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-left: 4px;
}

/* Success orb */
.success-orb {
  position: relative;
  z-index: 2;
  width: 100px;
  height: 100px;
  margin-bottom: 1.5rem;
}

.success-orb__aura {
  position: absolute;
  inset: -15px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-success-glow), transparent 70%);
  animation: pulse-aura 2s infinite;
}

.success-orb__inner {
  position: relative;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.5);
  animation: pulse-orb 2s infinite;
}

.success-emoji {
  font-size: 3rem;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
  animation: float-emoji 3s infinite;
}

@keyframes pulse-aura {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.5; }
}

@keyframes pulse-orb {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes float-emoji {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(5deg); }
  75% { transform: translateY(5px) rotate(-5deg); }
}

/* Title */
.cosmic-title {
  position: relative;
  z-index: 2;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(135deg, #fff, var(--color-premium));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
}

.cosmic-subtitle {
  position: relative;
  z-index: 2;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  max-width: 320px;
}

.subtitle-highlight {
  color: var(--color-premium);
  font-weight: 600;
  position: relative;
}

.subtitle-highlight::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--color-premium), transparent);
}

/* Card */
.cosmic-card {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 360px;
  background: var(--color-surface);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(179, 136, 255, 0.2);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
  transition: var(--transition);
}

.cosmic-card:hover {
  border-color: var(--color-premium);
  box-shadow: 0 20px 40px -12px var(--color-premium-glow);
}

/* Card header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(255, 159, 74, 0.2);
}

.header-label {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  letter-spacing: 0.5px;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 30px;
  color: #22c55e;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

/* Product section */
.product-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  border: 1px solid rgba(255, 159, 74, 0.1);
}

.product-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 159, 74, 0.1);
  border: 1px solid rgba(255, 159, 74, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.product-title {
  display: block;
  color: white;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.product-desc {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.product-price {
  color: var(--color-premium);
  font-weight: 700;
  font-size: 1.2rem;
}

/* Details section */
.details-section {
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  font-size: 0.85rem;
}

.detail-label {
  color: var(--color-text-secondary);
}

.detail-value {
  color: white;
  font-weight: 500;
}

.detail-row--discount .detail-label {
  color: #22c55e;
}

.detail-value--discount {
  color: #22c55e !important;
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 159, 74, 0.3), transparent);
  margin: 1rem 0;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.total-value {
  color: var(--color-premium);
  font-weight: 700;
  font-size: 1.3rem;
}

/* Payment energy */
.payment-energy {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 159, 74, 0.1);
}

.energy-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #4ade80);
  border-radius: 2px;
  position: relative;
  animation: energy-pulse 2s infinite;
}

@keyframes energy-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.energy-text {
  display: block;
  text-align: center;
  font-size: 0.7rem;
  color: #22c55e;
  letter-spacing: 1px;
}

/* Botón cósmico */
.cosmic-button {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 360px;
  padding: 1rem;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--color-premium), #ff6b4a);
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 10px 20px -5px rgba(255, 159, 74, 0.4);
  margin-bottom: 1rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-text {
  position: relative;
  z-index: 2;
}

.button-arrow {
  position: relative;
  z-index: 2;
  transition: transform 0.2s;
}

.button-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.cosmic-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px -5px rgba(255, 159, 74, 0.6);
}

.cosmic-button:hover .button-arrow {
  transform: translateX(4px);
}

.cosmic-button:hover .button-glow {
  left: 100%;
}

/* Footer */
.cosmic-footer {
  position: relative;
  z-index: 2;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 159, 74, 0.1);
  border-radius: 30px;
  backdrop-filter: blur(4px);
}

.footer-icon {
  font-size: 1rem;
  filter: drop-shadow(0 0 5px rgba(255, 159, 74, 0.3));
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

/* Responsive */
@media (max-width: 480px) {
  .cosmic-pago-exitoso {
    padding: 1.5rem 1rem;
  }

  .cosmic-title {
    font-size: 2rem;
  }

  .success-orb {
    width: 80px;
    height: 80px;
  }

  .success-emoji {
    font-size: 2.2rem;
  }

  .cosmic-card {
    padding: 1.25rem;
  }

  .product-title {
    font-size: 0.8rem;
  }

  .product-price {
    font-size: 1rem;
  }

  .total-value {
    font-size: 1.1rem;
  }

  .cosmic-footer {
    font-size: 0.7rem;
    flex-wrap: wrap;
  }
}
</style>