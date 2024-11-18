import './App.css'
import Branch from './components/Branch';
import Dashboard from './components/Dashboard';
import Login from './components/Login'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Menu_ from './components/Menu_';
import Notfound from './components/Notfound';
import Tmp1 from './components/template/Tmp1';
function App() {

  return (
    
    <Router> {/* Wrap your Routes in BrowserRouter */}
      <Routes>
        <Route path="/:tenantName/login" element={<Login />} />        
        <Route path="/branch" element={<Branch />} />        
        <Route path="/dashboard" element={<Dashboard />} />        
        <Route path="/menu" element={<Menu />} />        
        <Route path="/menu_" element={<Menu_ />} />   
        <Route path="/tmp1" element={<Tmp1 />} />   
        
        <Route path="*" element={<Notfound />} />         
      </Routes>
    </Router>
  )
}

export default App
