/* 点点 App showcase — continuous composition, 9:16 */
const { CompositionStage, useComposition, Easing, interpolate, animate, clamp } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakSlider, TweakColor } = window;

const W = 1080, H = 1920;
const PW = 397.132, PH = 860.957, PR = 46.683;
const S = 1.80;
const PX = (W - PW * S) / 2, PY = (H - PH * S) / 2;

const FONT = '"PingFang SC", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif';

/* ── the only three motion helpers ─────────────────────────────── */
const MOTION = {
  // springy appear: opacity + scale + rise
  pop: (T, at, { dy = 22, s0 = 0.88, d = 0.72 } = {}) => {
    const p = clamp((T - at) / d, 0, 1);
    const e = Easing.easeOutBack(p);
    return { opacity: clamp((T - at) / (d * 0.42), 0, 1), scale: s0 + (1 - s0) * e, y: dy * (1 - e) };
  },
  // eased glide between two authored times
  glide: (T, from, to, start, end, ease = Easing.easeOutCubic) =>
    animate({ from, to, start, end, ease })(T),
  // endless slow float
  drift: (T, seed, amp = 1) => ({
    y: amp * 4.2 * Math.sin(T * 0.62 + seed * 1.7),
    x: amp * 2.4 * Math.sin(T * 0.44 + seed * 2.9),
    rot: amp * 0.85 * Math.sin(T * 0.53 + seed * 1.1),
  }),
};

/* ── small chrome pieces ───────────────────────────────────────── */
function StatusBar() {
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: PW, height: 59.599 }}>
      <div style={{ position: 'absolute', left: 41.5, top: 17, fontFamily: FONT, fontWeight: 600, fontSize: 17.5, letterSpacing: '0.01em', color: '#000' }}>9:41</div>
      <div style={{ position: 'absolute', right: 36, top: 22, display: 'flex', flexDirection: 'row', gap: 5.5, alignItems: 'flex-end' }}>
        {[4.5, 6.5, 8.5, 10.5].map((h, i) => (
          <div key={i} style={{ width: 3.2, height: h, borderRadius: 1.1, backgroundColor: '#000' }} />
        ))}
        <svg width="16" height="11.5" viewBox="0 0 16 11.5" style={{ marginLeft: 2.5, marginBottom: -0.5 }}>
          <path d="M8 9.6 L10.6 6.9 A3.7 3.7 0 0 0 5.4 6.9 Z M8 4.6 A6.9 6.9 0 0 1 12.8 6.6 L14.4 4.9 A9.2 9.2 0 0 0 1.6 4.9 L3.2 6.6 A6.9 6.9 0 0 1 8 4.6 Z" fill="#000" />
        </svg>
        <div style={{ marginLeft: 3, width: 24.5, height: 12, borderRadius: 3.6, boxShadow: 'inset 0 0 0 1.1px rgba(0,0,0,0.35)', padding: 1.8, boxSizing: 'border-box', marginBottom: -0.5 }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 2, backgroundColor: '#000' }} />
        </div>
      </div>
    </div>
  );
}

