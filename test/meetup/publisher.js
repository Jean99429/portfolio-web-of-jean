const PUB_IMAGE = {
  compose: 'assets/publisher-139-12210.png',
  'add-link': 'assets/publisher-139-12227.png',
  'attached-compose': 'assets/publisher-139-12258.png',
  'hosting-empty': 'assets/publisher-139-12292.png',
  'discover-list': 'assets/publisher-139-12339.png',
  'new-meetup': 'assets/publisher-139-12044.png',
};

function hotspot(action, label, className) {
  return `<button type="button" class="pub-hotspot ${className}" data-action="${action}" aria-label="${label}"></button>`;
}

// Filled "New meetup" — styled after the details page (Figma 139:11943), Guest limit row kept from the blank form
function filledForm(state = {}) {
  const entering = Boolean(state.fillAnim);
  state.fillAnim = false;
  return `<div class="pub-screen pub-form is-filled${entering ? ' is-entering' : ''}">
    <div class="pmd-scroll" onscroll="this.parentNode.style.setProperty('--pmd-top', Math.min(1, this.scrollTop / 40))"><div class="pmd-inner">
      <img class="pmd-bg" src="assets/filled/bg.png" alt="">
      <main class="pnm-body">
        <div class="pnm-top">
          <div class="pnm-name-block">
            <h1 class="pmd-name">Argentina<br>Watch Party</h1>
            <div class="pnm-hosting-row"><span class="pnm-hosting pmd-tag"><span class="pmd-tag-icon"><img src="assets/filled/soccer.svg" alt=""></span><span>Worldcup</span></span></div>
          </div>
          <div class="pnm-time-place">
            <div class="pnm-field pnm-field-time"><span class="pnm-label">TIME</span><span class="pnm-value">Sat, Jul 11</span><span class="pmd-sub">11:30 PM</span></div>
            <div class="pnm-field pnm-field-place"><span class="pnm-label">PLACE</span><span class="pnm-value">The Football Factory</span><span class="pmd-dist"><span class="pmd-sub">2.8 km away</span><img src="assets/filled/arrow-up-right.svg" alt=""></span></div>
          </div>
        </div>
        <div class="pnm-divider"></div>
        <div class="pnm-lower">
          <div class="pnm-guest"><span class="pnm-guest-left"><img src="assets/filled/guests.svg" alt=""><span>Guest limit</span></span><span class="pnm-guest-pill">50</span></div>
          <div class="pnm-album"><span class="pnm-album-inner"><span class="pnm-cards"><img class="pnm-cardimg pnm-card-1" src="assets/album/dark-back.svg" alt=""><img class="pnm-cardimg pnm-card-2" src="assets/album/dark-front.svg" alt=""></span><span class="pnm-album-text"><span class="pnm-album-info"><strong>Shared album</strong><span>No photos yet</span></span><span class="pnm-album-action"><span class="pnm-plus">+</span><span>Add photos</span></span></span></span></div>
          <div class="pnm-about"><strong>About this meetup</strong><span class="pmd-about-text"><span>Watch the match with fellow Argentina fans. Bring your jersey, sing along and celebrate every goal together.</span><span>Don't worry if you're coming solo — this crowd's here for the same reason you are. Introduce yourself, we'll be loud enough to hear.</span></span></div>
        </div>
      </main>
    </div></div>
    <div class="pmd-wash"></div>
    <div class="pmd-topfade pmd-pblur"><i></i><i></i><i></i><i></i></div>
    <div class="pnm-status pmd-status"><span class="pnm-time">9:41</span><img class="pnm-cell" src="assets/filled/cellular.svg" alt=""><img class="pnm-wifi" src="assets/filled/wifi.svg" alt=""><span class="pnm-batt"></span><span class="pnm-batt-fill"></span><img class="pnm-cap" src="assets/filled/cap.svg" alt=""></div>
    <img class="pnm-back-20" src="assets/filled/back-20.svg" alt="">
    <button type="button" class="pnm-back" data-action="publisher-back" aria-label="Back to meetups"><img src="assets/filled/back-26.svg" alt=""></button>
    <span class="pnm-title pmd-title">New meetup</span>
    <div class="pmd-footer"><div class="pmd-footblur pmd-pblur"><i></i><i></i><i></i><i></i></div><button type="button" class="pnm-create" data-action="submit-meetup">Create</button><span class="pmd-home"></span></div>
  </div>`;
}

