export default function BottomSheet({ restaurant, lang, onClose }) {
  if (!restaurant) return null;

  // 언어별 네이버 리뷰 버튼 텍스트
  const btnText = {
    ko: '네이버 리뷰 보기 →',
    ja: 'Naver レビューを見る →',
    en: 'View Naver Review →',
    zh: '查看 Naver 评论 →'
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
        {/* 역 이름 다국어 적용 */}
        <p className="sheet-station">🚇 {restaurant[`station_${lang}`] || restaurant.station_ko}</p>
        <h2 className="sheet-name">{restaurant[`name_${lang}`]}</h2>
        <p className="sheet-genre">{restaurant[`genre_${lang}`]}</p>
        
        <a 
          href={restaurant.naver_url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="naver-btn"
        >
          {btnText[lang]}
        </a>
      </div>
    </div>
  );
}