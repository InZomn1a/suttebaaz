import React, { useEffect, useState } from 'react'
import Clock from './Clock'
import MessageBox from './MessageBox'
import PunishmentModal from './PunishmentModal'
import { readBin, writeBin } from '../utils/jsonbin'
import { JSONBIN } from '../config'
import toast from 'react-hot-toast'

export default function AditDashboard({ user, onLogout }){
  const [amount, setAmount] = useState('')
  const [logs, setLogs] = useState([])
  const [todayCount, setTodayCount] = useState(0)
  const [messages, setMessages] = useState([])
  const [punishment, setPunishment] = useState(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(()=>{
    const local = JSON.parse(localStorage.getItem('smoketrack_data') || '{}')
    if(local.logs) setLogs(local.logs)
    if(local.reactions) setMessages(local.reactions)
    const ap = local.activePunishment || null
    if(ap) setPunishment(ap)
  },[])

  useEffect(()=>{
    const today = new Date().toISOString().slice(0,10)
    const sum = (logs || []).filter(l=> l.date === today).reduce((s,i)=>s + (i.cigarettes||0),0)
    setTodayCount(sum)
  },[logs])

  useEffect(()=>{
    let mounted = true
    async function poll(){
      if(!JSONBIN.BIN_ID || !JSONBIN.API_KEY) return
      setSyncing(true)
      try{
        const remote = await readBin()
        if(remote.logs) setLogs(remote.logs)
        if(remote.reactions) setMessages(remote.reactions)
        if(remote.punishments && remote.punishments.length){
          const latest = remote.punishments[remote.punishments.length-1]
          setPunishment(latest)
          localStorage.setItem('activePunishment', JSON.stringify(latest))
        }
        localStorage.setItem('smoketrack_data', JSON.stringify(remote))
      }catch(err){ console.error('sync err', err) }
      setSyncing(false)
      if(mounted) setTimeout(poll, JSONBIN.POLL_INTERVAL || 5000)
    }
    poll()
    return ()=> { mounted = false }
  },[])

  async function addCig(e){
    e?.preventDefault()
    const payload = {
      id: Date.now(),
      cigarettes: 1,
      amount: Number(amount) || 0,
      ts: new Date().toISOString(),
      time: new Date().toLocaleTimeString(),
      date: new Date().toISOString().slice(0,10),
      by: 'adit'
    }
    if(todayCount >= 1){
      if(!confirm('You have reached the daily limit (1). Continue?')) return
    }
    const newLogs = [payload, ...logs]
    setLogs(newLogs)
    localStorage.setItem('smoketrack_data', JSON.stringify({ ...JSON.parse(localStorage.getItem('smoketrack_data')||'{}'), logs: newLogs, reactions: messages }))
    setAmount('')
    toast.success('Logged successfully')

    if(JSONBIN.BIN_ID && JSONBIN.API_KEY){
      try{
        const remote = await readBin().catch(()=> ({}))
        const merged = { ...remote, logs: newLogs, reactions: messages || [], punishments: remote.punishments || [] }
        await writeBin(merged)
      }catch(err){ console.error('write err', err); toast.error('Sync failed') }
    }
  }

  return (
    <div className='min-h-screen p-4'>
      <div className='header'>
        <div className='flex items-center gap-3'>
          <div className='text-lg font-semibold'>Adit</div>
          <div className='small text-gray-500'>Mumbai</div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='small'>Sync: {syncing ? 'on' : 'idle'}</div>
          <button onClick={onLogout} className='px-2 py-1 border rounded'>Logout</button>
        </div>
      </div>

      <div className='max-w-2xl mx-auto py-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div className='card'>
            <div className='small'>Mumbai (You)</div>
            <div className='text-xl font-medium'>{new Date().toLocaleTimeString()}</div>
            <div className='text-xs text-gray-400'>{new Date().toLocaleDateString()}</div>
          </div>
          <div className='card'>
            <div className='small'>Alberta (Ancia)</div>
            <div className='text-xl font-medium'>{new Date().toLocaleString('en-US',{timeZone:'America/Edmonton', hour:'2-digit', minute:'2-digit'})}</div>
            <div className='text-xs text-gray-400'>Time shown</div>
          </div>
          <div className='card text-center'>
            <div className='small'>Today</div>
            <div className='text-lg font-medium'>{todayCount} cigarette(s)</div>
            <div className='text-xs text-gray-400'>Warn after 1 — you can continue</div>
          </div>
        </div>

        <form onSubmit={addCig} className='card mb-4'>
          <div className='flex gap-3 items-end'>
            <div className='flex-1'>
              <label className='small'>Amount spent (₹)</label>
              <input value={amount} onChange={e=>setAmount(e.target.value)} className='w-full border rounded px-3 py-2' placeholder='e.g. 150' />
            </div>
            <div>
              <button type='submit' className='btn bg-black text-white'>Log cigarette</button>
            </div>
          </div>
        </form>

        <div className='card mb-4'>
          <h3 className='font-semibold mb-2'>Messages & Reactions</h3>
          <MessageBox items={messages} />
        </div>

        <div className='card'>
          <h3 className='font-semibold mb-2'>History</h3>
          <div className='space-y-2'>
            {logs.map(l=> (
              <div key={l.id} className='p-2 border rounded flex justify-between items-center'>
                <div>
                  <div className='small'>{new Date(l.ts).toLocaleString()}</div>
                  <div className='font-medium'>Cigarettes: {l.cigarettes} • Amount: ₹{l.amount}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PunishmentModal item={punishment} />
    </div>
  )
}
