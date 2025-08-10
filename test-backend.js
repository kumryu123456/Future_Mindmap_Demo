#!/usr/bin/env node

/**
 * Future Mindmap Demo - Backend API Test Script
 * 백엔드 API 엔드포인트들을 순차적으로 테스트하는 스크립트
 */

const API_BASE_URL = 'http://127.0.0.1:54321';

// Test configuration
const testConfig = {
  timeout: 30000, // 30 seconds
  retries: 3,
  testInput: "AI 스타트업 창업하고 싶어"
};

// ANSI colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  let color = colors.reset;
  
  switch (level) {
    case 'INFO': color = colors.blue; break;
    case 'SUCCESS': color = colors.green; break;
    case 'WARNING': color = colors.yellow; break;
    case 'ERROR': color = colors.red; break;
  }
  
  console.log(`${color}[${timestamp}] ${level}: ${message}${colors.reset}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function makeRequest(endpoint, method = 'POST', body = null) {
  const url = `${API_BASE_URL}/functions/v1/${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
    options.body = JSON.stringify(body);
  }

  log('INFO', `Making ${method} request to: ${url}`);

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// Test cases
const tests = [
  {
    name: '🏠 Health Check',
    endpoint: 'hello-world',
    method: 'GET',
    body: null,
    required: true
  },
  {
    name: '📝 Korean NLP Parsing',
    endpoint: 'parse-input',
    method: 'POST',
    body: {
      rawText: testConfig.testInput,
      context: 'mindmap_generation',
      options: {
        format: 'json',
        includeMetadata: true
      }
    },
    required: true
  },
  {
    name: '🏢 Enterprise Data Fetch',
    endpoint: 'fetch-enterprise-data',
    method: 'POST', 
    body: {
      query: 'AI 스타트업',
      options: {
        maxResults: 3,
        includeMetadata: true
      }
    },
    required: true
  },
  {
    name: '🧠 AI Plan Generation',
    endpoint: 'generate-plan',
    method: 'POST',
    body: {
      objective: testConfig.testInput,
      context: {
        requestType: 'mindmap_generation',
        maxNodes: 8,
        layout: 'hierarchical'
      },
      options: {
        format: 'mindmap_nodes',
        includePositioning: true
      }
    },
    required: true
  },
  {
    name: '🎯 Smart Mindmap Creation',
    endpoint: 'create-smart-mindmap',
    method: 'POST',
    body: {
      input: testConfig.testInput,
      options: {
        maxNodes: 10,
        includeEnterpriseData: true,
        layout: 'hierarchical',
        language: 'korean'
      }
    },
    required: true
  },
  {
    name: '🔍 RAG Detail Search',
    endpoint: 'rag-detail',
    method: 'POST',
    body: {
      query: 'AI 개발자 기술 스택',
      context: 'mindmap_node_detail',
      options: {
        maxResults: 3,
        searchDepth: 'detailed'
      }
    },
    required: false
  },
  {
    name: '🌟 Auto Expand Node',
    endpoint: 'auto-expand',
    method: 'POST',
    body: {
      context: 'AI 스타트업: 기술 준비',
      parentNodeId: 'test-node-123',
      expandDirection: 'children',
      maxNodes: 4
    },
    required: false
  }
];

async function runSingleTest(test) {
  log('INFO', `🧪 Running test: ${test.name}`);
  
  const startTime = Date.now();
  const result = await makeRequest(test.endpoint, test.method, test.body);
  const duration = Date.now() - startTime;
  
  if (result.success) {
    log('SUCCESS', `✅ ${test.name} - PASSED (${duration}ms)`, {
      status: result.status,
      dataSize: JSON.stringify(result.data).length,
      headers: result.headers['content-type']
    });
    return { test: test.name, success: true, duration, data: result.data };
  } else {
    log('ERROR', `❌ ${test.name} - FAILED (${duration}ms)`, {
      status: result.status,
      error: result.error || result.statusText,
      data: result.data
    });
    return { test: test.name, success: false, duration, error: result.error || result.data };
  }
}

async function runAllTests() {
  log('INFO', '🚀 Starting Future Mindmap Backend API Tests');
  log('INFO', `Base URL: ${API_BASE_URL}`);
  log('INFO', `Test Input: "${testConfig.testInput}"`);
  console.log('─'.repeat(80));

  const results = [];
  let passedTests = 0;
  let failedTests = 0;

  for (const test of tests) {
    try {
      const result = await runSingleTest(test);
      results.push(result);
      
      if (result.success) {
        passedTests++;
      } else {
        failedTests++;
        if (test.required) {
          log('ERROR', `❌ CRITICAL: Required test "${test.name}" failed!`);
        }
      }
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      log('ERROR', `💥 Test "${test.name}" threw an exception`, { error: error.message });
      results.push({ test: test.name, success: false, error: error.message });
      failedTests++;
    }
    
    console.log('─'.repeat(40));
  }

  // Final summary
  console.log('─'.repeat(80));
  log('INFO', '📊 TEST SUMMARY');
  log('SUCCESS', `✅ Passed: ${passedTests}/${tests.length}`);
  log('ERROR', `❌ Failed: ${failedTests}/${tests.length}`);

  const criticalFailures = results.filter(r => !r.success && tests.find(t => t.name === r.test)?.required);
  if (criticalFailures.length > 0) {
    log('ERROR', '🚨 CRITICAL FAILURES DETECTED:');
    criticalFailures.forEach(f => {
      log('ERROR', `   - ${f.test}: ${f.error}`);
    });
  }

  if (failedTests === 0) {
    log('SUCCESS', '🎉 ALL TESTS PASSED! Backend is ready!');
    return true;
  } else if (criticalFailures.length === 0) {
    log('WARNING', '⚠️  Some non-critical tests failed, but core functionality works');
    return true;
  } else {
    log('ERROR', '💥 CRITICAL TESTS FAILED! Please fix backend issues');
    return false;
  }
}

// Run the tests
if (typeof window === 'undefined') {
  // Node.js environment
  const { fetch } = require('undici'); // You might need: npm install undici
  
  global.fetch = fetch;
  
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      log('ERROR', '💥 Test runner crashed', { error: error.message });
      process.exit(1);
    });
}