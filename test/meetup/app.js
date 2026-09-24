let renderPublisher,handlePublisherAction;
async function loadPublisher(){if(!renderPublisher){({renderPublisher,handlePublisherAction}=await import('./publisher.js?v=170fix'));}}
const maps=await fetch('./assets-map.json').then(r=>r.json());
const f=maps['139-11899'],d=maps['139-11943'],i=maps['139-12440'];
const assets={feed:f.imgImage1,cover:d.imgLocked,back:d.imgBackIcon,albumIcon:d.imgImagePlaceholder,meetup:f.imgFrame42};
const avatars=[i.imgEllipse,i.imgEllipse1,i.imgEllipse2];
const guests=['Tom','Sofia','Alex','Mateo','Lucia','Leo','Camila','Nico','Valentina','Ben','Emma','Lucas','Mia','Oliver','Isabella','Noah','Luna','Diego','Ava','Santiago','Elena','Max','Chloe','Daniel','Zoe','Gabriel','Maya','Liam','Sara','Theo','Eva','Jules','Amelia','Felix','Clara','Sam'];
const state={joined:false,hosting:false,attached:false,created:false,posted:false,prefilled:false,photos:[],messages:[]};
let screen='feed',modal=null,returnScreen='feed';
const app=document.querySelector('#app');
const img=(src,cls='',alt='')=>`<img src="${src}" class="${cls}" alt="${alt}">`;
const action=(name,label,cls='')=>`<button class="${cls}" data-action="${name}"${name==='close'&&cls==='close'?' aria-label="Close"':name==='back'||name==='feed'?' aria-label="Back"':''}>${label}</button>`;
const status=(dark=false)=>`<div class="status ${dark?'dark':''}"><b>9:41</b><span>${img(d.imgCellularConnection)}${img(d.imgWifi)}<span class="battery"></span></span></div>`;
const back=(name='back')=>action(name,img(d.imgBackIcon),'icon-button back');
const count=()=>state.joined?37:36;
const avatarStack=()=>`<div class="avatar-stack">${avatars.map(a=>img(a)).join('')}${state.joined?'<span class="you-avatar">You</span>':''}</div>`;
function feed(){return `<section class="feed">${img(assets.feed,'feed-image','Argentina football fans celebrating')}<div class="feed-info">${action('details',`<img class="meetup-icon" src="assets/feed/meetup-icon-full.svg" alt=""><span class="feed-card-text"><span class="feed-card-title"><span>Meetup</span><span class="feed-divider"></span><span>Argentina Watch Party</span></span><small>${count()}/50 going</small></span>`,'feed-card')}<strong>tom</strong><p>You're invited! Watch the match with fellow Argentina fans 🇦🇷 Come sing with us!</p><div class="music"><img src="assets/feed/music.svg" alt=""><span>Song name - song artist</span></div></div><button class="inbox-hotspot" data-action="chat" aria-label="Open meetup chat"></button>${state.posted?'<div class="posted-toast" role="status">Your post is live</div>':''}</section>`;}
function details(){const photos=state.photos;return `<section class="pub-screen pub-form is-filled pmd-details">
<div class="pmd-scroll" onscroll="this.parentNode.style.setProperty('--pmd-top', Math.min(1, this.scrollTop / 40))"><div class="pmd-inner">
<img class="pmd-bg" src="assets/filled/bg.png" alt="">
<main class="pnm-body">
<div class="pnm-top"><div class="pnm-name-block"><h1 class="pmd-name">Argentina<br>Watch Party</h1><div class="pnm-hosting-row"><span class="pnm-hosting pmd-tag"><span class="pmd-tag-icon"><img src="assets/filled/soccer.svg" alt=""></span><span>Worldcup</span></span></div></div>
<div class="pnm-time-place"><div class="pnm-field pnm-field-time"><span class="pnm-label">TIME</span><span class="pnm-value">Sat, Jul 11</span><span class="pmd-sub">11:30 PM</span></div><div class="pnm-field pnm-field-place"><span class="pnm-label">PLACE</span><span class="pnm-value">The Football Factory</span><span class="pmd-dist"><span class="pmd-sub">2.8 km away</span><img src="assets/filled/arrow-up-right.svg" alt=""></span></div></div></div>
<div class="pnm-divider"></div>
<div class="pnm-lower">
<div class="pmd-going"><div class="pmd-going-left"><span class="pmd-avatars"><span class="pmd-av pmd-av-3"><img src="assets/details/avatar-a.png" alt=""></span><span class="pmd-av pmd-av-2"><img src="assets/details/avatar-b.png" alt=""></span><span class="pmd-av pmd-av-1"><img src="assets/details/avatar-c.png" alt=""></span></span><span class="pmd-going-count"><strong>${count()}</strong><span>going · 50 total</span></span></div>${action('people','View','pnm-guest-pill pmd-view')}</div>
<div class="pnm-album"><span class="pnm-album-inner"><span class="pnm-cards">${photos.length?`<img class="pmd-album-thumb" src="${photos[0]}" alt="">`:`<img class="pnm-cardimg pnm-card-1" src="assets/album/dark-back.svg" alt=""><img class="pnm-cardimg pnm-card-2" src="assets/album/dark-front.svg" alt="">`}</span><span class="pnm-album-text"><span class="pnm-album-info"><strong>Shared album</strong><span>${photos.length?photos.length+' photo'+(photos.length>1?'s':''):'No photos yet'}</span></span><button type="button" class="pnm-album-action" data-action="add-photos"><span class="pnm-plus">+</span><span>Add photos</span></button></span></span>${photos.length?`<div class="pmd-photo-grid">${photos.map(src=>`<img src="${src}" alt="Shared meetup photo">`).join('')}</div>`:''}</div>
<div class="pnm-about"><strong>About this meetup</strong><span class="pmd-about-text"><span>Watch the match with fellow Argentina fans. Bring your jersey, sing along and celebrate every goal together.</span><span>Don't worry if you're coming solo — this crowd's here for the same reason you are. Introduce yourself, we'll be loud enough to hear.</span></span></div>
</div></main>
</div></div>
<div class="pmd-topfade pmd-pblur"><i></i><i></i><i></i><i></i></div>
<div class="pnm-status pmd-status"><span class="pnm-time">9:41</span><img class="pnm-cell" src="assets/filled/cellular.svg" alt=""><img class="pnm-wifi" src="assets/filled/wifi.svg" alt=""><span class="pnm-batt"></span><span class="pnm-batt-fill"></span><img class="pnm-cap" src="assets/filled/cap.svg" alt=""></div>
<img class="pnm-back-20" src="assets/filled/back-20.svg" alt="">
<button type="button" class="pnm-back" data-action="back" aria-label="Back"><img src="assets/filled/back-26.svg" alt=""></button>
<button type="button" class="pmd-share" data-action="share" aria-label="Share"><img src="assets/filled/share.svg" alt=""></button>
<div class="pmd-footer"><div class="pmd-footblur pmd-pblur"><i></i><i></i><i></i><i></i></div><button type="button" class="pnm-create" data-action="${state.joined?'chat':'join'}">Join</button><span class="pmd-home"></span></div>
</section>`;}
function chat(){return `<section class="gc">
<div class="gc-head"><div class="gc-status"><span class="gc-time">9:41</span><img class="gc-cell" src="assets/chat/cellular.svg" alt=""><img class="gc-wifi" src="assets/chat/wifi.svg" alt=""><span class="gc-batt"></span><span class="gc-batt-fill"></span><img class="gc-cap" src="assets/chat/cap.svg" alt=""></div>
<div class="gc-top"><div class="gc-top-left"><button type="button" class="gc-back" data-action="feed" aria-label="Back"><img src="assets/chat/back.svg" alt=""></button><img class="gc-avatar" src="assets/chat/header-avatar.png" alt=""><span class="gc-title">Argentina Watch Party</span></div><span class="gc-dots"><img src="assets/chat/dots.svg" alt=""></span></div></div>
<div class="gc-body"><p class="gc-date">August 18，4:26 AM</p><div class="gc-msgs">
<div class="gc-row gc-pop gc-pop-1"><img class="gc-host" src="assets/chat/host-avatar.png" alt=""><div class="gc-bubble"><img class="gc-tail" src="assets/chat/tail.svg" alt="">Hi! Welcome👏👏</div></div>
<div class="gc-row2"><div class="gc-bubble gc-bubble-2 gc-pop gc-pop-2"><img class="gc-tail" src="assets/chat/tail.svg" alt="">Let’s enjoyyyy the game🇦🇷🇦🇷</div><span class="gc-reaction gc-pop-3">🔥</span></div>
</div></div>
<img class="gc-input" src="assets/chat/input-bar.png" alt="">
<div class="gc-end"><button type="button" class="gc-restart" data-action="restart">Restart</button></div>
</section>`;}
const IA='assets/intro/';
const piece=(l,t,w,h,rot,inner,cls='',i=0)=>`<div class="ia ${cls}" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px;--i:${i}"><div style="transform:rotate(${rot}deg)">${inner}</div></div>`;
const vec=(src,w,h,iy,ix)=>`<div class="ia-vec" style="width:${w}px;height:${h}px"><img src="${IA+src}" alt="" style="inset:${iy}% ${ix}%"></div>`;
const icon=(src,w,h)=>`<img src="${IA+src}" alt="" style="width:${w}px;height:${h}px">`;
function introArt(){return `<div class="intro-art" aria-hidden="true">
${piece(27.65,9.84,155.548,166.947,-15,'<div class="ic-back"><div class="ic-bars"><i></i><i></i><b></b><i class="short"></i></div></div>','ia-card-back',0)}
${piece(0,52.33,17.74,17.49,40.43,vec('confetti-arc.svg',13.53,11.46,-13.09,-11.09),'ia-bit',14)}
${piece(226.57,98.59,35.671,35.671,-10,icon('gamepad.svg',30.792,30.792),'ia-bit',8)}
${piece(77.54,34.38,151.522,167.824,5.18,`<div class="ic-photo"><img src="${IA}card-photo.png" alt=""><span class="ic-shade"></span><div class="ic-info"><strong>Argentina Watch Party</strong><span>Sat, Jul 11 · 11:30 PM</span><span>The Football Factory</span><div class="ic-going"><span class="ic-avs"><img src="${IA}avatar-1.png" alt=""><img src="${IA}avatar-2.png" alt=""><img src="${IA}avatar-3.png" alt=""></span>36 going</div></div></div>`,'ia-card-photo',0)}
${piece(249.9,45.62,30.155,30.155,0,icon('art-jam.svg',30.155,30.155),'ia-bit',10)}
${piece(183.19,17.96,10.02,9.02,0,icon('confetti-1.svg',10.02,9.02),'ia-bit',15)}
${piece(173.63,138.5,141.397,45.318,3,"<div class=\"ib\">You're invited！</div>",'ia-bit',0)}
${piece(6.42,124.25,72.05,37.29,-7.09,'<div class="ib sm">36 going</div>','ia-bit',3)}
${piece(30,0,42.698,42.698,-12,icon('soccer.svg',36,36),'ia-bit',7)}
${piece(6.42,101.37,40.809,41.525,-19.44,icon('fire.svg',31.681,32.854),'ia-bit',9)}
${piece(216.8,22.46,23.53,18.22,-24.93,vec('confetti-squiggle.svg',21.19,10.24,-14.65,-7.08),'ia-bit',13)}
${piece(247.96,86.99,8.98,11,0,icon('confetti-2.svg',8.98,11),'ia-bit',16)}
${piece(29.99,78.13,10.99,11,0,icon('confetti-3.svg',10.99,11),'ia-bit',14)}
</div>`;}
const CONFETTI_COLORS=['#fe2c55','#25f4ee','#ffd23f','#9b6bff','#ff8a3d'];
// Confetti pops up from the top of the popup, then drifts down while flipping. Fixed pseudo-random values so it plays the same every time.
function confetti(){const rnd=n=>{const x=Math.sin(n*12.9898)*43758.5453;return x-Math.floor(x);};const bits=Array.from({length:30},(_,n)=>{const a=(-160+rnd(n+1)*140)*Math.PI/180,up=110+rnd(n+7)*120,x1=Math.cos(a)*(90+rnd(n+3)*90),y1=-Math.abs(Math.sin(a))*up,x2=x1+(rnd(n+11)-.5)*90,y2=y1+230+rnd(n+5)*160,shape=['','cf-dot','cf-strip'][n%3];return `<i class="cf-bit ${shape}" style="--x0:${((rnd(n+21)-.5)*48).toFixed(1)}px;--y0:${((rnd(n+23)-.5)*10).toFixed(1)}px;--x1:${x1.toFixed(1)}px;--y1:${y1.toFixed(1)}px;--x2:${x2.toFixed(1)}px;--y2:${y2.toFixed(1)}px;--r1:${Math.round((rnd(n+2)-.5)*360)}deg;--r2:${Math.round((rnd(n+4)-.5)*900)}deg;--c:${CONFETTI_COLORS[n%5]};--d:${(rnd(n+9)*.12).toFixed(2)}s;--dur:${(2.1+rnd(n+13)*.7).toFixed(2)}s;--flip:${(.35+rnd(n+17)*.35).toFixed(2)}s"><b></b></i>`}).join('');return `<div class="cf" aria-hidden="true">${bits}</div>`;}
function overlays(){if(modal==='intro')return `<div class="modal-shade intro-shade"><section class="intro-modal" role="dialog" aria-modal="true" aria-labelledby="intro-title"><div class="intro-bg"></div><button class="intro-close" data-action="close" aria-label="Close"><img src="assets/intro/close.svg" alt=""></button>${introArt()}<div class="intro-body"><div class="intro-copy"><h2 id="intro-title">Meet your people.</h2><p>Find your crowd. Join local meetups<br>for the things you love.</p></div>${action('compose','Get started','primary')}</div></section></div>`;
if(modal==='success')return `<div class="modal-shade join-shade"><section class="join-modal" role="dialog" aria-modal="true" aria-labelledby="join-title">${confetti()}<div class="join-body"><img class="join-check" src="assets/join/check.svg" alt=""><div class="join-copy"><h2 id="join-title">You're in!</h2><p>See you at the meetup.</p></div><div class="join-actions">${action('chat','Join group chat','primary')}<button type="button" class="join-skip" data-action="close">Skip for now</button></div></div></section></div>`;
if(modal==='people')return `<div class="modal-shade ppl-shade" data-action="dismiss"><section class="ppl-sheet" role="dialog" aria-modal="true" aria-labelledby="people-title"><div class="ppl-grip"></div><h2 id="people-title">Who's going</h2><div class="ppl-list">${[...guests,...(state.joined?['You']:[])].map((name,n)=>`<div class="ppl-row">${n<3?img(avatars[n],'ppl-avatar'):`<span class="ppl-avatar ppl-letter${name==='You'?' ppl-you':''}">${name==='You'?'You':name.slice(0,1)}</span>`}<div class="ppl-info"><b>${name}</b><small>${n===0?'Bringing fans together':name==='You'?'See you at the match!':'Argentina fan 🇦🇷'}</small></div>${n===0?'<em class="ppl-host">Host</em>':''}</div>`).join('')}</div></section></div>`;return '';}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){getSelection()?.removeAllRanges();state.screen=screen;app.innerHTML=(screen==='feed'?feed():screen==='details'?details():screen==='chat'?chat():renderPublisher(screen,state,assets))+overlays();app.dataset.screen=screen;if(modal&&app.firstElementChild)app.firstElementChild.inert=true;if(modal)app.querySelector('[role="dialog"] button:not(:disabled)')?.focus({preventScroll:true,focusVisible:false});}
// Screen transitions (iOS conventions): push/pop for drill-in pages, present/dismiss for the full-screen composer,
// sheet-down when the Add link sheet closes. 'none' = the target screen animates itself.
const TX={'feed>details':'present','details>feed':'dismiss','feed>chat':'push','details>chat':'push','chat>feed':'pop','feed>compose':'present','compose>feed':'dismiss','add-link>compose':'sheet-down','add-link>select-meetup':'present','select-meetup>add-link':'dismiss','select-meetup>new-meetup':'push','new-meetup>select-meetup':'pop','filled-meetup>select-meetup':'pop','filled-meetup>compose':'dismiss','select-meetup>compose':'dismiss'};
const TX_ON_TOP=['pop','dismiss','sheet-down'];
function navigate(next){const kind=TX[screen+'>'+next];let old=null;if(kind){old=document.createElement('div');old.className='tx-layer tx-old tx-'+kind;while(app.firstChild)old.appendChild(app.firstChild);old.inert=true;}screen=next;modal=null;render();if(!old)return;const neu=app.firstElementChild;neu.classList.add('tx-in','tx-'+kind);if(kind==='pop'||kind==='dismiss')neu.classList.add('tx-quiet');if(TX_ON_TOP.includes(kind))app.appendChild(old);else app.insertBefore(old,app.firstChild);old.getAnimations({subtree:true}).forEach(a=>{if(a.animationName?.startsWith('tx-'))return;try{a.finish()}catch{a.cancel()}});setTimeout(()=>{old.remove();neu.classList.remove('tx-in','tx-'+kind);},650);}
// Closing overlays: play the exit animation, then re-render without the overlay
function closeModal(){const shade=app.querySelector('.modal-shade');if(!shade){modal=null;render();return;}if(shade.classList.contains('is-closing'))return;shade.classList.add('is-closing');setTimeout(()=>{modal=null;render();},470);}
app.addEventListener('click',async e=>{const button=e.target.closest('[data-action]');if(!button)return;const a=button.dataset.action;if(a==='dismiss'&&e.target!==button)return;
if(a==='dismiss'&&button.classList.contains('ppl-shade')&&e.clientY<app.querySelector('.pmd-status').getBoundingClientRect().bottom)return;
if(a==='close'||a==='dismiss'){closeModal();}
else if(a==='details'){returnScreen=screen;navigate('details');}
else if(a==='back')navigate(returnScreen);
else if(a==='feed')navigate('feed');
else if(a==='compose'){await loadPublisher();navigate('compose');}
else if(a==='people'){modal='people';render();}
else if(a==='join'){state.joined=true;modal='success';render();}
else if(a==='chat')navigate('chat');
else if(a==='restart')location.reload();
else if(a==='add-photos'){const input=document.createElement('input');input.type='file';input.accept='image/*';input.multiple=true;input.onchange=()=>{for(const file of input.files)if(file.type.startsWith('image/'))state.photos.push(URL.createObjectURL(file));render();};input.click();}
else if(a==='share'){if(navigator.share){try{await navigator.share({title:'Argentina Watch Party',url:location.href});}catch{}}else{modal='share';app.insertAdjacentHTML('beforeend',`<div class="modal-shade"><section class="share-modal" role="dialog" aria-modal="true"><h2>Invite your people</h2><p>Argentina Watch Party<br>Sat, Jul 11 · The Football Factory</p>${action('close','Done','primary')}</section></div>`);}}
else{const next=handlePublisherAction(a,state);if(next)navigate(next);}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal){closeModal();}});
function resize(){const phone=innerWidth<=500,w=phone?402:450,h=phone?874:920,scale=phone?Math.min(innerWidth/402,innerHeight/874):Math.min(innerWidth*.9/450,innerHeight*.82/920,1);document.documentElement.style.setProperty('--scale',scale);const s=document.querySelector('#stage');s.style.width=w*scale+'px';s.style.height=h*scale+'px';}
addEventListener('resize',resize);resize();render();
// Decode heavy publish-flow images up front so screen transitions don't stall
const decoded=['assets/addlink-sheet.png','assets/publisher-139-12210.png','assets/publisher-139-12258.png','assets/publisher-139-12339.png','assets/publisher-139-12292.png','assets/publisher-139-12044.png','assets/filled/bg.png','assets/form/bg-gradient.png'].map(src=>{const im=new Image();im.src=src;im.decode?.().catch(()=>{});return im;});
// Splash → feed → new-feature popup
const splash=document.querySelector('#splash');
setTimeout(()=>{splash.classList.add('hide');setTimeout(()=>splash.remove(),700);},1400);
// Load TikTok Sans during the splash so the popup never paints in the fallback font
const fontsReady=document.fonts?Promise.all(['400','600','700','800'].map(w=>document.fonts.load(`${w} 16px "TikTok Sans"`))).catch(()=>{}):Promise.resolve();
setTimeout(async()=>{await Promise.race([fontsReady,new Promise(r=>setTimeout(r,1500))]);if(screen==='feed'&&!modal){modal='intro';render();}},2400);
