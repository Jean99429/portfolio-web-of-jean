const escapeAttribute = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

/**
 * Render the decorative success animation shown after joining a meetup.
 * `avatars` may contain image path strings or objects with a `src` property.
 */
export function renderJoinAnimation({ avatars = [], count = 37 } = {}) {
  const people = avatars.slice(0, 3).map((avatar, index) => {
    const src = typeof avatar === 'string' ? avatar : avatar?.src;
    if (!src) return '';
    return `<span class="join-animation__person join-animation__person--${index + 1}"><img src="${escapeAttribute(src)}" alt=""></span>`;
  }).join('');

  const previousCount = Math.max(0, Number(count) - 1 || 36);
  return `<div class="join-animation" aria-hidden="true">
    <span class="join-animation__glow"></span>
    <span class="join-animation__particle join-animation__particle--one">✦</span>
    <span class="join-animation__particle join-animation__particle--two">•</span>
    <span class="join-animation__particle join-animation__particle--three">✦</span>
    <span class="join-animation__particle join-animation__particle--four">•</span>
    <div class="join-animation__scene">
      <div class="join-animation__arrivals">${people}<span class="join-animation__you"><span>You</span></span></div>
      <div class="join-animation__group">${people}<span class="join-animation__you"><span>You</span></span></div>
    </div>
    <div class="join-animation__count"><span class="join-animation__count-old">${previousCount}</span><span class="join-animation__count-arrow">→</span><span class="join-animation__count-new">${Number(count) || 37}</span><span class="join-animation__count-label">going</span></div>
  </div>`;
}
