#!/usr/bin/env node

/**
 * Test script for Scientific Research MCP Server
 * Tests all the research tools that were originally expected
 */

import { spawn } from 'child_process';

const TEST_TIMEOUT = 15000; // 15 seconds

class ResearchToolsTest {
  constructor() {
    this.serverProcess = null;
    this.testResults = [];
  }

  async startServer() {
    console.log('Starting Scientific Research MCP Server...');
    this.serverProcess = spawn('node', ['scientific-research-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

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
      this.serverProcess.stdin.write(JSON.stringify(request) + '\\n');
    });
  }

  async testSearchPapers() {
    console.log('\\n=== Testing search_papers ===');
    
    const testCases = [
      {
        name: 'Basic search',
        query: 'machine learning',
        expected: 'results'
      },
      {
        name: 'Complex search with filters',
        query: 'deep learning applications',
        limit: 5,
        year_range: { start: 2020, end: 2023 }
      },
      {
        name: 'Search excluding preprints',
        query: 'artificial intelligence',
        include_preprints: false
      }
    ];

    for (const testCase of testCases) {
      await this.runToolTest('search_papers', testCase.name, {
        query: testCase.query,
        limit: testCase.limit,
        year_range: testCase.year_range,
        include_preprints: testCase.include_preprints
      });
    }
  }

  async testGetPaperDetails() {
    console.log('\\n=== Testing get_paper_details ===');
    
    const testCases = [
      {
        name: 'Get paper by ArXiv ID',
        paper_id: 'arxiv:2301.07041'
      },
      {
        name: 'Get paper with citations',
        paper_id: 'doi:10.1038/nature14539',
        include_citations: true
      }
    ];

    for (const testCase of testCases) {
      await this.runToolTest('get_paper_details', testCase.name, {
        paper_id: testCase.paper_id,
        include_citations: testCase.include_citations,
        include_references: testCase.include_references
      });
    }
  }

  async testSearchArxiv() {
    console.log('\\n=== Testing search_arxiv ===');
    
    const testCases = [
      {
        name: 'ArXiv search with category',
        query: 'attention mechanism',
        category: 'cs.AI',
        max_results: 5
      },
      {
        name: 'Sort by date',
        query: 'transformer',
        sort_by: 'submittedDate',
        max_results: 3
      }
    ];

    for (const testCase of testCases) {
      await this.runToolTest('search_arxiv', testCase.name, {
        query: testCase.query,
        category: testCase.category,
        max_results: testCase.max_results,
        sort_by: testCase.sort_by
      });
    }
  }

  async testAnalyzePaper() {
    console.log('\\n=== Testing analyze_paper ===');
    
    const testCases = [
      {
        name: 'Comprehensive analysis',
        paper_content: 'This paper presents a novel approach to machine learning using deep neural networks. The methodology involves training on large datasets and evaluating performance on benchmark tasks.',
        analysis_type: 'comprehensive'
      },
      {
        name: 'Summary analysis',
        paper_content: 'Research on artificial intelligence and its applications in healthcare.',
        analysis_type: 'summary'
      },
      {
        name: 'Gap analysis',
        paper_content: 'Study of reinforcement learning algorithms and their limitations.',
        analysis_type: 'gaps'
      }
    ];

    for (const testCase of testCases) {
      await this.runToolTest('analyze_paper', testCase.name, {
        paper_content: testCase.paper_content,
        analysis_type: testCase.analysis_type,
        focus_areas: testCase.focus_areas
      });
    }
  }

  async testGetCitations() {
    console.log('\\n=== Testing get_citations ===');
    
    const testCases = [
      {
        name: 'APA citation format',
        paper_id: 'arxiv:1706.03762',
        citation_format: 'apa'
      },
      {
        name: 'BibTeX format',
        paper_id: 'doi:10.1038/nature14539',
        citation_format: 'bibtex'
      },
      {
        name: 'Vancouver format with related papers',
        paper_id: 'arxiv:2301.07041',
        citation_format: 'vancouver',
        include_related: true
      }
    ];

    for (const testCase of testCases) {
      await this.runToolTest('get_citations', testCase.name, {
        paper_id: testCase.paper_id,
        citation_format: testCase.citation_format,
        include_related: testCase.include_related
      });
    }
  }

  async testResearchQuery() {
    console.log('\\n=== Testing research_query ===');
    
    const testCases = [
      {
        name: 'Comprehensive research query',
        research_question: 'What are the latest developments in natural language processing?',
        scope: {
          fields: ['computer science', 'linguistics'],
          time_range: { start_year: 2022, end_year: 2024 }
        },
        analysis_depth: 'comprehensive'
      },
      {
        name: 'Quick overview query',
        research_question: 'How effective is machine learning in medical diagnosis?',
        analysis_depth: 'overview'
      }
    ];

    for (const testCase of testCases) {
      await this.runToolTest('research_query', testCase.name, {
        research_question: testCase.research_question,
        scope: testCase.scope,
        analysis_depth: testCase.analysis_depth
      });
    }
  }

  async testHelperTools() {
    console.log('\\n=== Testing Helper Tools ===');
    
    // Test help tool
    await this.runToolTest('help', 'General help', {});
    await this.runToolTest('help', 'Search help', { topic: 'search' });
    
    // Test list_tools
    await this.runToolTest('list_tools', 'List all tools', { include_examples: true });
  }

