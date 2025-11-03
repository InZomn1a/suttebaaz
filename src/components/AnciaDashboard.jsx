import React, { useEffect, useState } from 'react'
import Clock from './Clock'
import MessageBox from './MessageBox'
import { readBin, writeBin } from '../utils/jsonbin'
import { JSONBIN } from '../config'
import toast from 'react-hot-toast'

export default function AnciaDashboard({ user, onLogout }){
  const [logs, setLogs] = useState([])
  const [message, setMessage] = useState('')
  const [gif, setGif] = useState('')
  const [todayCount, setTodayCount] = useState(0)
  const [messages, setMessages] = useState([])
  const [syncing, setSyncing] = useState(false)

  useEffect(()=>{
    const local = JSON.parse(localStorage.getItem('smoketrack_data') || '{}')
    if(local.logs) setLogs(local.logs)
    if(local.reactions) setMessages(local.reactions)
  },[])

  useEffect(()=>{
    const q = setInterval(async ()=>{
      if(!JSONBIN.BIN_ID || !JSONBIN.API_KEY) return
      setSyncing(true)
      try{
        const remote = await readBin()
        if(remote.logs) setLogs(remote.logs)
        if(remote.reactions) setMessages(remote.reactions)
        localStorage.setItem('smoketrack_data', JSON.stringify(remote))
      }catch(err){ console.error('sync err', err) }
      setSyncing(false)
    }, JSONBIN.POLL_INTERVAL || 5000)
    return ()=> clearInterval(q)
  },[])

  useEffect(()=>{
    const today = new Date().toISOString().slice(0,10)
    const sum = (logs || []).filter(l=> l.date === today).reduce((s,i)=>s + (i.cigarettes||0),0)
    setTodayCount(sum)
  },[logs])

  async function sendReaction(e){
    e?.preventDefault()
    const newMsg = { from: 'Ancia', text: message || null, gif: gif || null, time: new Date().toLocaleTimeString() }
    const newMessages = [newMsg, ...(messages || [])]
    setMessages(newMessages)
    localStorage.setItem('smoketrack_data', JSON.stringify({ ...JSON.parse(localStorage.getItem('smoketrack_data')||'{}'), logs, reactions: newMessages }))
    setMessage(''); setGif('')
    toast.success('Sent ✅')

    if(JSONBIN.BIN_ID && JSONBIN.API_KEY){
      try{
        const remote = await readBin().catch(()=> ({}))
        const merged = { ...remote, logs, reactions: newMessages, punishments: remote.punishments || [] }
        await writeBin(merged)
      }catch(err){ console.error('write err', err); toast.error('Sync failed') }
    }
  }

  async function sendPunishment(e){
    e?.preventDefault()
    const pun = { from: 'Ancia', message: message || 'Punishment', gif: gif || null, time: new Date().toLocaleTimeString() }
    if(JSONBIN.BIN_ID && JSONBIN.API_KEY){
      try{
        const remote = await readBin().catch(()=> ({}))
        const punishments = remote.punishments ? [...remote.punishments, pun] : [pun]
        const merged = { ...remote, logs, reactions: messages || [], punishments }
        await writeBin(merged)
        toast.success('Punishment sent')
      }catch(err){ console.error(err); toast.error('fail') }
    } else {
      toast.error('JSONBin not configured')
    }
  }

  return (
    <div className='min-h-screen p-4'>
      <div className='header'>
        <div className='flex items-center gap-3'>
          <div className='text-lg font-semibold'>Ancia</div>
          <div className='small text-gray-500'>Alberta</div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='small'>Sync: {syncing ? 'on' : 'idle'}</div>
          <button onClick={onLogout} className='px-2 py-1 border rounded'>Logout</button>
        </div>
      </div>

      <div className='max-w-2xl mx-auto py-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <div className='card'>
            <div className='small'>Alberta (You)</div>
            <div className='text-xl font-medium'>{new Date().toLocaleString('en-US',{timeZone:'America/Edmonton', hour:'2-digit', minute:'2-digit'})}</div>
            <div className='text-xs text-gray-400'>Time shown</div>
          </div>
          <div className='card'>
            <div className='small'>Mumbai (Adit)</div>
            <div className='text-xl font-medium'>{new Date().toLocaleTimeString()}</div>
            <div className='text-xs text-gray-400'>Time shown</div>
          </div>
          <div className='card text-center'>
            <div className='small'>Today (Adit)</div>
            <div className='text-lg font-medium'>{todayCount} cigarette(s)</div>
            <div className='text-xs text-gray-400'>Punishment option appears only if Adit breaks 1/day</div>
          </div>
        </div>

        <form onSubmit={sendReaction} className='card mb-4 space-y-3'>
          <h3 className='font-semibold'>Send reaction (text or GIF)</h3>
          <div>
            <label className='small'>Text</label>
            <input value={message} onChange={e=>setMessage(e.target.value)} className='w-full border rounded px-3 py-2' placeholder='Say something' />
          </div>
          <div>
            <label className='small'>GIF URL</label>
            <input value={gif} onChange={e=>setGif(e.target.value)} className='w-full border rounded px-3 py-2' placeholder='https://media.giphy.com/...' />
          </div>
          <div className='flex justify-end'>
            <button className='btn bg-black text-white'>Send</button>
          </div>
        </form>

        {todayCount > 1 && (
          <div className='card mb-4'>
            <h3 className='font-semibold mb-2'>Punishment</h3>
            <p className='small mb-2'>Send a punishment message that will pop up on Adit's screen.</p>
            <form onSubmit={sendPunishment} className='space-y-2'>
              <div>
                <label className='small'>Punishment text</label>
                <input value={message} onChange={e=>setMessage(e.target.value)} className='w-full border rounded px-3 py-2' placeholder='e.g. No gaming for 2 days' />
              </div>
              <div>
                <label className='small'>GIF URL (optional)</label>
                <input value={gif} onChange={e=>setGif(e.target.value)} className='w-full border rounded px-3 py-2' placeholder='gif link' />
              </div>
              <div className='flex justify-end'>
                <button className='btn bg-red-600 text-white'>Send punishment</button>
              </div>
            </form>
          </div>
        )}

        <div className='card'>
          <h3 className='font-semibold mb-3'>Adit's history</h3>
          <div className='space-y-3'>
            {logs.map(l=> (
              <div key={l.id} className='border rounded p-3 flex justify-between items-center'>
                <div>
                  <div className='small'>{new Date(l.ts).toLocaleString()}</div>
                  <div className='font-medium'>Cigarettes: {l.cigarettes} • Amount: ₹{l.amount}</div>
                  <div className='text-xs text-gray-400'>By: {l.by}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='card mt-4'>
          <h3 className='font-semibold mb-3'>Messages</h3>
          <MessageBox items={messages} />
        </div>
      </div>
    </div>
  )
}
