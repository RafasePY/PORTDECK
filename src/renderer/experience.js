'use strict';
// PortDeck PULSE: microinterações e áudio sintetizado com WebAudio.
// Os sons são produzidos localmente; nenhuma mídia da Steam é copiada.
(() => {
  const $ = id => document.getElementById(id);
  const splash = $('boot-screen');
  const soundButton = $('sound-toggle');
  let soundEnabled = localStorage.getItem('portdeck:pulse:sound') !== 'off';
  let audio = null, bootDone = false, lastSelection = null, lastNavigation = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function audioContext() {
    if (!audio) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return null;
      audio = new Audio();
    }
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    return audio;
  }
  function note(frequency, duration, type, volume, delay, finishFrequency) {
    if (!soundEnabled) return;
    try {
      const c = audioContext();
      if (!c) return;
      const t = c.currentTime + (delay || 0), oscillator = c.createOscillator();
      const gain = c.createGain();
      oscillator.type = type || 'sine';
      oscillator.frequency.setValueAtTime(frequency, t);
      if (finishFrequency) oscillator.frequency.exponentialRampToValueAtTime(finishFrequency, t + duration);
      gain.gain.setValueAtTime(.0001, t);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0002, volume), t + .013);
      gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
      oscillator.connect(gain).connect(c.destination);
      oscillator.start(t);
      oscillator.stop(t + duration + .025);
    } catch(e) { /* áudio desabilitado pelo sistema; a interface continua funcional */ }
  }
  function sound(kind) {
    if (kind === 'move') note(420,.075,'sine',.035,0,620);
    if (kind === 'select') {note(480,.115,'triangle',.065,0,790);note(820,.11,'sine',.035,.075,1120);}
    if (kind === 'back') note(650,.13,'sine',.045,0,340);
    if (kind === 'boot') {
      note(130,.55,'sine',.09,0,360);
      note(280,.6,'triangle',.045,.15,620);
      note(640,.5,'sine',.035,.28,920);
    }
  }
  function syncSoundButton() {
    soundButton.textContent = soundEnabled ? '♫' : '♪';
    soundButton.classList.toggle('muted',!soundEnabled);
    soundButton.setAttribute('aria-label',soundEnabled?'Desativar sons':'Ativar sons');
    soundButton.title = soundEnabled?'Desativar sons da interface':'Ativar sons da interface';
  }
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('portdeck:pulse:sound',soundEnabled?'on':'off');
    syncSoundButton();
    if (soundEnabled) sound('select');
  });
  syncSoundButton();
  function finishBoot() {
    if (bootDone) return;
    bootDone = true;
    splash.classList.add('dismissed');
    sound('select');
    setTimeout(() => splash.setAttribute('hidden',''),900);
    const play = $('play-selected');
    if (!play.disabled) play.focus({preventScroll:true});
  }
  setTimeout(() => { if (soundEnabled) sound('boot'); },reduceMotion?0:300);
  setTimeout(finishBoot,reduceMotion?200:2450);
  splash.addEventListener('click',finishBoot);
  document.addEventListener('keydown',e => {
    if (bootDone) return;
    if (e.key === 'Tab') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    finishBoot();
  },true);
  // Events emitted by the library, so mouse, keyboard and gamepad feel the same.
  window.addEventListener('portdeck:navigate', e => {
    if (!bootDone) {lastSelection=e.detail.id;return;}
    if (lastSelection===e.detail.id) return;
    lastSelection=e.detail.id;
    if (performance.now()-lastNavigation>85) sound('move');
    lastNavigation=performance.now();
    const info=$('hero-info');
    info.classList.remove('pulse-enter');
    void info.offsetWidth;
    info.classList.add('pulse-enter');
  });
  window.addEventListener('portdeck:view',()=>{if(bootDone)sound('move');});
  window.addEventListener('portdeck:play',()=>{if(bootDone)sound('select');});
  window.addEventListener('portdeck:modal',()=>{if(bootDone)sound('select');});
  $('modal-close').addEventListener('click',()=>sound('back'));
  // Very subtle parallax, without interfering with focus or gamepad navigation.
  const hero=document.querySelector('.hero');
  hero.addEventListener('pointermove',e=>{
    if (reduceMotion || e.pointerType==='touch') return;
    const r=hero.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    hero.style.setProperty('--pulse-x',(x*10).toFixed(1)+'px');
    hero.style.setProperty('--pulse-y',(y*10).toFixed(1)+'px');
  });
  hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--pulse-x','0px');hero.style.setProperty('--pulse-y','0px');});
  // Native fullscreen might capture keyboard focus on first startup; click continues too.
})();
