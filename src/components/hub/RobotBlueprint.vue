<script setup>
// Blueprint técnico do robô — traçado como no design ERO Hub, com um leve
// "draw-on" no primeiro reveal via stroke-dasharray/offset animado por CSS.
</script>

<template>
  <svg viewBox="0 0 480 620" class="hub-robot" preserveAspectRatio="xMidYMid meet">
    <circle cx="240" cy="330" r="252" fill="none" stroke="rgba(255,255,255,0.05)" />
    <circle cx="240" cy="330" r="205" fill="none" stroke="rgba(230,48,48,0.14)" stroke-width="1" stroke-dasharray="3 7" />
    <path d="M300 120 A160 160 0 0 1 430 250" fill="none" stroke="rgba(230,48,48,0.45)" stroke-width="1" />
    <line x1="70" y1="330" x2="410" y2="330" stroke="rgba(255,255,255,0.06)" />
    <line x1="240" y1="70" x2="240" y2="600" stroke="rgba(255,255,255,0.05)" stroke-dasharray="2 6" />
    <line x1="438" y1="150" x2="438" y2="560" stroke="rgba(255,255,255,0.22)" stroke-dasharray="4 5" />
    <line x1="432" y1="150" x2="444" y2="150" stroke="rgba(255,255,255,0.22)" />
    <line x1="432" y1="560" x2="444" y2="560" stroke="rgba(255,255,255,0.22)" />

    <g class="hub-robot-lines" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="1.4" stroke-linejoin="round">
      <line x1="240" y1="150" x2="240" y2="128" stroke="rgba(255,255,255,0.4)" />
      <circle cx="240" cy="124" r="3.2" stroke="rgba(255,255,255,0.5)" />
      <polygon points="175,168 190,150 290,150 305,168 305,196 290,214 190,214 175,196" />
      <circle cx="210" cy="182" r="12" /><circle cx="210" cy="182" r="6.5" stroke="rgba(255,255,255,0.35)" />
      <circle cx="240" cy="182" r="12" /><circle cx="240" cy="182" r="6.5" stroke="rgba(255,255,255,0.35)" />
      <circle cx="270" cy="182" r="12" /><circle cx="270" cy="182" r="6.5" stroke="rgba(255,255,255,0.35)" />
      <polygon points="218,214 262,214 268,242 212,242" />
      <line x1="228" y1="220" x2="228" y2="238" stroke="rgba(255,255,255,0.3)" />
      <line x1="252" y1="220" x2="252" y2="238" stroke="rgba(255,255,255,0.3)" />
      <polygon points="150,262 168,242 312,242 330,262 330,420 312,440 168,440 150,420" />
      <rect x="186" y="272" width="108" height="36" rx="3" stroke="rgba(255,255,255,0.45)" />
      <line x1="194" y1="284" x2="286" y2="284" stroke="rgba(255,255,255,0.28)" />
      <line x1="194" y1="296" x2="256" y2="296" stroke="rgba(255,255,255,0.28)" />
      <rect x="200" y="328" width="80" height="12" rx="2" stroke="rgba(255,255,255,0.35)" />
      <line x1="150" y1="370" x2="330" y2="370" stroke="rgba(255,255,255,0.22)" />
      <line x1="176" y1="390" x2="304" y2="390" stroke="rgba(255,255,255,0.18)" />
      <line x1="176" y1="406" x2="304" y2="406" stroke="rgba(255,255,255,0.18)" />
      <circle cx="168" cy="262" r="3" stroke="rgba(255,255,255,0.4)" /><circle cx="312" cy="262" r="3" stroke="rgba(255,255,255,0.4)" />
      <circle cx="168" cy="420" r="3" stroke="rgba(255,255,255,0.4)" /><circle cx="312" cy="420" r="3" stroke="rgba(255,255,255,0.4)" />
      <circle cx="152" cy="282" r="11" stroke="rgba(255,255,255,0.5)" />
      <polygon points="140,288 160,282 178,352 158,358" stroke="rgba(255,255,255,0.5)" />
      <circle cx="168" cy="360" r="9" stroke="rgba(255,255,255,0.5)" />
      <polygon points="160,362 178,360 190,428 172,432" stroke="rgba(255,255,255,0.5)" />
      <rect x="170" y="430" width="24" height="16" rx="2" stroke="rgba(255,255,255,0.45)" />
      <circle cx="328" cy="282" r="11" stroke="rgba(255,255,255,0.5)" />
      <polygon points="340,288 320,282 302,352 322,358" stroke="rgba(255,255,255,0.5)" />
      <circle cx="312" cy="360" r="9" stroke="rgba(255,255,255,0.5)" />
      <polygon points="320,362 302,360 290,428 308,432" stroke="rgba(255,255,255,0.5)" />
      <rect x="286" y="430" width="24" height="16" rx="2" stroke="rgba(255,255,255,0.45)" />
      <polygon points="180,440 300,440 312,472 168,472" />
      <line x1="185" y1="472" x2="176" y2="500" stroke="rgba(255,255,255,0.45)" />
      <line x1="295" y1="472" x2="304" y2="500" stroke="rgba(255,255,255,0.45)" />
      <circle cx="172" cy="522" r="54" /><circle cx="172" cy="522" r="42" stroke="rgba(255,255,255,0.3)" /><circle cx="172" cy="522" r="16" stroke="rgba(255,255,255,0.5)" /><circle cx="172" cy="522" r="4" stroke="rgba(255,255,255,0.4)" />
      <line x1="172" y1="480" x2="172" y2="564" stroke="rgba(255,255,255,0.18)" /><line x1="130" y1="522" x2="214" y2="522" stroke="rgba(255,255,255,0.18)" />
      <circle cx="308" cy="522" r="54" /><circle cx="308" cy="522" r="42" stroke="rgba(255,255,255,0.3)" /><circle cx="308" cy="522" r="16" stroke="rgba(255,255,255,0.5)" /><circle cx="308" cy="522" r="4" stroke="rgba(255,255,255,0.4)" />
      <line x1="308" y1="480" x2="308" y2="564" stroke="rgba(255,255,255,0.18)" /><line x1="266" y1="522" x2="350" y2="522" stroke="rgba(255,255,255,0.18)" />
    </g>
    <line x1="120" y1="586" x2="360" y2="586" stroke="rgba(255,255,255,0.16)" stroke-dasharray="3 6" />
    <g class="hub-robot-cross" stroke="#e63030" stroke-width="1.3">
      <path d="M356 172 H368 M362 166 V178" />
      <path d="M368 250 H380 M374 244 V256" />
      <path d="M360 336 H372 M366 330 V342" />
      <path d="M356 470 H368 M362 464 V476" />
      <path d="M144 300 H156 M150 294 V306" />
      <path d="M298 138 H310 M304 132 V144" />
    </g>
  </svg>
</template>

<style scoped>
.hub-robot {
  width: 100%;
  max-width: 470px;
  height: auto;
  display: block;
  margin: 0 auto;
}
.hub-robot-lines {
  animation: hub-robot-fade 900ms ease both;
}
.hub-robot-cross {
  animation: hub-robot-blink-in 700ms ease 700ms both;
}
@keyframes hub-robot-fade {
  from {
    opacity: 0;
    transform: scale(0.97);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes hub-robot-blink-in {
  0% { opacity: 0; }
  60% { opacity: 1; }
  80% { opacity: 0.3; }
  100% { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .hub-robot-lines,
  .hub-robot-cross {
    animation: none;
  }
}
</style>
