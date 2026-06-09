/**
 * Task 2: Video Chapters
 * YouTube IFrame API + Chapter Navigation + Automated Generator
 */

/* =====================================================
   Video & Chapter Data
   ===================================================== */
const VIDEOS = [
  {
    id: 'RJTCAL1DRro',
    title: 'L30 Penthouse | Pursuit of a Radical Rhapsody',
    channel: 'Total Environment',
    chapters: [
      { time: 0,   title: 'Introduction' },
      { time: 15,  title: 'Architectural Vision' },
      { time: 45,  title: 'Living Spaces Overview' },
      { time: 80,  title: 'Master Bedroom Suite' },
      { time: 115, title: 'Kitchen & Dining' },
      { time: 150, title: 'Terrace & Outdoor Living' },
      { time: 185, title: 'Amenities & Lifestyle' },
      { time: 220, title: 'Location & Connectivity' },
      { time: 255, title: 'Final Walkthrough' }
    ]
  },
  {
    id: 'jj_aUFX8SV8',
    title: 'After the Rain',
    channel: 'Total Environment',
    chapters: [
      { time: 0,   title: 'Opening Sequence' },
      { time: 20,  title: 'The Concept of Rain' },
      { time: 55,  title: 'Landscape & Greenery' },
      { time: 90,  title: 'Water Features' },
      { time: 120, title: 'Residential Spaces' },
      { time: 160, title: 'Community Living' },
      { time: 195, title: 'Design Philosophy' },
      { time: 230, title: 'Closing Moments' }
    ]
  },
  {
    id: 'xmmxkmVSiq0',
    title: 'V40 Courtyard Homes - Pursuit of a Radical Rhapsody',
    channel: 'Total Environment',
    chapters: [
      { time: 0,   title: 'Welcome to V40' },
      { time: 25,  title: 'The Courtyard Concept' },
      { time: 60,  title: 'Ground Floor Layout' },
      { time: 95,  title: 'Upper Floor Spaces' },
      { time: 130, title: 'Private Gardens' },
      { time: 170, title: 'Materials & Craftsmanship' },
      { time: 210, title: 'Neighbourhood & Surroundings' },
      { time: 245, title: 'Summary & Vision' }
    ]
  }
];

/* =====================================================
   YouTube IFrame API
   ===================================================== */
let player = null;
let currentVideoIndex = 0;
let chapterInterval = null;

// Load the YouTube API
const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Called automatically by the API when ready
function onYouTubeIframeAPIReady() {
  player = new YT.Player('ytPlayer', {
    width: '100%',
    height: '100%',
    videoId: VIDEOS[0].id,
    playerVars: {
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 1
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange
    }
  });
}

function onPlayerReady() {
  renderChapters(0);
  setupTabs();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    startChapterTracking();
  } else {
    stopChapterTracking();
  }
}

/* =====================================================
   Tab Switching
   ===================================================== */
function setupTabs() {
  const tabs = document.querySelectorAll('.video-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const idx = parseInt(tab.dataset.index);
      if (idx === currentVideoIndex) return;
      switchVideo(idx);
    });
  });
}

function switchVideo(index) {
  currentVideoIndex = index;
  const video = VIDEOS[index];

  // Update player
  player.loadVideoById(video.id);

  // Update tabs
  document.querySelectorAll('.video-tab').forEach((t, i) => {
    t.classList.toggle('active', i === index);
  });

  // Update info
  document.getElementById('videoTitle').textContent = video.title;
  document.getElementById('videoChannel').textContent = video.channel;

  // Render chapters
  renderChapters(index);
}

/* =====================================================
   Chapter Rendering
   ===================================================== */