  async runToolTest(toolName, testName, args) {
    try {
      console.log(`\\nTesting: ${testName} (${toolName})`);
      
      const request = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 10000),
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      const response = await this.sendMCPRequest(request);
      
      if (response.error) {
        console.log(`❌ FAILED: ${response.error.message}`);
        this.testResults.push({
          tool: toolName,
          test: testName,
          status: 'FAILED',
          error: response.error.message
        });
      } else {
        const result = JSON.parse(response.result.content[0].text);
        console.log(`✅ SUCCESS: ${toolName} returned valid result`);
        
        // Log key result information
        if (result.results_count !== undefined) {
          console.log(`   Found ${result.results_count} results`);
        }
        if (result.analysis) {
          console.log(`   Analysis type: ${Object.keys(result.analysis).join(', ')}`);
        }
        if (result.citation) {
          console.log(`   Citation generated successfully`);
        }
        
        this.testResults.push({
          tool: toolName,
          test: testName,
          status: 'SUCCESS',
          resultKeys: Object.keys(result)
        });
      }
    } catch (error) {
      console.log(`❌ EXCEPTION: ${error.message}`);
      this.testResults.push({
        tool: toolName,
        test: testName,
        status: 'EXCEPTION',
        error: error.message
      });
    }
  }

  async testErrorHandling() {
    console.log('\\n=== Testing Error Handling ===');
    
    const errorTests = [
      {
        name: 'Missing query parameter',
        tool: 'search_papers',
        args: {} // Missing required query
      },
      {
        name: 'Invalid paper ID',
        tool: 'get_paper_details',
        args: { paper_id: 'invalid:12345' }
      },
      {
        name: 'Nonexistent tool',
        tool: 'fake_tool',
        args: { query: 'test' }
      }
    ];

    for (const test of errorTests) {
      try {
        console.log(`\\nTesting: ${test.name}`);
        const request = {
          jsonrpc: '2.0',
          id: Math.floor(Math.random() * 10000),
          method: 'tools/call',
          params: {
            name: test.tool,
            arguments: test.args
          }
        };

        const response = await this.sendMCPRequest(request);
        
        if (response.error) {
          console.log(`✅ Error properly handled: ${response.error.message}`);
          this.testResults.push({
            tool: test.tool,
            test: test.name,
            status: 'ERROR_HANDLED',
            errorMessage: response.error.message
          });
        } else {
          console.log(`⚠️  Expected error but got success`);
          this.testResults.push({
            tool: test.tool,
            test: test.name,
            status: 'UNEXPECTED_SUCCESS'
          });
        }
      } catch (error) {
        console.log(`✅ Exception properly caught: ${error.message}`);
        this.testResults.push({
          tool: test.tool,
          test: test.name,
          status: 'EXCEPTION_HANDLED'
        });
      }
    }
  }

  printSummary() {
    console.log('\\n=== Scientific Research Tools Test Summary ===');
    
    const byTool = {};
    this.testResults.forEach(result => {
      if (!byTool[result.tool]) {
        byTool[result.tool] = { total: 0, passed: 0, failed: 0 };
      }
      byTool[result.tool].total++;
      if (result.status === 'SUCCESS') {
        byTool[result.tool].passed++;
      } else {
        byTool[result.tool].failed++;
      }
    });
    
    console.log('\\n📊 Results by Tool:');
    Object.entries(byTool).forEach(([tool, stats]) => {
      const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`${tool}: ${stats.passed}/${stats.total} passed (${passRate}%)`);
    });
    
    const totalTests = this.testResults.length;
    const totalPassed = this.testResults.filter(r => r.status === 'SUCCESS').length;
    const totalFailed = this.testResults.filter(r => r.status === 'FAILED').length;
    const totalErrors = this.testResults.filter(r => r.status.includes('ERROR')).length;
    
    console.log(`\\n📈 Overall Results:`);
    console.log(`Total tests: ${totalTests}`);
    console.log(`✅ Passed: ${totalPassed}`);
    console.log(`❌ Failed: ${totalFailed}`);
    console.log(`🛡️  Error handling: ${totalErrors}`);
    console.log(`Success rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);

    console.log('\\n🔧 Available Tools Confirmed:');
    const uniqueTools = [...new Set(this.testResults.map(r => r.tool))];
    uniqueTools.forEach(tool => {
      const toolTests = this.testResults.filter(r => r.tool === tool);
      const passed = toolTests.filter(r => r.status === 'SUCCESS').length;
      console.log(`- ${tool} (${passed > 0 ? '✅ working' : '❌ issues'})`);
    });
  }

  async run() {
    try {
      await this.startServer();
      await this.testSearchPapers();
      await this.testGetPaperDetails();
      await this.testSearchArxiv();
      await this.testAnalyzePaper();
      await this.testGetCitations();
      await this.testResearchQuery();
      await this.testHelperTools();
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
const test = new ResearchToolsTest();
test.run().then(() => {
  console.log('\\n🎯 Scientific research tools testing completed!');
  console.log('\\n💡 These tools should resolve the -32601 errors you were experiencing.');
}).catch(error => {
  console.error('Test runner failed:', error);
  process.exit(1);
});