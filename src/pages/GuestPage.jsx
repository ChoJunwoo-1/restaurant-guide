import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import BottomSheet from '../components/BottomSheet';
import { LINE_INFO } from '../constants';
import '../index.css';

const STATION_ORDER = [
  '동대문역', '동대문역사문화공원역', '동묘앞역', '종로5가역', '혜화역', '을지로4가역', '신당역', '종로3가역',
  '신설동역', '청구역', '을지로3가역', '충무로역', '안국역', '명동역', '광화문역', '시청역', '회현역', '서울역',
  '경복궁역', '왕십리역', '이태원역', '한강진역', '녹사평역', '서울숲역', '뚝섬역', '성수역', '건대입구역',
  '이대역', '신촌역', '홍대입구역', '합정역', '망원역', '신사역', '압구정역', '압구정로데오역', '고속터미널역',
  '신논현역', '강남역', '여의나루역', '여의도역', '삼성역', '잠실역'
];

export default function GuestPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [lang, setLang] = useState('ko');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    fetchRestaurants();

    // 1. 초기 테마 불러오기
    const fetchTheme = async () => {
      const { data } = await supabase.from('app_settings').select('theme').eq('id', 1).single();
      if (data) document.documentElement.setAttribute('data-theme', data.theme);
    };
    fetchTheme();

    // 2. 관리자가 DB에서 테마 변경 시 실시간 감지 (새로고침 불필요)
    const themeSubscription = supabase.channel('custom-theme-channel')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings' }, (payload) => {
        document.documentElement.setAttribute('data-theme', payload.new.theme);
      })
      .subscribe();

    return () => { supabase.removeChannel(themeSubscription); };
  }, []);

  async function fetchRestaurants() {
    const { data, error } = await supabase.from('restaurants').select('*, genres(*)').order('name_ko', { ascending: true });
    if (!error) setRestaurants(data);
  }

  const stations = [...new Set(restaurants.map(r => r.station_ko))].sort((a, b) => {
    let indexA = STATION_ORDER.indexOf(a);
    let indexB = STATION_ORDER.indexOf(b);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-color)' }}>맛집 추천</h1>
      <div className="lang-selector">
        <button className={`lang-btn ${lang === 'ko' ? 'active' : ''}`} onClick={() => setLang('ko')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src="https://flagcdn.com/w20/kr.png" alt="Korea" style={{ width: '18px', borderRadius: '2px' }} />한국어
        </button>
        <button className={`lang-btn ${lang === 'ja' ? 'active' : ''}`} onClick={() => setLang('ja')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src="https://flagcdn.com/w20/jp.png" alt="Japan" style={{ width: '18px', borderRadius: '2px' }} />日本語
        </button>
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src="https://flagcdn.com/w20/us.png" alt="USA" style={{ width: '18px', borderRadius: '2px' }} />English
        </button>
      </div>

      {stations.map(stationKo => {
        const groupRestaurants = restaurants.filter(r => r.station_ko === stationKo);
        const stationName = groupRestaurants[0][`station_${lang}`] || stationKo;
        const lines = groupRestaurants[0].line ? String(groupRestaurants[0].line).split(',') : [];

        return (
          <div key={stationKo}>
            <h2 className="station-title">
              {lines.map(l => LINE_INFO[l] ? <span key={l} style={{ color: LINE_INFO[l].color, marginRight: '4px' }}>{LINE_INFO[l].icon}</span> : null)}
              {stationName}
            </h2>
            <div className="card-grid">
              {groupRestaurants.map(restaurant => (
                <div key={restaurant.id} className="card" onClick={() => setSelectedRestaurant(restaurant)}>
                  <h3 className="card-name">{restaurant[`name_${lang}`]}</h3>
                  <p className="card-genre">{restaurant.genres ? restaurant.genres[`name_${lang}`] : ''}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <BottomSheet restaurant={selectedRestaurant} lang={lang} onClose={() => setSelectedRestaurant(null)} />
    </div>
  );
}