import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LINE_INFO } from '../constants';
import '../index.css';

const initialRestaurantForm = {
  line: '2',
  station_ko: '', station_ja: '', station_en: '',
  name_ko: '', name_ja: '', name_en: '',
  genre_id: '',
  note_ko: '', note_ja: '', note_en: '',
  naver_url: '', google_url: ''
};

const initialGenreForm = {
  name_ko: '', name_ja: '', name_en: ''
};

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState('restaurants'); 
  
  const [restaurants, setRestaurants] = useState([]);
  const [genres, setGenres] = useState([]);
  
  const [showResForm, setShowResForm] = useState(false);
  const [resFormData, setResFormData] = useState(initialRestaurantForm);
  const [editResId, setEditResId] = useState(null);

  const [genreFormData, setGenreFormData] = useState(initialGenreForm);

  // 공통 입력칸 스타일 (다크모드)
  const inputStyle = { width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #444', backgroundColor: '#121212', color: '#fff' };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { fetchRestaurants(); fetchGenres(); }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { fetchRestaurants(); fetchGenres(); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRestaurants = async () => {
    const { data } = await supabase.from('restaurants').select('*, genres(*)').order('station_ko').order('name_ko');
    if (data) setRestaurants(data);
  };

  const fetchGenres = async () => {
    const { data } = await supabase.from('genres').select('*').order('created_at');
    if (data) setGenres(data);
  };

  const handleGenreChange = (e) => setGenreFormData({ ...genreFormData, [e.target.name]: e.target.value });
  const handleResChange = (e) => setResFormData({ ...resFormData, [e.target.name]: e.target.value });

  const handleGenreSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('genres').insert([genreFormData]);
    if (!error) {
      alert('장르가 추가되었습니다!');
      setGenreFormData(initialGenreForm);
      fetchGenres();
    }
  };

  const handleGenreDelete = async (id, nameKo) => {
    if (!window.confirm(`${nameKo} 장르를 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('genres').delete().eq('id', id);
    if (!error) {
      alert('삭제되었습니다.');
      fetchGenres(); fetchRestaurants(); 
    }
  };

  const handleResSubmit = async (e) => {
    e.preventDefault();
    const { id, created_at, genres, ...updateData } = resFormData; 
    
    if (editResId) {
      const { error } = await supabase.from('restaurants').update(updateData).eq('id', editResId);
      if (!error) {
        alert('맛집이 수정되었습니다!');
        setResFormData(initialRestaurantForm); setEditResId(null); setShowResForm(false);
        fetchRestaurants();
      }
    } else {
      const { error } = await supabase.from('restaurants').insert([updateData]);
      if (!error) {
        alert('맛집이 추가되었습니다!');
        setResFormData(initialRestaurantForm); setShowResForm(false);
        fetchRestaurants();
      }
    }
  };

  const handleResEdit = (r) => {
    setResFormData({ ...initialRestaurantForm, ...r, genre_id: r.genre_id || '' });
    setEditResId(r.id);
    setShowResForm(true);
  };

  const handleResDelete = async (id, nameKo) => {
    if (!window.confirm(`${nameKo} 식당을 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (!error) fetchRestaurants();
  };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
  };

  if (!session) {
    return (
      <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#fff' }}>관리자 로그인</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} required />
          <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} required />
          <button type="submit" style={{ padding: '14px', borderRadius: '8px', background: '#ffffff', color: '#000', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>로그인</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>관리자 대시보드</h1>
        <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #444', background: '#1e1e1e', color: '#fff' }}>로그아웃</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('restaurants')} style={{ flex: 1, padding: '12px', fontWeight: 'bold', borderRadius: '8px', border: 'none', background: activeTab === 'restaurants' ? '#ffffff' : '#2c2c2c', color: activeTab === 'restaurants' ? '#000' : '#888' }}>맛집 관리</button>
        <button onClick={() => setActiveTab('genres')} style={{ flex: 1, padding: '12px', fontWeight: 'bold', borderRadius: '8px', border: 'none', background: activeTab === 'genres' ? '#ffffff' : '#2c2c2c', color: activeTab === 'genres' ? '#000' : '#888' }}>장르 관리</button>
      </div>

      {activeTab === 'genres' && (
        <div>
          <div style={{ background: '#1e1e1e', padding: '20px', borderRadius: '12px', border: '1px solid #333', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', marginTop: 0, color: '#fff' }}>새 장르 추가</h2>
            <form onSubmit={handleGenreSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input name="name_ko" placeholder="한국어 장르" value={genreFormData.name_ko} onChange={handleGenreChange} required style={inputStyle} />
              <input name="name_ja" placeholder="日本語 장르" value={genreFormData.name_ja} onChange={handleGenreChange} style={inputStyle} />
              <input name="name_en" placeholder="English 장르" value={genreFormData.name_en} onChange={handleGenreChange} style={inputStyle} />
              <button type="submit" style={{ gridColumn: 'span 2', padding: '12px', background: '#03C75A', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>장르 저장하기</button>
            </form>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {genres.map(g => (
              <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', background: '#1e1e1e', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
                <div style={{ color: '#fff' }}><strong>{g.name_ko}</strong> <span style={{ color: '#aaa' }}>({g.name_ja} / {g.name_en})</span></div>
                <button onClick={() => handleGenreDelete(g.id, g.name_ko)} style={{ color: '#ff4d4d', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>삭제</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'restaurants' && (
        <div>
          {showResForm ? (
            <div style={{ background: '#1e1e1e', padding: '24px', borderRadius: '16px', border: '1px solid #333', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', marginTop: 0, color: '#fff' }}>{editResId ? '맛집 수정' : '새 맛집 추가'}</h2>
              <form onSubmit={handleResSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <div style={{ padding: '15px', background: '#2c2c2c', borderRadius: '8px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', display: 'block', color: '#fff' }}>지하철 호선</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => {
                      const currentLines = resFormData.line ? String(resFormData.line).split(',') : [];
                      const isChecked = currentLines.includes(num);
                      return (
                        <label key={num} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '14px', color: '#ddd' }}>
                          <input type="checkbox" checked={isChecked} onChange={() => {
                            let newLines = isChecked ? currentLines.filter(l => l !== num) : [...currentLines, num].sort();
                            setResFormData({ ...resFormData, line: newLines.join(',') });
                          }} /> {num}호선
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#2c2c2c', padding: '15px', borderRadius: '8px' }}>
                  <div><label style={{ fontSize: '12px', color: '#aaa' }}>역 이름 (한국어)</label><input name="station_ko" value={resFormData.station_ko} onChange={handleResChange} required style={inputStyle} /></div>
                  <div><label style={{ fontSize: '12px', color: '#aaa' }}>역 이름 (일어)</label><input name="station_ja" value={resFormData.station_ja} onChange={handleResChange} style={inputStyle} /></div>
                  <div><label style={{ fontSize: '12px', color: '#aaa' }}>역 이름 (영어)</label><input name="station_en" value={resFormData.station_en} onChange={handleResChange} style={inputStyle} /></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#2c2c2c', padding: '15px', borderRadius: '8px' }}>
                  <div><label style={{ fontSize: '12px', color: '#aaa' }}>가게명 (한국어)</label><input name="name_ko" value={resFormData.name_ko} onChange={handleResChange} required style={inputStyle} /></div>
                  <div><label style={{ fontSize: '12px', color: '#aaa' }}>가게명 (일어)</label><input name="name_ja" value={resFormData.name_ja} onChange={handleResChange} style={inputStyle} /></div>
                  <div><label style={{ fontSize: '12px', color: '#aaa' }}>가게명 (영어)</label><input name="name_en" value={resFormData.name_en} onChange={handleResChange} style={inputStyle} /></div>
                </div>

                <div>
                  <label style={{ fontWeight: 'bold', fontSize: '14px', display: 'block', marginBottom: '5px', color: '#fff' }}>장르 선택</label>
                  <select name="genre_id" value={resFormData.genre_id} onChange={handleResChange} required style={inputStyle}>
                    <option value="">-- 장르를 선택하세요 --</option>
                    {genres.map(g => <option key={g.id} value={g.id}>{g.name_ko}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#332b00', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ gridColumn: 'span 2', fontSize: '14px', fontWeight: 'bold', color: '#ffdd66' }}>💡 특이사항 / 비고란 (웨이팅 등)</div>
                  <textarea name="note_ko" placeholder="한국어 비고" value={resFormData.note_ko} onChange={handleResChange} style={{ ...inputStyle, height: '60px' }} />
                  <textarea name="note_ja" placeholder="日本語 비고" value={resFormData.note_ja} onChange={handleResChange} style={{ ...inputStyle, height: '60px' }} />
                  <textarea name="note_en" placeholder="English 비고" value={resFormData.note_en} onChange={handleResChange} style={{ ...inputStyle, height: '60px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>네이버 리뷰 URL</label>
                  <input type="url" name="naver_url" value={resFormData.naver_url} onChange={handleResChange} required style={{ ...inputStyle, marginTop: '5px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>구글 맵 URL (선택)</label>
                  <input type="url" name="google_url" value={resFormData.google_url || ''} onChange={handleResChange} style={{ ...inputStyle, marginTop: '5px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => {setResFormData(initialRestaurantForm); setShowResForm(false); setEditResId(null);}} style={{ flex: 1, padding: '14px', borderRadius: '8px', background: '#333', color: '#fff', border: 'none', cursor: 'pointer' }}>취소</button>
                  <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '8px', background: '#03C75A', color: 'white', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>저장하기</button>
                </div>
              </form>
            </div>
          ) : (
            <>
              <button onClick={() => { setResFormData(initialRestaurantForm); setShowResForm(true); }} style={{ padding: '12px 20px', background: '#ffffff', color: '#000', borderRadius: '10px', border: 'none', fontWeight: 'bold', marginBottom: '20px', cursor: 'pointer' }}>+ 맛집 추가</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {restaurants.map(r => {
                  const lines = r.line ? String(r.line).split(',') : [];
                  return (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e1e1e', padding: '16px', borderRadius: '12px', border: '1px solid #333' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '4px' }}>
                          {lines.map(l => LINE_INFO[l] ? <span key={l} style={{ color: LINE_INFO[l].color, marginRight: '4px' }}>{LINE_INFO[l].icon}</span> : null)}
                          {r.station_ko} (장르: {r.genres ? r.genres.name_ko : '미지정'})
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>{r.name_ko}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleResEdit(r)} style={{ background: '#2c2c2c', color: '#4da6ff', border: '1px solid #444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>수정</button>
                        <button onClick={() => handleResDelete(r.id, r.name_ko)} style={{ background: '#2c2c2c', color: '#ff4d4d', border: '1px solid #444', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>삭제</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}