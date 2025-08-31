import React from 'react'
import { CssBaseline, Box } from '@mui/material'
import Orchestrator from './components/Orchestrator'

export default function App(){
  return (
    <>
      <CssBaseline />
      <Box sx={{ height: '100vh', bgcolor: '#f5f7fa' }}>
        <Orchestrator />
      </Box>
    </>
  )
}
