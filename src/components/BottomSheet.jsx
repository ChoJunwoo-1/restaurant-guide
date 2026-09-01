import { LINE_INFO } from '../constants';

export default function BottomSheet({ restaurant, lang, onClose }) {
  if (!restaurant) return null;

  const btnText = {
    ko: '네이버 리뷰 보기 →',
    ja: 'Naver レビューを見る →',
    en: 'View Naver Review →',
    zh: '查看 Naver 评论 →'
  };

  // 쉼표로 저장된 호선 문자열을 배열로 변환 (예: "2,3" -> ["2", "3"])
  const lines = restaurant.line ? String(restaurant.line).split(',') : [];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="sheet-station">
          {/* 배열을 순회하며 여러 개의 아이콘 출력 */}
          {lines.map(l => {
            const lineData = LINE_INFO[l];
            return lineData ? (
              <span key={l} style={{ color: lineData.color, marginRight: '4px' }}>{lineData.icon}</span>
            ) : null;
          })}
          {restaurant[`station_${lang}`] || restaurant.station_ko}
        </p>
        <h2 className="sheet-name">{restaurant[`name_${lang}`]}</h2>
        <p className="sheet-genre">{restaurant[`genre_${lang}`]}</p>
        
        <a href={restaurant.naver_url} target="_blank" rel="noopener noreferrer" className="naver-btn">
          {btnText[lang]}
        </a>
      </div>
    </div>
  );
}