const people = {
  emad: { name: 'Emad Armoun', role: 'Software engineer', description: 'Emad is a software engineer with a passion for web development and design. He loves creating interactive and user-friendly applications.', website: 'https://emad.armoun.com', image: 'images/emad.jpg' },
  vahid: { name: 'Vahid Armoun', role: 'Traditional animator', description: 'Vahid is a 2D traditional animator.', website: 'https://vahid.armoun.com', image: 'images/vahid.jpg' },
};
const list = document.getElementById('list-view');
const detail = document.getElementById('detail-view');
const back = document.getElementById('back');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let selectedCard = null;
let transitioning = false;

async function switchView(from, to, focusTarget, reverse = false) {
  if (transitioning) return;
  transitioning = true;
  from.inert = true;
  to.inert = true;
  const duration = reducedMotion.matches ? 0 : 420;
  const direction = reverse ? -1 : 1;
  try {
    await from.animate([
      { opacity: 1, transform: 'translateX(0) scale(1)' },
      { opacity: 0, transform: `translateX(${-direction * 36}px) scale(.96)` },
    ], { duration: duration * .55, easing: 'ease-in', fill: 'forwards' }).finished;
    from.hidden = true;
    from.getAnimations().forEach(animation => animation.cancel());
    to.hidden = false;
    await to.animate([
      { opacity: 0, transform: `translateX(${direction * 44}px) scale(.96)` },
      { opacity: 1, transform: 'translateX(0) scale(1)' },
    ], { duration, easing: 'cubic-bezier(.16, 1, .3, 1)' }).finished;
  } finally {
    from.hidden = true;
    to.hidden = false;
    from.inert = false;
    to.inert = false;
    transitioning = false;
    focusTarget.focus({ preventScroll: true });
  }
}

document.querySelectorAll('[data-person]').forEach(card => {
  card.addEventListener('click', () => {
    if (transitioning) return;
    selectedCard = card;
    const person = people[card.dataset.person];
    document.getElementById('profile-name').textContent = person.name;
    document.getElementById('profile-role').textContent = person.role;
    document.getElementById('profile-description').textContent = person.description;
    const portrait = document.getElementById('profile-image');
    portrait.src = person.image;
    portrait.alt = person.name;
    document.getElementById('profile-website').href = person.website;
    switchView(list, detail, back);
  });
});
back.addEventListener('click', () => {
  if (!transitioning) switchView(detail, list, selectedCard, true);
});
