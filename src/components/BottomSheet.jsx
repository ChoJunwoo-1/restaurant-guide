import { LINE_INFO } from '../constants';

export default function BottomSheet({ restaurant, lang, onClose }) {
  if (!restaurant) return null;

  const naverText = { ko: '네이버 지도', ja: 'Naver マップ', en: 'Naver Map' };
  const googleText = { ko: '구글 지도', ja: 'Google マップ', en: 'Google Map' };

  const lines = restaurant.line ? String(restaurant.line).split(',') : [];
  
  const noteText = restaurant[`note_${lang}`];
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

        {noteText && (
          <div style={{ background: '#fff3cd', padding: '12px', borderRadius: '8px', marginTop: '10px', fontSize: '14px', color: '#856404', lineHeight: '1.4' }}>
            💡 {noteText}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <a href={restaurant.naver_url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', backgroundColor: '#03C75A', color: 'white', textAlign: 'center', padding: '14px', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', textDecoration: 'none', boxSizing: 'border-box' }}>
            {naverText[lang]}
          </a>
          
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