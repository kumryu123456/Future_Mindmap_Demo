/**
 * Advanced SessionManager Example
 * Demonstrates export/import, validation, and advanced features
 */

import React, { useState, useEffect } from "react";
import { SessionManager } from "../SessionManager";
import { useSessionManager } from "../../../hooks/useSessionManager";
import { SessionExportImport } from "../../../utils/sessionExportImport";
import { SessionStorageUtil } from "../../../utils/sessionStorage";
import type {
  SessionItem,
  ExportFormat,
  ImportOptions,
} from "../../../types/components/sessionManager";
import "../SessionManager.css";

interface ProjectData {
  name: string;
  description: string;
  type: "project";
  phases: ProjectPhase[];
  tasks: Task[];
  milestones: Milestone[];
  collaborators: string[];
  settings: ProjectSettings;
  createdAt: string;
  lastModified: string;
}

interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  status: "planning" | "active" | "completed" | "on-hold";
  startDate: string;
  endDate: string;
  tasks: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "urgent";
  assignee?: string;
  phaseId: string;
  tags: string[];
  createdAt: string;
  dueDate?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  status: "upcoming" | "completed" | "overdue";
  tasks: string[];
}

interface ProjectSettings {
  autoSave: boolean;
  notifications: boolean;
  collaboration: boolean;
  visibility: "private" | "team" | "public";
}

