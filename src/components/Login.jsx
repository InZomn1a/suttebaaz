import React, { useState } from 'react'

const CREDENTIALS = { adit: 'mumbai', ancia: 'alberta' }

export default function Login({ onLogin }){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  function submit(e){
    e.preventDefault()
    if(CREDENTIALS[username] && CREDENTIALS[username] === password){
      onLogin({ username })
    } else setErr('Invalid — try adit/mumbai or ancia/alberta')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <h1 className="text-2xl font-semibold mb-2">SmokeTrack</h1>
          <p className="small mb-4">Accountability with options — mobile-first</p>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block small">Username</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block small">Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            {err && <div className="text-red-600 text-sm">{err}</div>}
            <div className="flex justify-end">
              <button className="btn bg-black text-white">Login</button>
            </div>
            <div className="text-xs text-gray-400">Use <strong>adit/mumbai</strong> or <strong>ancia/alberta</strong></div>
          </form>
        </div>
      </div>
    </div>
  )
}