function InputBar() {
  return (
    <div style={{
      position: 'absolute', left: 0, top: 763.221, width: PW, height: 97.736,
      borderRadius: 28.294, backgroundColor: 'rgba(247,247,247,0.98)', backdropFilter: 'blur(4.042px)',
      display: 'flex', flexDirection: 'column', padding: '10.105px 0px', boxSizing: 'border-box',
    }}>
      <div style={{ height: 49.231, display: 'flex', flexDirection: 'row', gap: 14.147, padding: '0px 16.168px', alignItems: 'center', boxSizing: 'border-box', flexShrink: 0 }}>
        <div style={{ width: 24.252, height: 24.252, flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 2.021, top: 2.021, width: 20.21, height: 20.21, borderRadius: '50%', boxShadow: 'inset 0 0 0 1.516px rgba(20,20,20,0.8)' }} />
          <div style={{ position: 'absolute', left: 7.579, top: 7.074, width: 9.701, height: 10.105, display: 'flex', flexDirection: 'row', gap: 1.213, justifyContent: 'center', alignItems: 'center' }}>
            {[4.4, 8.2, 10.1, 5.6].map((h, i) => (
              <div key={i} style={{ width: 1.35, height: h, borderRadius: 0.7, backgroundColor: 'rgba(20,20,20,0.8)' }} />
            ))}
          </div>
        </div>
        <div style={{
          height: 49.231, borderRadius: 16.168, backgroundColor: '#fff',
          boxShadow: 'inset 0 0 0 0.505px rgba(20,20,20,0.1), 0px 0px 8.084px 0px rgba(20,20,20,0.04)',
          display: 'flex', flexDirection: 'row', padding: '11.116px 16.168px', alignItems: 'center', boxSizing: 'border-box', flexGrow: 1,
        }}>
          <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: 16.168, whiteSpace: 'nowrap', lineHeight: '26.273px', letterSpacing: '0.020em', color: 'rgba(20,20,20,0.16)' }}>给点点发消息...</span>
        </div>
        <svg width="24.252" height="24.252" viewBox="0 0 24 24" style={{ flexShrink: 0 }} fill="none" stroke="rgba(20,20,20,0.8)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 8.6h2.6l1.5-2.2h7.8l1.5 2.2H20a1.6 1.6 0 0 1 1.6 1.6v7.4A1.6 1.6 0 0 1 20 19.4H4a1.6 1.6 0 0 1-1.6-1.6v-7.4A1.6 1.6 0 0 1 4 8.6Z" />
          <circle cx="12" cy="13.9" r="3.5" />
        </svg>
      </div>
    </div>
  );
}

function Avatar({ style }) {
  return (
    <div style={{
      position: 'absolute', left: 17.993, top: 69.868, width: 39.41, height: 39.41,
      borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.8)',
      boxShadow: '0px 0px 10.105px 0px rgba(0,0,0,0.04)', padding: 2.526, boxSizing: 'border-box', ...style,
    }}>
      <div style={{
        width: 34.357, height: 34.357, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 30%, #ffffff 0%, #e8faf4 46%, #a9eedd 100%)',
        boxShadow: 'inset 0 0 0 0.505px rgba(20,20,20,0.1)',
      }} />
    </div>
  );
}

/* 助手气泡（左，带右向引脚）*/
function AssistantBubble({ top, width, text, tail, style, fontSize = 16.168 }) {
  return (
    <div style={{ position: 'absolute', left: 20.21, top, width: 356.711, ...style }}>
      <div style={{
        width, borderRadius: 22.231, backgroundColor: '#fff',
        boxShadow: 'inset 0 0 0 0.505px rgb(237,237,237)',
        padding: '12.126px 16.168px', boxSizing: 'border-box',
      }}>
        <span style={{ display: 'block', maxWidth: 263.744, fontFamily: FONT, fontWeight: 400, fontSize, lineHeight: '26.273px', letterSpacing: '0.020em', color: 'rgb(20,20,20)' }}>{text}</span>
      </div>
      {tail}
    </div>
  );
}

const TAIL_INTRO = (
  <svg width="12.109" height="7.775" viewBox="0 0 12.109 7.775" style={{ position: 'absolute', left: 8.525, top: 99.233, transform: 'scaleX(-1)' }}>
    <path d="M 0 0.24 L 0.203 0.605 C 2.597 4.913 6.342 7.448 11.418 7.773 C 11.732 7.793 11.963 7.599 12.058 7.364 C 12.151 7.132 12.124 6.836 11.92 6.619 C 9.783 4.349 9.83 1.832 10.267 0.331 L 10.363 0 L 0 0.24 Z" fill="#fff" />
  </svg>
);
const TAIL_REPLY = (
  <svg width="12.55" height="13.355" viewBox="0 0 12.550 13.355" style={{ position: 'absolute', left: 8.084, top: 94.874, transform: 'scaleX(-1)' }}>
    <path d="M 0 5.82 L 0.203 6.185 C 2.597 10.494 6.342 13.029 11.418 13.354 C 11.732 13.374 11.963 13.179 12.058 12.944 C 12.151 12.712 12.124 12.416 11.92 12.199 C 9.783 9.929 9.83 7.413 10.267 5.911 L 10.363 5.581 L 12.55 0 L 0 5.82 Z" fill="#fff" />
  </svg>
);

