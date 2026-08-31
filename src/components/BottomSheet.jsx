export default function BottomSheet({ restaurant, lang, onClose }) {
  // 선택된 식당이 없으면 아무것도 그리지 않음
  if (!restaurant) return null;

  return (
    <div className="overlay" onClick={onClose}>
      {/* sheet 내부를 클릭했을 때는 창이 닫히지 않도록 이벤트 전파 막기 */}
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="sheet-station">🚇 {restaurant.station}</p>
        <h2 className="sheet-name">{restaurant[`name_${lang}`]}</h2>
        <p className="sheet-genre">{restaurant[`genre_${lang}`]}</p>
        
        <a 
          href={restaurant.naver_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="naver-btn"
        >
          네이버 리뷰 보기 →
        </a>
      </div>
    </div>
  );
}