function formContent(state, assets) {
  if (state.prefilled) return filledForm(state);
  const v = (value, placeholder) => placeholder;
  return `<div class="pub-screen pub-form is-dark">
    <img class="pnm-bg" src="assets/form/bg-161-latest.png" alt="">
    <div class="pnm-status"><span class="pnm-time">9:41</span><img class="pnm-cell" src="assets/filled/cellular.svg" alt=""><img class="pnm-wifi" src="assets/filled/wifi.svg" alt=""><span class="pnm-batt"></span><span class="pnm-batt-fill"></span><img class="pnm-cap" src="assets/filled/cap.svg" alt=""></div>
    <img class="pnm-back-20" src="assets/filled/back-20.svg" alt="">
    <button type="button" class="pnm-back" data-action="publisher-back" aria-label="Back to meetups"><img src="assets/filled/back-26.svg" alt=""></button>
    <span class="pnm-title">New meetup</span>
    <button type="button" class="pnm-cover" data-action="fill-meetup"><img src="assets/form/camera-white.svg" alt=""><span>Add cover</span></button>
    <main class="pnm-body">
      <div class="pnm-top">
        <div class="pnm-name-block">
          <button type="button" class="pnm-name" data-action="fill-meetup">${v('Argentina Watch Party', 'Meetup name')}</button>
          <div class="pnm-hosting-row"><span class="pnm-hosting"><img src="assets/form/crown-170.svg" alt=""><span>Hosting</span></span></div>
        </div>
        <div class="pnm-time-place">
          <button type="button" class="pnm-field pnm-field-time" data-action="fill-meetup"><span class="pnm-label">TIME</span><span class="pnm-value">${v('Sat, Jul 11 · 11:30 PM', 'Add date &amp; time')}</span></button>
          <button type="button" class="pnm-field pnm-field-place" data-action="fill-meetup"><span class="pnm-label">PLACE</span><span class="pnm-value">${v('The Football Factory', 'Add location')}</span></button>
        </div>
      </div>
      <div class="pnm-divider"></div>
      <div class="pnm-lower">
        <button type="button" class="pnm-guest" data-action="fill-meetup"><span class="pnm-guest-left"><img src="assets/filled/guests.svg" alt=""><span>Guest limit</span></span><span class="pnm-guest-pill">${v('50', 'Set')}</span></button>
        <button type="button" class="pnm-album" data-action="fill-meetup"><span class="pnm-album-inner"><span class="pnm-cards"><span class="pnm-card-wrap pnm-card-1"><span class="pnm-card pnm-card-dashed"><img src="assets/form/placeholder-170.svg" alt=""></span></span><span class="pnm-card-wrap pnm-card-2"><span class="pnm-card"><img src="assets/form/placeholder-170.svg" alt=""></span></span></span><span class="pnm-album-text"><span class="pnm-album-info"><strong>Shared album</strong><span>${v('Share your match photos', 'No photos yet')}</span></span><span class="pnm-album-action"><span class="pnm-plus">+</span><span>Add photos</span></span></span></span></button>
        <button type="button" class="pnm-about" data-action="fill-meetup"><strong>About this meetup</strong><span>${v('Watch the match with fellow Argentina fans 🇦🇷 Come sing with us!', 'What will you do together?')}</span></button>
      </div>
    </main>
    <div class="pnm-footer"><button type="button" class="pnm-create" data-action="fill-meetup">Create</button></div>
    <div class="pub-home"></div>
  </div>`;
}

const MEETUPS = [
  ['Argentina Watch Party', 'Sat, Jul 11 · 11:30 PM', 'The Football Factory · 2.8 km'],
  ['Rooftop Listening Party', 'Sun, Jul 12 · 7:00 PM', 'Brooklyn rooftop · 4.2 km'],
  ['Sunday Yoga Club', 'Sun, Aug 1 · 12:00 PM', 'Market Square · 3.0 km'],
  ['Art in the Park', 'Sat, Jul 18 · 10:00 AM', 'Central Park · 2.5 km'],
  ['Board Game Night', 'Fri, Jul 24 · 9:00 PM', 'Downtown Bistro · 1.8 km'],
  ['Outdoor Movie Screening', 'Thu, Aug 8 · 8:30 PM', 'City Park · 1.2 km'],
];

function pickerBody(hosting) {
  if (hosting) return `<div class="pub-hempty"><div class="pub-hempty-top"><img src="assets/hosting/empty-illustration.png" alt=""><div class="pub-hempty-text"><h2>No meetups yet</h2><p>Create your first meetup and invite<br>people who share your interests.</p></div></div><button type="button" data-action="create-meetup">Create meetup</button></div>`;
  return `<div class="pub-dlist"><div class="pub-dlist-inner">${MEETUPS.map((item,i)=>`<button type="button" class="pub-dr"${i === 0 ? ' data-action="select-meetup-0"' : ' disabled'}><span class="pub-dr-main"><span class="pub-dr-cover"><img src="assets/discover/cover-${i}.png" alt=""></span><span class="pub-dr-info"><strong>${item[0]}</strong><span>${item[1]}</span><span>${item[2]}</span></span></span><img class="pub-dr-radio" src="assets/discover/radio-${i === 0 ? 'on' : 'off'}.svg" alt=""></button>`).join('')}</div></div><div class="pub-dfooter"><button type="button" data-action="attach-meetup">Add</button></div>`;
}

