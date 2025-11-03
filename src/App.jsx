import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import AditDashboard from './components/AditDashboard'
import AnciaDashboard from './components/AnciaDashboard'

export default function App(){
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const s = sessionStorage.getItem('smoketrack_user')
    if(s) setUser(JSON.parse(s))
  },[])

  const onLogin = (u) =>{
    setUser(u)
    sessionStorage.setItem('smoketrack_user', JSON.stringify(u))
    if(u.username === 'adit') navigate('/adit')
    else navigate('/ancia')
  }

  const onLogout = ()=>{
    sessionStorage.removeItem('smoketrack_user')
    setUser(null)
    navigate('/')
  }

  return (
    <div>
      <Routes>
        <Route path='/' element={<Login onLogin={onLogin} />} />
        <Route path='/adit' element={<AditDashboard user={user} onLogout={onLogout} />} />
        <Route path='/ancia' element={<AnciaDashboard user={user} onLogout={onLogout} />} />
      </Routes>
    </div>
  )
}
