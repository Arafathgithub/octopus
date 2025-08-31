import React from 'react'
import { Button, Stack } from '@mui/material'

export default function ActionToolbar({ onSave, onLoad, onRun, onToggleLogs }){
  return (
    <Stack direction="row" spacing={1}>
      <Button color="inherit" onClick={onSave}>Save</Button>
      <Button color="inherit" onClick={onLoad}>Load</Button>
      <Button color="inherit" onClick={onRun}>Run</Button>
      <Button color="inherit" onClick={onToggleLogs}>Logs</Button>
    </Stack>
  )
}
