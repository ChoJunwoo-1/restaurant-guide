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

  const stations = [...new Set(restaurants.map(r => r.station_ko))];

  return (
    <div className="container">
      {/* 상단 타이틀, 언어 선택 버튼 기존 코드 유지... */}

      {stations.map(stationKo => {
        // 현재 역에 해당하는 식당들만 필터링
        const groupRestaurants = restaurants.filter(r => r.station_ko === stationKo);
        // 그룹의 첫 번째 데이터에서 해당 언어의 역 이름을 가져옴 (없으면 한국어 표시)
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