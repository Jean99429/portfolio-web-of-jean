window.OutfitLoader = {
  progress(done,total,label) {
    const p=Math.min(100,Math.floor(done/Math.max(1,total)*100));
    document.getElementById('loadPercent').textContent=p;
    document.getElementById('demoLoader').setAttribute('aria-valuenow',p);
  },
  hide(){document.body.classList.remove('demo-loading');document.getElementById('demoLoader').hidden=true;},
  show(){document.body.classList.add('demo-loading');document.getElementById('demoLoader').hidden=false;this.progress(0,1);},
  error(){const n=document.getElementById('loadPercent');n.tabIndex=0;n.setAttribute('role','button');n.setAttribute('aria-label','重新加载');n.onclick=()=>location.reload();n.onkeydown=e=>{if(e.key==='Enter'||e.key===' ')location.reload();};},
  async fonts(){
    const link=document.querySelector('link[data-demo-fonts]');
    if(link && !link.sheet) await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('Font stylesheet timeout')),45000);
      link.addEventListener('load',()=>{clearTimeout(timer);resolve();},{once:true});
      link.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Font stylesheet failed'));},{once:true});
    });
    const text=window.OUTFIT_FONT_TEXT || document.body.textContent;
    let fontTimer;
    const readyFonts=Promise.all(['300 14px "Noto Sans SC"','400 14px "Noto Sans SC"','300 14px Montserrat','400 14px Montserrat','500 14px Montserrat','600 14px Montserrat','400 14px Lora','italic 400 14px Lora'].map(font=>document.fonts.load(font,text))).then(()=>document.fonts.ready);
    try { await Promise.race([readyFonts,new Promise((_,reject)=>{fontTimer=setTimeout(()=>reject(new Error("Font loading timeout")),45000);})]); } finally {clearTimeout(fontTimer);}
  },
  image(src){return new Promise((resolve,reject)=>{
    const img=new Image(),timer=setTimeout(()=>reject(new Error('Image timeout: '+src)),45000);
    img.onload=()=>img.decode().then(()=>{clearTimeout(timer);resolve(img);},reject);
    img.onerror=()=>{clearTimeout(timer);reject(new Error('Image failed: '+src));};
    img.src=src;
  });}
};
