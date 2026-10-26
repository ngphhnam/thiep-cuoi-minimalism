/**
 * MINIMALISM ĐỎ ĐẬM (CHUNG ĐÔI THEME) - JAVASCRIPT CONTROLLER
 * Xử lý mở thiệp tự động cuộn xuống, hoa trôi dạt, đếm ngược, nhạc nền và modal
 */

document.addEventListener('DOMContentLoaded', () => {
  initGuestName();
  initIntroHeartsBackground();
  initEnvelopeAutoScroll();
  initAmbientCanvas();
  initCountdown();
  initMusic();
  initLightbox();
  initGiftModal();
  initGuestbook();
  initCopyButtons();
});

// 1. Nhận diện tên khách mời từ URL (?guest=...)
function initGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guest = urlParams.get('guest');
  if (guest && guest.trim()) {
    const decoded = decodeURIComponent(guest.trim());
    const el = document.getElementById('envelope-guest-name');
    if (el) el.textContent = decoded;
    const input = document.getElementById('wish-name-input');
    if (input) input.value = decoded;
  }
}

// 1.1 Khởi tạo hạt tim bay nhẹ nhàng ở nền màn hình mở đầu (Screenshot 1)
function initIntroHeartsBackground() {
  const container = document.getElementById('intro-floating-hearts');
  if (!container) return;

  const colors = ['#c9a24a', '#a8323b', '#e27882', '#ffccd5', '#d63031', '#f3d9a2'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    createAmbientHeart(container, colors, true);
  }

  // Tạo liên tục các hạt tim bay lửng
  const timer = setInterval(() => {
    if (!document.getElementById('envelope-overlay') || document.getElementById('envelope-overlay').classList.contains('hidden')) {
      clearInterval(timer);
      return;
    }
    createAmbientHeart(container, colors, false);
  }, 900);
}

function createAmbientHeart(container, colors, initialScatter) {
  const heart = document.createElement('div');
  heart.className = 'intro-ambient-heart';

  const size = Math.floor(Math.random() * 14) + 10; // 10px - 24px
  const left = Math.random() * 100; // 0 - 100%
  const duration = Math.random() * 6 + 7; // 7s - 13s
  const delay = initialScatter ? -(Math.random() * duration) : 0;
  const color = colors[Math.floor(Math.random() * colors.length)];

  heart.style.left = left + '%';
  heart.style.width = size + 'px';
  heart.style.height = size + 'px';
  heart.style.animationDuration = duration + 's';
  heart.style.animationDelay = delay + 's';
  heart.style.color = color;

  heart.innerHTML = `
    <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
  `;

  container.appendChild(heart);

  setTimeout(() => {
    if (heart && heart.parentNode) {
      heart.parentNode.removeChild(heart);
    }
  }, (duration + 2) * 1000);
}

// 2. Mở thiệp: CHUỖI ANIMATION MỞ THIỆP GIẤY THẬT TUẦN TỰ (Sequential Paper Opening Animation)
function initEnvelopeAutoScroll() {
  const overlay = document.getElementById('envelope-overlay');
  const introCard = document.getElementById('intro-card');
  const btn = document.getElementById('btn-open-envelope');
  const burstContainer = document.getElementById('heart-burst-container');
  const targetSection = document.getElementById('wedding-content');
  const urlParams = new URLSearchParams(window.location.search);

  // Nếu URL có sẵn ?open=1 thì bỏ qua bìa
  if (urlParams.get('open') === '1') {
    if (overlay) {
      overlay.classList.add('hidden');
      document.body.classList.remove('locked');
      document.documentElement.classList.remove('locked');
    }
    return;
  }

  let isOpening = false;

  if (btn && overlay) {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (isOpening) return;
      isOpening = true;

      // 1. Phản hồi xúc giác nút bấm (Button press feedback)
      btn.classList.add('btn-pressed');

      // 2. Tự động phát nhạc
      playMusicSafe();

      // 3. GIAI ĐOẠN 1 (0ms - 450ms): MỞ THẾ GIẤY TỰ NHIÊN (Paper Unfold / Opening Tension)
      // Thiệp nhún nhẹ lấy đà theo điểm neo và góc nghiêng 3D, hoa hai bên nở nhẹ đồng bộ
      if (introCard) {
        introCard.classList.add('card-opening');
      }

      // 4. GIAI ĐOẠN 2 (450ms): KÍCH HOẠT NỔ TRÀNG TIM TUNG TÓE (Particle Burst)
      setTimeout(() => {
        triggerHeartBurst(burstContainer);
      }, 450);

      // 5. GIAI ĐOẠN 3 (500ms): THIỆP LẤY ĐÀ VÚT BAY LÊN TRÊN (Envelope Away)
      // Chuyển động giấy thật: nhấp đà 12px rồi vút lên -135vh, hoa bay đồng bộ 100%
      setTimeout(() => {
        if (introCard) {
          introCard.classList.remove('card-opening');
          introCard.classList.add('card-flying-away');
        }
      }, 500);

      // 6. GIAI ĐOẠN 4 (1150ms): MỜ DẦN MÀN HÌNH BÌA
      setTimeout(() => {
        overlay.style.transition = 'opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
        overlay.style.opacity = '0';
      }, 1150);

      // 7. GIAI ĐOẠN 5 (1350ms): KẾT THÚC DỨT KHOÁT & TỰ ĐỘNG CUỘN XUỐNG MƯỢT MÀ
      setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.classList.remove('locked');
        document.documentElement.classList.remove('locked');

        if (targetSection) {
          targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 1350);
    });
  }
}

