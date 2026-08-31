import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import BottomSheet from '../components/BottomSheet';
import '../index.css';

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
      .select('*')
      .order('station_ko', { ascending: true }) // 에러 방지: station_ko로 정렬
      .order('sort_order', { ascending: true });

    if (!error) setRestaurants(data);
  }

  // DB에서 station_ko 기준으로 중복 제거
  const stations = [...new Set(restaurants.map(r => r.station_ko))];

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '800' }}>맛집 추천</h1>
      
      {/* 이 부분이 빠져 있어서 언어 선택이 안 보였던 것입니다! */}
      <div className="lang-selector">
        <button className={`lang-btn ${lang === 'ko' ? 'active' : ''}`} onClick={() => setLang('ko')}>한국어</button>
        <button className={`lang-btn ${lang === 'ja' ? 'active' : ''}`} onClick={() => setLang('ja')}>日本語</button>
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>English</button>
        <button className={`lang-btn ${lang === 'zh' ? 'active' : ''}`} onClick={() => setLang('zh')}>中文</button>
      </div>

      {stations.map(stationKo => {
        // 현재 역에 해당하는 식당들만 필터링
        const groupRestaurants = restaurants.filter(r => r.station_ko === stationKo);
        // 언어에 맞는 역 이름 출력 (값이 비어있으면 기본값으로 한국어 출력)
        const stationName = groupRestaurants[0][`station_${lang}`] || stationKo;

        return (
          <div key={stationKo}>
            <h2 className="station-title">🚇 {stationName}</h2>
            <div className="card-grid">
              {groupRestaurants.map(restaurant => (
                <div key={restaurant.id} className="card" onClick={() => setSelectedRestaurant(restaurant)}>
                  <h3 className="card-name">{restaurant[`name_${lang}`]}</h3>
                  <p className="card-genre">{restaurant[`genre_${lang}`]}</p>
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