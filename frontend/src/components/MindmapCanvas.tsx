import React, { useState, useRef } from 'react';
import { useToast } from './ui/ToastNotification';
import './MindmapCanvas.css';

interface Node {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

const MindmapCanvas: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', x: 400, y: 300, text: 'Central Idea', color: '#667eea' }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const handleNodeMouseDown = (nodeId: string) => {
    setIsDragging(true);
    setDraggedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggedNode && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setNodes(prev => prev.map(node => 
        node.id === draggedNode ? { ...node, x, y } : node
      ));
    }
  };

  const handleMouseUp = () => {
    if (isDragging && draggedNode) {
      toast.info('Node position updated', { duration: 1500 });
    }
    setIsDragging(false);
    setDraggedNode(null);
  };

  const addNode = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const newNode: Node = {
        id: Date.now().toString(),
        x,
        y,
        text: 'New Node',
        color: '#764ba2'
      };

      setNodes(prev => [...prev, newNode]);
      toast.success('New node added!', {
        duration: 2000,
        action: { label: 'Undo', onClick: () => removeLastNode() }
      });
    }
  };

  const removeLastNode = () => {
    setNodes(prev => {
      if (prev.length > 1) {
        const updated = prev.slice(0, -1);
        toast.info('Node removed', { duration: 1500 });
        return updated;
      } else {
        toast.warning('Cannot remove the central node', { duration: 2000 });
        return prev;
      }
    });
  };

  const handleNodeDoubleClick = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newText = prompt('Edit node text:', 
      nodes.find(n => n.id === nodeId)?.text || 'New Node'
    );
    
    if (newText && newText.trim()) {
      setNodes(prev => prev.map(node => 
        node.id === nodeId ? { ...node, text: newText.trim() } : node
      ));
      toast.success('Node text updated!', { duration: 2000 });
    } else if (newText === '') {
      toast.warning('Node text cannot be empty', { duration: 2000 });
    }
  };

  const handleNodeRightClick = (nodeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (nodes.length > 1) {
      setNodes(prev => prev.filter(node => node.id !== nodeId));
      toast.info('Node deleted', {
        duration: 3000,
        action: { label: 'Undo', onClick: () => {
          // In a real app, you'd store the deleted node to restore it
          toast.info('Undo functionality would restore the node');
        }}
      });
    } else {
      toast.warning('Cannot delete the central node', { duration: 2000 });
    }
  };

  const clearAllNodes = () => {
    if (nodes.length > 1) {
      const backup = [...nodes];
      setNodes([nodes[0]]);  // Keep only the central node
      toast.info('All nodes cleared except central node', {
        duration: 4000,
        action: { label: 'Restore All', onClick: () => {
          setNodes(backup);
          toast.success('All nodes restored!');
        }}
      });
    } else {
      toast.info('Only central node remains', { duration: 2000 });
    }
  };

  const saveCanvas = () => {
    try {
      const canvasData = JSON.stringify(nodes);
      localStorage.setItem('mindmap-canvas', canvasData);
      toast.success('Canvas saved successfully!', {
        duration: 3000,
        action: { label: 'Export', onClick: () => {
          const blob = new Blob([canvasData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'mindmap.json';
          a.click();
          toast.info('Mindmap exported to file');
        }}
      });
    } catch (error) {
      toast.error('Failed to save canvas', { duration: 3000 });
    }
  };

  const loadCanvas = () => {
    try {
      const savedData = localStorage.getItem('mindmap-canvas');
      if (savedData) {
        const parsedNodes = JSON.parse(savedData);
        setNodes(parsedNodes);
        toast.success('Canvas loaded successfully!', { duration: 3000 });
      } else {
        toast.warning('No saved canvas found', { duration: 2000 });
      }
    } catch (error) {
      toast.error('Failed to load canvas', { duration: 3000 });
    }
  };

  return (
    <div 
      className="mindmap-canvas"
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={addNode}
    >
      <div className="instructions">
        <div className="instruction-text">
          Double-click to add nodes • Drag nodes to move them • Double-click nodes to edit • Right-click to delete
        </div>
        <div className="canvas-controls">
          <button onClick={saveCanvas} className="control-btn save-btn">Save</button>
          <button onClick={loadCanvas} className="control-btn load-btn">Load</button>
          <button onClick={clearAllNodes} className="control-btn clear-btn">Clear</button>
        </div>
      </div>
      
      {nodes.map(node => (
        <div
          key={node.id}
          className="mindmap-node"
          style={{
            left: node.x - 60,
            top: node.y - 30,
            backgroundColor: node.color
          }}
          onMouseDown={() => handleNodeMouseDown(node.id)}
          onDoubleClick={(e) => handleNodeDoubleClick(node.id, e)}
          onContextMenu={(e) => handleNodeRightClick(node.id, e)}
        >
          {node.text}
        </div>
      ))}
    </div>
  );
};

export default MindmapCanvas;