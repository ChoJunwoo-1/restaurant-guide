import { BrowserRouter, Routes, Route } from 'react-router-dom';
import GuestPage from './pages/GuestPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 주소가 '/' 이면 손님용 페이지를 보여줌 */}
        <Route path="/" element={<GuestPage />} />
        {/* 주소가 '/admin' 이면 관리자 페이지를 보여줌 */}
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;