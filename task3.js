/**
 * Task 3: Lead Form on YouTube Video
 * Shows a form smoothly after 6 seconds of video playback
 */

let player;
let isFormShown = false;
let checkTimeInterval;
const TRIGGER_TIME = 6; // seconds

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
    videoId: 'RJTCAL1DRro', // Using the first video from Task 2
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
  // Elements
  const formOverlay = document.getElementById('formOverlay');
  const formClose = document.getElementById('formClose');
  const leadForm = document.getElementById('leadForm');
  const formCard = document.getElementById('formCard');
  const formSuccess = document.getElementById('formSuccess');
  const resumeBtn = document.getElementById('resumeBtn');
  const timerBar = document.getElementById('timerBar');

  // Close form handler
  formClose.addEventListener('click', () => {
    formOverlay.classList.remove('visible');
    player.playVideo(); // Resume playing
  });

  // Handle Form Submission
  leadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Get values
    const name = document.getElementById('leadName').value;
    const email = document.getElementById('leadEmail').value;
    const phone = document.getElementById('leadPhone').value;

    console.log('Lead Captured:', { name, email, phone });

    // Simulate API call and show success
    const btn = document.getElementById('formSubmit');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px; margin-right: 8px;"></span> Submitting...';
    btn.style.pointerEvents = 'none';

    setTimeout(() => {
      // Hide form, show success message
      leadForm.style.display = 'none';
      document.querySelector('.form-card__header').style.display = 'none';
      formSuccess.classList.add('visible');
      
      // We can also mark the timer as done
      timerBar.classList.add('done');
      document.getElementById('timerLabel').textContent = 'Lead Submitted Successfully';

      // Restore button for potential future use (though we hide the form)
      btn.innerHTML = originalText;
      btn.style.pointerEvents = 'all';
    }, 1500);
  });

  // Resume Video Button
  resumeBtn.addEventListener('click', () => {
    formOverlay.classList.remove('visible');
    player.playVideo();
  });
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    // Start checking time
    if (!isFormShown) {
      document.getElementById('timerBar').classList.add('active');
      checkTimeInterval = setInterval(checkVideoTime, 250);
    }
  } else {
    // Pause checking if paused/buffered/ended
    clearInterval(checkTimeInterval);
    document.getElementById('timerBar').classList.remove('active');
  }
}

function checkVideoTime() {
  if (!player || typeof player.getCurrentTime !== 'function' || isFormShown) return;

  const currentTime = player.getCurrentTime();
  
  // Update progress bar visuals
  const fill = document.getElementById('timerFill');
  const label = document.getElementById('timerLabel');
  
  if (currentTime < TRIGGER_TIME) {
    const pct = (currentTime / TRIGGER_TIME) * 100;
    fill.style.width = pct + '%';
    label.textContent = `Form appears in ${Math.ceil(TRIGGER_TIME - currentTime)}s`;
  } else {
    // Trigger the form
    showLeadForm();
  }
}

function showLeadForm() {
  isFormShown = true;
  clearInterval(checkTimeInterval);
  
  // Pause the video
  player.pauseVideo();

  // Update timer bar to 100%
  document.getElementById('timerFill').style.width = '100%';
  document.getElementById('timerLabel').textContent = 'Please complete the form to continue';

  // Show the overlay with smooth animation
  const formOverlay = document.getElementById('formOverlay');
  formOverlay.classList.add('visible');
}
