# SessionManager Component

A comprehensive React component for managing session data with save/load functionality, built specifically for the Future Mindmap application.

## Features

- **Save/Load Sessions**: Full integration with the existing session API infrastructure
- **Local Storage Support**: Offline session management with compression and optional encryption
- **Multiple Session Types**: Support for mindmap, project, research, planning, brainstorming, and analysis sessions
- **Auto-save**: Configurable automatic saving with conflict resolution
- **Export/Import**: Multiple format support (JSON, CSV, XML, HTML, Markdown)
- **Collaboration**: Integration with existing collaborative features
- **Validation**: Built-in session data validation and integrity checking
- **Search & Filter**: Advanced session discovery and organization
- **Version Control**: Basic version management and backup creation

## Quick Start

### Basic Usage

```tsx
import React, { useState } from 'react';
import { SessionManager } from './components/session/SessionManager';

function App() {
  const [currentData, setCurrentData] = useState({
    name: 'My Mindmap',
    type: 'mindmap',
    nodes: [],
    connections: []
  });

  return (
    <div>
      <SessionManager
        currentSessionData={currentData}
        defaultSessionType="mindmap"
        autoSave={true}
        autoSaveInterval={30000}
        onSessionChange={(session) => {
          console.log('Session changed:', session);
        }}
        onError={(error) => {
          console.error('Session error:', error);
        }}
      />
    </div>
  );
}
```

### Using the Hook

```tsx
import React from 'react';
import { useSessionManager } from '../hooks/useSessionManager';

function MyComponent() {
  const {
    sessions,
    currentSession,
    isLoading,
    saveSession,
    loadSession,
    searchSessions
  } = useSessionManager();

  const handleSave = async () => {
    const result = await saveSession(mySessionData, {
      autoSave: true,
      compression: 'gzip',
      createBackup: true
    });
    
    if (result.success) {
      console.log('Session saved successfully!');
    }
  };

  return (
    <div>
      <button onClick={handleSave} disabled={isLoading}>
        Save Session
      </button>
      
      <div>
        {sessions.map(session => (
          <div key={session.id}>
            {session.name} - {session.type}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Component Props

### SessionManagerProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `currentSessionData` | `Record<string, unknown>` | - | Current session data to manage |
| `currentSessionId` | `string` | - | ID of current session if editing existing |
| `defaultSessionType` | `SessionType` | `'mindmap'` | Default type for new sessions |
| `autoSave` | `boolean` | `true` | Enable automatic saving |
| `autoSaveInterval` | `number` | `30000` | Auto-save interval in milliseconds |
| `enableCollaboration` | `boolean` | `true` | Show collaborative features |
| `enableImportExport` | `boolean` | `true` | Show import/export features |
| `maxSessions` | `number` | `50` | Maximum sessions to display |
| `defaultFilter` | `SessionFilter` | `'all'` | Default filter for session list |
| `onSave` | `Function` | - | Custom save handler |
| `onLoad` | `Function` | - | Custom load handler |
| `onSessionChange` | `Function` | - | Session selection change handler |
| `onError` | `Function` | - | Error handler |

## Session Types

```tsx
type SessionType = 
  | 'mindmap'      // Mind mapping sessions
  | 'project'      // Project management
  | 'research'     // Research and analysis
  | 'planning'     // Planning and strategy
  | 'brainstorming' // Ideation sessions
  | 'analysis'     // Data analysis
  | 'presentation' // Presentation content
  | 'workflow'     // Process workflows
  | 'template';    // Reusable templates
```

## API Integration

The SessionManager leverages the existing API infrastructure:

- **Save API**: Uses `saveSession`, `saveMindmapSession`, `saveProjectSession` functions
- **Load API**: Uses `loadSession`, `loadSessionFull`, `getUserSessions` functions
- **Session Store**: Integrates with `useSession` hook and session management infrastructure

## Local Storage

### Features
- **Compression**: LZW compression for efficient storage
- **Encryption**: Basic XOR encryption (demo purposes)
- **Quota Management**: Automatic cleanup of old sessions
- **Backup System**: Automatic backup creation before saves
- **Validation**: Data integrity checking

### Usage

```tsx
import { SessionStorageUtil } from '../utils/sessionStorage';

// Save to local storage
const result = SessionStorageUtil.saveSession('session-id', sessionData, {
  compress: true,
  encrypt: false,
  backup: true
});

// Load from local storage
const loadResult = SessionStorageUtil.loadSession('session-id');
if (loadResult.success) {
  console.log('Loaded:', loadResult.data);
}

