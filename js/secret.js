/* ============================================
   FROSTLIGHT - Secret Vault Player
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  const PASSPHRASE = 'frostlegion2026';

  const lockScreen = document.getElementById('lockScreen');
  const playerArea = document.getElementById('playerArea');
  const passwordInput = document.getElementById('passwordInput');
  const unlockBtn = document.getElementById('unlockBtn');
  const passwordError = document.getElementById('passwordError');

  // --- Unlock Logic ---
  function attemptUnlock() {
    const input = passwordInput.value.trim();
    if (input === PASSPHRASE) {
      lockScreen.style.display = 'none';
      playerArea.classList.add('unlocked');
      initPlayer();
    } else {
      passwordError.classList.add('show');
      passwordInput.value = '';
      passwordInput.focus();
      setTimeout(() => passwordError.classList.remove('show'), 3000);
    }
  }

  unlockBtn.addEventListener('click', attemptUnlock);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') attemptUnlock();
  });

  // --- Audio Player ---
  // Since these are unreleased tracks, we simulate playback with the Web Audio API
  // generating ambient tones. In production, replace with actual audio file URLs.

  const tracks = [
    { name: 'Ashes of the Northern Sky', duration: 323 },
    { name: 'Beneath the Frozen Pines', duration: 287 },
    { name: 'The Last Stand at Orobie', duration: 371 },
    { name: 'Wolfborn (Acoustic Version)', duration: 235 },
    { name: 'March of the Iron Legion', duration: 422 },
  ];

  let currentTrack = -1;
  let isPlaying = false;
  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;
  let playbackTimer = null;
  let elapsed = 0;

  const nowPlayingBar = document.getElementById('nowPlayingBar');
  const nowPlayingTitle = document.getElementById('nowPlayingTitle');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevTrackBtn = document.getElementById('prevTrackBtn');
  const nextTrackBtn = document.getElementById('nextTrackBtn');
  const globalProgressBar = document.getElementById('globalProgressBar');
  const globalProgress = document.getElementById('globalProgress');
  const audioTime = document.getElementById('audioTime');
  const trackItems = document.querySelectorAll('.track-item');

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function initAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function startTone() {
    initAudioContext();
    stopTone();

    // Create a warm ambient drone
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    const baseFreqs = [110, 130.81, 146.83, 164.81, 196];
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(baseFreqs[currentTrack % baseFreqs.length], audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 1);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
  }

  function stopTone() {
    if (oscillator) {
      try {
        if (gainNode) {
          gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
        }
        setTimeout(() => {
          try { oscillator.stop(); } catch (_) { /* already stopped */ }
          oscillator = null;
        }, 350);
      } catch (_) {
        oscillator = null;
      }
    }
  }

  function updateProgress() {
    if (!isPlaying || currentTrack < 0) return;

    elapsed += 0.25;
    const track = tracks[currentTrack];
    const pct = Math.min((elapsed / track.duration) * 100, 100);

    globalProgressBar.style.width = pct + '%';
    audioTime.textContent = `${formatTime(elapsed)} / ${formatTime(track.duration)}`;

    // Update track-level progress bar
    const activeItem = document.querySelector(`.track-item[data-track="${currentTrack}"]`);
    if (activeItem) {
      const bar = activeItem.querySelector('.track-progress-bar');
      if (bar) bar.style.width = pct + '%';
    }

    if (elapsed >= track.duration) {
      playNext();
      return;
    }

    playbackTimer = setTimeout(updateProgress, 250);
  }

  function playTrack(index) {
    // Reset previous
    trackItems.forEach(item => {
      item.classList.remove('playing');
      const bar = item.querySelector('.track-progress-bar');
      if (bar) bar.style.width = '0%';
      const btn = item.querySelector('.track-play-btn i');
      if (btn) btn.className = 'fas fa-play';
    });

    clearTimeout(playbackTimer);
    elapsed = 0;
    currentTrack = index;
    isPlaying = true;

    const track = tracks[index];
    nowPlayingBar.classList.add('active');
    nowPlayingTitle.textContent = track.name;
    playPauseBtn.querySelector('i').className = 'fas fa-pause';

    const activeItem = document.querySelector(`.track-item[data-track="${index}"]`);
    if (activeItem) {
      activeItem.classList.add('playing');
      const btn = activeItem.querySelector('.track-play-btn i');
      if (btn) btn.className = 'fas fa-pause';
    }

    startTone();
    updateProgress();
  }

  function togglePlayPause() {
    if (currentTrack < 0) {
      playTrack(0);
      return;
    }

    if (isPlaying) {
      isPlaying = false;
      clearTimeout(playbackTimer);
      stopTone();
      playPauseBtn.querySelector('i').className = 'fas fa-play';

      const activeItem = document.querySelector(`.track-item[data-track="${currentTrack}"]`);
      if (activeItem) {
        const btn = activeItem.querySelector('.track-play-btn i');
        if (btn) btn.className = 'fas fa-play';
      }
    } else {
      isPlaying = true;
      startTone();
      playPauseBtn.querySelector('i').className = 'fas fa-pause';

      const activeItem = document.querySelector(`.track-item[data-track="${currentTrack}"]`);
      if (activeItem) {
        const btn = activeItem.querySelector('.track-play-btn i');
        if (btn) btn.className = 'fas fa-pause';
      }

      updateProgress();
    }
  }

  function playNext() {
    const next = (currentTrack + 1) % tracks.length;
    playTrack(next);
  }

  function playPrev() {
    if (elapsed > 3) {
      // Restart current track
      elapsed = 0;
      return;
    }
    const prev = (currentTrack - 1 + tracks.length) % tracks.length;
    playTrack(prev);
  }

  function initPlayer() {
    // Track item click handlers
    trackItems.forEach(item => {
      const btn = item.querySelector('.track-play-btn');
      const index = parseInt(item.dataset.track, 10);

      btn.addEventListener('click', () => {
        if (currentTrack === index && isPlaying) {
          togglePlayPause();
        } else {
          playTrack(index);
        }
      });
    });

    playPauseBtn.addEventListener('click', togglePlayPause);
    nextTrackBtn.addEventListener('click', playNext);
    prevTrackBtn.addEventListener('click', playPrev);

    // Seek on progress bar click
    globalProgress.addEventListener('click', (e) => {
      if (currentTrack < 0) return;
      const rect = globalProgress.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      elapsed = pct * tracks[currentTrack].duration;
    });
  }
});
