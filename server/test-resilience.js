#!/usr/bin/env node

/**
 * Test script for server resilience improvements
 * Tests error handling, fallback mechanisms, and graceful degradation
 */

import { spawn } from 'child_process';

const TEST_TIMEOUT = 30000; // 30 seconds

class ResilienceTest {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
  }

  async startServer() {
    console.log('Starting ASR-GoT MCP Server for resilience testing...');
    this.serverProcess = spawn('node', ['index.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Wait a moment for server to start
    await this.delay(2000);

    if (this.serverProcess.killed) {
      throw new Error('Server failed to start');
    }
  }

  async stopServer() {
    if (this.serverProcess) {
      this.serverProcess.kill();
      this.serverProcess = null;
    }
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendMCPRequest(request) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, TEST_TIMEOUT);

      let responseData = '';

      const dataHandler = (data) => {
        responseData += data.toString();
        try {
          const response = JSON.parse(responseData);
          clearTimeout(timeout);
          this.serverProcess.stdout.off('data', dataHandler);
          resolve(response);
        } catch (e) {
          // Not complete JSON yet, continue collecting
        }
      };

      this.serverProcess.stdout.on('data', dataHandler);

      this.serverProcess.stdin.write(JSON.stringify(request) + '\n');
    });
  }

  async testResilientQuery() {
    console.log('\\n=== Testing Resilient Query Execution ===');
    
    const testCases = [
      {
        name: 'Normal query',
        query: 'What are the effects of climate change on marine ecosystems?',
        shouldSucceed: true
      },
      {
        name: 'Complex query with potential parsing issues',
        query: 'How do "nested quotes" and special chars like \\n\\t affect research on AI & ML?',
        shouldSucceed: true
      },
      {
        name: 'Very short query',
        query: 'AI',
        shouldSucceed: true
      },
      {
        name: 'Empty config query',
        query: 'Test query with minimal setup',
        config: null,
        shouldSucceed: true
      }
    ];

    for (const testCase of testCases) {
      try {
        console.log(`\\nTesting: ${testCase.name}`);
        console.log(`Query: "${testCase.query}"`);
        
        const request = {
          jsonrpc: '2.0',
          id: Math.floor(Math.random() * 10000),
          method: 'tools/call',
          params: {
            name: 'execute_resilient_query',
            arguments: {
              query: testCase.query,
              config: testCase.config || {
                enable_fallbacks: true,
                max_hypotheses: 3
              }
            }
          }
        };

        const response = await this.sendMCPRequest(request);
        
        if (response.error) {
          console.log(`❌ FAILED: ${response.error.message}`);
          this.testResults.push({
            test: testCase.name,
            status: 'FAILED',
            error: response.error.message
          });
        } else {
          const result = JSON.parse(response.result.content[0].text);
          console.log(`✅ SUCCESS: Completed ${result.stages_completed?.length || 0} stages`);
          if (result.stages_failed?.length > 0) {
            console.log(`⚠️  Had ${result.stages_failed.length} failed stages but continued with fallbacks`);
          }
          if (result.fallback_used) {
            console.log(`🔄 Fallback mechanisms were used`);
          }
          
          this.testResults.push({
            test: testCase.name,
            status: 'SUCCESS',
            stagesCompleted: result.stages_completed?.length || 0,
            stagesFailed: result.stages_failed?.length || 0,
            fallbackUsed: result.fallback_used || false
          });
        }
      } catch (error) {
        console.log(`❌ EXCEPTION: ${error.message}`);
        this.testResults.push({
          test: testCase.name,
          status: 'EXCEPTION',
          error: error.message
        });
      }
    }
  }

  async testErrorHandling() {
    console.log('\\n=== Testing Error Handling ===');
    
    const errorTests = [
      {
        name: 'Missing required parameter',
        request: {
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/call',
          params: {
            name: 'execute_resilient_query',
            arguments: {} // Missing query
          }
        }
      },
      {
        name: 'Invalid tool name',
        request: {
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'nonexistent_tool',
            arguments: { query: 'test' }
          }
        }
      }
    ];

    for (const test of errorTests) {
      try {
        console.log(`\\nTesting: ${test.name}`);
        const response = await this.sendMCPRequest(test.request);
        
        if (response.error) {
          console.log(`✅ Properly handled error: ${response.error.message}`);
          this.testResults.push({
            test: test.name,
            status: 'HANDLED_CORRECTLY',
            errorMessage: response.error.message
          });
        } else {
          console.log(`❌ Should have failed but didn't`);
          this.testResults.push({
            test: test.name,
            status: 'SHOULD_HAVE_FAILED'
          });
        }
      } catch (error) {
        console.log(`✅ Exception properly caught: ${error.message}`);
        this.testResults.push({
          test: test.name,
          status: 'EXCEPTION_CAUGHT',
          error: error.message
        });
      }
    }
  }

  printSummary() {
    console.log('\\n=== Test Results Summary ===');
    console.log(`Total tests: ${this.testResults.length}`);
    
    const successes = this.testResults.filter(r => r.status === 'SUCCESS').length;
    const failures = this.testResults.filter(r => r.status === 'FAILED').length;
    const exceptions = this.testResults.filter(r => r.status === 'EXCEPTION').length;
    const handled = this.testResults.filter(r => r.status === 'HANDLED_CORRECTLY').length;
    
    console.log(`✅ Successful: ${successes}`);
    console.log(`❌ Failed: ${failures}`);
    console.log(`⚠️  Exceptions: ${exceptions}`);
    console.log(`🛡️  Errors handled correctly: ${handled}`);
    
    const fallbackTests = this.testResults.filter(r => r.fallbackUsed);
    if (fallbackTests.length > 0) {
      console.log(`🔄 Tests that used fallbacks: ${fallbackTests.length}`);
    }
    
    console.log('\\n=== Detailed Results ===');
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.test}: ${result.status}`);
      if (result.stagesCompleted !== undefined) {
        console.log(`   - Stages completed: ${result.stagesCompleted}`);
      }
      if (result.stagesFailed !== undefined && result.stagesFailed > 0) {
        console.log(`   - Stages failed: ${result.stagesFailed}`);
      }
      if (result.fallbackUsed) {
        console.log(`   - Used fallbacks: Yes`);
      }
      if (result.error) {
        console.log(`   - Error: ${result.error}`);
      }
    });
  }

  async run() {
    try {
      await this.startServer();
      await this.testResilientQuery();
      await this.testErrorHandling();
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      await this.stopServer();
      this.printSummary();
    }
  }
}

// Run tests
const test = new ResilienceTest();
test.run().then(() => {
  console.log('\\n🏁 Resilience testing completed');
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});