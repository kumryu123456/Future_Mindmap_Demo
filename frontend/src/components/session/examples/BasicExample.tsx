/**
 * Basic SessionManager Example
 * Demonstrates simple save/load functionality
 */

import React, { useState } from 'react';
import { SessionManager } from '../SessionManager';
import '../SessionManager.css';

interface MindmapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  connections: string[];
}

interface BasicMindmapData {
  name: string;
  description?: string;
  type: 'mindmap';
  nodes: MindmapNode[];
  createdAt: string;
  lastModified: string;
}

export const BasicExample: React.FC = () => {
  const [mindmapData, setMindmapData] = useState<BasicMindmapData>({
    name: 'Sample Mindmap',
    description: 'A basic example mindmap',
    type: 'mindmap',
    nodes: [
      {
        id: 'root',
        text: 'Central Idea',
        x: 400,
        y: 300,
        connections: ['node1', 'node2']
      },
      {
        id: 'node1',
        text: 'Branch 1',
        x: 200,
        y: 200,
        connections: ['root']
      },
      {
        id: 'node2',
        text: 'Branch 2',
        x: 600,
        y: 200,
        connections: ['root']
      }
    ],
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [isEditingNode, setIsEditingNode] = useState<string | null>(null);
  const [newNodeText, setNewNodeText] = useState('');

  const handleAddNode = () => {
    if (!newNodeText.trim()) return;

    const newNode: MindmapNode = {
      id: `node_${Date.now()}`,
      text: newNodeText.trim(),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      connections: ['root']
    };

    setMindmapData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      lastModified: new Date().toISOString()
    }));

    // Update root node connections
    setMindmapData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === 'root' 
          ? { ...node, connections: [...node.connections, newNode.id] }
          : node
      )
    }));

    setNewNodeText('');
  };

  const handleEditNode = (nodeId: string, newText: string) => {
    setMindmapData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, text: newText } : node
      ),
      lastModified: new Date().toISOString()
    }));
    setIsEditingNode(null);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === 'root') return; // Don't allow deleting root

    setMindmapData(prev => ({
      ...prev,
      nodes: prev.nodes
        .filter(node => node.id !== nodeId)
        .map(node => ({
          ...node,
          connections: node.connections.filter(conn => conn !== nodeId)
        })),
      lastModified: new Date().toISOString()
    }));
  };

  const handleSessionChange = (session: any) => {
    if (session && session.id !== currentSessionId) {
      setCurrentSessionId(session.id);
      console.log('Session changed to:', session);
    }
  };

  const handleLoadSession = async (sessionId: string) => {
    // In a real implementation, this would load the session data
    // For this example, we'll simulate loading
    console.log('Loading session:', sessionId);
    
    // Update current data with loaded data
    setCurrentSessionId(sessionId);
  };

  return (
    <div className="basic-example">
      <div className="example-header">
        <h1>Basic SessionManager Example</h1>
        <p>
          This example demonstrates basic save/load functionality with a simple mindmap editor.
          Try creating some nodes, then saving your work!
        </p>
      </div>

      <div className="example-content">
        {/* Simple Mindmap Editor */}
        <div className="mindmap-editor">
          <div className="editor-header">
            <h3>Mindmap Editor</h3>
            <div className="editor-controls">
              <input
                type="text"
                value={newNodeText}
                onChange={(e) => setNewNodeText(e.target.value)}
                placeholder="Enter new node text..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddNode()}
                className="node-input"
              />
              <button onClick={handleAddNode} className="btn btn--primary">
                Add Node
              </button>
            </div>
          </div>

          <div className="mindmap-canvas">
            <div className="canvas-info">
              <strong>{mindmapData.name}</strong>
              {mindmapData.description && <p>{mindmapData.description}</p>}
              <small>
                Nodes: {mindmapData.nodes.length} | 
                Last modified: {new Date(mindmapData.lastModified).toLocaleString()}
              </small>
            </div>

            <div className="nodes-list">
              {mindmapData.nodes.map(node => (
                <div key={node.id} className={`node-item ${node.id === 'root' ? 'root-node' : ''}`}>
                  {isEditingNode === node.id ? (
                    <div className="node-edit">
                      <input
                        type="text"
                        defaultValue={node.text}
                        onBlur={(e) => handleEditNode(node.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleEditNode(node.id, (e.target as HTMLInputElement).value);
                          }
                        }}
                        autoFocus
                        className="node-edit-input"
                      />
                    </div>
                  ) : (
                    <div className="node-display">
                      <span className="node-text">{node.text}</span>
                      <div className="node-actions">
                        <button
                          onClick={() => setIsEditingNode(node.id)}
                          className="btn btn--small btn--secondary"
                        >
                          Edit
                        </button>
                        {node.id !== 'root' && (
                          <button
                            onClick={() => handleDeleteNode(node.id)}
                            className="btn btn--small btn--danger"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {node.connections.length > 0 && (
                    <small className="node-connections">
                      Connected to: {node.connections.join(', ')}
                    </small>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SessionManager Component */}
        <div className="session-manager-wrapper">
          <SessionManager
            currentSessionData={mindmapData}
            currentSessionId={currentSessionId}
            defaultSessionType="mindmap"
            autoSave={true}
            autoSaveInterval={30000}
            enableCollaboration={false}
            onSessionChange={handleSessionChange}
            onLoad={handleLoadSession}
            onSuccess={(message) => {
              console.log('Success:', message);
            }}
            onError={(error) => {
              console.error('Error:', error);
              alert(`Error: ${error}`);
            }}
          />
        </div>
      </div>

      <div className="example-footer">
        <h4>Try these actions:</h4>
        <ul>
          <li>Add some nodes to your mindmap</li>
          <li>Click "Save Session" to save your work</li>
          <li>Try loading a different session</li>
          <li>Search for sessions by name</li>
          <li>Check the auto-save status indicator</li>
        </ul>
        
        <div className="code-example">
          <details>
            <summary>View source code</summary>
            <pre>
              <code>{`// Basic SessionManager usage
<SessionManager
  currentSessionData={mindmapData}
  currentSessionId={currentSessionId}
  defaultSessionType="mindmap"
  autoSave={true}
  autoSaveInterval={30000}
  onSessionChange={(session) => {
    console.log('Session changed:', session);
  }}
  onError={(error) => {
    console.error('Session error:', error);
  }}
/>`}</code>
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BasicExample;