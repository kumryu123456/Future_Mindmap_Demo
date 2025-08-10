/**
 * Complete Mindmap Creation Workflow Integration Tests
 * Tests the full user journey from creating a mindmap to saving and loading sessions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';

// Mock dependencies for cleaner testing
jest.mock('../../services/api', () => ({
  createNode: jest.fn().mockResolvedValue({ success: true, data: { id: 'node-1', text: 'Test Node' } }),
  updateNode: jest.fn().mockResolvedValue({ success: true }),
  deleteNode: jest.fn().mockResolvedValue({ success: true }),
  createConnection: jest.fn().mockResolvedValue({ success: true }),
  deleteConnection: jest.fn().mockResolvedValue({ success: true }),
  saveSession: jest.fn().mockResolvedValue({ success: true, data: { sessionId: 'session-1' } }),
  loadSession: jest.fn().mockResolvedValue({ 
    success: true, 
    data: { 
      session: { 
        id: 'session-1', 
        name: 'Test Session',
        data: { nodes: [], connections: [] }
      } 
    } 
  })
}));

// Mock CSS imports
jest.mock('../../App.css', () => ({}));
jest.mock('../../components/MindmapCanvas.css', () => ({}));

describe('Complete Mindmap Creation Workflow Integration', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    
    // Mock localStorage for session persistence
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', { 
      value: localStorageMock,
      configurable: true,
      writable: true
    });

    // Mock sessionStorage with separate mock object
    const sessionStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn()
    };
    Object.defineProperty(window, 'sessionStorage', { 
      value: sessionStorageMock,
      configurable: true,
      writable: true
    });
  });

  afterEach(() => {
    // Restore original properties and clean up mocks
    try {
      delete (window as any).localStorage;
    } catch (error) {
      // Safe deletion attempt
    }
    try {
      delete (window as any).sessionStorage;
    } catch (error) {
      // Safe deletion attempt
    }
    jest.restoreAllMocks();
  });

  it('completes full mindmap creation and session management workflow', async () => {
    // Render the main application
    render(<App />);

    // Step 1: Verify initial app state
    await waitFor(() => {
      expect(screen.getByText('Future Mindmap')).toBeInTheDocument();
    });

    // Step 2: Create a new mindmap node
    const canvas = screen.getByTestId('mindmap-canvas');
    expect(canvas).toBeInTheDocument();

    // Simulate double-click to create a node
    fireEvent.doubleClick(canvas, { 
      clientX: 200, 
      clientY: 150 
    });

    await waitFor(() => {
      // Should show node creation interface or created node
      expect(screen.getByPlaceholderText('Enter node text...')).toBeInTheDocument();
    });

    // Step 3: Add content to the first node
    const nodeInput = screen.getByPlaceholderText('Enter node text...');
    await user.type(nodeInput, 'Main Idea');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Main Idea')).toBeInTheDocument();
    });

    // Step 4: Create a second node
    fireEvent.doubleClick(canvas, { 
      clientX: 350, 
      clientY: 200 
    });

    await waitFor(() => {
      const inputs = screen.getAllByPlaceholderText('Enter node text...');
      expect(inputs.length).toBeGreaterThanOrEqual(1);
    });

    const secondNodeInput = screen.getAllByPlaceholderText('Enter node text...')[0];
    await user.type(secondNodeInput, 'Sub Idea');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Sub Idea')).toBeInTheDocument();
    });

    // Step 5: Create connection between nodes
    const mainIdea = screen.getByText('Main Idea');
    const subIdea = screen.getByText('Sub Idea');

    // Simulate drag from one node to another to create connection
    fireEvent.mouseDown(mainIdea, { button: 0 });
    fireEvent.mouseMove(subIdea);
    fireEvent.mouseUp(subIdea);

    await waitFor(() => {
      // Connection should be created (check for connection visual indicator)
      const connections = screen.queryAllByTestId('node-connection');
      expect(connections.length).toBeGreaterThan(0);
    });

    // Step 6: Test node editing
    await user.click(mainIdea);
    
    // Should show editing interface
    const editInput = await waitFor(() => {
      const input = screen.queryByDisplayValue('Main Idea');
      expect(input).toBeInTheDocument();
      return input;
    });

    // Perform user interactions outside of waitFor
    await user.clear(editInput);
    await user.type(editInput, 'Updated Main Idea');
    await user.keyboard('{Enter}');

    // Step 7: Test session saving
    const saveButton = screen.getByRole('button', { name: /save/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/enter session name/i)).toBeInTheDocument();
    });

    const sessionNameInput = screen.getByPlaceholderText(/enter session name/i);
    await user.type(sessionNameInput, 'My Test Mindmap');

    const confirmSaveButton = screen.getByRole('button', { name: /save session/i });
    await user.click(confirmSaveButton);

    await waitFor(() => {
      // Should show success feedback
      expect(screen.getByText(/session saved/i)).toBeInTheDocument();
    });

    // Step 8: Test session loading
    const loadButton = screen.getByRole('button', { name: /load/i });
    await user.click(loadButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search sessions/i)).toBeInTheDocument();
    });

    // Should show available sessions
    await waitFor(() => {
      expect(screen.getByText('My Test Mindmap')).toBeInTheDocument();
    });

    const loadSessionButton = screen.getByRole('button', { name: /load session/i });
    await user.click(loadSessionButton);

    await waitFor(() => {
      // Session should be loaded successfully
      expect(screen.getByText(/session loaded/i)).toBeInTheDocument();
    });

    // Step 9: Verify mindmap state after loading
    await waitFor(() => {
      expect(screen.getByText('Updated Main Idea')).toBeInTheDocument();
      expect(screen.getByText('Sub Idea')).toBeInTheDocument();
    });

    // Step 10: Test node deletion
    const deleteButton = screen.getByLabelText(/delete node/i);
    await user.click(deleteButton);

    // Wait for confirm button to appear
    const confirmButton = await waitFor(() => {
      return screen.getByRole('button', { name: /confirm/i });
    });
    
    // Perform click outside of waitFor
    await user.click(confirmButton);

    await waitFor(() => {
      // Node should be removed
      expect(screen.queryByText('Sub Idea')).not.toBeInTheDocument();
    });
  });

  it('handles workflow errors gracefully', async () => {
    // Mock API failure
    const mockApi = require('../../services/api');
    mockApi.createNode.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Future Mindmap')).toBeInTheDocument();
    });

    const canvas = screen.getByTestId('mindmap-canvas');
    fireEvent.doubleClick(canvas, { clientX: 200, clientY: 150 });

    // Should handle error gracefully
    await waitFor(() => {
      expect(screen.getByText(/error creating node/i)).toBeInTheDocument();
    });

    // Should still allow retry
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
  });

  it('supports offline functionality', async () => {
    // Save original navigator.onLine descriptor
    const originalDescriptor = Object.getOwnPropertyDescriptor(navigator, 'onLine');
    
    // Mock offline state
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => false
    });

    // Cleanup function
    const cleanup = () => {
      if (originalDescriptor) {
        Object.defineProperty(navigator, 'onLine', originalDescriptor);
      } else {
        delete (navigator as any).onLine;
      }
    };

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/offline mode/i)).toBeInTheDocument();
    });

    // Should still allow node creation in offline mode
    const canvas = screen.getByTestId('mindmap-canvas');
    fireEvent.doubleClick(canvas, { clientX: 200, clientY: 150 });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter node text...')).toBeInTheDocument();
    });

    const nodeInput = screen.getByPlaceholderText('Enter node text...');
    await user.type(nodeInput, 'Offline Node');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByText('Offline Node')).toBeInTheDocument();
    });

    // Should show pending sync status
    expect(screen.getByText(/pending sync/i)).toBeInTheDocument();
    
    // Cleanup
    cleanup();
  });

  it('supports collaborative features', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Future Mindmap')).toBeInTheDocument();
    });

    // Enable collaboration
    const collabButton = screen.getByRole('button', { name: /collaborate/i });
    await user.click(collabButton);

    await waitFor(() => {
      expect(screen.getByText(/collaboration enabled/i)).toBeInTheDocument();
    });

    // Should show collaboration status
    expect(screen.getByText(/collaborators: 0/i)).toBeInTheDocument();

    // Should show share options
    const shareButton = screen.getByRole('button', { name: /share/i });
    await user.click(shareButton);

    await waitFor(() => {
      expect(screen.getByText(/share link/i)).toBeInTheDocument();
    });
  });

  it('handles large mindmaps efficiently', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Future Mindmap')).toBeInTheDocument();
    });

    // Create multiple nodes to test performance
    const canvas = screen.getByTestId('mindmap-canvas');
    
    const startTime = performance.now();
    
    for (let i = 0; i < 10; i++) {
      fireEvent.doubleClick(canvas, { 
        clientX: 100 + (i * 50), 
        clientY: 100 + (i * 50) 
      });

      await waitFor(() => {
        const inputs = screen.getAllByPlaceholderText('Enter node text...');
        if (inputs.length > 0) {
          return Promise.resolve();
        }
        throw new Error('Input not found');
      });

      const nodeInput = screen.getAllByPlaceholderText('Enter node text...')[0];
      await user.type(nodeInput, `Node ${i + 1}`);
      await user.keyboard('{Enter}');
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Should complete within reasonable time (10 seconds)
    expect(duration).toBeLessThan(10000);

    // All nodes should be present
    for (let i = 1; i <= 10; i++) {
      expect(screen.getByText(`Node ${i}`)).toBeInTheDocument();
    }
  });

  it('supports accessibility features', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Future Mindmap')).toBeInTheDocument();
    });

    // Check for proper ARIA labels
    const canvas = screen.getByTestId('mindmap-canvas');
    expect(canvas).toHaveAttribute('aria-label');

    // Test keyboard navigation
    canvas.focus();
    await user.keyboard('{Enter}');

    // Should create node via keyboard
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter node text...')).toBeInTheDocument();
    });

    // Test screen reader support
    const nodeInput = screen.getByPlaceholderText('Enter node text...');
    expect(nodeInput).toHaveAttribute('aria-describedby');

    await user.type(nodeInput, 'Accessible Node');
    await user.keyboard('{Enter}');

    await waitFor(() => {
      const node = screen.getByText('Accessible Node');
      expect(node).toHaveAttribute('role', 'button');
      expect(node).toHaveAttribute('aria-label');
    });
  });
});