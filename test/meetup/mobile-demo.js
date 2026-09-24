function fitMobileDemo(){
 const w=(document.documentElement.clientWidth<=600?document.documentElement.clientWidth:402), h=window.visualViewport?.height||innerHeight;
 const root=document.documentElement;
 root.style.setProperty('--mobile-scale',w/402);
 root.style.setProperty('--mobile-height',h/(w/402)+'px');
 root.style.setProperty('--mobile-width',w+'px');
 root.style.setProperty('--viewport-height',h+'px');
}
fitMobileDemo();addEventListener('resize',fitMobileDemo);window.visualViewport?.addEventListener('resize',fitMobileDemo);
