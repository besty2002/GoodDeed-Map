import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import StoreDetail from './pages/StoreDetail';
import ReportStore from './pages/ReportStore';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import MyPage from './pages/MyPage';
import Timeline from './pages/Timeline';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="store/:id" element={<StoreDetail />} />
          <Route path="report" element={<ReportStore />} />
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="login" element={<Login />} />
          <Route path="mypage" element={<MyPage />} />
          <Route path="timeline" element={<Timeline />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

