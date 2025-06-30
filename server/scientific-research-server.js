#!/usr/bin/env node

/**
 * Scientific Research MCP Server
 * Provides tools for searching papers, analyzing research, and conducting literature reviews
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Scientific Research Tools Definition
const scientificTools = [
  {
    name: 'search_papers',
    description: 'Search for academic papers using keywords, authors, or topics. Returns paper titles, abstracts, and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query (keywords, topic, or research question)' },
        limit: { type: 'number', default: 10, description: 'Maximum number of papers to return' },
        year_range: { 
          type: 'object', 
          properties: {
            start: { type: 'number', description: 'Start year' },
            end: { type: 'number', description: 'End year' }
          }
        },
        include_preprints: { type: 'boolean', default: true, description: 'Include preprint papers' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_paper_details',
    description: 'Get detailed information about a specific paper including full abstract, authors, citations, and methodology.',
    inputSchema: {
      type: 'object',
      properties: {
        paper_id: { type: 'string', description: 'Paper identifier (DOI, ArXiv ID, or URL)' },
        include_citations: { type: 'boolean', default: true, description: 'Include citation information' },
        include_references: { type: 'boolean', default: false, description: 'Include paper references' }
      },
      required: ['paper_id']
    }
  },
  {
    name: 'search_arxiv',
    description: 'Search ArXiv preprint repository for the latest research papers in various fields.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        category: { 
          type: 'string', 
          description: 'ArXiv category (e.g., cs.AI, physics.gen-ph, q-bio.BM)',
          enum: ['cs.AI', 'cs.LG', 'cs.CL', 'physics.gen-ph', 'q-bio.BM', 'stat.ML', 'math.ST', 'econ.EM']
        },
        max_results: { type: 'number', default: 20, description: 'Maximum results to return' },
        sort_by: { 
          type: 'string', 
          enum: ['relevance', 'lastUpdatedDate', 'submittedDate'],
          default: 'relevance'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'analyze_paper',
    description: 'Analyze a research paper and extract key information including methodology, findings, limitations, and research gaps.',
    inputSchema: {
      type: 'object',
      properties: {
        paper_content: { type: 'string', description: 'Paper content (abstract, full text, or URL)' },
        analysis_type: {
          type: 'string',
          enum: ['summary', 'methodology', 'findings', 'gaps', 'comprehensive'],
          default: 'comprehensive'
        },
        focus_areas: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific areas to focus analysis on'
        }
      },
      required: ['paper_content']
    }
  },
  {
    name: 'get_citations',
    description: 'Get citation information and related papers for a given research paper.',
    inputSchema: {
      type: 'object',
      properties: {
        paper_id: { type: 'string', description: 'Paper identifier' },
        citation_format: {
          type: 'string',
          enum: ['apa', 'mla', 'chicago', 'vancouver', 'bibtex'],
          default: 'apa'
        },
        include_related: { type: 'boolean', default: true, description: 'Include related papers' }
      },
      required: ['paper_id']
    }
  },
  {
    name: 'research_query',
    description: 'Execute a comprehensive research query that combines multiple search strategies and provides synthesized results.',
    inputSchema: {
      type: 'object',
      properties: {
        research_question: { type: 'string', description: 'Main research question or topic' },
        scope: {
          type: 'object',
          properties: {
            fields: { type: 'array', items: { type: 'string' }, description: 'Research fields to include' },
            time_range: { 
              type: 'object',
              properties: {
                start_year: { type: 'number' },
                end_year: { type: 'number' }
              }
            },
            publication_types: { 
              type: 'array', 
              items: { type: 'string' },
              description: 'Types of publications (journal, conference, preprint, etc.)'
            }
          }
        },
        analysis_depth: {
          type: 'string',
          enum: ['overview', 'detailed', 'comprehensive'],
          default: 'detailed'
        }
      },
      required: ['research_question']
    }
  },
  {
    name: 'help',
    description: 'Get help information about available research tools and how to use them effectively.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { 
          type: 'string', 
          description: 'Specific topic to get help about',
          enum: ['search', 'analysis', 'citations', 'general']
        }
      }
    }
  },
  {
    name: 'list_tools',
    description: 'List all available research tools with their descriptions and usage examples.',
    inputSchema: {
      type: 'object',
      properties: {
        include_examples: { type: 'boolean', default: true, description: 'Include usage examples' }
      }
    }
  }
];

// Mock research database for demonstration
class MockResearchDatabase {
  constructor() {
    this.papers = [
      {
        id: 'arxiv:2301.07041',
        title: 'Language Models are Few-Shot Learners',
        authors: ['Tom B. Brown', 'Benjamin Mann', 'Nick Ryder'],
        abstract: 'Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task...',
        year: 2020,
        venue: 'NeurIPS',
        category: 'cs.LG',
        citations: 15420,
        url: 'https://arxiv.org/abs/2005.14165'
      },
      {
        id: 'doi:10.1038/nature14539',
        title: 'Human-level control through deep reinforcement learning',
        authors: ['Volodymyr Mnih', 'Koray Kavukcuoglu', 'David Silver'],
        abstract: 'The theory of reinforcement learning provides a normative account connecting learning and decision making...',
        year: 2015,
        venue: 'Nature',
        category: 'cs.AI',
        citations: 12890,
        url: 'https://www.nature.com/articles/nature14539'
      },
      {
        id: 'arxiv:1706.03762',
        title: 'Attention Is All You Need',
        authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar'],
        abstract: 'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...',
        year: 2017,
        venue: 'NeurIPS',
        category: 'cs.CL',
        citations: 25340,
        url: 'https://arxiv.org/abs/1706.03762'
      }
    ];
  }

  searchPapers(query, options = {}) {
    const { limit = 10, year_range, include_preprints = true } = options;
    
    let results = this.papers.filter(paper => {
      const searchText = `${paper.title} ${paper.abstract} ${paper.authors.join(' ')}`.toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase());
      
      if (!matchesQuery) return false;
      
      if (year_range) {
        if (year_range.start && paper.year < year_range.start) return false;
        if (year_range.end && paper.year > year_range.end) return false;
      }
      
      if (!include_preprints && paper.id.startsWith('arxiv:')) return false;
      
      return true;
    });
    
    return results.slice(0, limit);
  }

  getPaperDetails(paperId) {
    const paper = this.papers.find(p => p.id === paperId || p.url.includes(paperId));
    if (!paper) {
      throw new Error(`Paper not found: ${paperId}`);
    }
    
    return {
      ...paper,
      full_abstract: paper.abstract + ' [This is a mock implementation - in reality, this would fetch the complete paper details]',
      methodology: 'Deep learning approach using transformer architecture',
      key_findings: ['Significant performance improvements', 'Novel architectural innovations', 'Scalability benefits'],
      limitations: ['Computational requirements', 'Data dependency', 'Interpretability challenges'],
      related_papers: this.papers.filter(p => p.id !== paper.id).slice(0, 3)
    };
  }

  searchArxiv(query, options = {}) {
    const { category, max_results = 20, sort_by = 'relevance' } = options;
    
    let results = this.papers.filter(paper => {
      if (!paper.id.startsWith('arxiv:')) return false;
      
      const searchText = `${paper.title} ${paper.abstract}`.toLowerCase();
      const matchesQuery = searchText.includes(query.toLowerCase());
      
      if (category && paper.category !== category) return false;
      
      return matchesQuery;
    });
    
    if (sort_by === 'relevance') {
      results.sort((a, b) => b.citations - a.citations);
    } else if (sort_by === 'submittedDate') {
      results.sort((a, b) => b.year - a.year);
    }
    
    return results.slice(0, max_results);
  }

  analyzePaper(content, analysisType = 'comprehensive') {
    // Mock analysis - in reality, this would use NLP/AI to analyze the paper
    const analysis = {
      summary: 'This paper presents novel research in the field with significant implications.',
      methodology: 'Experimental approach using quantitative methods and statistical analysis.',
      findings: [
        'Key finding 1: Significant improvement in performance metrics',
        'Key finding 2: Novel approach outperforms baseline methods',
        'Key finding 3: Scalable solution with practical applications'
      ],
      gaps: [
        'Limited evaluation on diverse datasets',
        'Lack of long-term impact assessment',
        'Insufficient comparison with recent state-of-the-art methods'
      ],
      recommendations: [
        'Expand evaluation to additional domains',
        'Conduct longitudinal studies',
        'Compare with latest competing approaches'
      ]
    };
    
    if (analysisType === 'summary') {
      return { summary: analysis.summary };
    } else if (analysisType === 'methodology') {
      return { methodology: analysis.methodology };
    } else if (analysisType === 'findings') {
      return { findings: analysis.findings };
    } else if (analysisType === 'gaps') {
      return { gaps: analysis.gaps, recommendations: analysis.recommendations };
    }
    
    return analysis;
  }

  getCitations(paperId, format = 'apa') {
    const paper = this.papers.find(p => p.id === paperId);
    if (!paper) {
      throw new Error(`Paper not found: ${paperId}`);
    }
    
    const citations = {
      apa: `${paper.authors.join(', ')} (${paper.year}). ${paper.title}. ${paper.venue}.`,
      mla: `${paper.authors[0]}. "${paper.title}." ${paper.venue}, ${paper.year}.`,
      chicago: `${paper.authors.join(', ')}. "${paper.title}." ${paper.venue} (${paper.year}).`,
      vancouver: `${paper.authors.join(', ')}. ${paper.title}. ${paper.venue}. ${paper.year}.`,
      bibtex: `@article{${paper.id.replace(':', '_')},\n  title={${paper.title}},\n  author={${paper.authors.join(' and ')}},\n  journal={${paper.venue}},\n  year={${paper.year}}\n}`
    };
    
    return {
      citation: citations[format],
      related_papers: this.papers.filter(p => p.id !== paper.id).slice(0, 5),
      citation_count: paper.citations
    };
  }
}

// Initialize mock database
const mockDB = new MockResearchDatabase();

// Create MCP server
const server = new Server(
  {
    name: 'scientific-research-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool request handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case 'search_papers': {
        if (!args.query) {
          throw new McpError(ErrorCode.InvalidParams, 'Missing required argument: query');
        }
        
        const searchResults = mockDB.searchPapers(args.query, {
          limit: args.limit,
          year_range: args.year_range,
          include_preprints: args.include_preprints
        });
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              query: args.query,
              results_count: searchResults.length,
              papers: searchResults.map(paper => ({
                id: paper.id,
                title: paper.title,
                authors: paper.authors,
                year: paper.year,
                venue: paper.venue,
                citations: paper.citations,
                abstract_preview: paper.abstract.substring(0, 200) + '...'
              }))
            }, null, 2)
          }]
        };
      }

      case 'get_paper_details': {
        if (!args.paper_id) {
          throw new McpError(ErrorCode.InvalidParams, 'Missing required argument: paper_id');
        }
        
        const paperDetails = mockDB.getPaperDetails(args.paper_id);
        
        return {
          content: [{
            type: 'text',
            text: JSON.stringify(paperDetails, null, 2)
          }]
        };
      }

      // case 'search_arxiv': { … }
      // case 'analyze_paper': { … }
      // case 'get_citations': { … }
      // case 'research_query': { … }
      // case 'help': { … }
      // case 'list_tools': { … }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Tool execution failed: ${error.message}`);
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
  }
});

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: scientificTools };
});

// Start server
async function main() {
  try {
    console.error('[INFO] Starting Scientific Research MCP Server');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`[INFO] Scientific Research Server running with ${scientificTools.length} tools`);
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    process.exit(1);
  }
}

main();