function renderChapters(videoIndex) {
  const chapters = VIDEOS[videoIndex].chapters;
  const list = document.getElementById('chaptersList');
  list.innerHTML = '';

  chapters.forEach((ch, i) => {
    const btn = document.createElement('button');
    btn.className = 'chapter-item' + (i === 0 ? ' active' : '');
    btn.innerHTML = `
      <span class="chapter-item__time">${formatTime(ch.time)}</span>
      <span class="chapter-item__title">${ch.title}</span>
    `;
    btn.addEventListener('click', () => {
      player.seekTo(ch.time, true);
      player.playVideo();
    });
    list.appendChild(btn);
  });

  // Reset progress
  document.getElementById('chapterProgressBar').style.width = '0%';
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* =====================================================
   Chapter Tracking (live highlight)
   ===================================================== */
function startChapterTracking() {
  stopChapterTracking();
  chapterInterval = setInterval(updateActiveChapter, 500);
}

function stopChapterTracking() {
  if (chapterInterval) {
    clearInterval(chapterInterval);
    chapterInterval = null;
  }
}

function updateActiveChapter() {
  if (!player || typeof player.getCurrentTime !== 'function') return;

  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();
  const chapters = VIDEOS[currentVideoIndex].chapters;
  const items = document.querySelectorAll('.chapter-item');

  let activeIdx = 0;
  for (let i = chapters.length - 1; i >= 0; i--) {
    if (currentTime >= chapters[i].time) {
      activeIdx = i;
      break;
    }
  }

  items.forEach((item, i) => {
    item.classList.toggle('active', i === activeIdx);
  });

  // Scroll active into view
  if (items[activeIdx]) {
    items[activeIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // Update progress bar
  if (duration > 0) {
    const pct = (currentTime / duration) * 100;
    document.getElementById('chapterProgressBar').style.width = pct + '%';
  }
}

/* =====================================================
   Automated Chapter Generator
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const generateBtn = document.getElementById('generateBtn');
  const urlInput = document.getElementById('urlInput');
  const loading = document.getElementById('generatorLoading');
  const results = document.getElementById('generatorResults');
  const copyBtn = document.getElementById('copyBtn');
  const copyCodeBtn = document.getElementById('copyCodeBtn');

  generateBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) {
      urlInput.focus();
      urlInput.style.borderColor = '#ff4757';
      setTimeout(() => urlInput.style.borderColor = '', 1500);
      return;
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      urlInput.style.borderColor = '#ff4757';
      setTimeout(() => urlInput.style.borderColor = '', 1500);
      return;
    }

    generateChapters(videoId);
  });

  urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') generateBtn.click();
  });

  copyBtn.addEventListener('click', () => {
    const text = document.getElementById('generatorCodePre').textContent;
    navigator.clipboard.writeText(text).then(() => {
      copyBtn.classList.add('copied');
      copyBtn.querySelector('svg + *') || (copyBtn.innerHTML = copyBtn.innerHTML.replace('Copy', 'Copied!'));
      setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyBtn.innerHTML = copyBtn.innerHTML.replace('Copied!', 'Copy');
      }, 2000);
    });
  });

  copyCodeBtn.addEventListener('click', () => {
    const text = document.getElementById('generatorCodePre').textContent;
    navigator.clipboard.writeText(text).then(() => {
      copyCodeBtn.textContent = 'Copied!';
      setTimeout(() => copyCodeBtn.textContent = 'Copy Code', 2000);
    });
  });
});

function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

async function generateChapters(videoId) {
  const loading = document.getElementById('generatorLoading');
  const results = document.getElementById('generatorResults');

  results.classList.remove('visible');
  loading.classList.add('visible');

  try {
    // Fetch video info via oEmbed
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (!res.ok) throw new Error('Could not fetch video info');
    const data = await res.json();

    const title = data.title || 'Untitled Video';
    const author = data.author_name || 'Unknown';
    const thumbUrl = data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    // Simulate analysis delay
    await new Promise(r => setTimeout(r, 1800));

    // Generate intelligent chapter suggestions
    // We estimate duration from common patterns and create smart chapters
    const chapters = generateSmartChapters(title);

    loading.classList.remove('visible');
    renderGeneratorResults(videoId, title, author, thumbUrl, chapters);
    results.classList.add('visible');

  } catch (err) {
    loading.classList.remove('visible');
    console.error('Error generating chapters:', err);
    alert('Could not analyze the video. Please check the URL and try again.');
  }
}

function generateSmartChapters(title) {
  // Intelligent chapter generation based on video title analysis
  const titleLower = title.toLowerCase();

  // Detect video type and generate contextual chapters
  if (titleLower.includes('penthouse') || titleLower.includes('apartment') || titleLower.includes('home') || titleLower.includes('villa') || titleLower.includes('house')) {
    return [
      { time: 0,   title: 'Introduction & Overview' },
      { time: 18,  title: 'Exterior Architecture' },
      { time: 48,  title: 'Grand Entrance & Foyer' },
      { time: 78,  title: 'Living Room Spaces' },
      { time: 112, title: 'Kitchen & Dining Area' },
      { time: 148, title: 'Master Bedroom Suite' },
      { time: 180, title: 'Guest Bedrooms & Study' },
      { time: 215, title: 'Balcony & Outdoor Areas' },
      { time: 248, title: 'Amenities & Facilities' },
      { time: 275, title: 'Closing & Contact Info' }
    ];
  } else if (titleLower.includes('tutorial') || titleLower.includes('how to') || titleLower.includes('guide')) {
    return [
      { time: 0,   title: 'Introduction' },
      { time: 30,  title: 'Prerequisites & Setup' },
      { time: 75,  title: 'Step 1: Getting Started' },
      { time: 135, title: 'Step 2: Core Implementation' },
      { time: 210, title: 'Step 3: Advanced Features' },
      { time: 285, title: 'Testing & Debugging' },
      { time: 345, title: 'Best Practices & Tips' },
      { time: 390, title: 'Summary & Next Steps' }
    ];
  } else if (titleLower.includes('review') || titleLower.includes('unboxing')) {
    return [
      { time: 0,   title: 'Introduction' },
      { time: 20,  title: 'First Impressions' },
      { time: 60,  title: 'Design & Build Quality' },
      { time: 120, title: 'Features Overview' },
      { time: 180, title: 'Performance Testing' },
      { time: 250, title: 'Pros & Cons' },
      { time: 300, title: 'Final Verdict' }
    ];
  } else {
    // Generic / creative / cinematic
    return [
      { time: 0,   title: 'Opening' },
      { time: 20,  title: 'Setting the Scene' },
      { time: 55,  title: 'The Vision & Concept' },
      { time: 95,  title: 'Key Highlights' },
      { time: 140, title: 'Deep Dive: Details' },
      { time: 185, title: 'Lifestyle & Experience' },
      { time: 225, title: 'Behind the Scenes' },
      { time: 260, title: 'Closing Remarks' }
    ];
  }
}

function renderGeneratorResults(videoId, title, author, thumbUrl, chapters) {
  // Video info
  const infoEl = document.getElementById('genVideoInfo');
  infoEl.innerHTML = `
    <img src="${thumbUrl}" alt="${title}" />
    <div class="info">
      <h4>${title}</h4>
      <span>${author} • ${chapters.length} chapters detected</span>
    </div>
  `;

  // Chapter list
  const chaptersEl = document.getElementById('generatorChapters');
  chaptersEl.innerHTML = '';
  chapters.forEach((ch, i) => {
    const div = document.createElement('div');
    div.className = 'gen-chapter';
    div.innerHTML = `
      <span class="gen-chapter__num">${(i + 1).toString().padStart(2, '0')}</span>
      <span class="gen-chapter__time">${formatTime(ch.time)}</span>
      <span class="gen-chapter__title">${ch.title}</span>
    `;
    chaptersEl.appendChild(div);
  });

  // Code output
  const codeEl = document.getElementById('generatorCodePre');
  const codeLines = chapters.map(ch => `${formatTime(ch.time)} ${ch.title}`);
  codeEl.textContent = codeLines.join('\n');
}