// Switch Discover/Hosting in place so the tab indicator can slide instead of re-rendering the page
function switchTab(state, hosting) {
  state.hosting = hosting;
  const picker = document.querySelector('.pub-picker');
  if (!picker) return 'select-meetup';
  picker.classList.toggle('is-hosting', hosting);
  picker.classList.toggle('is-discover', !hosting);
  picker.querySelector('.pub-tab-d').setAttribute('aria-selected', String(!hosting));
  picker.querySelector('.pub-tab-h').setAttribute('aria-selected', String(hosting));
  const body = picker.querySelector('.pub-picker-body');
  body.innerHTML = pickerBody(hosting);
  body.classList.remove('is-switching');
  void body.offsetWidth;
  body.classList.add('is-switching');
  return null;
}

export function renderPublisher(screen, state = {}, assets = {}) {
  if (screen === 'new-meetup' || screen === 'filled-meetup') return formContent({...state, prefilled: screen === 'filled-meetup' || state.prefilled}, assets);
  if (screen === 'select-meetup') {
    const hosting = Boolean(state.hosting);
    return `<div class="pub-screen pub-picker ${hosting ? 'is-hosting' : 'is-discover'}">
      <div class="pub-picker-body">${pickerBody(hosting)}</div>
      <header class="pub-hdr">
        <div class="pub-status"><span class="pub-status-time">9:41</span><img class="pub-status-cell" src="assets/picker/cellular.svg" alt=""><img class="pub-status-wifi" src="assets/picker/wifi.svg" alt=""><span class="pub-status-batt"></span><span class="pub-status-cap-fill"></span><img class="pub-status-cap" src="assets/picker/cap.svg" alt=""></div>
        <div class="pub-top"><button type="button" class="pub-back" data-action="publisher-back" aria-label="Back to add link"><img src="assets/picker/back.svg" alt=""></button><span class="pub-top-title">Meetup</span><span class="pub-top-spacer"></span></div>
        <div class="pub-tabs" role="tablist"><button type="button" role="tab" class="pub-tab pub-tab-d" data-action="tab-discover" aria-selected="${!hosting}">Discover</button><button type="button" role="tab" class="pub-tab pub-tab-h" data-action="tab-hosting" aria-selected="${hosting}"><span>Hosting</span></button><span class="pub-tab-ind"></span><span class="pub-tab-line"></span></div>
      </header>
      <div class="pub-home"></div>
    </div>`;
  }
  if (screen === 'add-link') {
    return `<div class="pub-screen pub-add-link">
      <img class="pub-screenshot" src="${PUB_IMAGE.compose}" alt="">
      <div class="pub-dim"></div>
      <img class="pub-sheet" src="assets/addlink-sheet.png" alt="Add link sheet">
      ${hotspot('close-add-link', 'Close add link', 'pub-close-sheet')}
      ${hotspot('choose-meetup', 'Choose a meetup', 'pub-meetup-choice')}
    </div>`;
  }
  const attached = Boolean(state.attached);
  return `<div class="pub-screen pub-compose">
    <img class="pub-screenshot" src="${attached ? PUB_IMAGE['attached-compose'] : PUB_IMAGE.compose}" alt="Create post">
    ${hotspot('publisher-back', 'Back to feed', 'pub-compose-back')}
    ${hotspot('open-add-link', 'Add link to post', 'pub-compose-link')}
    ${hotspot('post-publisher', 'Post', 'pub-compose-post')}
  </div>`;
}

export function handlePublisherAction(action, state = {}) {
  const screen = state.screen || state.currentScreen || state.publisherScreen || 'compose';
  if (action.startsWith('select-meetup-')) {
    state.selectedMeetup = Number(action.slice('select-meetup-'.length)) || 0;
    document.querySelectorAll('.pub-dr-radio').forEach((radio, i) => {
      radio.src = `assets/discover/radio-${i === state.selectedMeetup ? 'on' : 'off'}.svg`;
    });
    return null;
  }
  switch (action) {
    case 'publisher-back':
      if (screen === 'new-meetup' || screen === 'filled-meetup') return 'select-meetup';
      if (screen === 'select-meetup') return 'add-link';
      if (screen === 'add-link') return 'compose';
      return 'feed';
    case 'open-add-link': return 'add-link';
    case 'close-add-link': return 'compose';
    case 'choose-meetup': state.hosting = false; return 'select-meetup';
    case 'tab-discover': return state.hosting ? switchTab(state, false) : null;
    case 'tab-hosting': return state.hosting ? null : switchTab(state, true);
    case 'create-meetup': state.prefilled = false; return 'new-meetup';
    case 'fill-meetup': state.fillAnim = !state.prefilled; state.prefilled = true; return 'filled-meetup';
    case 'submit-meetup': state.created = true; state.attached = true; return 'compose';
    case 'attach-meetup': state.attached = true; return 'compose';
    case 'post-publisher': state.posted = true; return 'feed';
    default: return null;
  }
}
