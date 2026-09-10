const people = {
  emad: { name: 'Emad Armoun', role: 'Software engineer', description: 'Emad builds for the web and captures life through a lens. A software engineer and photographer, he brings an eye for detail to both code and composition. Music and cinema keep his curiosity alive beyond the screen.', website: 'https://emad.armoun.com', image: 'images/emad.jpg' },
  vahid: { name: 'Vahid Armoun', role: 'Traditional animator', description: 'Vahid brings drawings to life through traditional 2D animation. His creative world extends beyond animation to graphic design, portrait drawing, and other visual arts. From a face on paper to a character in motion, drawing runs through his work.', website: 'https://vahid.armoun.com', image: 'images/vahid.jpg' },
};
const translations = {
  en: {
    title: 'Armoun Family', heading: 'The Armoun Family', back: 'Back',
    website: 'Visit website', linkedin: 'LinkedIn', language: 'Language', about: 'About',
    meta: 'Meet Emad and Vahid Armoun. Software engineering, design, and traditional animation.',
    people,
  },
  fa: {
    title: 'خانواده آرمون', heading: 'خانواده آرمون', back: 'بازگشت',
    website: 'بازدید از وب‌سایت', linkedin: 'لینکداین', language: 'زبان', about: 'دربارهٔ',
    meta: 'با عماد و وحید آرمون آشنا شوید؛ مهندسی نرم‌افزار، عکاسی و انیمیشن سنتی.',
    people: {
      emad: { ...people.emad, name: 'عماد آرمون', role: 'مهندس نرم‌افزار', description: 'عماد برای وب می‌سازد و با دوربین، زندگی را ثبت می‌کند. مهندس نرم‌افزار و عکاسی که هم در کد و هم در قاب، به جزئیات اهمیت می‌دهد. موسیقی و سینما هم بخش دیگری از دنیای او هستند.' },
      vahid: { ...people.vahid, name: 'وحید آرمون', role: 'انیماتور سنتی', description: 'وحید با انیمیشن دوبعدی سنتی به نقاشی‌ها جان می‌دهد. دنیای هنری او به انیمیشن محدود نمی‌شود؛ گرافیک، طراحی چهره و دیگر هنرهای تجسمی هم بخشی از علایق و فعالیت‌های او هستند. از چهره‌ای روی کاغذ تا شخصیتی در حرکت، طراحی نقطهٔ مشترک کارهای اوست.' },
    },
  },
};
let language = 'en';
try {
  const saved = localStorage.getItem('armoun-language');
  if (Object.hasOwn(translations, saved)) language = saved;
} catch { /* Language switching also works when storage is unavailable. */ }

function renderProfile() {
  if (!selectedCard) return;
  const id = selectedCard.dataset.person;
  const person = translations[language].people[id];
  document.getElementById('profile-name').textContent = person.name;
  document.getElementById('profile-role').textContent = person.role;
  document.getElementById('profile-description').textContent = person.description;
  const portrait = document.getElementById('profile-image');
  portrait.src = person.image;
  portrait.alt = person.name;
  document.getElementById('profile-website').href = person.website;
  document.getElementById('profile-linkedin').hidden = id !== 'emad';
}

function setLanguage(nextLanguage) {
  if (!Object.hasOwn(translations, nextLanguage)) return;
  language = nextLanguage;
  const text = translations[language];
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
  document.title = text.title;
  document.querySelector('meta[name="description"]').content = text.meta;
  document.querySelector('.language-switch').setAttribute('aria-label', text.language);
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = text[element.dataset.i18n];
  });
  document.querySelectorAll('[data-language]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.language === language));
  });
  document.querySelectorAll('[data-person]').forEach(card => {
    const person = text.people[card.dataset.person];
    card.querySelector('.name').textContent = person.name;
    card.querySelector('.role').textContent = person.role;
    card.querySelector('img').alt = person.name;
    card.setAttribute('aria-label', `${text.about} ${person.name}`);
  });
  renderProfile();
  try { localStorage.setItem('armoun-language', language); } catch { /* Optional persistence. */ }
}

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
    renderProfile();
    switchView(list, detail, back);
  });
});
back.addEventListener('click', () => {
  if (!transitioning) switchView(detail, list, selectedCard, true);
});

document.querySelectorAll('[data-language]').forEach(button => {
  button.addEventListener('click', () => setLanguage(button.dataset.language));
});
setLanguage(language);
