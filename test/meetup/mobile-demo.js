function fitMobileDemo(){
 const w=(document.documentElement.clientWidth<=600?document.documentElement.clientWidth:402), h=window.visualViewport?.height||innerHeight;
 const root=document.documentElement;
 root.style.setProperty('--mobile-scale',w/402);
 root.style.setProperty('--mobile-height',h/(w/402)+'px');
 root.style.setProperty('--mobile-width',w+'px');
 root.style.setProperty('--viewport-height',h+'px');
}
fitMobileDemo();addEventListener('resize',fitMobileDemo);window.visualViewport?.addEventListener('resize',fitMobileDemo);

function adaptScreens(){
 document.querySelectorAll('.pub-compose:not([data-mobile-ready])').forEach(screen=>{
  screen.dataset.mobileReady='true';
  const image=screen.querySelector('.pub-screenshot'),post=screen.querySelector('.pub-compose-post');
  const scroll=document.createElement('div'),content=document.createElement('div'),footer=document.createElement('div');
  scroll.className='mobile-compose-scroll';content.className='mobile-compose-content';footer.className='mobile-compose-footer';
  const copy=image.cloneNode();copy.alt='';footer.append(copy,post);
  while(screen.firstChild)content.append(screen.firstChild);
  scroll.append(content);screen.append(scroll,footer);
 });
 document.querySelectorAll('.feed:not([data-mobile-ready])').forEach(screen=>{
  screen.dataset.mobileReady='true';const image=screen.querySelector('.feed-image');
  for(const part of ['top','bottom']){const layer=document.createElement('div');layer.className='mobile-feed-'+part;const copy=image.cloneNode();copy.className='';copy.alt='';layer.append(copy);screen.append(layer);}
 });
}
new MutationObserver(adaptScreens).observe(document.querySelector('#app'),{childList:true,subtree:true});adaptScreens();
