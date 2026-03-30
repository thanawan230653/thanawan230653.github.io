// Scene controller.  For this simple project it just ensures hearts
// animation is running on any page that includes this script.
document.addEventListener('DOMContentLoaded', () => {
  if (typeof hearts !== 'undefined' && hearts.start) {
    hearts.start();
  }
});