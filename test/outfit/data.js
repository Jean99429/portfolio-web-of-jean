// 20 套方案的文字（草稿，可以直接改这里的文字）
// en：英文名称（场景）  cn：中文名称  reason：详情页的一句理由（写看图看不出来的信息）

const WEATHER = "上海 · 16° 阴";

const ANCHOR = { cn: "荷叶边衬衫", img: "assets/items/anchor-shirt.png" };

const LOOKS = [
  { en: "Antique Market",     cn: "周末古董市集",   reason: "你过去 6 次都把这件衬衫配蓝色牛仔裤。这次换成深棕丝绒裤，一样随性，但更有质感。" },
  { en: "Matinee Screening",  cn: "午后老电影院",   reason: "今天 16°，短裤配过膝长靴刚好不冷；露出的一截膝盖，让这件衬衫不那么乖。" },
  { en: "Bookshop Afternoon", cn: "书店的下午",     reason: "这件衬衫你还没配过长裙。及踝长裙让荷叶边从正式变得松弛。" },
  { en: "Garden Lunch",       cn: "花园午宴",       reason: "这条花纹中裙在你衣柜里已经两个月没穿了，它的深橄榄色和衬衫的奶油色正好同属暖调。" },
  { en: "Gallery Opening",    cn: "画廊开幕夜",     reason: "你平时穿外套时，荷叶边总被盖住。这件短外套只到腰，刚好把它露出来。" },
  { en: "Wine Bar After Work",cn: "下班后的小酒馆", reason: "酒红阔腿裤和鞋同色，把腿拉得很长，这是你常穿的直筒裤做不到的比例。" },
  { en: "Record Store",       cn: "唱片店淘碟",     reason: "你之前的搭配重点都在上半身。这次裤脚的花纹和金靴把重点放到了脚下。" },
  { en: "Concert Hall",       cn: "音乐厅之夜",     reason: "需要稍微正式、又不想穿西装的时候，叠层裙给衬衫多加了一层结构感。" },
  { en: "Dinner Party",       cn: "朋友家的晚宴",   reason: "亮片只在裙子侧边一条，晚上有光，白天穿也不夸张。" },
  { en: "Rainy Museum Day",   cn: "雨天看展",       reason: "今天阴天、16°，长大衣敞开穿，既保暖，又不挡住胸前的荷叶边。" },
  { en: "Opera Night",        cn: "歌剧院的晚上",   reason: "毛绒披肩比外套轻，适合在室内外来回走动的晚上。" },
  { en: "Saturday Brunch",    cn: "周六早午餐",     reason: "棒球帽把整套拉回休闲。这是你第一次把这件衬衫穿得这么街头。" },
  { en: "Countryside Weekend",cn: "乡间周末",       reason: "上短下长的比例很显高，羊毛短外套也刚好适合今天的温度。" },
  { en: "Art Fair",           cn: "艺术博览会",     reason: "红色流苏外套是你衣柜里最大胆的一件。有这件衬衫压着，大胆但不过头。" },
  { en: "First Cold Day",     cn: "降温的第一天",   reason: "明天还会再降 4°。长大衣加针织帽从头暖到脚，荷叶边仍然露在外面。" },
  { en: "Monday Meeting",     cn: "周一的会议",     reason: "灰色外套和直筒裤足够稳重，开会也合适；荷叶边让你不会和别人穿得一样。" },
  { en: "Library Date",       cn: "图书馆约会",     reason: "米褐外套和黑色叠层裙，是你衣柜里还没组合过的两件。" },
  { en: "Birthday Dinner",    cn: "生日晚宴",       reason: "这一批里最闪的一套，留给值得庆祝的晚上；衬衫的奶油色让金色显得更温柔。" },
  { en: "Foggy Morning",      cn: "起雾的早上",     reason: "格纹、丝绒、网纱三种质感叠在一起，是这一批里层次最多的一套。" },
  { en: "Late Night Jazz",    cn: "深夜爵士酒吧",   reason: "流苏外套走路时会跟着动，在昏暗的灯光下最出彩。" },
].map((l, i) => ({ ...l, img: `assets/looks/look-${String(i + 1).padStart(2, "0")}.webp`, thumb: `assets/thumbs/look-${String(i + 1).padStart(2, "0")}.webp` }));

// 演示路径：第 20 套，点裤子 →「把裤子换成裙子」→ 换成衣柜里的黑色叠层中裙
const DEMO = {
  look: 19,                                   // 第 20 套（从 0 开始数）
  cat: "bottom",
  doing: "把裤子换成裙子",
  img: "assets/looks/look-20-edit.webp",
  thumb: "assets/thumbs/look-20-edit.webp",
  reason: "换成黑色叠层中裙后，流苏外套的长度和裙摆一上一下呼应，比长裤更轻快。",
  bottomId: "08018731",                       // 换上的那条裙子（卡片上用）
  bottomName: "黑色叠层中裙",
};

// 衣柜：上衣 7 件、下装 12 件（演示只做衣服和裤子）
const WARDROBE = {
  tops: [
    { id: "02142905", name: "驼色胸针毛衣" },
    { id: "02893915", name: "酒红花纹 V 领毛衣" },
    { id: "03085905", name: "粉色蕾丝边衬衫" },
    { id: "anchor-shirt", name: "荷叶边衬衫" },
    { id: "08021037", name: "条纹荷叶领衬衫" },
    { id: "05755920", name: "深棕亮片针织衫" },
    { id: "02903901", name: "黑色珠饰无袖上衣" },
  ],
  bottoms: [
    { id: "05854905", name: "深棕丝绒长裤" },
    { id: "04344905", name: "橄榄花纹中裙" },
    { id: "08012015", name: "酒红百慕大短裤" },
    { id: "08013026", name: "提花裤脚长裤" },
    { id: "08037065", name: "灰褐色长裙" },
    { id: "08015007", name: "酒红阔腿裤" },
    { id: "08018731", name: "黑色叠层中裙" },
    { id: "08016896", name: "亮片侧条长裤" },
    { id: "08019042", name: "亮片拼接中裙" },
    { id: "08014900", name: "撞色裤脚长裤" },
    { id: "08022051", name: "金色亮片围裹裙" },
    { id: "08039034", name: "炭灰直筒裤" },
  ],
  start: { tops: 3, bottoms: 6 },          // 一开始停在荷叶边衬衫、黑色叠层中裙
};
