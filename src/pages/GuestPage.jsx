import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import BottomSheet from '../components/BottomSheet';
import { LINE_INFO } from '../constants';
import '../index.css';

const STATION_ORDER = [
  '동대문역',
  '동대문역사문화공원역',
  '종로5가역',
  '동묘앞역',
  '혜화역',
  '을지로4가역',
  '신당역',
  '종로3가역',
  '을지로3가역',
  '명동역',
  '시청역'
];

export default function GuestPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [lang, setLang] = useState('ko');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, genres(*)')
      .order('name_ko', { ascending: true });

    if (!error) setRestaurants(data);
  }

  const stations = [...new Set(restaurants.map(r => r.station_ko))].sort((a, b) => {
    let indexA = STATION_ORDER.indexOf(a);
    let indexB = STATION_ORDER.indexOf(b);
    
    if (indexA === -1) indexA = 999; // 목록에 없는 먼 역은 맨 아래로
    if (indexB === -1) indexB = 999;
    
    return indexA - indexB;
  });
  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#ffffff' }}>맛집 추천</h1>
      <div className="lang-selector">
        <button className={`lang-btn ${lang === 'ko' ? 'active' : ''}`} onClick={() => setLang('ko')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src="https://flagcdn.com/w20/kr.png" alt="Korea" style={{ width: '18px', borderRadius: '2px' }} />
          한국어
        </button>
        <button className={`lang-btn ${lang === 'ja' ? 'active' : ''}`} onClick={() => setLang('ja')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src="https://flagcdn.com/w20/jp.png" alt="Japan" style={{ width: '18px', borderRadius: '2px' }} />
          日本語
        </button>
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <img src="https://flagcdn.com/w20/us.png" alt="USA" style={{ width: '18px', borderRadius: '2px' }} />
          English
        </button>
      </div>

      {stations.map(stationKo => {
        const groupRestaurants = restaurants.filter(r => r.station_ko === stationKo);
        const stationName = groupRestaurants[0][`station_${lang}`] || stationKo;
        const lines = groupRestaurants[0].line ? String(groupRestaurants[0].line).split(',') : [];

        return (
          <div key={stationKo}>
            <h2 className="station-title">
              {lines.map(l => {
                const lineData = LINE_INFO[l];
                return lineData ? <span key={l} style={{ color: lineData.color, marginRight: '4px' }}>{lineData.icon}</span> : null;
              })}
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