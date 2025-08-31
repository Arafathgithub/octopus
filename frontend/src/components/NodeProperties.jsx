import React, { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button } from '@mui/material'

export default function NodeProperties({ node, onClose, onUpdate }){
  const [state, setState] = useState({})
  useEffect(()=>{ if(node) setState(node.data?.props || {}) }, [node])
  if(!node) return null

  const save = ()=>{
    const updated = { ...node, data: { ...node.data, props: state } }
    onUpdate(updated)
    onClose()
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">{node.data?.label}</Typography>
      <TextField label="parameter1" value={state.parameter1 || ''} onChange={(e)=>setState(s=>({ ...s, parameter1: e.target.value }))} fullWidth sx={{ mt:2 }} />
      <TextField label="parameter2" value={state.parameter2 || ''} onChange={(e)=>setState(s=>({ ...s, parameter2: e.target.value }))} fullWidth sx={{ mt:2 }} />
      <Box sx={{ display:'flex', gap:1, mt:2 }}>
        <Button variant="contained" onClick={save}>Save</Button>
        <Button variant="outlined" onClick={onClose}>Cancel</Button>
      </Box>
    </Box>
  )
}
