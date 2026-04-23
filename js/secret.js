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
  const tracks = [
    { name: 'But the Dawn Came Again', src: 'audio/DEMO But the Dawn Came Again.mp3' },
    { name: 'Crackling Fire', src: 'audio/DEMO Crackling Fire.mp3' },
    { name: 'Starless Skies', src: 'audio/DEMO Starless Skies.mp3' },
  ];

  let currentTrack = -1;
  let isPlaying = false;
  let audio = new Audio();
  audio.preload = 'metadata';

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

  // Update progress from real audio timeupdate
  audio.addEventListener('timeupdate', () => {
    if (currentTrack < 0) return;
    const duration = audio.duration || 0;
    const current = audio.currentTime || 0;
    const pct = duration > 0 ? (current / duration) * 100 : 0;

    globalProgressBar.style.width = pct + '%';
    audioTime.textContent = `${formatTime(current)} / ${formatTime(duration)}`;

    const activeItem = document.querySelector(`.track-item[data-track="${currentTrack}"]`);
    if (activeItem) {
      const bar = activeItem.querySelector('.track-progress-bar');
      if (bar) bar.style.width = pct + '%';
    }
  });

  // Update duration display when metadata loads
  audio.addEventListener('loadedmetadata', () => {
    const activeItem = document.querySelector(`.track-item[data-track="${currentTrack}"]`);
    if (activeItem) {
      const dur = activeItem.querySelector('.track-duration');
      if (dur) dur.textContent = `Demo · ${formatTime(audio.duration)}`;
    }
  });

  // Auto-play next track when current ends
  audio.addEventListener('ended', () => {
    playNext();
  });

  function playTrack(index) {
    // Reset previous
    trackItems.forEach(item => {
      item.classList.remove('playing');
      const bar = item.querySelector('.track-progress-bar');
      if (bar) bar.style.width = '0%';
      const btn = item.querySelector('.track-play-btn i');
      if (btn) btn.className = 'fas fa-play';
    });

    currentTrack = index;
    isPlaying = true;

    const track = tracks[index];
    audio.src = track.src;
    audio.play();

    nowPlayingBar.classList.add('active');
    nowPlayingTitle.textContent = track.name;
    playPauseBtn.querySelector('i').className = 'fas fa-pause';

    const activeItem = document.querySelector(`.track-item[data-track="${index}"]`);
    if (activeItem) {
      activeItem.classList.add('playing');
      const btn = activeItem.querySelector('.track-play-btn i');
      if (btn) btn.className = 'fas fa-pause';
    }
  }

  function togglePlayPause() {
    if (currentTrack < 0) {
      playTrack(0);
      return;
    }

    if (isPlaying) {
      isPlaying = false;
      audio.pause();
      playPauseBtn.querySelector('i').className = 'fas fa-play';

      const activeItem = document.querySelector(`.track-item[data-track="${currentTrack}"]`);
      if (activeItem) {
        const btn = activeItem.querySelector('.track-play-btn i');
        if (btn) btn.className = 'fas fa-play';
      }
    } else {
      isPlaying = true;
      audio.play();
      playPauseBtn.querySelector('i').className = 'fas fa-pause';

      const activeItem = document.querySelector(`.track-item[data-track="${currentTrack}"]`);
      if (activeItem) {
        const btn = activeItem.querySelector('.track-play-btn i');
        if (btn) btn.className = 'fas fa-pause';
      }
    }
  }

  function playNext() {
    const next = (currentTrack + 1) % tracks.length;
    playTrack(next);
  }

  function playPrev() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
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
      if (currentTrack < 0 || !audio.duration) return;
      const rect = globalProgress.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      audio.currentTime = pct * audio.duration;
    });
  }
});
