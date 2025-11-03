import React from 'react'

export default function PunishmentModal({ item }){
  if(!item) return null
  return (
    <div className='fixed inset-0 bg-black/40 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full'>
        <h3 className='text-lg font-semibold mb-2'>Punishment</h3>
        <p className='mb-3'>{item.message}</p>
        {item.gif && <img src={item.gif} alt='gif' className='w-full rounded mb-3'/>}
        <div className='text-xs text-gray-500'>Sent by {item.from} • {item.time}</div>
        <div className='mt-4 flex justify-end'>
          <button onClick={()=>{ window.localStorage.removeItem('activePunishment'); window.location.reload(); }} className='btn bg-black text-white'>OK</button>
        </div>
      </div>
    </div>
  )
}
