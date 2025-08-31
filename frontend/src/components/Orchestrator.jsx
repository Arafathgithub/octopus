import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Box, Drawer, IconButton, Typography, AppBar, Toolbar as MUIToolbar } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import axios from 'axios'

import SidebarList from './Sidebar'
import MLNode from './MLNode'
import NodeProperties from './NodeProperties'
import ActionToolbar from './Toolbar'
import LogsPanel from './LogsPanel'

const initialNodes = [
  { id: '1', type: 'mlNode', data: { label: 'Start' }, position: { x: 250, y: 5 } },
]

export default function Orchestrator(){
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [reactFlowInstance, setReactFlowInstance] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [steps, setSteps] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [logsOpen, setLogsOpen] = useState(false)
  const idCounter = useRef(2)

  useEffect(()=>{
    axios.get('http://127.0.0.1:8000/api/steps').then(res=>setSteps(res.data)).catch(()=>{
      // fallback: local list
      setSteps(["ingest","split","train","evaluate"])
    })
  },[])

  const nodeTypes = useMemo(() => ({ mlNode: MLNode }), [])

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges])

  const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }, [])

  const onDrop = useCallback((event) => {
    event.preventDefault()
    if (!reactFlowInstance) return
    const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect()
    const type = event.dataTransfer.getData('application/reactflow')
    const label = event.dataTransfer.getData('application/reactflow-label')
    if (!type) return
    const position = reactFlowInstance.project({ x: event.clientX - reactFlowBounds.left, y: event.clientY - reactFlowBounds.top })
    const newNode = { id: `${idCounter.current++}`, type, position, data: { label, props: {} } }
    setNodes((nds) => nds.concat(newNode))
  }, [reactFlowInstance, setNodes])

  const onNodeClick = useCallback((event, node) => { setSelectedNode(node) }, [])

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject()
      localStorage.setItem('flow', JSON.stringify(flow))
      alert('Pipeline saved to localStorage')
    }
  }, [reactFlowInstance])

  const onLoad = useCallback(() => {
    const flow = JSON.parse(localStorage.getItem('flow') || 'null')
    if (flow) {
      setNodes(flow.nodes || [])
      setEdges(flow.edges || [])
      setTimeout(()=>reactFlowInstance?.fitView(), 100)
    } else alert('No saved pipeline found')
  }, [reactFlowInstance, setNodes, setEdges])

  const runPipeline = useCallback(async ()=>{
    if (!reactFlowInstance) return
    const flow = reactFlowInstance.toObject()
    try{
      await axios.post('http://127.0.0.1:8000/api/run', { flow })
      setLogsOpen(true)
    }catch(err){
      console.error(err)
      alert('Failed to start pipeline')
    }
  },[reactFlowInstance])

  return (
    <Box sx={{ height: '100%' }}>
      <AppBar position="static">
        <MUIToolbar>
          <IconButton color="inherit" edge="start" onClick={()=>setDrawerOpen(o=>!o)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>MLflow Pipeline Orchestrator</Typography>
          <ActionToolbar onSave={onSave} onLoad={onLoad} onRun={runPipeline} onToggleLogs={()=>setLogsOpen(s=>!s)} />
        </MUIToolbar>
      </AppBar>

      <Box sx={{ display: 'flex', height: 'calc(100% - 64px)' }}>
        <Drawer variant="persistent" open={drawerOpen} sx={{ width: 280, '& .MuiDrawer-paper': { width: 280, boxSizing: 'border-box' } }}>
          <SidebarList steps={steps} onToggle={()=>setDrawerOpen(false)} />
        </Drawer>

        <Box ref={reactFlowWrapper} sx={{ flexGrow: 1, position: 'relative' }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              onNodeClick={onNodeClick}
            >
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </ReactFlowProvider>
        </Box>

        <Drawer anchor="right" variant="persistent" open={Boolean(selectedNode)} sx={{ '& .MuiDrawer-paper': { width: 360 } }}>
          <NodeProperties node={selectedNode} onClose={()=>setSelectedNode(null)} onUpdate={(n)=>{
            setNodes((nds)=>nds.map(x=> x.id===n.id? n: x))
            setSelectedNode(n)
          }} />
        </Drawer>

      </Box>

      <LogsPanel open={logsOpen} onClose={()=>setLogsOpen(false)} />
    </Box>
  )
}
