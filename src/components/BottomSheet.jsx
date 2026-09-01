import { LINE_INFO } from '../constants';

export default function BottomSheet({ restaurant, lang, onClose }) {
  if (!restaurant) return null;

  const naverText = { ko: '네이버지도', ja: 'Naverマップ', en: 'Naver Map', zh: 'Naver 地图' };
  const googleText = { ko: '구글지도', ja: 'Googleマップ', en: 'Google Map', zh: 'Google 地图' };

  const lines = restaurant.line ? String(restaurant.line).split(',') : [];
  
  // 비고란 텍스트 (해당 언어 데이터가 없으면 안 띄움)
  const noteText = restaurant[`note_${lang}`];
  // 장르 텍스트 (genres 테이블과 연결된 데이터 가져오기)
  const genreText = restaurant.genres ? restaurant.genres[`name_${lang}`] : '';

  return (
    <div className="overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="sheet-station">
          {lines.map(l => {
            const lineData = LINE_INFO[l];
            return lineData ? <span key={l} style={{ color: lineData.color, marginRight: '4px' }}>{lineData.icon}</span> : null;
          })}
          {restaurant[`station_${lang}`] || restaurant.station_ko}
        </p>
        <h2 className="sheet-name">{restaurant[`name_${lang}`]}</h2>
        <p className="sheet-genre">{genreText}</p>

        {/* 비고란 (특이사항이 있을 때만 노란 박스로 표시) */}
        {noteText && (
          <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '8px', marginTop: '10px', fontSize: '14px', color: '#856404', lineHeight: '1.4' }}>
            💡 {noteText}
          </div>
        )}
        
        {/* 지도 버튼 영역 (flex를 이용해 양옆으로 배치) */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <a href={restaurant.naver_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', backgroundColor: '#03C75A', color: 'white', textAlign: 'center', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', boxSizing: 'border-box' }}>
            {naverText[lang]}
          </a>
          
          {/* 구글 맵 주소가 입력되어 있을 때만 버튼 표시 */}
          {restaurant.google_url && (
            <a href={restaurant.google_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', backgroundColor: '#4285F4', color: 'white', textAlign: 'center', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', boxSizing: 'border-box' }}>
              {googleText[lang]}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}