export const AdvancedExample: React.FC = () => {
  const [projectData, setProjectData] = useState<ProjectData>({
    name: "Advanced Project Manager",
    description:
      "Comprehensive project management with SessionManager integration",
    type: "project",
    phases: [
      {
        id: "phase1",
        name: "Planning",
        description: "Project planning and setup",
        status: "completed",
        startDate: "2024-01-01",
        endDate: "2024-01-15",
        tasks: ["task1", "task2"],
      },
      {
        id: "phase2",
        name: "Development",
        description: "Core development phase",
        status: "active",
        startDate: "2024-01-16",
        endDate: "2024-03-01",
        tasks: ["task3", "task4", "task5"],
      },
    ],
    tasks: [
      {
        id: "task1",
        title: "Define Requirements",
        description: "Gather and document project requirements",
        status: "completed",
        priority: "high",
        assignee: "alice@example.com",
        phaseId: "phase1",
        tags: ["planning", "requirements"],
        createdAt: "2024-01-01T09:00:00Z",
        dueDate: "2024-01-05T17:00:00Z",
      },
      {
        id: "task2",
        title: "Create Project Plan",
        description: "Develop detailed project timeline",
        status: "completed",
        priority: "high",
        assignee: "bob@example.com",
        phaseId: "phase1",
        tags: ["planning", "timeline"],
        createdAt: "2024-01-02T10:00:00Z",
        dueDate: "2024-01-10T17:00:00Z",
      },
      {
        id: "task3",
        title: "Setup Development Environment",
        description: "Configure development tools and environment",
        status: "completed",
        priority: "medium",
        assignee: "charlie@example.com",
        phaseId: "phase2",
        tags: ["development", "setup"],
        createdAt: "2024-01-16T09:00:00Z",
      },
      {
        id: "task4",
        title: "Implement Core Features",
        description: "Develop main application features",
        status: "in-progress",
        priority: "high",
        assignee: "alice@example.com",
        phaseId: "phase2",
        tags: ["development", "features"],
        createdAt: "2024-01-20T09:00:00Z",
        dueDate: "2024-02-15T17:00:00Z",
      },
      {
        id: "task5",
        title: "Write Unit Tests",
        description: "Create comprehensive test suite",
        status: "todo",
        priority: "medium",
        assignee: "bob@example.com",
        phaseId: "phase2",
        tags: ["development", "testing"],
        createdAt: "2024-01-25T09:00:00Z",
        dueDate: "2024-02-20T17:00:00Z",
      },
    ],
    milestones: [
      {
        id: "milestone1",
        title: "Planning Complete",
        description: "All planning activities finished",
        targetDate: "2024-01-15T17:00:00Z",
        status: "completed",
        tasks: ["task1", "task2"],
      },
      {
        id: "milestone2",
        title: "Core Features Ready",
        description: "Main features implemented and tested",
        targetDate: "2024-02-28T17:00:00Z",
        status: "upcoming",
        tasks: ["task4", "task5"],
      },
    ],
    collaborators: [
      "alice@example.com",
      "bob@example.com",
      "charlie@example.com",
    ],
    settings: {
      autoSave: true,
      notifications: true,
      collaboration: true,
      visibility: "team",
    },
    createdAt: "2024-01-01T09:00:00Z",
    lastModified: new Date().toISOString(),
  });

  const [currentSessionId, setCurrentSessionId] = useState<string>();
  const [selectedExportFormat, setSelectedExportFormat] =
    useState<ExportFormat>("json");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [storageStats, setStorageStats] = useState<any>(null);

  // Use the advanced session manager hook
  const { validateSession, searchSessions, setupAutoSave, clearAutoSave } =
    useSessionManager();

  // Update storage stats periodically
  useEffect(() => {
    const updateStats = () => {
      const stats = SessionStorageUtil.getStorageStats();
      setStorageStats(stats);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Setup auto-save when session changes
  useEffect(() => {
    if (currentSessionId && projectData.settings.autoSave) {
      setupAutoSave(projectData, currentSessionId, 15000); // 15 seconds for demo
    }

    return () => clearAutoSave();
  }, [
    currentSessionId,
    projectData.settings.autoSave,
    setupAutoSave,
    clearAutoSave,
    projectData,
  ]);

  const handleAddTask = () => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: "New Task",
      description: "Task description",
      status: "todo",
      priority: "medium",
      phaseId: "phase2",
      tags: [],
      createdAt: new Date().toISOString(),
    };

    setProjectData((prev) => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
      lastModified: new Date().toISOString(),
    }));
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setProjectData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
      lastModified: new Date().toISOString(),
    }));
  };

  const handleValidateSession = () => {
    const result = validateSession(projectData);
    setValidationResult(result);
  };

  const handleExportSession = async () => {
    if (!currentSessionId) return;

    try {
      const result = await SessionExportImport.exportSession(currentSessionId, {
        format: selectedExportFormat,
        includeMetadata: true,
        compressed: false,
        filename: `project-export-${Date.now()}.${selectedExportFormat}`,
      });

      if (result.success) {
        SessionExportImport.downloadExport(result);
        alert("Export completed successfully!");
      } else {
        alert(`Export failed: ${result.error?.message}`);
      }
    } catch (error) {
      alert(`Export error: ${error}`);
    }
  };

  const handleImportFile = async () => {
    if (!importFile) return;

    try {
      const content = await importFile.text();
      const result = await SessionExportImport.importSession(content, {
        source: "file",
        validation: "relaxed",
        conflictResolution: "overwrite",
        sessionName: `Imported from ${importFile.name}`,
      });

      if (result.success) {
        alert(`Successfully imported session: ${result.data.sessionId}`);
        setImportFile(null);
        // Reload sessions to show the new import
        window.location.reload();
      } else {
        alert(`Import failed: ${result.error?.message}`);
      }
    } catch (error) {
      alert(`Import error: ${error}`);
    }
  };

  const handleSearchSessions = async (query: string) => {
    if (!query.trim()) return;

    try {
      const result = await searchSessions(
        {
          query,
          types: ["project", "mindmap"],
          priorities: ["high", "medium"],
        },
        {
          limit: 10,
          sortBy: "lastModified",
          sortOrder: "desc",
        },
      );

      console.log("Search results:", result);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  const getTaskStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "#48bb78";
      case "in-progress":
        return "#ed8936";
      case "blocked":
        return "#f56565";
      default:
        return "#a0aec0";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "#e53e3e";
      case "high":
        return "#dd6b20";
      case "medium":
        return "#3182ce";
      default:
        return "#38a169";
    }
  };

  return (
    <div className="advanced-example">
      <div className="example-header">
        <h1>Advanced SessionManager Example</h1>
        <p>
          This example demonstrates advanced features including export/import,
          validation, local storage management, and integration with complex
          project data.
        </p>
      </div>

      <div className="example-content">
        {/* Project Dashboard */}
        <div className="project-dashboard">
          <div className="dashboard-header">
            <h3>{projectData.name}</h3>
            <p>{projectData.description}</p>

            <div className="project-stats">
              <div className="stat">
                <span className="stat-label">Phases:</span>
                <span className="stat-value">{projectData.phases.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Tasks:</span>
                <span className="stat-value">{projectData.tasks.length}</span>
              </div>
              <div className="stat">
                <span className="stat-label">Collaborators:</span>
                <span className="stat-value">
                  {projectData.collaborators.length}
                </span>
              </div>
              <div className="stat">
                <span className="stat-label">Last Modified:</span>
                <span className="stat-value">
                  {new Date(projectData.lastModified).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Task Management */}
          <div className="task-management">
            <div className="section-header">
              <h4>Tasks</h4>
              <button
                onClick={handleAddTask}
                className="btn btn--primary btn--small"
              >
                Add Task
              </button>
            </div>

            <div className="tasks-grid">
              {projectData.tasks.map((task) => (
                <div key={task.id} className="task-card">
                  <div className="task-header">
                    <h5>{task.title}</h5>
                    <div className="task-meta">
                      <span
                        className="task-status"
                        style={{
                          backgroundColor: getTaskStatusColor(task.status),
                        }}
                      >
                        {task.status}
                      </span>
                      <span
                        className="task-priority"
                        style={{ color: getPriorityColor(task.priority) }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <p className="task-description">{task.description}</p>

                  <div className="task-details">
                    {task.assignee && (
                      <div className="task-assignee">👤 {task.assignee}</div>
                    )}
                    {task.dueDate && (
                      <div className="task-due-date">
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    {task.tags.length > 0 && (
                      <div className="task-tags">
                        {task.tags.map((tag) => (
                          <span key={tag} className="task-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="task-actions">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleUpdateTask(task.id, {
                          status: e.target.value as Task["status"],
                        })
                      }
                      className="status-select"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Features Panel */}
        <div className="advanced-features">
          <h4>Advanced Features</h4>

          {/* Validation */}
          <div className="feature-section">
            <h5>Session Validation</h5>
            <button
              onClick={handleValidateSession}
              className="btn btn--secondary"
            >
              Validate Current Session
            </button>

            {validationResult && (
              <div className="validation-result">
                <div
                  className={`validation-status ${validationResult.isValid ? "valid" : "invalid"}`}
                >
                  Status: {validationResult.isValid ? "✅ Valid" : "❌ Invalid"}
                </div>
                <div>Integrity Score: {validationResult.integrityScore}%</div>

                {validationResult.errors.length > 0 && (
                  <div className="validation-errors">
                    <strong>Errors:</strong>
                    <ul>
                      {validationResult.errors.map(
                        (error: any, index: number) => (
                          <li key={index}>{error.message}</li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {validationResult.warnings.length > 0 && (
                  <div className="validation-warnings">
                    <strong>Warnings:</strong>
                    <ul>
                      {validationResult.warnings.map(
                        (warning: any, index: number) => (
                          <li key={index}>{warning.message}</li>
                        ),
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Export */}
          <div className="feature-section">
            <h5>Export Session</h5>
            <div className="export-controls">
              <select
                value={selectedExportFormat}
                onChange={(e) =>
                  setSelectedExportFormat(e.target.value as ExportFormat)
                }
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="html">HTML</option>
                <option value="markdown">Markdown</option>
              </select>
              <button
                onClick={handleExportSession}
                disabled={!currentSessionId}
                className="btn btn--primary"
              >
                Export as {selectedExportFormat.toUpperCase()}
              </button>
            </div>
          </div>

          {/* Import */}
          <div className="feature-section">
            <h5>Import Session</h5>
            <div className="import-controls">
              <input
                type="file"
                accept=".json,.csv,.xml"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              />
              <button
                onClick={handleImportFile}
                disabled={!importFile}
                className="btn btn--secondary"
              >
                Import File
              </button>
            </div>
          </div>

          {/* Storage Statistics */}
          {storageStats && (
            <div className="feature-section">
              <h5>Storage Statistics</h5>
              <div className="storage-stats">
                <div>Total Sessions: {storageStats.totalSessions}</div>
                <div>
                  Storage Used:{" "}
                  {(storageStats.totalSize / 1024 / 1024).toFixed(2)} MB
                </div>
                <div>Usage: {storageStats.usagePercentage.toFixed(1)}%</div>

                <div className="storage-usage-bar">
                  <div
                    className="usage-fill"
                    style={{
                      width: `${Math.min(storageStats.usagePercentage, 100)}%`,
                    }}
                  />
                </div>

                <details>
                  <summary>Session Breakdown</summary>
                  <div className="sessions-breakdown">
                    {storageStats.sessionsBreakdown
                      .slice(0, 5)
                      .map((session: any) => (
                        <div key={session.id} className="session-stat">
                          <span>{session.name}</span>
                          <span>{(session.size / 1024).toFixed(1)} KB</span>
                        </div>
                      ))}
                  </div>
                </details>
              </div>
            </div>
          )}

          {/* Search Demo */}
          <div className="feature-section">
            <h5>Search Sessions</h5>
            <div className="search-controls">
              <input
                type="text"
                placeholder="Search sessions..."
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSessions((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <small>Press Enter to search</small>
            </div>
          </div>
        </div>

        {/* SessionManager Component */}
        <div className="session-manager-wrapper">
          <SessionManager
            currentSessionData={projectData}
            currentSessionId={currentSessionId}
            defaultSessionType="project"
            autoSave={projectData.settings.autoSave}
            autoSaveInterval={15000}
            enableCollaboration={true}
            enableImportExport={true}
            enableVersionControl={true}
            onSessionChange={(session) => {
              setCurrentSessionId(session?.id);
              console.log("Session changed:", session);
            }}
            onSuccess={(message) => {
              console.log("Success:", message);
            }}
            onError={(error) => {
              console.error("Error:", error);
              alert(`SessionManager Error: ${error}`);
            }}
            onValidate={(sessionData) => {
              // Custom validation logic
              const errors: any[] = [];
              const warnings: any[] = [];

              if (!sessionData.name || sessionData.name.toString().length < 3) {
                errors.push({
                  code: "NAME_TOO_SHORT",
                  message: "Session name must be at least 3 characters",
                  severity: "major",
                });
              }

              const projectData = sessionData as ProjectData;
              if (projectData.tasks && projectData.tasks.length > 50) {
                warnings.push({
                  code: "MANY_TASKS",
                  message:
                    "This project has many tasks, consider organizing into phases",
                  recommendation:
                    "Break down into smaller phases for better management",
                });
              }

              return {
                isValid: errors.length === 0,
                errors,
                warnings,
                integrityScore: Math.max(
                  0,
                  100 - errors.length * 15 - warnings.length * 5,
                ),
              };
            }}
          />
        </div>
      </div>

      <div className="example-footer">
        <h4>Advanced Features Demonstrated:</h4>
        <ul>
          <li>✅ Complex project data management</li>
          <li>✅ Real-time validation with custom rules</li>
          <li>
            ✅ Export to multiple formats (JSON, CSV, XML, HTML, Markdown)
          </li>
          <li>✅ Import from external files</li>
          <li>✅ Storage quota monitoring and statistics</li>
          <li>✅ Advanced search with filters</li>
          <li>✅ Auto-save with configurable intervals</li>
          <li>✅ Session data integrity validation</li>
          <li>✅ Local storage with compression</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedExample;