/* 推荐问题气泡（帧1）*/
function PromptChip({ text, style }) {
  return (
    <div style={{ position: 'absolute', width: 'max-content', ...style }}>
      <div style={{
        height: 77.908, borderRadius: 45.828, backgroundColor: 'rgb(251,251,251)',
        backdropFilter: 'blur(4.583px)', boxShadow: '0px 4.583px 34.371px 0px rgba(0,0,0,0.08)',
        padding: '13.748px 22.914px 13.748px 18.331px', display: 'flex', alignItems: 'center', boxSizing: 'border-box',
      }}>
        <span style={{ opacity: 0.8, fontFamily: FONT, fontWeight: 500, fontSize: 22.914, whiteSpace: 'nowrap', lineHeight: '100%', letterSpacing: '0.040em', color: '#000' }}>{text}</span>
      </div>
      <svg width="25.488" height="14.907" viewBox="0 0 25.488 14.907" style={{ position: 'absolute', left: 19.877, top: 72.871, opacity: 0.9 }}>
        <path d="M 9.021 0.078 C 11.56 1.763 14.605 2.745 17.88 2.745 L 25.488 2.745 C 19.829 10.435 11.412 14.738 0.233 14.907 C 0.013 14.911 -0.084 14.628 0.088 14.49 C 6.416 9.415 6.386 3.456 5.271 0 L 9.021 0.078 Z" fill="rgb(251,251,251)" />
      </svg>
    </div>
  );
}

/* 用户/意图气泡（帧2）*/
function IntentChip({ text, style }) {
  return (
    <div style={{ position: 'absolute', width: 'max-content', ...style }}>
      <div style={{
        height: 45.914, borderRadius: 127.3, backgroundColor: '#fff',
        padding: '11.457px 15.276px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
        boxShadow: '0px 3.4px 18px 0px rgba(20,20,20,0.06)',
      }}>
        <span style={{ opacity: 0.9, fontFamily: FONT, fontWeight: 500, fontSize: 16.549, whiteSpace: 'nowrap', lineHeight: '22.914px', letterSpacing: '0.020em', color: 'rgb(20,20,20)' }}>{text}</span>
      </div>
      <div style={{ position: 'absolute', left: -7.638, top: 14.003, width: 10.184, height: 8.911, transform: 'scaleY(-1)' }}>
        <div style={{ position: 'absolute', left: 2.546, top: 0, width: 7.638, height: 7.638, borderRadius: '50%', backgroundColor: '#fff' }} />
        <div style={{ position: 'absolute', left: 0, top: 6.365, width: 2.546, height: 2.546, borderRadius: '50%', backgroundColor: '#fff' }} />
      </div>
    </div>
  );
}

/* 用户气泡（右，尾巴在右下）*/
function UserBubble({ text, style }) {
  return (
    <div style={{ position: 'absolute', width: 'max-content', maxWidth: 296.08, ...style }}>
      <div style={{ borderRadius: 22.231, backgroundColor: 'rgb(232,233,232)', padding: '12.126px 16.168px', boxSizing: 'border-box' }}>
        <span style={{ display: 'block', fontFamily: FONT, fontWeight: 400, fontSize: 16.168, lineHeight: '26.273px', letterSpacing: '0.020em', color: 'rgb(20,20,20)' }}>{text}</span>
      </div>
      <svg width="12.109" height="7.775" viewBox="0 0 12.109 7.775" style={{ position: 'absolute', right: 8.525, bottom: -6.4 }}>
        <path d="M 0 0.24 L 0.203 0.605 C 2.597 4.913 6.342 7.448 11.418 7.773 C 11.732 7.793 11.963 7.599 12.058 7.364 C 12.151 7.132 12.124 6.836 11.92 6.619 C 9.783 4.349 9.83 1.832 10.267 0.331 L 10.363 0 L 0 0.24 Z" fill="rgb(232,233,232)" />
      </svg>
    </div>
  );
}

/* 链接解析卡（原稿切图，卡面内容宽 296.08）*/
const LINK_W = 312.4, LINK_H = 163.1, LINK_DX = 8.2, LINK_DY = 15.5;
function LinkCard({ style }) {
  return <img src="assets/link-card.png" alt="" style={{ position: 'absolute', width: LINK_W, height: LINK_H, ...style }} />;
}

