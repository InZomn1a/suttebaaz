import React, { useEffect, useState } from 'react'

export default function Clock({ timeZone, label }){
  const [now, setNow] = useState(new Date())
  useEffect(()=>{
    const t = setInterval(()=> setNow(new Date()), 1000)
    return ()=> clearInterval(t)
  },[])

  const timeStr = new Intl.DateTimeFormat([], { hour:'2-digit', minute:'2-digit', timeZone }).format(now)
  const dateStr = new Intl.DateTimeFormat([], { year:'numeric', month:'short', day:'numeric', timeZone }).format(now)

  return (
    <div className="text-center">
      <div className="small">{label}</div>
      <div className="text-lg font-medium">{timeStr}</div>
      <div className="text-xs text-gray-400">{dateStr}</div>
    </div>
  )
}
