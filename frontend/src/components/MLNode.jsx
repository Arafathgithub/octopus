import React, { memo } from 'react'
import { Handle, Position } from 'reactflow'

export default memo(({ data }) => {
  return (
    <div style={{ padding: 10, borderRadius: 8, border: '2px solid #1a192b', background: '#fff', width: 160, textAlign: 'center' }}>
      <Handle type="target" position={Position.Top} />
      <div>{data?.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  )
})
