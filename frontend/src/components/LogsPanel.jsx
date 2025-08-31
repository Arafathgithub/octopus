import React, { useEffect, useState } from 'react'
import { Drawer, Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

export default function LogsPanel({ open=false, onClose }){
  const [lines, setLines] = useState([])

  useEffect(()=>{
    let ws
    if(open){
      ws = new WebSocket((location.protocol==='https:'? 'wss://' : 'ws://') + '127.0.0.1:8000' + '/ws/logs')
      ws.onmessage = (e)=>{
        setLines(l=>[...l, e.data])
      }
      ws.onopen = ()=> setLines(['Connected to logs stream...'])
    }
    return ()=>{ ws?.close() }
  },[open])

  return (
    <Drawer anchor="bottom" open={open} onClose={onClose}>
      <Box sx={{ p:2, height: 300, overflow: 'auto' }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography variant="h6">Pipeline Logs</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ mt:1, fontFamily: 'monospace', fontSize: 12 }}>
          {lines.map((l,i)=> <div key={i}>{l}</div>)}
        </Box>
      </Box>
    </Drawer>
  )
}
