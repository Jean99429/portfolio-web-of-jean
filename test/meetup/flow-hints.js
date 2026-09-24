// Visual-only guide: original controls and event handlers remain untouched.
const app = document.querySelector('#app');
const hint = document.createElement('div');
hint.className = 'flow-hint';
hint.setAttribute('aria-hidden', 'true');
document.body.append(hint);
let attached = false, viewed = false, previous = null;
let changedAt = 0, quietSince = 0, flashed = false;
app.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.closest('[inert]')) return;
  if (['submit-meetup', 'attach-meetup'].includes(button.dataset.action)) attached = true;
  if (button.dataset.action === 'people') viewed = true;
}, true);
function target() {
  const pick = selector => [...app.querySelectorAll(selector)].find(el => !el.closest('[inert],.tx-old,.is-closing'));
  if (document.querySelector('#splash')) return null;
  if (pick('.intro-modal')) return pick('.intro-modal [data-action="compose"]');
  if (pick('.join-modal')) return pick('.join-modal [data-action="chat"]');
  if (pick('.ppl-shade')) return pick('.ppl-shade');
  if (app.querySelector('.modal-shade')) return null;
  switch(app.dataset.screen) {
    case 'compose': return pick(`[data-action="${attached ? 'post-publisher' : 'open-add-link'}"]`);
    case 'add-link': return pick('[data-action="choose-meetup"]');
    case 'select-meetup': return pick('.pub-picker.is-hosting [data-action="create-meetup"]') || pick('[data-action="tab-hosting"]');
    case 'new-meetup': return pick('.pnm-cover[data-action="fill-meetup"]');
    case 'filled-meetup': return pick('[data-action="submit-meetup"]');
    case 'feed': return pick('.feed-card[data-action="details"]');
    case 'details': return pick(`[data-action="${viewed ? 'join' : 'people'}"]`) || pick('.pmd-footer [data-action="chat"]');
    default: return null;
  }
}
function paint() {
  const el = target();
  const now = performance.now();
  if (el !== previous) {
    hint.classList.remove('visible'); previous = el;
    changedAt = quietSince = now; flashed = false;
  }
  // Include delayed finite animations and transitions; ignore ambient loops.
  const moving = app.getAnimations({subtree:true}).some(animation => {
    const timing = animation.effect?.getComputedTiming();
    return timing && Number.isFinite(timing.endTime) &&
      (animation.pending || animation.playState === 'running');
  });
  if (moving) quietSince = now;
  if (el) {
    let r = el.getBoundingClientRect();
    const phone = document.querySelector('#phone').getBoundingClientRect();
    let left = Math.max(r.left,phone.left), top = Math.max(r.top,phone.top);
    let right = Math.min(r.right,phone.right), bottom = Math.min(r.bottom,phone.bottom);
    if (el.matches('.ppl-shade')) {
      const sheet = el.querySelector('.ppl-sheet').getBoundingClientRect();
      const status = app.querySelector('.pmd-status').getBoundingClientRect();
      left = phone.left; right = phone.right;
      top = Math.max(phone.top, status.bottom); bottom = sheet.top;
    }
    const width = right-left, height = bottom-top;
    hint.style.cssText = `left:${left}px;top:${top}px;width:${width}px;height:${height}px`;
    if (!flashed && width > 0 && height > 0 && !moving &&
        now - changedAt >= 400 && now - quietSince >= 120) {
      hint.classList.add('visible');
      flashed = true;
    }
  } else hint.classList.remove('visible');
  requestAnimationFrame(paint);
}
requestAnimationFrame(paint);
