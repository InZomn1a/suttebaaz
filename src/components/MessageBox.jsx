import React from 'react'

export default function MessageBox({ items }){
  if(!items || items.length === 0) return <div className='small text-center py-4'>No messages yet</div>
  return (
    <div className='space-y-2'>
      {items.map((m,i)=> (
        <div key={i} className='p-3 rounded border bg-white/60'>
          <div className='text-xs text-gray-500'>{m.from} • {m.time}</div>
          <div className='mt-1'>{m.text}</div>
          {m.gif && <img src={m.gif} alt='gif' className='mt-2 max-h-36 w-full object-contain rounded'/>}
        </div>
      ))}
    </div>
  )
}