// Hàm kích hoạt hiệu ứng nổ một tràng tim (Heart Burst Explosion)
function triggerHeartBurst(container) {
  if (!container) return;

  const heartColors = [
    '#c9a24a', // Vàng gold
    '#e27882', // Hồng đào
    '#a8323b', // Đỏ đô
    '#d63031', // Đỏ rực
    '#ff9aa2', // Hồng phấn
    '#ffd166', // Vàng sáng
    '#fff4e6', // Trắng kem
    '#511419'  // Đỏ mận
  ];

  const totalHearts = 65; // Số lượng tim nổ tung tóe như Screenshot 2
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < totalHearts; i++) {
    const heart = document.createElement('div');
    heart.className = 'burst-heart';

    // Toạ độ bay ngẫu nhiên tỏa tròn từ tâm với góc và khoảng cách tự nhiên
    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * (Math.max(window.innerWidth, window.innerHeight) * 0.65);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const rotStart = (Math.random() - 0.5) * 45;
    const rotEnd = (Math.random() - 0.5) * 450;
    const size = Math.floor(Math.random() * 18) + 14; // 14px - 32px
    const color = heartColors[Math.floor(Math.random() * heartColors.length)];

    heart.style.left = centerX + 'px';
    heart.style.top = centerY + 'px';
    heart.style.width = size + 'px';
    heart.style.height = size + 'px';
    heart.style.color = color;
    heart.style.setProperty('--dx', dx + 'px');
    heart.style.setProperty('--dy', dy + 'px');
    heart.style.setProperty('--rot-start', rotStart + 'deg');
    heart.style.setProperty('--rot-end', rotEnd + 'deg');

    // Chênh lệch delay chút ít để các hạt văng tự nhiên
    const delay = Math.random() * 0.12;
    heart.style.animationDelay = delay + 's';

    heart.innerHTML = `
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;

    container.appendChild(heart);
  }

  // Dọn dẹp sau khi nổ xong
  setTimeout(() => {
    container.innerHTML = '';
  }, 2200);
}

// 3. Ambient Canvas (Cánh hoa đỏ đô & hạt ánh kim vàng rơi nhẹ nhàng)
function initAmbientCanvas() {
  const canvas = document.getElementById('ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const colors = ['#7a1f26', '#a8323b', '#c9a24a', '#ece4d8', '#511419'];

  for (let i = 0; i < 28; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height - height,
      size: Math.random() * 8 + 5,
      speedY: Math.random() * 0.9 + 0.4,
      speedX: Math.random() * 0.6 - 0.3,
      angle: Math.random() * Math.PI * 2,
      spin: Math.random() * 0.02 - 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.4 + 0.3
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(p.angle) * 0.4 + p.speedX;
      p.angle += p.spin;

      if (p.y > height + 20) {
        p.y = -20;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;

      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  draw();
}

// 4. Đồng hồ đếm ngược đến 18/12/2026 09:00:00
function initCountdown() {
  const target = new Date('2026-12-18T09:00:00').getTime();

  const daysEl = document.getElementById('count-days');
  const hoursEl = document.getElementById('count-hours');
  const minsEl = document.getElementById('count-mins');
  const secsEl = document.getElementById('count-secs');

  function update() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(d).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(h).padStart(2, '0');
    if (minsEl) minsEl.textContent = String(m).padStart(2, '0');
    if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// 5. Trình phát nhạc
let audio = null;
let isMusicPlaying = false;

function initMusic() {
  const btn = document.getElementById('btn-toggle-music');
  audio = document.getElementById('bg-audio');

  if (btn && audio) {
    btn.addEventListener('click', () => {
      if (isMusicPlaying) {
        audio.pause();
        isMusicPlaying = false;
        btn.classList.remove('playing');
      } else {
        audio.play().then(() => {
          isMusicPlaying = true;
          btn.classList.add('playing');
        }).catch(() => {});
      }
    });
  }
}

function playMusicSafe() {
  const btn = document.getElementById('btn-toggle-music');
  if (audio && !isMusicPlaying) {
    audio.play().then(() => {
      isMusicPlaying = true;
      if (btn) btn.classList.add('playing');
    }).catch(() => {});
  }
}

// 6. Lightbox xem ảnh toàn màn hình
let currentImageIndex = 0;
const galleryImages = [
  'image/wedding-05.jpg',
  'image/wedding-01.jpg',
  'image/wedding-02.jpg',
  'image/wedding-03.jpg',
  'image/wedding-04.jpg',
  'image/wedding-06.jpg',
  'image/wedding-07.jpg',
  'image/wedding-08.jpg',
  'image/wedding-09.jpg',
  'image/wedding-10.jpg',
  'image/wedding-11.jpg',
  'image/wedding-12.jpg',
  'image/wedding-13.jpg',
  'image/wedding-14.jpg',
  'image/wedding-15.jpg',
  'image/wedding-16.jpg'
];

function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const closeBtn = document.getElementById('lightbox-close');
  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  window.openMinimalLightbox = (index) => {
    currentImageIndex = index;
    if (imgEl && galleryImages[currentImageIndex]) {
      imgEl.src = galleryImages[currentImageIndex];
    }
    if (modal) modal.classList.add('active');
  };

  const close = () => {
    if (modal) modal.classList.remove('active');
  };

  const next = () => {
    currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
    if (imgEl) imgEl.src = galleryImages[currentImageIndex];
  };

  const prev = () => {
    currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    if (imgEl) imgEl.src = galleryImages[currentImageIndex];
  };

  if (closeBtn) closeBtn.onclick = close;
  if (nextBtn) nextBtn.onclick = next;
  if (prevBtn) prevBtn.onclick = prev;

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) close();
    };
  }

  document.addEventListener('keydown', (e) => {
    if (modal && modal.classList.contains('active')) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    }
  });
}

// 7. Modal Hộp quà mừng cưới
function initGiftModal() {
  const modal = document.getElementById('gift-modal');
  const openTrigger = document.getElementById('btn-open-gift');
  const closeBtn = document.getElementById('gift-modal-close');

  if (openTrigger && modal) {
    openTrigger.onclick = () => modal.classList.add('active');
  }
  if (closeBtn && modal) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }
  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('active');
    };
  }
}

// 8. Sổ lưu bút (Guestbook)
function initGuestbook() {
  const form = document.getElementById('wish-form');
  const list = document.getElementById('wishes-list');

  const defaultWishes = [
    { name: "Minh Hiếu", time: "20:15 - 18/12/2026", msg: "Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long, sớm sinh quý tử nhé! Rất háo hức chờ đến ngày cưới!" },
    { name: "Thanh Trúc", time: "18:30 - 18/12/2026", msg: "Chúc mừng cô dâu xinh đẹp nhất trần đời! Chúc hai vợ chồng luôn ngọt ngào và bình yên bên nhau!" },
    { name: "Tuấn Anh", time: "15:45 - 18/12/2026", msg: "Chúc mừng người anh em đã tìm được một nửa hoàn hảo. Chúc hai bạn một đời an yên và hạnh phúc trọn vẹn!" }
  ];

  function loadWishes() {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem('minimal_wishes') || '[]');
    } catch (e) {}
    const all = [...saved, ...defaultWishes];
    if (!list) return;
    list.innerHTML = '';
    all.forEach(w => {
      const bubble = document.createElement('div');
      bubble.style.cssText = 'background: rgba(81, 20, 25, 0.04); border: 1px solid rgba(81, 20, 25, 0.1); border-radius: 8px; padding: 0.8rem 1rem; margin-bottom: 0.8rem;';
      bubble.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.2rem;">
          <strong style="color: #511419; font-size: 0.95rem;">${escapeHTML(w.name)}</strong>
          <span style="font-size: 0.72rem; color: rgba(81, 20, 25, 0.6);">${escapeHTML(w.time)}</span>
        </div>
        <div style="font-size: 0.95rem; color: #511419; line-height: 1.4;">${escapeHTML(w.msg)}</div>
      `;
      list.appendChild(bubble);
    });
  }

  loadWishes();

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('wish-name-input');
      const msgInput = document.getElementById('wish-msg-input');

      if (!nameInput.value.trim() || !msgInput.value.trim()) {
        showToast('Vui lòng nhập tên và lời chúc!');
        return;
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      const newWish = {
        name: nameInput.value.trim(),
        time: timeStr,
        msg: msgInput.value.trim()
      };

      let saved = [];
      try {
        saved = JSON.parse(localStorage.getItem('minimal_wishes') || '[]');
      } catch (e) {}
      saved.unshift(newWish);
      localStorage.setItem('minimal_wishes', JSON.stringify(saved));

      msgInput.value = '';
      loadWishes();
      showToast('Cảm ơn bạn đã gửi lời chúc yêu thương!');
    });
  }
}

// 9. Nút sao chép STK
function initCopyButtons() {
  document.querySelectorAll('.btn-copy-acc').forEach(btn => {
    btn.addEventListener('click', () => {
      const acc = btn.getAttribute('data-acc');
      if (acc) {
        navigator.clipboard.writeText(acc).then(() => {
          showToast(`Đã sao chép số tài khoản: ${acc}`);
        }).catch(() => {
          showToast(`Số tài khoản: ${acc}`);
        });
      }
    });
  });
}

function showToast(msg) {
  let toast = document.getElementById('toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-msg';
    toast.style.cssText = 'position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: #511419; color: #fff; padding: 0.65rem 1.4rem; border-radius: 9999px; font-size: 0.88rem; box-shadow: 0 10px 25px rgba(0,0,0,0.3); z-index: 5000; transition: opacity 0.3s;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => {
    toast.style.opacity = '0';
  }, 2800);
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