// Get storage statistics
const stats = SessionStorageUtil.getStorageStats();
console.log(`Using ${stats.usagePercentage}% of available storage`);
```

## Export/Import

### Supported Formats
- **JSON**: Complete data preservation
- **CSV**: Tabular data export (flattened structure)
- **XML**: Structured markup format
- **HTML**: Human-readable web format
- **Markdown**: Documentation-friendly format

### Export Example

```tsx
import { SessionExportImport } from '../utils/sessionExportImport';

// Export single session
const exportResult = await SessionExportImport.exportSession('session-id', {
  format: 'json',
  includeMetadata: true,
  compressed: false,
  filename: 'my-session-export.json'
});

if (exportResult.success) {
  SessionExportImport.downloadExport(exportResult);
}

// Batch export
const batchResult = await SessionExportImport.batchExport(
  ['session-1', 'session-2', 'session-3'],
  { format: 'json' }
);
```

### Import Example

```tsx
// Import from JSON
const importResult = await SessionExportImport.importSession(jsonContent, {
  source: 'file',
  validation: 'strict',
  conflictResolution: 'overwrite',
  sessionName: 'Imported Session'
});

if (importResult.success) {
  console.log('Imported session ID:', importResult.data.sessionId);
}
```

## Validation

Built-in validation ensures data integrity:

```tsx
import { useSessionManager } from '../hooks/useSessionManager';

const { validateSession } = useSessionManager();

const validation = validateSession(sessionData);

if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
  console.log('Warnings:', validation.warnings);
  console.log('Integrity score:', validation.integrityScore);
}
```

## Advanced Features

### Custom Save Handler

```tsx
<SessionManager
  onSave={async (sessionData, options) => {
    // Custom save logic
    const response = await myCustomSaveAPI(sessionData);
    return {
      success: response.success,
      data: response.data,
      error: response.error
    };
  }}
/>
```

### Search and Filtering

```tsx
const { searchSessions } = useSessionManager();

const results = await searchSessions({
  query: 'mindmap',
  types: ['mindmap', 'project'],
  dateRange: {
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    field: 'lastModified'
  }
}, {
  limit: 20,
  sortBy: 'lastModified',
  sortOrder: 'desc'
});
```

### Auto-save Configuration

```tsx
const { setupAutoSave, clearAutoSave } = useSessionManager();

// Setup auto-save every 30 seconds
setupAutoSave(sessionData, sessionId, 30000);

// Clear auto-save when component unmounts
useEffect(() => {
  return () => clearAutoSave();
}, [clearAutoSave]);
```

## Styling

The component includes comprehensive CSS styling. Import the styles:

```tsx
import './SessionManager.css';
```

### CSS Classes
- `.session-manager` - Main container
- `.session-manager__header` - Header section
- `.session-card` - Individual session display
- `.modal` - Dialog modals
- `.sessions-list` - Session list container
- `.session-item` - Individual session in list

### Customization

```css
/* Override default styles */
.session-manager {
  --primary-color: #667eea;
  --background-color: #ffffff;
  --border-color: #e2e8f0;
  --text-color: #1a202c;
}
```

## Integration with Existing Hooks

The SessionManager integrates seamlessly with existing session management:

```tsx
import { useSession, useNotificationSystem } from '../hooks/useSessionStore';

function MySessionComponent() {
  const { auth, connectivity } = useSession();
  const { showSuccess, showError } = useNotificationSystem();
  
  return (
    <SessionManager
      onSuccess={(message) => showSuccess('Success', message)}
      onError={(error) => showError('Error', error)}
    />
  );
}
```

## Error Handling

Comprehensive error handling with detailed error codes:

```tsx
const errorCodes = {
  'VALIDATION_ERROR': 'Data validation failed',
  'STORAGE_QUOTA_EXCEEDED': 'Storage limit reached',
  'SESSION_NOT_FOUND': 'Session could not be found',
  'SAVE_ERROR': 'Failed to save session',
  'LOAD_ERROR': 'Failed to load session',
  'EXPORT_ERROR': 'Export operation failed',
  'IMPORT_ERROR': 'Import operation failed'
};
```

## Performance Considerations

- **Lazy Loading**: Sessions loaded on demand
- **Compression**: Automatic data compression for storage
- **Caching**: In-memory caching of frequently accessed sessions
- **Debouncing**: Auto-save operations are debounced
- **Cleanup**: Automatic cleanup of old sessions to manage storage

## Browser Compatibility

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Storage**: Uses localStorage with fallback strategies
- **APIs**: Compatible with existing session management infrastructure

## Development

### Running Tests

```bash
npm test -- --testPathPattern=SessionManager
```

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint src/components/session/
```

## Contributing

1. Follow existing code patterns and TypeScript types
2. Add tests for new functionality
3. Update documentation for API changes
4. Ensure backwards compatibility with existing session infrastructure

## License

This component is part of the Future Mindmap application and follows the project's licensing terms.