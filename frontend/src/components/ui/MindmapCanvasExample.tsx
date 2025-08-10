import React, { useEffect, useState } from 'react';
import MindmapCanvas from './MindmapCanvasNew';
import { useMindmapStore } from '../../hooks/useMindmapStore';
import useMindmapAccessibility from '../../hooks/useMindmapAccessibility';
import type { MindmapNode, MindmapConnection } from '../../types/store';

export const MindmapCanvasExample: React.FC = () => {
  const [activeExample, setActiveExample] = useState<'basic' | 'interactive' | 'readonly' | 'custom'>('basic');
  
  const {
    createNode,
    createConnection,
    clearMindmap,
    newMindmap,
    applyTheme,
    changeLayoutType,
    theme,
    canvas,
    nodes,
    connections
  } = useMindmapStore();

  const { announceToScreenReader } = useMindmapAccessibility();

  // Create sample data
  const createSampleMindmap = () => {
    clearMindmap();
    
    // Create central node
    const centralId = 'central-node';
    createNode({
      id: centralId,
      text: 'React Flow Mindmap',
      x: 400,
      y: 300,
      type: 'central',
      color: theme.colors.primary,
      width: 200,
      height: 80
    });

    // Create main branches
    const mainBranches = [
      { id: 'features', text: 'Features', x: 600, y: 200 },
      { id: 'components', text: 'Components', x: 600, y: 300 },
      { id: 'interactions', text: 'Interactions', x: 600, y: 400 },
      { id: 'customization', text: 'Customization', x: 200, y: 250 }
    ];

    mainBranches.forEach(branch => {
      createNode({
        id: branch.id,
        text: branch.text,
        x: branch.x,
        y: branch.y,
        type: 'main',
        parentId: centralId,
        color: theme.colors.secondary,
        width: 150,
        height: 60
      });
    });

    // Create sub-nodes
    const subNodes = [
      { id: 'drag-drop', text: 'Drag & Drop', x: 750, y: 150, parentId: 'features' },
      { id: 'zoom-pan', text: 'Zoom & Pan', x: 750, y: 200, parentId: 'features' },
      { id: 'selection', text: 'Multi Selection', x: 750, y: 250, parentId: 'features' },
      
      { id: 'nodes', text: 'Custom Nodes', x: 750, y: 280, parentId: 'components' },
      { id: 'edges', text: 'Custom Edges', x: 750, y: 320, parentId: 'components' },
      
      { id: 'edit', text: 'Node Editing', x: 750, y: 380, parentId: 'interactions' },
      { id: 'connect', text: 'Node Connections', x: 750, y: 420, parentId: 'interactions' },
      
      { id: 'themes', text: 'Themes', x: 50, y: 220, parentId: 'customization' },
      { id: 'layouts', text: 'Layouts', x: 50, y: 280, parentId: 'customization' }
    ];

    subNodes.forEach(subNode => {
      createNode({
        id: subNode.id,
        text: subNode.text,
        x: subNode.x,
        y: subNode.y,
        type: 'sub',
        parentId: subNode.parentId,
        color: theme.colors.accent,
        width: 120,
        height: 50
      });
    });

    // Create some associative connections
    createConnection('features', 'components', 'associative');
    createConnection('components', 'interactions', 'dependency');
    createConnection('themes', 'layouts', 'associative');

    announceToScreenReader('Sample mindmap created');
  };

  const createLargeMindmap = () => {
    clearMindmap();
    
    // Create a larger, more complex mindmap
    const centralId = 'software-dev';
    createNode({
      id: centralId,
      text: 'Software Development',
      x: 500,
      y: 400,
      type: 'central',
      color: theme.colors.primary,
      width: 250,
      height: 100
    });

    const domains = [
      { id: 'frontend', text: 'Frontend', angle: 0, color: '#667eea' },
      { id: 'backend', text: 'Backend', angle: Math.PI / 3, color: '#764ba2' },
      { id: 'devops', text: 'DevOps', angle: 2 * Math.PI / 3, color: '#48bb78' },
      { id: 'testing', text: 'Testing', angle: Math.PI, color: '#ed8936' },
      { id: 'design', text: 'Design', angle: 4 * Math.PI / 3, color: '#f093fb' },
      { id: 'project-mgmt', text: 'Project Management', angle: 5 * Math.PI / 3, color: '#38b2ac' }
    ];

    domains.forEach(domain => {
      const radius = 250;
      const x = 500 + Math.cos(domain.angle) * radius;
      const y = 400 + Math.sin(domain.angle) * radius;
      
      createNode({
        id: domain.id,
        text: domain.text,
        x,
        y,
        type: 'main',
        parentId: centralId,
        color: domain.color,
        width: 160,
        height: 70
      });

      // Add sub-categories
      const subCategories = getSubCategoriesForDomain(domain.id);
      subCategories.forEach((subCat, index) => {
        const subAngle = domain.angle + (index - subCategories.length / 2) * 0.3;
        const subRadius = 150;
        const subX = x + Math.cos(subAngle) * subRadius;
        const subY = y + Math.sin(subAngle) * subRadius;
        
        createNode({
          id: subCat.id,
          text: subCat.text,
          x: subX,
          y: subY,
          type: 'sub',
          parentId: domain.id,
          color: domain.color,
          width: 120,
          height: 50
        });
      });
    });

    // Add cross-domain connections
    createConnection('frontend', 'backend', 'associative');
    createConnection('backend', 'devops', 'dependency');
    createConnection('testing', 'frontend', 'associative');
    createConnection('testing', 'backend', 'associative');
    createConnection('design', 'frontend', 'dependency');
    createConnection('project-mgmt', 'devops', 'associative');

    announceToScreenReader('Large software development mindmap created');
  };

  const getSubCategoriesForDomain = (domainId: string) => {
    const categories: Record<string, Array<{id: string, text: string}>> = {
      frontend: [
        { id: 'react', text: 'React' },
        { id: 'vue', text: 'Vue.js' },
        { id: 'css', text: 'CSS/SCSS' },
        { id: 'typescript', text: 'TypeScript' }
      ],
      backend: [
        { id: 'nodejs', text: 'Node.js' },
        { id: 'python', text: 'Python' },
        { id: 'databases', text: 'Databases' },
        { id: 'apis', text: 'APIs' }
      ],
      devops: [
        { id: 'docker', text: 'Docker' },
        { id: 'kubernetes', text: 'Kubernetes' },
        { id: 'cicd', text: 'CI/CD' },
        { id: 'monitoring', text: 'Monitoring' }
      ],
      testing: [
        { id: 'unit', text: 'Unit Tests' },
        { id: 'integration', text: 'Integration' },
        { id: 'e2e', text: 'E2E Testing' },
        { id: 'performance', text: 'Performance' }
      ],
      design: [
        { id: 'ux', text: 'UX Design' },
        { id: 'ui', text: 'UI Design' },
        { id: 'prototyping', text: 'Prototyping' },
        { id: 'accessibility', text: 'Accessibility' }
      ],
      'project-mgmt': [
        { id: 'agile', text: 'Agile' },
        { id: 'planning', text: 'Planning' },
        { id: 'documentation', text: 'Documentation' },
        { id: 'communication', text: 'Communication' }
      ]
    };

    return categories[domainId] || [];
  };

  // Example themes
  const exampleThemes = {
    dark: {
      id: 'dark',
      name: 'Dark Theme',
      description: 'Dark theme for better focus',
      colors: {
        primary: '#667eea',
        secondary: '#764ba2',
        accent: '#f093fb',
        background: '#1a202c',
        surface: '#2d3748',
        text: '#f7fafc',
        textSecondary: '#cbd5e0',
        border: '#4a5568',
        success: '#48bb78',
        warning: '#ed8936',
        error: '#f56565'
      },
      nodeStyles: theme.nodeStyles,
      connectionStyles: theme.connectionStyles,
      fonts: theme.fonts
    },
    nature: {
      id: 'nature',
      name: 'Nature Theme',
      description: 'Green nature-inspired theme',
      colors: {
        primary: '#38a169',
        secondary: '#2f855a',
        accent: '#68d391',
        background: '#f0fff4',
        surface: '#ffffff',
        text: '#1a202c',
        textSecondary: '#4a5568',
        border: '#c6f6d5',
        success: '#38a169',
        warning: '#d69e2e',
        error: '#e53e3e'
      },
      nodeStyles: theme.nodeStyles,
      connectionStyles: theme.connectionStyles,
      fonts: theme.fonts
    }
  };

  const handleNodeClick = (node: MindmapNode) => {
    console.log('Node clicked:', node);
    announceToScreenReader(`Clicked on ${node.text}`);
  };

  const handleConnectionClick = (connection: MindmapConnection) => {
    console.log('Connection clicked:', connection);
    announceToScreenReader(`Clicked on connection`);
  };

  const handleCanvasClick = (event: React.MouseEvent) => {
    console.log('Canvas clicked:', event);
  };

  const renderExampleControls = () => (
    <div style={{
      position: 'absolute',
      top: 10,
      left: 10,
      background: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 1000,
      minWidth: '250px'
    }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: 'bold' }}>
        Mindmap Canvas Examples
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={() => setActiveExample('basic')}
          style={{
            margin: '2px',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: activeExample === 'basic' ? '#667eea' : '#e2e8f0',
            color: activeExample === 'basic' ? 'white' : '#4a5568',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Basic
        </button>
        <button
          onClick={() => setActiveExample('interactive')}
          style={{
            margin: '2px',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: activeExample === 'interactive' ? '#667eea' : '#e2e8f0',
            color: activeExample === 'interactive' ? 'white' : '#4a5568',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Interactive
        </button>
        <button
          onClick={() => setActiveExample('readonly')}
          style={{
            margin: '2px',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: activeExample === 'readonly' ? '#667eea' : '#e2e8f0',
            color: activeExample === 'readonly' ? 'white' : '#4a5568',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Read-only
        </button>
        <button
          onClick={() => setActiveExample('custom')}
          style={{
            margin: '2px',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: activeExample === 'custom' ? '#667eea' : '#e2e8f0',
            color: activeExample === 'custom' ? 'white' : '#4a5568',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Custom
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={createSampleMindmap}
          style={{
            margin: '2px',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: '#48bb78',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Load Sample
        </button>
        <button
          onClick={createLargeMindmap}
          style={{
            margin: '2px',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: '#ed8936',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Large Example
        </button>
        <button
          onClick={clearMindmap}
          style={{
            margin: '2px',
            padding: '6px 12px',
            border: 'none',
            borderRadius: '4px',
            background: '#f56565',
            color: 'white',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Clear
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '500' }}>
          Theme:
        </label>
        <select
          onChange={(e) => {
            const selectedTheme = e.target.value;
            if (selectedTheme === 'default') {
              // Reset to default theme - would need to implement this
            } else if (exampleThemes[selectedTheme as keyof typeof exampleThemes]) {
              applyTheme(exampleThemes[selectedTheme as keyof typeof exampleThemes]);
            }
          }}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <option value="default">Default</option>
          <option value="dark">Dark</option>
          <option value="nature">Nature</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: '500' }}>
          Layout:
        </label>
        <select
          onChange={(e) => changeLayoutType(e.target.value as any)}
          style={{
            width: '100%',
            padding: '4px 8px',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <option value="radial">Radial</option>
          <option value="tree">Tree</option>
          <option value="organic">Organic</option>
          <option value="grid">Grid</option>
          <option value="manual">Manual</option>
        </select>
      </div>

      <div style={{ fontSize: '11px', color: '#718096' }}>
        <div>Nodes: {Object.keys(nodes).length}</div>
        <div>Connections: {Object.keys(connections).length}</div>
        <div>Canvas: {canvas.width}×{canvas.height}</div>
      </div>
    </div>
  );

  const renderCurrentExample = () => {
    const baseProps = {
      style: { width: '100%', height: '600px' },
      className: 'mindmap-example-canvas'
    };

    switch (activeExample) {
      case 'basic':
        return (
          <MindmapCanvas
            {...baseProps}
            showMinimap={true}
            showControls={true}
            showBackground={true}
          />
        );

      case 'interactive':
        return (
          <MindmapCanvas
            {...baseProps}
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeClick}
            onConnectionClick={handleConnectionClick}
            onCanvasClick={handleCanvasClick}
            showMinimap={true}
            showControls={true}
            showBackground={true}
          />
        );

      case 'readonly':
        return (
          <MindmapCanvas
            {...baseProps}
            readonly={true}
            showMinimap={false}
            showControls={false}
            showBackground={true}
          />
        );

      case 'custom':
        return (
          <MindmapCanvas
            {...baseProps}
            onNodeClick={handleNodeClick}
            showMinimap={false}
            showControls={true}
            showBackground={false}
            style={{
              ...baseProps.style,
              border: '2px solid #667eea',
              borderRadius: '12px'
            }}
          />
        );

      default:
        return null;
    }
  };

  // Initialize with sample data
  useEffect(() => {
    if (Object.keys(nodes).length === 0) {
      createSampleMindmap();
    }
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {renderExampleControls()}
      
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        paddingTop: '20px',
        paddingLeft: '280px', // Space for controls
        paddingRight: '20px',
        paddingBottom: '20px'
      }}>
        {renderCurrentExample()}
      </div>

      {/* Usage Instructions */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '12px',
        maxWidth: '300px',
        zIndex: 1000
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Keyboard Shortcuts:</div>
        <div>• Tab/Shift+Tab: Navigate nodes</div>
        <div>• Arrow keys: Move between connected nodes</div>
        <div>• Ctrl+Arrow: Move selected node</div>
        <div>• Enter: Edit node text</div>
        <div>• Space: Expand/collapse node</div>
        <div>• Delete: Remove selected node</div>
        <div>• Ctrl+N: Create new node</div>
        <div>• Home: Go to central node</div>
      </div>
    </div>
  );
};

export default MindmapCanvasExample;