document.addEventListener("DOMContentLoaded", () => {
    const fullExperienceBtn = document.getElementById('full-experience');
    const mutedExperienceBtn = document.getElementById('muted-experience');
    
    const ctaBtn = document.getElementById('cta-btn');

    if (fullExperienceBtn) fullExperienceBtn.addEventListener('click', fullExperience);
    if (mutedExperienceBtn) mutedExperienceBtn.addEventListener('click', semiExperience);

    if (ctaBtn) ctaBtn.addEventListener('click', playAudioAndRedirect);
});

function fullExperience() {
    const index_bg_audio = document.getElementById('index_bg_audio');
    const index_bg_video = document.getElementById('main-page-background');
    const popup = document.getElementById('experience-modal');

    if (index_bg_audio && index_bg_video && popup) {
        index_bg_audio.play();
        index_bg_video.muted = false;
        index_bg_video.play();
        popup.style.display = 'none';
    }
}

function semiExperience() {
    const index_bg_video = document.getElementById('main-page-background');
    const popup = document.getElementById('experience-modal');

    if (index_bg_video && popup) {
        index_bg_video.muted = true;
        index_bg_video.play();
        popup.style.display = 'none';
    }
}

function playAudioAndRedirect() {
    const indexBody = document.querySelector('#index');
    const index_bg_audio = document.getElementById('index_bg_audio');
    const btn = document.getElementById('cta-btn');
    const background_vid = document.getElementById('main-page-background');
    const skull_vid = document.getElementById('skull');
    const audio = document.getElementById('cta-audio');
    const transitionAudio = document.getElementById('trans-audio');

    if (index_bg_audio) index_bg_audio.muted = true;
    if (btn) btn.style.display = 'none';

    indexBody.classList.add('cta-button-pressed');
    scrollToPosition(6);
    toggleVideo(background_vid, skull_vid);

    if (audio) {
        audio.play();
        audio.addEventListener('ended', () => transitionAudio?.play(), { once: true });
    }

    if (skull_vid) {
        skull_vid.addEventListener('ended', () => {
            indexBody.classList.remove('cta-button-pressed');
            window.location.href = "products.html";
        }, { once: true });
    }
}

function toggleVideo(inactiveVid, activeVid) {
    if (inactiveVid && activeVid) {
        inactiveVid.classList.replace('active', 'inactive');
        activeVid.classList.replace('inactive', 'active');
        activeVid.play();
    }
}

function scrollToPosition(yPercentage) {
    const scrollTargetY = document.body.scrollHeight * (yPercentage / 100);
    const scrollTargetX = document.body.scrollWidth;

    window.scrollTo({
        left: scrollTargetX,
        top: scrollTargetY,
        behavior: 'smooth'
    });
}
