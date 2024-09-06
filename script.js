const profilePic = document.getElementById('profile-pic');

window.addEventListener('scroll', function () {
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;
  const fadePoint = 650; // The point where the fade starts

  // Calculate the opacity based on the scroll position
  profilePic.style.opacity = Math.max(1 - scrollPosition / fadePoint, 0);
});