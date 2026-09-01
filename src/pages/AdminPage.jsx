import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LINE_INFO } from '../constants'; // ★ 추가
import '../index.css';

const initialFormState = {
  line: '2',
  station_ko: '', station_ja: '', station_en: '', station_zh: '',
  name_ko: '', genre_ko: '', name_ja: '', genre_ja: '',
  name_en: '', genre_en: '', name_zh: '', genre_zh: '',
  naver_url: '', sort_order: 1
};

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  
  // ★ 추가된 부분: 현재 수정 중인 맛집의 ID를 저장 (null이면 '새로 추가' 상태)
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchRestaurants();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchRestaurants();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('station_ko', { ascending: true })
      .order('sort_order', { ascending: true });

    if (!error) setRestaurants(data);
  };

  const handleDelete = async (id, nameKo) => {
    if (!window.confirm(`${nameKo} 식당을 정말 삭제하시겠습니까?`)) return;
    const { error } = await supabase.from('restaurants').delete().eq('id', id);
    if (!error) {
      setRestaurants(restaurants.filter(r => r.id !== id));
      alert('삭제되었습니다.');
    } else {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  // ★ 추가된 부분: 수정 버튼을 눌렀을 때 폼에 기존 데이터를 채워넣는 함수
  const handleEdit = (restaurant) => {
    setFormData(restaurant); // 폼 데이터에 선택한 식당 정보 넣기
    setEditId(restaurant.id); // 수정 모드로 전환
    setShowForm(true); // 폼 열기
  };

  // 폼을 닫고 초기화하는 함수
  const resetForm = () => {
    setFormData(initialFormState);
    setEditId(null);
    setShowForm(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'sort_order' ? Number(value) : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // DB 고유값(id, created_at 등)을 빼고 순수 업데이트할 데이터만 분리합니다.
    const { id, created_at, ...updateData } = formData;
    
    if (editId) {
      // ★ 수정(UPDATE) 모드
      const { error } = await supabase
        .from('restaurants')
        .update(updateData) // formData 대신 분리해낸 updateData를 사용
        .eq('id', editId); 
        
      if (error) {
        console.error(error);
        alert('수정 중 오류가 발생했습니다.');
      } else {
        alert('맛집이 성공적으로 수정되었습니다!');
        resetForm();
        fetchRestaurants();
      }
    } else {
      // ★ 추가(INSERT) 모드
      const { error } = await supabase.from('restaurants').insert([updateData]); // 여기도 updateData 사용
      
      if (error) {
        console.error(error);
        alert('저장 중 오류가 발생했습니다.');
      } else {
        alert('맛집이 성공적으로 추가되었습니다!');
        resetForm();
        fetchRestaurants();
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert('로그인 실패: 이메일이나 비밀번호를 확인해주세요.');
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>관리자 로그인</h1>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }} required />
          <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '16px' }} required />
          <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '8px', background: '#000', color: '#fff', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>관리자 대시보드</h1>
        <button onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontSize: '14px' }}>로그아웃</button>
      </div>

      {showForm ? (
        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)' }}>
          {/* 수정 모드인지 추가 모드인지에 따라 제목 변경 */}
          <h2 style={{ fontSize: '20px', marginTop: '0', marginBottom: '20px' }}>
            {editId ? '맛집 정보 수정' : '새 맛집 추가'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>지하철 호선</label>
              <select name="line" value={formData.line} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }}>
                <option value="1">1호선</option>
                <option value="2">2호선</option>
                <option value="3">3호선</option>
                <option value="4">4호선</option>
                <option value="5">5호선</option>
                <option value="6">6호선</option>
                <option value="7">7호선</option>
                <option value="8">8호선</option>
                <option value="9">9호선</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f7f7f8', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#8e8e93' }}>한국어 역 이름</label>
              <input name="station_ko" value={formData.station_ko} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#8e8e93' }}>日本語 역 이름</label>
              <input name="station_ja" value={formData.station_ja} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#8e8e93' }}>English 역 이름</label>
              <input name="station_en" value={formData.station_en} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#8e8e93' }}>中文 역 이름</label>
              <input name="station_zh" value={formData.station_zh} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
            </div>
          </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', background: '#f7f7f8', padding: '15px', borderRadius: '8px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#8e8e93' }}>한국어 이름</label>
                <input name="name_ko" value={formData.name_ko} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8e8e93' }}>한국어 장르</label>
                <input name="genre_ko" value={formData.genre_ko} onChange={handleChange} required style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8e8e93' }}>日本語 이름</label>
                <input name="name_ja" value={formData.name_ja} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8e8e93' }}>日本語 장르</label>
                <input name="genre_ja" value={formData.genre_ja} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8e8e93' }}>English 이름</label>
                <input name="name_en" value={formData.name_en} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8e8e93' }}>English 장르</label>
                <input name="genre_en" value={formData.genre_en} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8e8e93' }}>中文 이름</label>
                <input name="name_zh" value={formData.name_zh} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#8e8e93' }}>中文 장르</label>
                <input name="genre_zh" value={formData.genre_zh} onChange={handleChange} style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginTop: '4px' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>네이버 리뷰 URL</label>
              <input type="url" name="naver_url" value={formData.naver_url} onChange={handleChange} placeholder="https://..." required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>표시 순서 (숫자)</label>
              <input type="number" name="sort_order" value={formData.sort_order} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={resetForm} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}>취소</button>
              <button type="submit" style={{ flex: 2, padding: '14px', borderRadius: '8px', border: 'none', background: '#03C75A', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
                {editId ? '수정하기' : '저장하기'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={() => { resetForm(); setShowForm(true); }}
              style={{ padding: '12px 20px', background: '#000', color: '#fff', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}
            >
              + 맛집 추가
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {restaurants.map(r => {
              const lineData = LINE_INFO[r.line] || { icon: '', color: '#000' };
              return (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#8e8e93', marginBottom: '4px' }}>
                      <span style={{ color: lineData.color, marginRight: '4px' }}>{lineData.icon}</span>
                      {r.station_ko} (순서: {r.sort_order})
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{r.name_ko}</div>
                 </div>
                
                {/* ★ 수정/삭제 버튼 그룹 */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleEdit(r)}
                    style={{ background: '#f2f2f7', color: '#007aff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    수정
                  </button>
                  <button 
                    onClick={() => handleDelete(r.id, r.name_ko)}
                    style={{ background: '#ffebee', color: '#ff3b30', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}