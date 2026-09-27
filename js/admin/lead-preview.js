document.addEventListener('DOMContentLoaded', () => {

    // 1. Dynamic Data Population (Simulating connection to Dashboard Profile Modal[cite: 22])
    // If a user clicks "Open Full Record" from dashboard, we can pass params via URL: ?name=Jane+Smith&email=jane...
    const urlParams = new URLSearchParams(window.location.search);
    const passedName = urlParams.get('name');
    const passedEmail = urlParams.get('email');

    if (passedName) {
        document.getElementById('record-name').textContent = passedName;
        // Generate Initials
        const initials = passedName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('avatar-initials').textContent = initials;
    }
    
    if (passedEmail) {
        document.getElementById('record-email').textContent = passedEmail;
    }

    // 2. Audio Player Logic
    const audioModal = document.getElementById('audio-modal');
    const closeAudioBtn = document.getElementById('close-audio-btn');
    const playButtons = document.querySelectorAll('.play-record-btn');
    const playingRecordIdText = document.getElementById('playing-record-id');
    const htmlAudioPlayer = document.getElementById('html-audio-player');
    const waveformVisualizer = document.querySelector('.audio-waveform-visualizer');

    const openAudioModal = (recordId) => {
        if (!audioModal) return;
        
        // Set the UI text to show which record is loaded
        playingRecordIdText.textContent = `Record ID: ${recordId}`;
        
        // Show the modal and lock scroll
        audioModal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    const closeAudioModal = () => {
        if (!audioModal) return;
        
        // Stop audio playback immediately upon closing
        htmlAudioPlayer.pause();
        htmlAudioPlayer.currentTime = 0;
        
        audioModal.classList.remove('show');
        document.body.style.overflow = '';
    };

    // Attach listeners to table buttons
    playButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const recordId = btn.getAttribute('data-record-id');
            openAudioModal(recordId);
        });
    });

    // Handle closing events
    if (closeAudioBtn) closeAudioBtn.addEventListener('click', closeAudioModal);
    
    if (audioModal) {
        audioModal.addEventListener('click', (e) => {
            if (e.target === audioModal) closeAudioModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && audioModal && audioModal.classList.contains('show')) {
            closeAudioModal();
        }
    });

    // 3. Sync Waveform animation with HTML5 Audio Play State
    htmlAudioPlayer.addEventListener('play', () => {
        waveformVisualizer.classList.add('playing');
    });

    htmlAudioPlayer.addEventListener('pause', () => {
        waveformVisualizer.classList.remove('playing');
    });
    
    htmlAudioPlayer.addEventListener('ended', () => {
        waveformVisualizer.classList.remove('playing');
    });

    // 4. Quick Action Button Alerts (Mock Logic)
    document.querySelectorAll('.btn-action').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const actionName = e.target.closest('button').textContent.trim();
            alert(`Opening interface for: ${actionName}`);
        });
    });
});