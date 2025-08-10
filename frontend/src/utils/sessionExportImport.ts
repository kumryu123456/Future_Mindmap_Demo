/**
 * Session Export/Import Utilities
 * Handles exporting and importing session data in various formats
 */

import type { 
  SessionItem, 
  ExportFormat, 
  ExportOptions, 
  ImportOptions, 
  SessionOperationResult 
} from '../types/components/sessionManager';
import { SessionStorageUtil } from './sessionStorage';

/**
 * Export utilities for different formats
 */
class ExportUtil {
  /**
   * Export to JSON format
   */
  static exportToJSON(data: Record<string, unknown>, pretty: boolean = true): string {
    return JSON.stringify(data, null, pretty ? 2 : 0);
  }

  /**
   * Export to CSV format
   */
  static exportToCSV(data: Record<string, unknown>): string {
    try {
      const flattenObject = (obj: any, prefix = ''): Record<string, any> => {
        const flattened: Record<string, any> = {};
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            
            if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
              Object.assign(flattened, flattenObject(obj[key], newKey));
            } else if (Array.isArray(obj[key])) {
              flattened[newKey] = obj[key].join('; ');
            } else {
              flattened[newKey] = obj[key];
            }
          }
        }
        
        return flattened;
      };
      
      const flattened = flattenObject(data);
      const headers = Object.keys(flattened);
      const values = Object.values(flattened).map(value => 
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      );
      
      return [headers.join(','), values.join(',')].join('\n');
    } catch (error) {
      throw new Error('Failed to convert to CSV format');
    }
  }

  /**
   * Export to XML format
   */
  static exportToXML(data: Record<string, unknown>): string {
    try {
      const escapeXML = (str: string): string => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      const objectToXML = (obj: any, rootName = 'session'): string => {
        let xml = `<${rootName}>`;
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const tagName = key.replace(/[^a-zA-Z0-9_]/g, '_');
            
            if (value === null || value === undefined) {
              xml += `<${tagName} />`;
            } else if (typeof value === 'object' && !Array.isArray(value)) {
              xml += objectToXML(value, tagName);
            } else if (Array.isArray(value)) {
              xml += `<${tagName}>`;
              value.forEach((item, index) => {
                if (typeof item === 'object') {
                  xml += objectToXML(item, `item_${index}`);
                } else {
                  xml += `<item>${escapeXML(String(item))}</item>`;
                }
              });
              xml += `</${tagName}>`;
            } else {
              xml += `<${tagName}>${escapeXML(String(value))}</${tagName}>`;
            }
          }
        }
        
        xml += `</${rootName}>`;
        return xml;
      };
      
      return `<?xml version="1.0" encoding="UTF-8"?>\n${objectToXML(data)}`;
    } catch (error) {
      throw new Error('Failed to convert to XML format');
    }
  }

  /**
   * Export to Markdown format
   */
  static exportToMarkdown(data: Record<string, unknown>): string {
    try {
      const objectToMarkdown = (obj: any, level = 1): string => {
        let md = '';
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const heading = '#'.repeat(Math.min(level, 6));
            
            md += `${heading} ${key}\n\n`;
            
            if (value === null || value === undefined) {
              md += '*No data*\n\n';
            } else if (typeof value === 'object' && !Array.isArray(value)) {
              md += objectToMarkdown(value, level + 1);
            } else if (Array.isArray(value)) {
              value.forEach(item => {
                if (typeof item === 'object') {
                  md += objectToMarkdown(item, level + 1);
                } else {
                  md += `- ${String(item)}\n`;
                }
              });
              md += '\n';
            } else {
              md += `${String(value)}\n\n`;
            }
          }
        }
        
        return md;
      };
      
      return objectToMarkdown(data);
    } catch (error) {
      throw new Error('Failed to convert to Markdown format');
    }
  }

  /**
   * Export to HTML format
   */
  static exportToHTML(data: Record<string, unknown>): string {
    try {
      const escapeHTML = (str: string): string => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      const objectToHTML = (obj: any, level = 1): string => {
        let html = '';
        
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const value = obj[key];
            const headingTag = `h${Math.min(level, 6)}`;
            
            html += `<${headingTag}>${escapeHTML(key)}</${headingTag}>`;
            
            if (value === null || value === undefined) {
              html += '<p><em>No data</em></p>';
            } else if (typeof value === 'object' && !Array.isArray(value)) {
              html += '<div style="margin-left: 20px;">';
              html += objectToHTML(value, level + 1);
              html += '</div>';
            } else if (Array.isArray(value)) {
              html += '<ul>';
              value.forEach(item => {
                if (typeof item === 'object') {
                  html += '<li>';
                  html += objectToHTML(item, level + 1);
                  html += '</li>';
                } else {
                  html += `<li>${escapeHTML(String(item))}</li>`;
                }
              });
              html += '</ul>';
            } else {
              html += `<p>${escapeHTML(String(value))}</p>`;
            }
          }
        }
        
        return html;
      };
      
      const sessionName = data.name || 'Session Export';
      const content = objectToHTML(data);
      
      return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(String(sessionName))}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3, h4, h5, h6 { color: #2d3748; margin-top: 2em; margin-bottom: 0.5em; }
        p { margin-bottom: 1em; line-height: 1.6; }
        ul { margin-bottom: 1em; }
        li { margin-bottom: 0.25em; }
        em { color: #718096; }
        .export-meta { background: #f7fafc; padding: 1rem; border-radius: 6px; margin-bottom: 2rem; font-size: 0.875rem; color: #4a5568; }
    </style>
</head>
<body>
    <div class="export-meta">
        <strong>Session Export</strong><br>
        Generated on: ${new Date().toLocaleString()}<br>
        Format: HTML
    </div>
    ${content}
</body>
</html>`.trim();
    } catch (error) {
      throw new Error('Failed to convert to HTML format');
    }
  }
}

/**
 * Import utilities for different formats
 */
class ImportUtil {
  /**
   * Import from JSON format
   */
  static importFromJSON(data: string): Record<string, unknown> {
    try {
      return JSON.parse(data);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Import from CSV format (basic implementation)
   */
  static importFromCSV(data: string): Record<string, unknown> {
    try {
      const lines = data.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have at least header and one data row');
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const values = lines[1].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      
      const result: Record<string, unknown> = {};
      
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          const value = values[index];
          
          // Try to parse numbers and booleans
          if (value === 'true' || value === 'false') {
            result[header] = value === 'true';
          } else if (!isNaN(Number(value)) && value !== '') {
            result[header] = Number(value);
          } else if (value.includes('; ')) {
            // Array format
            result[header] = value.split('; ');
          } else {
            result[header] = value;
          }
        }
      });
      
      return result;
    } catch (error) {
      throw new Error('Failed to parse CSV format');
    }
  }

  /**
   * Detect import format from content
   */
  static detectFormat(content: string): ExportFormat | null {
    const trimmed = content.trim();
    
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return 'json';
    }
    
    if (trimmed.startsWith('<?xml') || trimmed.startsWith('<session')) {
      return 'xml';
    }
    
    if (trimmed.startsWith('<!DOCTYPE html') || trimmed.includes('<html')) {
      return 'html';
    }
    
    if (trimmed.includes('#') && trimmed.includes('\n')) {
      return 'markdown';
    }
    
    if (trimmed.includes(',') && trimmed.split('\n').length >= 2) {
      return 'csv';
    }
    
    return null;
  }
}

/**
 * Main export/import handler
 */
export class SessionExportImport {
  /**
   * Export session to specified format
   */
  static async exportSession(
    sessionId: string,
    options: ExportOptions
  ): Promise<SessionOperationResult> {
    try {
      // Load session data
      const sessionResult = SessionStorageUtil.loadSession(sessionId);
      if (!sessionResult.success || !sessionResult.data) {
        return {
          success: false,
          error: {
            code: 'SESSION_NOT_FOUND',
            message: sessionResult.error || 'Session not found'
          }
        };
      }

      let sessionData = sessionResult.data;

      // Add metadata if requested
      if (options.includeMetadata) {
        const sessions = SessionStorageUtil.getAllSessions();
        const sessionMeta = sessions.find(s => s.id === sessionId);
        
        if (sessionMeta) {
          sessionData = {
            ...sessionData,
            _metadata: {
              id: sessionMeta.id,
              name: sessionMeta.name,
              type: sessionMeta.type,
              status: sessionMeta.status,
              lastModified: sessionMeta.lastModified,
              size: sessionMeta.size,
              isLocal: sessionMeta.isLocal,
              isCollaborative: sessionMeta.isCollaborative,
              exportedAt: new Date().toISOString(),
              exportFormat: options.format
            }
          };
        }
      }

      // Filter sections if specified
      if (options.sections && options.sections.length > 0) {
        const filteredData: Record<string, unknown> = {};
        options.sections.forEach(section => {
          if (sessionData[section] !== undefined) {
            filteredData[section] = sessionData[section];
          }
        });
        sessionData = filteredData;
      }

      // Convert to specified format
      let exportedContent: string;
      let mimeType: string;
      let fileExtension: string;

      switch (options.format) {
        case 'json':
          exportedContent = ExportUtil.exportToJSON(sessionData, true);
          mimeType = 'application/json';
          fileExtension = 'json';
          break;
          
        case 'csv':
          exportedContent = ExportUtil.exportToCSV(sessionData);
          mimeType = 'text/csv';
          fileExtension = 'csv';
          break;
          
        case 'xml':
          exportedContent = ExportUtil.exportToXML(sessionData);
          mimeType = 'application/xml';
          fileExtension = 'xml';
          break;
          
        case 'html':
          exportedContent = ExportUtil.exportToHTML(sessionData);
          mimeType = 'text/html';
          fileExtension = 'html';
          break;
          
        case 'markdown':
          exportedContent = ExportUtil.exportToMarkdown(sessionData);
          mimeType = 'text/markdown';
          fileExtension = 'md';
          break;
          
        default:
          return {
            success: false,
            error: {
              code: 'UNSUPPORTED_FORMAT',
              message: `Export format '${options.format}' is not supported`
            }
          };
      }

      // Handle compression
      if (options.compressed && options.format !== 'html') {
        // Simple compression for demo - in production use proper compression
        exportedContent = btoa(exportedContent);
        fileExtension += '.b64';
      }

      // Generate filename
      const filename = options.filename || 
        `session-${sessionId.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.${fileExtension}`;

      return {
        success: true,
        data: {
          content: exportedContent,
          filename,
          mimeType,
          size: exportedContent.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'EXPORT_ERROR',
          message: error instanceof Error ? error.message : 'Export failed'
        }
      };
    }
  }

  /**
   * Import session from content
   */
  static async importSession(
    content: string,
    options: ImportOptions
  ): Promise<SessionOperationResult> {
    try {
      let sessionData: Record<string, unknown>;

      // Handle different sources
      switch (options.source) {
        case 'file':
        case 'clipboard':
          // Content is already provided
          break;
          
        case 'template':
          // Load from template (would need template storage)
          return {
            success: false,
            error: {
              code: 'NOT_IMPLEMENTED',
              message: 'Template import not yet implemented'
            }
          };
          
        default:
          return {
            success: false,
            error: {
              code: 'INVALID_SOURCE',
              message: `Import source '${options.source}' is not supported`
            }
          };
      }

      // Detect format if not specified
      const format = ImportUtil.detectFormat(content);
      if (!format) {
        return {
          success: false,
          error: {
            code: 'UNKNOWN_FORMAT',
            message: 'Could not detect file format'
          }
        };
      }

      // Handle decompression
      let processedContent = content;
      if (content.match(/^[A-Za-z0-9+/]+=*$/)) {
        try {
          processedContent = atob(content);
        } catch (error) {
          // Not base64 encoded, continue with original
        }
      }

      // Parse content based on format
      switch (format) {
        case 'json':
          sessionData = ImportUtil.importFromJSON(processedContent);
          break;
          
        case 'csv':
          sessionData = ImportUtil.importFromCSV(processedContent);
          break;
          
        default:
          return {
            success: false,
            error: {
              code: 'UNSUPPORTED_IMPORT_FORMAT',
              message: `Import from '${format}' format is not yet supported`
            }
          };
      }

      // Validate imported data
      if (options.validation === 'strict') {
        if (!sessionData.name || typeof sessionData.name !== 'string') {
          return {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Session must have a valid name'
            }
          };
        }
      }

      // Generate session ID
      const sessionId = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Override name if provided
      if (options.sessionName) {
        sessionData.name = options.sessionName;
      } else if (!sessionData.name) {
        sessionData.name = `Imported Session ${new Date().toLocaleDateString()}`;
      }

      // Mark as template if requested
      if (options.asTemplate) {
        sessionData.type = 'template';
        sessionData.status = 'template';
      }

      // Handle merge with existing session
      if (options.merge && options.conflictResolution) {
        // This would require more complex logic to merge with existing data
        // For now, just save as new session
      }

      // Save imported session
      const saveResult = SessionStorageUtil.saveSession(sessionId, sessionData, {
        compress: true,
        backup: false // Don't backup imported sessions
      });

      if (!saveResult.success) {
        return {
          success: false,
          error: {
            code: 'SAVE_ERROR',
            message: saveResult.error || 'Failed to save imported session'
          }
        };
      }

      return {
        success: true,
        data: {
          sessionId,
          sessionData,
          importedAt: new Date().toISOString()
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'IMPORT_ERROR',
          message: error instanceof Error ? error.message : 'Import failed'
        }
      };
    }
  }

  /**
   * Download exported session as file
   */
  static downloadExport(exportResult: SessionOperationResult): void {
    if (!exportResult.success || !exportResult.data) {
      throw new Error('Invalid export result');
    }

    const { content, filename, mimeType } = exportResult.data;
    
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Failed to download file');
    }
  }

  /**
   * Get supported export formats
   */
  static getSupportedFormats(): { format: ExportFormat; name: string; description: string }[] {
    return [
      {
        format: 'json',
        name: 'JSON',
        description: 'JavaScript Object Notation - structured data format'
      },
      {
        format: 'csv',
        name: 'CSV',
        description: 'Comma-Separated Values - spreadsheet compatible'
      },
      {
        format: 'xml',
        name: 'XML',
        description: 'Extensible Markup Language - structured document format'
      },
      {
        format: 'html',
        name: 'HTML',
        description: 'HyperText Markup Language - web document format'
      },
      {
        format: 'markdown',
        name: 'Markdown',
        description: 'Markdown - human-readable text format'
      }
    ];
  }

  /**
   * Batch export multiple sessions
   */
  static async batchExport(
    sessionIds: string[],
    options: ExportOptions
  ): Promise<SessionOperationResult> {
    try {
      const exports: any[] = [];
      const errors: string[] = [];

      for (const sessionId of sessionIds) {
        const result = await this.exportSession(sessionId, {
          ...options,
          compressed: false // Handle compression at batch level
        });

        if (result.success && result.data) {
          exports.push({
            sessionId,
            filename: result.data.filename,
            content: result.data.content
          });
        } else {
          errors.push(`Failed to export ${sessionId}: ${result.error?.message}`);
        }
      }

      if (exports.length === 0) {
        return {
          success: false,
          error: {
            code: 'BATCH_EXPORT_FAILED',
            message: 'No sessions could be exported',
            details: errors
          }
        };
      }

      // Create batch export content
      const batchContent = {
        exportedAt: new Date().toISOString(),
        format: options.format,
        totalSessions: sessionIds.length,
        successfulExports: exports.length,
        errors: errors,
        sessions: exports
      };

      return {
        success: true,
        data: {
          content: JSON.stringify(batchContent, null, 2),
          filename: `batch-export-${new Date().toISOString().slice(0, 10)}.json`,
          mimeType: 'application/json',
          size: JSON.stringify(batchContent).length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BATCH_EXPORT_ERROR',
          message: error instanceof Error ? error.message : 'Batch export failed'
        }
      };
    }
  }
}