/* 总结卡（帧3）*/
function SummaryCard({ style }) {
  const body = { fontFamily: FONT, fontWeight: 400, fontSize: 15.158, lineHeight: '25.263px', letterSpacing: '0.020em', color: 'rgb(20,20,20)' };
  const head = { fontFamily: FONT, fontWeight: 600, fontSize: 16.168, lineHeight: '26.273px', letterSpacing: '0.020em', color: 'rgb(20,20,20)' };
  return (
    <div style={{
      position: 'absolute', left: 20.21, width: 356.71, borderRadius: 36.378,
      backgroundColor: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(6px)',
      boxShadow: '0px 0px 10.105px 0px rgba(0,0,0,0.04)',
      padding: '26.273px 22.231px 32.336px', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', gap: 26.273, ...style,
    }}>
      <span style={body}>最近有几场展览都很值得去看。我帮你整理了笔记亮点，并总结了几场最近的热门展览供你对比选择。</span>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 8, height: 117.219, alignItems: 'center' }}>
        {['assets/thumb-1.png', 'assets/thumb-2.png', 'assets/thumb-3.png'].map((src, i) => (
          <div key={i} style={{
            width: 106.103, height: 106.103, borderRadius: 22.231, flexShrink: 0,
            background: `url(${src}) center / cover no-repeat`,
            boxShadow: 'inset 0 0 0 2.021px rgba(255,255,255,0.8), 0px 2.021px 16.168px 0px rgba(0,0,0,0.12)',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12.126 }}>
        <span style={head}>🗿️ 敦煌文化艺术公益展</span>
        <span style={body}>这是一个免费的大型展览，还原了莫高窟的多个经典洞窟，包括“藏经洞”和“敦煌最美菩萨”壁画，沉浸感很强，非常适合想了解敦煌文化但又没机会去实地的人。</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6.063 }}>
          {['展期：2025年10月23日-2026年3月31日', '时间：10:00-18:00（周一闭馆）', '地点：长宁区仙霞路199号 艺丰中心', '门票：免费，需预约'].map((t, i) => (
            <span key={i} style={{ ...body, fontWeight: 600 }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12.126 }}>
        <span style={head}>🖼️ 古罗马艺术真迹大展</span>
        <span style={body}>来自意大利的考古发现和艺术珍品，通过131件文物展现古罗马的辉煌历史与灿烂文明，是了解西方古典艺术的好机会。</span>
      </div>
    </div>
  );
}

/* ── the piece ─────────────────────────────────────────────────── */
const PROMPTS = [
  { text: 'iPhone17系列怎么样', x: -30, y: 318 },
  { text: '近期艺术展览推荐', x: 158, y: 380 },
  { text: '秋冬温泉3日游行程', x: -22, y: 474 },
  { text: '附近宠物友好餐厅推荐', x: 104, y: 616 },
];

const CARDS = [
  { src: 'assets/card-iphone.png', w: 352, h: 451, x: -92, y: 418, rot: 5 },
  { src: 'assets/card-vangogh.png', w: 341, h: 444, x: 46, y: 362, rot: -2.5 },
  { src: 'assets/card-onsen.png', w: 352, h: 460, x: 208, y: 420, rot: 3.2 },
  { src: 'assets/card-bistro.png', w: 341, h: 444, x: 340, y: 358, rot: -4 },
];
const CARD_W = 150;

function Piece() {
  const { T, CUES, authoredTotal } = useComposition();
  const [tw, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const driftAmp = tw.drift ?? 1;

  const world = clamp(T / 0.4, 0, 1) * (1 - clamp((T - (authoredTotal - 0.55)) / 0.55, 0, 1));
  const phoneScale = MOTION.glide(T, 1.025, 1, 0, 1.5) + 0.004 * Math.sin(T * 0.5);

  // 开场
  const chromeIn = clamp((T - 0.12) / 0.7, 0, 1);
  const av = MOTION.pop(T, 0.34, { dy: 8, s0: 0.6, d: 0.8 });
  const intro = MOTION.pop(T, 0.66, { dy: 16, s0: 0.9, d: 0.85 });
  const introD = MOTION.drift(T, 9, driftAmp * 0.3);
  const introOut = 1 - clamp((T - (CUES.Parse - 0.5)) / 0.5, 0, 1);

  // 推荐问题
  const promptsOut = 1 - clamp((T - (CUES.Ask - 0.45)) / 0.5, 0, 1);
  const promptsOutY = MOTION.glide(T, 0, -16, CUES.Ask - 0.45, CUES.Ask + 0.05, Easing.easeInQuad);

  // 笔记卡
  const cardsGather = clamp((T - (CUES.Parse - 0.35)) / 0.95, 0, 1);
  const gatherE = Easing.easeInOutCubic(cardsGather);

  // 意图气泡 — 卡片落定后三个一起弹出
  const intent = [0, 1, 2].map((i) => MOTION.pop(T, CUES.Cards + 0.9 + i * 0.22, { dy: 18, s0: 0.8, d: 0.7 }));
  const intentD = [0, 1, 2].map((i) => MOTION.drift(T, 12 + i, driftAmp));

  // 小红书链接解析
  const link = MOTION.pop(T, CUES.Parse + 0.45, { dy: 74, s0: 0.94, d: 0.95 });
  const mark = MOTION.pop(T, CUES.Parse + 0.95, { dy: 0, s0: 0.42, d: 0.9 });
  const markD = MOTION.drift(T, 20, driftAmp * 0.5);
  const quest = MOTION.pop(T, CUES.Parse + 1.85, { dy: 26, s0: 0.88, d: 0.8 });

  // 总结
  const reply = MOTION.pop(T, CUES.Summary + 0.3, { dy: 20, s0: 0.9, d: 0.85 });
  const cardY = MOTION.glide(T, 900, 508, CUES.Summary + 0.7, CUES.Summary + 1.95);

  const cx = PX + (PW * S) / 2, cy = PY + (PH * S) / 2;
  const layer = {
    position: 'absolute', left: cx, top: cy, width: PW, height: PH,
    transformOrigin: '0 0', transform: `scale(${S * phoneScale}) translate(${-PW / 2}px, ${-PH / 2}px)`,
  };

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', backgroundColor: tw.bg ?? '#eef1f0' }}>
      <div style={{ position: 'absolute', left: -140, top: 140, width: 1400, height: 1400, background: `radial-gradient(circle, ${tw.glow ?? 'rgba(49,182,157,0.18)'} 0%, rgba(49,182,157,0) 62%)`, transform: `translateY(${8 * Math.sin(T * 0.3)}px)` }} />
      <div style={{ position: 'absolute', inset: 0 }}>

        {/* 手机外壳 — 始终可见 */}
        <div style={{ ...layer, overflow: 'hidden', borderRadius: PR, backgroundColor: 'rgb(243,243,243)', boxShadow: '0px 0px 35.644px 0px rgba(49,182,157,0.15)' }}>
         <div style={{ position: 'absolute', inset: 0, opacity: world }}>
          <div style={{ opacity: chromeIn }}><StatusBar /></div>
          <Avatar style={{ opacity: av.opacity, transform: `scale(${av.scale * (1 + 0.014 * Math.sin(T * 1.05))}) translateY(${av.y}px)` }} />
          <div style={{ opacity: intro.opacity * introOut, transform: `translate(${introD.x}px, ${intro.y + introD.y}px) scale(${intro.scale})`, transformOrigin: '10% 100%' }}>
            <AssistantBubble top={132.303} width={296.336} text="Hi，我是点点，陪你逛小红书的ai助手。 你种草，我总结，帮你一键消化小红书上的内容。" tail={TAIL_INTRO} />
          </div>
          <div style={{ opacity: link.opacity, transform: `translateY(${link.y}px) scale(${link.scale})`, transformOrigin: '90% 100%' }}>
            <LinkCard style={{ left: 80.9 - LINK_DX, top: 132.303 - LINK_DY }} />
          </div>
          <div style={{
            position: 'absolute', left: 39.4, top: 199.9, width: 83, height: 83, borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(11px)',
            WebkitBackdropFilter: 'blur(11px)',
            boxShadow: 'inset 0 0 0 0.8px rgba(255,255,255,0.6), 0px 4.583px 26px 0px rgba(20,20,20,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box',
            opacity: mark.opacity, transformOrigin: '50% 50%',
            transform: `translate(${markD.x}px, ${mark.y + markD.y}px) scale(${mark.scale}) rotate(${markD.rot}deg)`,
          }}>
            <img src="assets/xhs-icon.png" alt="" style={{ width: 48, height: 48 }} />
          </div>
          <UserBubble text="最近有什么值得看的展览" style={{
            right: 20.15, top: 282,
            opacity: quest.opacity, transform: `translateY(${quest.y}px) scale(${quest.scale})`, transformOrigin: '90% 100%',
          }} />
          <div style={{ opacity: reply.opacity, transform: `translateY(${reply.y}px) scale(${reply.scale})`, transformOrigin: '10% 100%' }}>
            <AssistantBubble top={376} width={296.08} text="最近有几场展览都很值得去看。我帮你整理了笔记亮点，并总结了几场最近的热门展览供你对比选择。" tail={TAIL_REPLY} />
          </div>
          <SummaryCard style={{ top: cardY }} />
          <div style={{ opacity: chromeIn }}><InputBar /></div>
         </div>
        </div>

        {/* 屏幕外（不裁切）— 卡片与气泡溢出手机边缘 */}
        <div style={{ ...layer, opacity: world }}>
          {PROMPTS.map((p, i) => {
            const m = MOTION.pop(T, CUES.Prompts + 0.15 + i * 0.27, { dy: 26, s0: 0.86, d: 0.8 });
            const d = MOTION.drift(T, i, driftAmp);
            return (
              <PromptChip key={i} text={p.text} style={{
                left: p.x, top: p.y,
                opacity: m.opacity * promptsOut,
                transform: `translate(${d.x}px, ${m.y + d.y + promptsOutY}px) scale(${m.scale * (1 - 0.06 * (1 - promptsOut))}) rotate(${d.rot}deg)`,
                transformOrigin: '18% 100%',
              }} />
            );
          })}

          {CARDS.map((c, i) => {
            const m = MOTION.pop(T, CUES.Ask + 0.5 + i * 0.22, { dy: 210, s0: 0.9, d: 1.05 });
            const d = MOTION.drift(T, i + 4, driftAmp);
            const cw = CARD_W, ch = CARD_W * (c.h / c.w);
            const gx = (198 - (c.x + cw / 2)) * gatherE;
            const gy = (470 - (c.y + ch / 2)) * gatherE;
            return (
              <img key={i} src={c.src} alt="" style={{
                position: 'absolute', left: c.x, top: c.y, width: cw, height: ch,
                opacity: m.opacity * (1 - gatherE),
                transform: `translate(${d.x + gx}px, ${m.y + d.y + gy}px) rotate(${c.rot + d.rot}deg) scale(${m.scale * (1 - 0.45 * gatherE)})`,
                transformOrigin: '50% 50%',
              }} />
            );
          })}

          <IntentChip text="帮我种草推荐" style={{
            left: 196, top: 340,
            opacity: intent[0].opacity * (1 - gatherE),
            transform: `translate(${intentD[0].x}px, ${intent[0].y + intentD[0].y}px) scale(${intent[0].scale}) rotate(${intentD[0].rot * 0.5}deg)`, transformOrigin: '0% 100%',
          }} />
          <IntentChip text="整理总结" style={{
            left: 18, top: 610,
            opacity: intent[1].opacity * (1 - gatherE),
            transform: `translate(${intentD[1].x}px, ${intent[1].y + intentD[1].y}px) scale(${intent[1].scale}) rotate(${intentD[1].rot * 0.5}deg)`, transformOrigin: '0% 100%',
          }} />
          <IntentChip text="行程规划" style={{
            left: 344, top: 610,
            opacity: intent[2].opacity * (1 - gatherE),
            transform: `translate(${intentD[2].x}px, ${intent[2].y + intentD[2].y}px) scale(${intent[2].scale}) rotate(${intentD[2].rot * 0.5}deg)`, transformOrigin: '0% 100%',
          }} />
        </div>
      </div>

      <TweaksPanel>
        <TweakSection label="动效" />
        <TweakSlider label="飘动幅度" value={tw.drift} min={0} max={2} step={0.1} onChange={(v) => setTweak('drift', v)} />
        <TweakSection label="画面" />
        <TweakColor label="底色" value={tw.bg} options={['#eef1f0', '#f5f3ef', '#e7edec', '#141414']} onChange={(v) => setTweak('bg', v)} />
        <TweakColor label="光晕" value={tw.glow} options={['rgba(49,182,157,0.18)', 'rgba(122,235,203,0.26)', 'rgba(86,160,244,0.16)', 'rgba(255,255,255,0.0)']} onChange={(v) => setTweak('glow', v)} />
        <TweakSection label="编辑" />
        <TweakToggle label="Motion editor" value={tw.motionEditor} onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
}

function DianStage() {
  return (
    <CompositionStage width={W} height={H} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg="#eef1f0">
      <Piece />
    </CompositionStage>
  );
}
window.DianStage = DianStage;
