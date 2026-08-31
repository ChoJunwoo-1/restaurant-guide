import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // 경로가 조금 바뀜(../)
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
      .order('sort_order', { ascending: true });

    if (!error) setRestaurants(data);
  }

  const stations = [...new Set(restaurants.map(r => r.station))];

  return (
    <div className="container">
      <h1 style={{ fontSize: '28px', fontWeight: '800' }}>맛집 추천</h1>
      <div className="lang-selector">
        <button className={`lang-btn ${lang === 'ko' ? 'active' : ''}`} onClick={() => setLang('ko')}>한국어</button>
        <button className={`lang-btn ${lang === 'ja' ? 'active' : ''}`} onClick={() => setLang('ja')}>日本語</button>
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => setLang('en')}>English</button>
        <button className={`lang-btn ${lang === 'zh' ? 'active' : ''}`} onClick={() => setLang('zh')}>中文</button>
      </div>

      {stations.map(station => (
        <div key={station}>
          <h2 className="station-title">🚇 {station}</h2>
          <div className="card-grid">
            {restaurants.filter(r => r.station === station).map(restaurant => (
              <div key={restaurant.id} className="card" onClick={() => setSelectedRestaurant(restaurant)}>
                <h3 className="card-name">{restaurant[`name_${lang}`]}</h3>
                <p className="card-genre">{restaurant[`genre_${lang}`]}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      <BottomSheet restaurant={selectedRestaurant} lang={lang} onClose={() => setSelectedRestaurant(null)} />
    </div>
  );
}