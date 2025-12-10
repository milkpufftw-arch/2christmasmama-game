import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Snowflake, 
  Gift, 
  TreePine, 
  Wine, 
  ShieldAlert, 
  Activity, 
  Brain, 
  Heart, 
  Eye, 
  Share2, 
  RefreshCw, 
  Play, 
  Upload, 
  ChevronRight, 
  Sparkles,
  CandyCane,
  Star,
  Bell
} from 'lucide-react';

// --- 雪花背景特效組件 (調整為更適合深色的亮度) ---
const SnowEffect = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute text-white/40 animate-fall drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-${Math.random() * 20}%`,
            animationDuration: `${Math.random() * 10 + 8}s`,
            animationDelay: `${Math.random() * 5}s`,
            fontSize: `${Math.random() * 10 + 4}px`
          }}
        >
          ❄
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
        .animate-fall {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(0);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [currentTip, setCurrentTip] = useState(null);
  const [currentIcon, setCurrentIcon] = useState('🎁'); // 新增：用於存儲當前抽到的圖標
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedChecks, setDisplayedChecks] = useState({ body: [], emotion: [], brain: [] });
  const [checkedCount, setCheckedCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  
  // --- 圖片設定 ---
  const driveImageId = "1zbO02DurlPSmMLnipgPxp3fqrWtcLoWt";
  const defaultImage = `https://lh3.googleusercontent.com/d/${driveImageId}`;
  const [userImage, setUserImage] = useState(defaultImage);
  const fileInputRef = useRef(null);

  // 備用圖片 (如果不幸連結失效，會顯示這張風格類似的，確保畫面不壞掉)
  const fallbackImage = "[https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=1000&auto=format&fit=crop](https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=1000&auto=format&fit=crop)"; 


  // --- 資料庫: 聖誕節特別版 ---
  const childTypes = [
    { id: 1, name: '禮物包裝撕裂者', desc: '妳包了三小時的精美禮物，他三秒鐘就撕爛，只對箱子感興趣。', icon: '🎁' },
    { id: 2, name: '聖誕樹推倒手', desc: '家裡的聖誕樹是他的假想敵，掛飾是他的手榴彈。', icon: '🎄' },
    { id: 3, name: '糖霜亢奮精靈', desc: '攝取了過量薑餅人和糖果，現在處於光速移動狀態，無法睡覺。', icon: '🍪' },
    { id: 4, name: '聖誕老人懷疑論者', desc: '「如果不乖聖誕老人就不來」這招對他沒用，他已經看穿妳的錢包了。', icon: '🎅' },
    { id: 5, name: '派對恐懼角落生物', desc: '親戚一來就崩潰大哭，堅持要黏在妳身上當無尾熊掛飾。', icon: '🐨' },
    { id: 6, name: '許願清單強盜', desc: '願望清單比購物節目錄還長，不買就在百貨公司地上打滾。', icon: '📝' },
    { id: 7, name: '交換禮物嫌棄王', desc: '當眾大聲說「這個好爛喔我不要」，讓媽媽想當場鑽地洞。', icon: '🤐' },
    { id: 8, name: '全家福破壞者', desc: '全家都看鏡頭笑，只有他閉眼、挖鼻孔或比中指。', icon: '📸' },
    { id: 9, name: '節日感冒傳播者', desc: '一定要選在聖誕夜發高燒，讓妳的聖誕大餐變成急診室便當。', icon: '🤒' },
    { id: 10, name: '電池終結者', desc: '所有發光發聲的玩具都被玩到沒電，家裡充滿了詭異的低電量音效。', icon: '🔋' },
    { id: 11, name: '獵魔女團狂樂粉', desc: '每天要聽Soda pop八百次，不唱就尖叫。', icon: '🎤' },
    { id: 12, name: '午夜不睡覺糾察隊', desc: '半夜三點爬起來檢查聖誕老人來了沒，結果抓到正在吃餅乾的爸爸。', icon: '🕵️' },
  ];

  const momStates = [
    { id: 1, level: 'hyper', name: '烤焦的火雞', icon: '🦃', desc: '外表看起來很堅強，內心已經焦黑，隨時會散發出燒焦的怒氣。', color: 'from-red-900 to-red-950 text-red-100 border-red-800' },
    { id: 2, level: 'hyper', name: '纏住的燈串', icon: '💡', desc: '思緒像打結的燈串一樣解不開，理智線糾纏在一起，一碰就碎。', color: 'from-orange-800 to-amber-900 text-orange-100 border-orange-800' },
    { id: 3, level: 'hyper', name: '暴躁的麋鹿', icon: '🦌', desc: '工作量過大，還要拉著全家這台破車前進，很想踢飛路人。', color: 'from-yellow-800 to-amber-950 text-amber-100 border-amber-800' },
    { id: 4, level: 'optimal', name: '眼神死的聖誕婆婆', icon: '👵', desc: '已經看破紅塵，只想把聖誕襪拿來裝紅酒喝。', color: 'from-emerald-900 to-green-950 text-emerald-100 border-emerald-800' },
    { id: 5, level: 'optimal', name: '包裝紙木乃伊', icon: '🩹', desc: '被瑣事纏身，但勉強還能維持人形，機械式地回應「好棒喔」。', color: 'from-teal-900 to-emerald-950 text-teal-100 border-teal-800' },
    { id: 6, level: 'hypo', name: '融化的雪人', icon: '🫠', desc: '體力耗盡，只想癱在暖爐（或地板）前，慢慢變成一灘水。', color: 'from-blue-900 to-slate-900 text-blue-100 border-blue-800' },
    { id: 7, level: 'hypo', name: '冬眠的熊', icon: '🐻', desc: '不管外面聖誕歌多大聲，妳現在只想睡到明年春天。', color: 'from-amber-950 to-orange-950 text-amber-100 border-amber-900' },
    { id: 8, level: 'hypo', name: '被遺忘的薑餅人', icon: '🫥', desc: '覺得自己像缺了一隻腳的薑餅人，又乾又硬，沒人疼愛。', color: 'from-slate-800 to-gray-950 text-slate-200 border-slate-700' },
  ];

  const awarenessChecks = useMemo(() => [
    { cat: 'body', text: '妳的肩膀現在是不是像掛了兩隻火雞一樣重？放下它。' },
    { cat: 'body', text: '牙關是不是咬得比核桃鉗娃娃還緊？鬆開。' },
    { cat: 'body', text: '妳現在呼吸是停滯的嗎？深吸一口冬天的冷空氣。' },
    { cat: 'body', text: '感覺一下腳底，是不是冰冰的？去穿雙襪子吧。' },
    { cat: 'body', text: '胃是不是塞滿了剩菜或者壓力？' },
    { cat: 'body', text: '妳現在眼神是慈祥的，還是充滿殺氣的？' },
    { cat: 'emotion', text: '胸口那團悶氣，是不是想把它當禮物送給老公？' },
    { cat: 'emotion', text: '妳現在覺得委屈嗎？(做這麼多卻沒人感謝)' },
    { cat: 'emotion', text: '如果憤怒是紅色，妳現在大概是聖誕紅的顏色。' },
    { cat: 'emotion', text: '允許自己現在就是討厭過節。' },
    { cat: 'emotion', text: '那股想哭的感覺，可以讓它像融雪一樣流出來嗎？' },
    { cat: 'emotion', text: '妳是不是覺得「只有我在忙」？' },
    { cat: 'brain', text: '腦中是不是在重播「明年的聖誕節我絕對不要這麼累」？' },
    { cat: 'brain', text: '擔心「孩子沒拿到心儀禮物會有陰影」？(別傻了)' },
    { cat: 'brain', text: '覺得這個混亂是「妳的錯」嗎？(不，這是節日的錯)' },
    { cat: 'brain', text: '妳現在急著要把家裡弄得像Pinterest照片一樣完美嗎？' },
    { cat: 'brain', text: '試著把心中的「我必須」改成「管他的」。' },
    { cat: 'brain', text: '看看周圍，其实房子還沒燒起來，就是好事。' },
  ], []);

  const survivalTips = [
    "用冷水洗臉。假裝妳是艾莎女王，冰冷能刺激迷走神經，強制冷靜（順便緊緻毛孔）。",
    "找 5 個紅色的東西。不是叫妳看那個未接來電，是看看周圍的裝飾，讓前額葉重新開機。",
    "雙腳用力踩地板。確認妳還在地球表面，沒有被這些小惡魔氣到飛上天。",
    "聞一下那棵很貴的聖誕樹（或旁邊的炸雞）。嗅覺是通往大腦情感中心最快的捷徑，吸爆它。",
    "喝一口冰水，含住 10 秒。想像那是把妳怒火澆熄的聖水。",
    "用力拍拍自己的手臂（蝴蝶擁抱法）。告訴自己：「我在這裡，我還沒因過勞而死。」",
    "握拳 5 秒，再瞬間放鬆。把想掐死聖誕老人的力氣釋放掉，手掌血液回流會舒服點。",
    "戴上抗噪耳機。假裝這是一部默劇，這些孩子的尖叫只是背景雜音。",
    "摸摸家裡的貓或那條觸感很好的毯子。這是合法的催產素來源，比老公還有用。",
    "靠著牆壁站著。牆壁不會倒，妳也不會。感受背後的支撐，妳不需要一個人扛全家。",
    "承認吧，妳現在就是想把聖誕樹燒了。接納這種破壞慾，只要不真的點火就好。",
    "妳現在「腦容量超載」了。暫停一下，去廁所滑手機不是偷懶，是系統維護。",
    "摸摸胸口。對內心那個崩潰的小女孩說：「乖，等下我們就去喝一杯。」",
    "允許自己對這個節日感到失望。IG 上的完美家庭都是修圖修出來的。",
    "告訴自己：「做得夠好就行」。聖誕大餐吃外送披薩，孩子一樣會長大。",
    "原諒剛剛失控吼叫的自己。妳也是第一次當這個品種怪獸的媽。",
    "妳不需要為全家人的快樂負責。如果他們不快樂，那是他們修養不夠。",
    "想哭就哭吧。眼淚是身體排毒的方式，哭完記得補妝就好。",
    "把心中的「我必須」改成「看心情」。找回一點女王的控制感。",
    "如果現在覺得靈魂出竅，咬一顆冰塊。痛覺會把妳拉回現實（雖然現實很殘酷）。",
    "去廁所鎖門。這是家裡唯一的淨土，宣稱聖誕老公公正在跟妳進行秘密視訊。",
    "拒絕那個煩人的親戚聚會。就說妳得了「社交恐懼型流感」，傳染力極強。",
    "對孩子說：「媽媽現在像沒電的玩具。」然後直接躺在地上裝死五分鐘。",
    "把燈光調暗。太亮的光線只會讓妳更清楚看到地上的垃圾。",
    "躲進衣櫥裡。狹小的空間能帶來安全感，順便檢查有沒有私房錢。",
    "把煩惱寫在紙上，然後撕爛它。如果能放進碎紙機，聲音會更療癒。",
    "整理一個小角落（例如妳的化妝台）。至少這個家裡有一個地方是聽妳指揮的。",
    "想像一個防護罩。婆婆的碎念和孩子的尖叫都會被彈開，妳是無敵的。",
    "說話變慢一點。這能騙過大腦以為現在很悠閒，雖然其實妳心急如焚。",
    "開電視給孩子看。這不是懶惰，這是為了世界和平而使用的「電子保母」。",
    "把孩子的哭鬧當成「求救訊號」。他在說：「媽！我的腦袋當機了！」不是針對妳。",
    "默念咒語：「這一切都會過去。」聖誕節一年只有一天，明天就是普通的地獄了。",
    "區分「事實」與「恐懼」。事實是他在哭，恐懼是他長大會變成更生人。專注事實就好。",
    "今天的目標：大家都活著，房子沒燒掉。這就是巨大的勝利，值得喝一杯。",
    "不要現在解決問題。延後處理是種智慧，或是說，是一種逃避的可恥但有用。",
    "想像妳是實境秀《瘋狂主婦》的觀眾。看著眼前的荒謬劇，其實蠻好笑的。",
    "傳訊息給閨蜜：「我快不行了。」只要有人知道妳在受苦，痛苦就會減半。",
    "妳的耐心像手機電量，現在只剩 1%。這時候開啟省電模式（閉嘴不說話）很合理。",
    "禮物不代表愛的全部。妳沒有離家出走，就是給這個家最棒的禮物。",
    "看著滿地的玩具，跨過去。把它們當成現代裝置藝術「消費主義的殞落」。",
    "聖誕老公公一年只工作一天是有原因的。這種高強度的歡樂誰受得了？",
    "薑餅屋最後都會倒塌的。就像我們的膠原蛋白，接受它，享受它。",
    "撕包裝紙的聲音是孩子大腦興奮的表現。雖然聽起來像在撕碎妳的心血。",
    "那些完美的網美照背後，通常都有一個剛崩潰完的媽媽和被威脅的孩子。",
    "今年的回憶，可能就是那個烤焦的雞。不完美才深刻，以後婚禮拿來講剛好。",
    "用「好奇心」取代「審判」。好奇一下，為什麼人類幼崽可以這麼失控？",
    "給自己一份禮物：十分鐘的絕對安靜。哪怕是在儲藏室裡跟拖把對望。",
    "妳是家裡的恆溫器。妳冷靜下來，家裡溫度就會降下來（或是結冰，也不錯）。",
    "如果真的受不了，就跟著孩子一起躺地上踢腿。嚇嚇他們，展現一下家長的威嚴。",
    "最後，深呼吸，摸摸頭，對自己說：「辛苦了，這該死的節日終於快結束了。」"
  ];
  
  // 隨機聖誕圖標庫
  const christmasIcons = ['🎁', '🎄', '🦌', '⛄', '🔔', '⭐', '🕯️', '🍪'];

  // --- 邏輯函數 ---
  useEffect(() => {
    if (step === 3) {
      shuffleCategory('body');
      shuffleCategory('emotion');
      shuffleCategory('brain');
      setCheckedCount(0);
    }
  }, [step]);

  const shuffleCategory = (category) => {
    const items = awarenessChecks.filter(x => x.cat === category);
    const shuffled = [...items].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setDisplayedChecks(prev => ({
      ...prev,
      [category]: selected
    }));
  };

  const handleCheck = (e) => {
    if (e.target.checked) {
      setCheckedCount(prev => prev + 1);
    } else {
      setCheckedCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleDraw = () => {
    setIsAnimating(true);
    setCurrentTip(null);
    setTimeout(() => {
      const randomTip = survivalTips[Math.floor(Math.random() * survivalTips.length)];
      const randomIcon = christmasIcons[Math.floor(Math.random() * christmasIcons.length)];
      setCurrentTip(randomTip);
      setCurrentIcon(randomIcon); // 設定隨機圖標
      setIsAnimating(false);
    }, 1200);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleShare = async () => {
    const urlToShare = window.location.href;
    const shareData = {
      title: '聖誕劫媽咪生存扭蛋機',
      text: '獻給每一個在聖誕節崩潰邊緣的妳。這裡不教妳怎麼烤火雞，只教妳怎麼活下去。',
      url: urlToShare,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(urlToShare);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      setShowToast(true); // Fallback for demo
      setTimeout(() => setShowToast(false), 2500);
    }
  };

  // --- 渲染畫面 ---

  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6 animate-in fade-in duration-700 relative z-10">
      <div className="absolute top-0 right-0 p-4 animate-pulse opacity-50">
        <Star className="text-amber-200 w-6 h-6" />
      </div>

      <button 
        onClick={handleShare}
        className="absolute top-4 right-4 p-2.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all text-amber-100 border border-white/10 z-20 group"
        title="分享給戰友"
      >
        <Share2 size={20} className="group-hover:text-amber-300 transition-colors" />
      </button>

      {/* 頭像區域 - 質感升級，移除聖誕老人裝飾 */}
      <div 
        className="relative mb-10 group cursor-pointer mt-8" 
        onClick={() => fileInputRef.current.click()}
        title="點擊更換妳的厭世大頭貼"
      >
        {/* 背後的光暈 */}
        <div className="absolute inset-0 bg-amber-500 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
        
        {/* 頭像框 - 簡約優雅的雙層金線 */}
        <div className="w-44 h-44 rounded-full border-[3px] border-amber-500/30 ring-2 ring-white/10 overflow-hidden bg-slate-800 relative z-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transform group-hover:scale-105 transition-all duration-500">
          <img
            src={userImage}
            alt="厭世媽咪頭像"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            // 新增錯誤處理：如果圖片載入失敗，切換到備用圖片
            onError={(e) => {
              if (e.target.src !== fallbackImage) {
                e.target.src = fallbackImage;
                e.target.onerror = null; // 防止無限迴圈
              }
            }}
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
            <Upload className="text-white" size={28} />
          </div>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />

      <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-wide leading-tight font-['Zen_Maru_Gothic'] drop-shadow-2xl">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-amber-500">聖誕劫</span>
        <br/>
        <span className="text-slate-200 text-3xl md:text-4xl mt-3 block tracking-wider font-bold">媽咪生存扭蛋機</span>
      </h1>

      <div className="flex items-center gap-4 mb-10 w-full max-w-[180px] justify-center opacity-70">
        <div className="h-[1px] bg-gradient-to-r from-transparent to-amber-200 flex-1"></div>
        <Sparkles className="text-amber-300" size={16} />
        <div className="h-[1px] bg-gradient-to-l from-transparent to-amber-200 flex-1"></div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/5 mb-12 max-w-sm mx-auto transform transition hover:bg-slate-900/50 duration-500">
        <p className="text-slate-300 leading-relaxed font-bold text-lg font-['Zen_Maru_Gothic']">
          獻給每一個在節日<br/>
          <span className="text-red-400 font-black">崩潰邊緣</span> 試著深呼吸的妳。
        </p>
        <div className="w-8 h-[1px] bg-white/20 mx-auto my-4 rounded-full"></div>
        <p className="text-slate-400 text-sm font-medium tracking-wide">
          這裡不教妳怎麼烤完美的火雞，<br/>
          <span className="text-amber-200 mt-1 inline-block border-b border-amber-500/30 pb-0.5">只教妳怎麼活過這個聖誕節。</span>
        </p>
      </div>

      <button
        onClick={() => { setStep(1); window.scrollTo(0,0); }}
        className="group relative inline-flex items-center justify-center px-10 py-4 font-black text-white transition-all duration-300 bg-gradient-to-r from-red-800 to-red-900 text-xl rounded-full focus:outline-none hover:shadow-[0_0_30px_-5px_rgba(220,38,38,0.4)] hover:brightness-110 active:scale-95 shadow-2xl border border-red-500/30 overflow-hidden font-['Zen_Maru_Gothic'] tracking-widest"
      >
        <span className="mr-3 relative z-10 drop-shadow-md text-red-50">投入聖誕硬幣</span>
        <div className="bg-white/10 p-1.5 rounded-full relative z-10 group-hover:rotate-180 transition-transform duration-500 border border-white/10">
          <Play size={18} className="fill-current text-white" />
        </div>
        
        {/* 光澤效果 */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </button>

      <p className="mt-12 text-[10px] text-slate-500 font-medium tracking-widest uppercase opacity-60">
        100% Dark Humor • Zero Judgment
      </p>
    </div>
  );

  const renderStep1 = () => (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 relative z-10">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-white flex items-center justify-center gap-3 font-['Zen_Maru_Gothic'] drop-shadow-lg">
          <CandyCane className="text-red-500" size={28} />
          <span className="tracking-wide">Step 1. 搗蛋鬼圖鑑</span>
        </h2>
        <div className="inline-block mt-3 px-4 py-1.5 bg-white/5 text-emerald-300 text-sm font-bold rounded-full border border-emerald-500/20 shadow-lg backdrop-blur-sm">
          知己知彼，今天的孩子是哪個品種？
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
        {childTypes.map((child) => (
          <button
            key={child.id}
            onClick={() => { setSelectedChild(child); setStep(2); window.scrollTo(0,0); }}
            className="group bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-white/5 hover:border-red-500/30 transition-all text-left shadow-lg hover:shadow-[0_0_20px_-5px_rgba(220,38,38,0.2)] hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="flex items-start gap-5">
              <div className="text-4xl bg-black/20 w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300 border border-white/5">
                {child.icon}
              </div>
              <div className="flex-1">
                <div className="font-bold text-slate-100 text-lg mb-2 group-hover:text-red-400 transition-colors font-['Zen_Maru_Gothic']">
                  {child.name}
                </div>
                <div className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300">
                  {child.desc}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-right duration-500 relative z-10">
      <button onClick={() => setStep(1)} className="group text-slate-400 text-sm mb-6 flex items-center hover:text-white transition-colors font-medium ml-1">
        <div className="bg-white/5 p-1 rounded-full shadow-sm mr-2 group-hover:-translate-x-1 transition-transform border border-white/10">
          <ChevronRight className="rotate-180" size={14} />
        </div>
        重選搗蛋鬼
      </button>
      
      {/* 選擇的怪獸卡片 */}
      <div className="bg-black/40 text-white p-6 rounded-2xl mb-10 shadow-2xl relative overflow-hidden border border-white/10 backdrop-blur-xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-900 rounded-full blur-[80px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-5">
           <div className="text-5xl bg-white/5 w-20 h-20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner border border-white/10">
             {selectedChild.icon}
           </div>
           <div>
             <div className="text-xs text-red-400 font-bold uppercase tracking-widest mb-1">Current Target</div>
             <div className="font-bold text-2xl font-['Zen_Maru_Gothic'] text-slate-100">{selectedChild.name}</div>
           </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 text-slate-400 text-sm leading-relaxed relative z-10 italic">
          "{selectedChild.desc}"
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white flex justify-center items-center gap-3 font-['Zen_Maru_Gothic']">
          <Activity className="text-red-500" size={28} />
          <span>Step 2. 災情評估</span>
        </h2>
        <div className="inline-block mt-3 px-4 py-1.5 bg-white/5 text-amber-300 text-sm font-bold rounded-full border border-amber-500/20 shadow-lg backdrop-blur-sm">
          誠實面對，妳現在的聖誕理智線？
        </div>
      </div>

      <div className="space-y-4 pb-24">
        {momStates.map((state) => (
          <button
            key={state.id}
            onClick={() => { setSelectedState(state); setStep(3); window.scrollTo(0,0); }}
            className={`group w-full p-4 rounded-2xl shadow-lg flex items-center gap-5 transition-all active:scale-[0.98] text-left border bg-gradient-to-r hover:brightness-110 ${state.color}`}
          >
            <div className="text-4xl filter drop-shadow-md bg-black/20 w-14 h-14 flex items-center justify-center rounded-full shadow-inner ring-1 ring-white/10">
              {state.icon}
            </div>
            <div className="flex-1">
              <div className="font-bold text-lg font-['Zen_Maru_Gothic'] tracking-wide">{state.name}</div>
              <div className="text-xs opacity-80 font-medium leading-relaxed mt-1 pr-4">{state.desc}</div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
               <ChevronRight className="text-white/70" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-in zoom-in duration-500 min-h-[80vh] flex flex-col relative z-10">
      <div className={`text-white p-8 rounded-b-[2.5rem] -mx-4 -mt-6 mb-8 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden bg-gradient-to-b ${selectedState.color}`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-[80px] opacity-10 -mr-10 -mt-10 pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 font-['Zen_Maru_Gothic']">
              <ShieldAlert className="text-white/90" size={24}/> 
              <span>機體掃描</span>
            </h2>
            <span className="text-xs bg-black/30 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-white/90 font-medium tracking-wide">
              自我修復模式
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-6xl bg-black/20 rounded-full w-24 h-24 flex items-center justify-center shadow-inner backdrop-blur-sm border border-white/10">
              {selectedState.icon}
            </div>
            <div>
              <div className="text-sm opacity-60 uppercase tracking-widest font-bold mb-1">Status</div>
              <div className="text-3xl font-black text-white font-['Zen_Maru_Gothic'] tracking-wide mb-2">{selectedState.name}</div>
              <div className="text-sm opacity-80 font-medium bg-black/20 px-3 py-1 rounded-lg inline-block backdrop-blur-sm">請花 10 秒鐘，觀察自己...</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-6 px-2 pb-24">
        <div className="flex items-center justify-center mb-2">
            <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-full text-sm text-amber-200 font-bold shadow-lg border border-white/10 flex items-center gap-2">
               <Sparkles size={14} className="text-amber-400"/>
               勾選妳有的感覺（沒有也可以跳過）
            </div>
        </div>

        {/* 檢查清單卡片樣式 - 深色版 */}
        {['body', 'emotion', 'brain'].map((cat) => {
            const icons = { body: <Eye size={20}/>, emotion: <Heart size={20}/>, brain: <Brain size={20}/> };
            const titles = { body: '身體 (Body)', emotion: '情緒 (Emotion)', brain: '大腦 (Brain)' };
            const colors = { body: 'text-emerald-300', emotion: 'text-rose-300', brain: 'text-indigo-300' };
            const bgs = { body: 'bg-emerald-900/30', emotion: 'bg-rose-900/30', brain: 'bg-indigo-900/30' };

            return (
                <div key={cat} className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-white/5 shadow-lg transition-all duration-300 hover:bg-slate-900/60">
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                        <h3 className={`font-black text-slate-100 flex items-center gap-2.5 text-lg font-['Zen_Maru_Gothic']`}>
                            <div className={`p-2 rounded-xl ${bgs[cat]} ${colors[cat]} border border-white/5`}>{icons[cat]}</div> 
                            {titles[cat]}
                        </h3>
                        <button onClick={() => shuffleCategory(cat)} className="text-xs flex items-center gap-1.5 text-slate-400 bg-white/5 px-3 py-1.5 rounded-full hover:bg-white/10 transition font-bold group border border-white/5">
                          <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-500"/> 換一組
                        </button>
                    </div>
                    <ul className="space-y-3">
                        {displayedChecks[cat].map((item,i) => (
                            <label key={i} className="group relative flex gap-4 items-start cursor-pointer p-3 rounded-xl transition-all hover:bg-white/5 border border-transparent hover:border-white/5">
                                <div className="relative flex items-center">
                                  <input type="checkbox" onChange={handleCheck} className="peer appearance-none w-5 h-5 border-2 border-slate-600 rounded-md checked:bg-amber-500 checked:border-amber-500 transition-colors mt-0.5 cursor-pointer"/>
                                  <svg className="absolute w-3.5 h-3.5 mt-0.5 left-1 pointer-events-none opacity-0 peer-checked:opacity-100 text-black transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                </div>
                                <span className="text-slate-400 text-[15px] font-medium leading-relaxed group-hover:text-slate-200 transition-colors">{item.text}</span>
                            </label>
                        ))}
                    </ul>
                </div>
            )
        })}

        <button
          onClick={() => { setStep(4); handleDraw(); window.scrollTo(0,0); }}
          className={`group mt-8 w-full py-5 rounded-2xl font-black text-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mb-10 border relative overflow-hidden font-['Zen_Maru_Gothic']
            ${checkedCount === 0 
              ? 'bg-gradient-to-r from-emerald-800 to-green-900 text-white border-green-700/50 hover:shadow-green-900/50' 
              : 'bg-gradient-to-r from-red-800 to-rose-900 text-white border-red-700/50 hover:shadow-red-900/50'}`}
        >
          <span className="relative z-10 drop-shadow-sm tracking-wider">
            {checkedCount === 0
              ? "以上都沒有（奇蹟啊！）直接領取禮物"
              : `確認 ${checkedCount} 項狀態，領取錦囊`}
          </span>
          <div className="bg-white/10 p-1 rounded-full relative z-10 group-hover:translate-x-1 transition-transform">
             <ChevronRight strokeWidth={3} size={20}/>
          </div>
          <div className="absolute inset-0 bg-white/10 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"/>
        </button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-in fade-in duration-700 relative z-10 py-10">
      <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/10 font-['Zen_Maru_Gothic']">
        <Gift className="text-red-400 animate-bounce" size={28}/> 
        <span className="tracking-wide">聖誕媽咪生存錦囊</span>
      </h2>

      {isAnimating ? (
        <div className="w-full max-w-sm aspect-square bg-slate-900/60 backdrop-blur-xl rounded-[2rem] flex flex-col items-center justify-center mb-10 shadow-[0_0_50px_rgba(220,38,38,0.2)] border border-red-500/20 relative">
           <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-green-500/5 rounded-[2rem]"></div>
           <RefreshCw size={64} className="text-red-400 animate-spin mb-6 relative z-10" />
           <p className="text-slate-300 font-bold text-lg animate-pulse relative z-10 font-['Zen_Maru_Gothic']">正在從聖誕襪裡掏禮物...</p>
        </div>
      ) : (
        <div className="w-full max-w-sm bg-[#1a202c] p-10 rounded-[2rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] border border-amber-500/20 mb-10 relative overflow-hidden group transform hover:-translate-y-1 transition-transform duration-500">
          {/* 金色裝飾邊緣 */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600"></div>
          
          <div className="absolute inset-0 bg-[url('[https://www.transparenttextures.com/patterns/stardust.png](https://www.transparenttextures.com/patterns/stardust.png)')] opacity-[0.1]"></div>
          
          {/* 圖標改為隨機聖誕圖示 */}
          <div className="text-8xl mb-6 text-center transform group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            {currentIcon}
          </div>
          
          <h3 className="text-sm font-bold text-center text-amber-500 mb-6 font-mono tracking-[0.2em] border-b border-white/10 pb-4 mx-8 uppercase">
             Survival Tip <span className="text-red-400">#{Math.floor(Math.random()*100).toString().padStart(3, '0')}</span>
          </h3>
          
          <p className="text-xl md:text-2xl text-slate-100 leading-relaxed text-center font-bold font-['Zen_Maru_Gothic'] mb-8 drop-shadow-md">
            {currentTip}
          </p>
          
          <div className="pt-6 border-t border-white/10 text-center relative">
             <div className="flex justify-center items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span className="bg-white/5 px-2 py-1 rounded text-slate-400">To: {selectedState?.name}</span>
                <span className="text-red-500">•</span>
                <span>From: 聖誕生存總部</span>
             </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* 結果頁分享按鈕 */}
        <button 
          onClick={handleShare}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-xl font-bold shadow-lg transition active:translate-y-1 flex justify-center items-center gap-3 text-lg group border border-white/5"
        >
          <Share2 size={20} className="group-hover:scale-110 transition-transform text-amber-400" />
          <span>分享給戰友</span>
        </button>

        <button
          onClick={handleDraw}
          disabled={isAnimating}
          className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-red-900/30 transition active:translate-y-1 disabled:opacity-50 flex justify-center items-center gap-3 text-lg border border-red-500/30"
        >
          <RefreshCw size={20} className={isAnimating ? 'animate-spin' : ''}/>
          <span>這個沒用，重抽一張</span>
        </button>

        <button
          onClick={() => { setStep(0); setSelectedChild(null); setSelectedState(null); window.scrollTo(0,0); }}
          className="w-full bg-transparent hover:bg-white/5 text-slate-400 py-4 rounded-xl font-bold transition flex items-center justify-center gap-3 border border-white/10 hover:text-slate-200"
        >
          <Wine size={20} className="text-red-500"/>
          <span>回到首頁 (或去喝熱紅酒)</span>
        </button>
      </div>

      <p className="mt-10 text-xs text-slate-500 text-center max-w-xs leading-relaxed opacity-60">
        * 本遊戲無法取代專業治療，但能提供短暫的逃避與歡樂。<br/>
        妳是好媽媽，真的。聖誕快樂！
      </p>
    </div>
  );

  return (
    <div className="min-h-screen font-slate-50 selection:bg-amber-900 selection:text-amber-100 bg-[#0c1a15]">
      {/* 引入圓體字型，並強制全域套用 */}
      <style>{`
        @import url('[https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700;900&display=swap](https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700;900&display=swap)');
        
        /* 強制所有元素使用圓體字型 */
        body, button, input, textarea, select, .font-sans {
          font-family: 'Zen Maru Gothic', sans-serif !important;
        }
      `}</style>
      
      <SnowEffect />
      
      {/* 主要容器 - 深色玻璃質感 - 移除 font-sans 避免衝突 */}
      <div className="max-w-md mx-auto min-h-screen shadow-[0_0_100px_-20px_rgba(0,0,0,0.8)] bg-[#0c1a15] relative overflow-hidden border-x border-white/5">
        
        {/* 裝飾性背景光暈 - 深色模式版 */}
        <div className="absolute top-[-10%] left-[-20%] w-[80%] h-[40%] bg-green-900/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] bg-red-900/10 rounded-full blur-[100px] pointer-events-none"></div>

        {/* 頂部裝飾燈串 - 發光版 */}
        <div className="flex justify-between px-4 -mt-3 mb-2 overflow-hidden pointer-events-none absolute top-0 w-full z-20">
           {[...Array(7)].map((_,i) => {
              const colors = ['bg-red-600 shadow-[0_0_10px_#dc2626]', 'bg-amber-400 shadow-[0_0_10px_#fbbf24]', 'bg-green-500 shadow-[0_0_10px_#22c55e]', 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'];
              return (
                 <div key={i} className="flex flex-col items-center">
                    <div className="h-4 w-[1px] bg-slate-600"></div>
                    <div className={`w-2.5 h-3.5 rounded-full ${colors[i%4]} animate-pulse opacity-80`} style={{animationDelay: `${i*0.3}s`}}></div>
                 </div>
              )
           })}
        </div>

        {/* 進度條 */}
        {step > 0 && (
          <div className="h-1 bg-slate-800 w-full relative z-30 mt-4">
            <div
              className="h-full bg-gradient-to-r from-green-600 via-amber-500 to-red-600 transition-all duration-700 rounded-r-full shadow-[0_0_15px_rgba(251,191,36,0.5)]"
              style={{ width: `${(step/4)*100}%` }}
            ></div>
          </div>
        )}

        <div className="p-5 relative z-10 pt-10 pb-20">
          {step === 0 && renderWelcome()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </div>

        {/* 提示訊息 Toast */}
        {showToast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-3 border border-slate-700">
            <Gift size={20} className="text-amber-400" />
            <span className="font-medium">連結已複製！快去傳給崩潰的戰友！</span>
          </div>
        )}
      </div>
    </div>
  );
}