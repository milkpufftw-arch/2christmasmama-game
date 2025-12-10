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

// --- 雪花背景特效組件 ---
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
  const [currentIcon, setCurrentIcon] = useState('🎁'); 
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedChecks, setDisplayedChecks] = useState({ body: [], emotion: [], brain: [] });
  const [checkedCount, setCheckedCount] = useState(0);
  const [showToast, setShowToast] = useState(false);
  
  // --- 圖片設定 ---
  const driveImageId = "1zbO02DurlPSmMLnipgPxp3fqrWtcLoWt";
  const defaultImage = `https://lh3.googleusercontent.com/d/${driveImageId}`;
  const fallbackImage = "https://images.unsplash.com/photo-1618588507085-c79565432917?q=80&w=1000&auto=format&fit=crop"; 
  const [userImage, setUserImage] = useState(defaultImage);
  const fileInputRef = useRef(null);

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
