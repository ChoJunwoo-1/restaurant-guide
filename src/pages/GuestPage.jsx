import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import BottomSheet from '../components/BottomSheet';
import { LINE_INFO } from '../constants';
import '../index.css';

export default function GuestPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [lang, setLang] = useState('ko');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    // ★ 변경: 장르 테이블(genres)의 데이터도 함께 묶어서(join) 가져옵니다.
    const { data, error } = await supabase
      .from('restaurants')
      .select('*, genres(*)')
      .order('station_ko', { ascending: true })
      .order('sort_order', { ascending: true });

    if (!error) setRestaurants(data);
  }

  const stations = [...new Set(restaurants.map(r => r.station_ko))];

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '800' }}>맛집 추천</h1>
      <div className="lang-selector">
        <button className={`lang-btn ${lang === 'ko' ? 'active' : ''}`} onClick={() => setLang('ko')}>한국어</button>
        <button className={`lang-btn ${lang === 'ja' ? 'active' : ''}`} onClick={() => setLang('ja')}>日本語</button>
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>English</button>
        <button className={`lang-btn ${lang === 'zh' ? 'active' : ''}`} onClick={() => setLang('zh')}>中文</button>
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
                  {/* ★ 변경: 가져온 genres 데이터에서 언어별 장르명을 출력 */}
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