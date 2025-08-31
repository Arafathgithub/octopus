import React from 'react'
import { List, ListItem, ListItemButton, ListItemText, Divider, Typography, IconButton, Box } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

export default function Sidebar({ steps = ["Data Ingest","Split","Train","Evaluate"], onToggle }){
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.setData('application/reactflow-label', label)
    event.dataTransfer.effectAllowed = 'move'
  }

  // Normalize steps to an array. Accept either an array or an object (e.g. {id:..., name:...})
  const stepList = Array.isArray(steps) ? steps : (steps ? Object.values(steps) : [])

  return (
    <div style={{ padding: 12 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle1" gutterBottom>Steps</Typography>
        <IconButton size="small" onClick={onToggle} aria-label="toggle sidebar">
          <ChevronLeftIcon />
        </IconButton>
      </Box>
      <List>
        {stepList.map((s, i)=> {
          const id = (s && s.id) ? s.id : `step-${i}`
          const label = (s && (s.name || s.label)) ? (s.name || s.label) : String(s)
          return (
            <React.Fragment key={id}>
              <ListItem disablePadding>
                <ListItemButton draggable onDragStart={(e)=>onDragStart(e,'mlNode',label)}>
                  <ListItemText primary={label} />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          )
        })}
      </List>
    </div>
  )
}
