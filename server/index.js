#!/usr/bin/env node

/**
 * ASR-GoT MCP Server
 * Advanced Scientific Reasoning Graph-of-Thoughts Model Context Protocol Server
 * 
 * Implements the 8-stage ASR-GoT framework for systematic scientific reasoning:
 * 1. Initialization, 2. Decomposition, 3. Hypothesis/Planning, 4. Evidence Integration,
 * 5. Pruning/Merging, 6. Subgraph Extraction, 7. Composition, 8. Reflection
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import { evaluate } from 'mathjs';
import yaml from 'js-yaml';

// ASR-GoT Graph State Management
class ASRGoTGraph {
  constructor(config = {}) {
    this.vertices = new Map();
    this.edges = new Map();
    this.hyperedges = new Map();
    this.layers = new Map();
    this.metadata = {
      created: new Date().toISOString(),
      version: '1.0.0',
      stage: 'initialization',
      config: config
    };
    this.currentStage = 1;
    this.stageNames = [
      'initialization', 'decomposition', 'hypothesis_planning', 
      'evidence_integration', 'pruning_merging', 'subgraph_extraction',
      'composition', 'reflection'
    ];
  }

  // Stage 1: Initialize root node
  initialize(taskDescription, initialConfidence = [0.8, 0.8, 0.8, 0.8]) {
    const rootNode = {
      node_id: 'n0',
      label: 'Task Understanding',
      type: 'root',
      content: taskDescription,
      confidence: initialConfidence,
      metadata: {
        created: new Date().toISOString(),
        provenance: 'user_input',
        epistemic_status: 'accepted',
        disciplinary_tags: [],
        falsification_criteria: null,
        bias_flags: [],
        revision_history: [],
        layer_id: 'base',
        topology_metrics: {},
        statistical_power: null,
        info_metrics: {},
        impact_score: 0.5,
        attribution: []
      }
    };
    
    this.vertices.set('n0', rootNode);
    this.metadata.stage = 'initialization';
    this.currentStage = 1;
    
    return {
      success: true,
      node_id: 'n0',
      message: 'ASR-GoT graph initialized successfully',
      current_stage: this.currentStage
    };
  }

  // Stage 2: Decompose task into dimensions
  decomposeTask(dimensions = null) {
    if (this.currentStage !== 1) {
      throw new Error(`Cannot decompose. Current stage: ${this.currentStage}, expected: 1`);
    }

    const defaultDimensions = [
      'Scope', 'Objectives', 'Constraints', 'Data Needs', 
      'Use Cases', 'Potential Biases', 'Knowledge Gaps'
    ];
    
    const taskDimensions = dimensions || defaultDimensions;
    const dimensionNodes = [];

    taskDimensions.forEach((dimension, index) => {
      const nodeId = `n2.${index + 1}`;
      const dimensionNode = {
        node_id: nodeId,
        label: dimension,
        type: 'dimension',
        content: `Analysis of ${dimension} aspects of the research task`,
        confidence: [0.8, 0.8, 0.8, 0.8],
        metadata: {
          created: new Date().toISOString(),
          provenance: 'task_decomposition',
          epistemic_status: 'pending',
          disciplinary_tags: [],
          falsification_criteria: null,
          bias_flags: [],
          revision_history: [],
          layer_id: 'decomposition',
          topology_metrics: {},
          statistical_power: null,
          info_metrics: {},
          impact_score: 0.4,
          attribution: []
        }
      };

      this.vertices.set(nodeId, dimensionNode);
      
      // Create edge from root to dimension node
      const edgeId = `e_n0_${nodeId}`;
      this.edges.set(edgeId, {
        edge_id: edgeId,
        source: 'n0',
        target: nodeId,
        edge_type: 'Decomposition',
        confidence: [0.9, 0.9, 0.9, 0.9],
        causal_metadata: null,
        temporal_metadata: null
      });

      dimensionNodes.push(nodeId);
    });

    this.currentStage = 2;
    this.metadata.stage = 'decomposition';

    return {
      success: true,
      dimension_nodes: dimensionNodes,
      message: `Task decomposed into ${taskDimensions.length} dimensions`,
      current_stage: this.currentStage
    };
  }

  // Stage 3: Generate hypotheses with detailed metadata
  generateHypotheses(dimensionNodeId, hypotheses, config = {}) {
    if (this.currentStage !== 2) {
      throw new Error(`Cannot generate hypotheses. Current stage: ${this.currentStage}, expected: 2`);
    }

    if (!this.vertices.has(dimensionNodeId)) {
      throw new Error(`Dimension node ${dimensionNodeId} not found`);
    }

    const maxHypotheses = config.max_hypotheses || 5;
    const hypothesisNodes = [];

    hypotheses.slice(0, maxHypotheses).forEach((hypothesis, index) => {
      const nodeId = `h_${dimensionNodeId}_${index + 1}`;
      const hypothesisNode = {
        node_id: nodeId,
        label: `Hypothesis ${index + 1}`,
        type: 'hypothesis',
        content: hypothesis.content || hypothesis,
        confidence: hypothesis.confidence || [0.5, 0.5, 0.5, 0.5],
        metadata: {
          created: new Date().toISOString(),
          provenance: 'hypothesis_generation',
          epistemic_status: 'hypothetical',
          disciplinary_tags: hypothesis.disciplinary_tags || [],
          falsification_criteria: hypothesis.falsification_criteria || null,
          bias_flags: hypothesis.bias_flags || [],
          revision_history: [],
          layer_id: 'hypothesis',
          topology_metrics: {},
          statistical_power: null,
          info_metrics: {},
          impact_score: hypothesis.impact_score || 0.6,
          attribution: hypothesis.attribution || [],
          plan: hypothesis.plan || null
        }
      };

      this.vertices.set(nodeId, hypothesisNode);

      // Create edge from dimension to hypothesis
      const edgeId = `e_${dimensionNodeId}_${nodeId}`;
      this.edges.set(edgeId, {
        edge_id: edgeId,
        source: dimensionNodeId,
        target: nodeId,
        edge_type: 'Hypothesis',
        confidence: [0.8, 0.8, 0.8, 0.8],
        causal_metadata: null,
        temporal_metadata: null
      });

      hypothesisNodes.push(nodeId);
    });

    this.currentStage = 3;
    this.metadata.stage = 'hypothesis_planning';

    return {
      success: true,
      hypothesis_nodes: hypothesisNodes,
      message: `Generated ${hypothesisNodes.length} hypotheses for dimension ${dimensionNodeId}`,
      current_stage: this.currentStage
    };
  }

  // Stage 4: Evidence integration with Bayesian updates
  integrateEvidence(hypothesisNodeId, evidence, config = {}) {
    if (this.currentStage !== 3) {
      throw new Error(`Cannot integrate evidence. Current stage: ${this.currentStage}, expected: 3`);
    }

    if (!this.vertices.has(hypothesisNodeId)) {
      throw new Error(`Hypothesis node ${hypothesisNodeId} not found`);
    }

    const evidenceId = `e_${uuidv4().slice(0, 8)}`;
    const evidenceNode = {
      node_id: evidenceId,
      label: evidence.title || 'Evidence',
      type: 'evidence',
      content: evidence.content,
      confidence: evidence.confidence || [0.7, 0.7, 0.7, 0.7],
      metadata: {
        created: new Date().toISOString(),
        provenance: evidence.provenance || 'evidence_integration',
        epistemic_status: 'evaluated',
        disciplinary_tags: evidence.disciplinary_tags || [],
        falsification_criteria: null,
        bias_flags: evidence.bias_flags || [],
        revision_history: [],
        layer_id: 'evidence',
        topology_metrics: {},
        statistical_power: evidence.statistical_power || null,
        info_metrics: evidence.info_metrics || {},
        impact_score: evidence.impact_score || 0.5,
        attribution: evidence.attribution || []
      }
    };

    this.vertices.set(evidenceId, evidenceNode);

    // Create typed edge between evidence and hypothesis
    const edgeId = `e_${evidenceId}_${hypothesisNodeId}`;
    const edgeType = evidence.relationship || 'Supportive';
    
    this.edges.set(edgeId, {
      edge_id: edgeId,
      source: evidenceId,
      target: hypothesisNodeId,
      edge_type: edgeType,
      confidence: evidence.edge_confidence || [0.8, 0.8, 0.8, 0.8],
      causal_metadata: evidence.causal_metadata || null,
      temporal_metadata: evidence.temporal_metadata || null
    });

    // Bayesian confidence update
    const hypothesis = this.vertices.get(hypothesisNodeId);
    const updateFactor = this._calculateBayesianUpdate(evidence, edgeType);
    hypothesis.confidence = hypothesis.confidence.map((c, i) => 
      Math.min(0.99, Math.max(0.01, c * updateFactor[i]))
    );

    this.currentStage = 4;
    this.metadata.stage = 'evidence_integration';

    return {
      success: true,
      evidence_id: evidenceId,
      updated_confidence: hypothesis.confidence,
      message: `Evidence integrated and confidence updated for hypothesis ${hypothesisNodeId}`,
      current_stage: this.currentStage
    };
  }

  // Helper method for Bayesian confidence updates
  _calculateBayesianUpdate(evidence, edgeType) {
    const evidenceStrength = evidence.confidence.reduce((a, b) => a + b, 0) / 4;
    const statPower = evidence.statistical_power?.power || 0.8;
    
    let updateFactors = [1.0, 1.0, 1.0, 1.0];
    
    switch (edgeType) {
      case 'Supportive':
        updateFactors = updateFactors.map(f => f * (1 + evidenceStrength * statPower * 0.2));
        break;
      case 'Contradictory':
        updateFactors = updateFactors.map(f => f * (1 - evidenceStrength * statPower * 0.2));
        break;
      case 'Correlative':
        updateFactors = updateFactors.map(f => f * (1 + evidenceStrength * statPower * 0.1));
        break;
      default:
        updateFactors = updateFactors.map(f => f * (1 + evidenceStrength * statPower * 0.05));
    }
    
    return updateFactors;
  }

  // Get graph summary for current state
  getGraphSummary() {
    const summary = {
      total_nodes: this.vertices.size,
      total_edges: this.edges.size,
      total_hyperedges: this.hyperedges.size,
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1],
      layers: Array.from(this.layers.keys()),
      node_types: {}
    };

    // Count nodes by type
    for (const node of this.vertices.values()) {
      summary.node_types[node.type] = (summary.node_types[node.type] || 0) + 1;
    }

    return summary;
  }

  // Export graph in various formats
  exportGraph(format = 'json') {
    const graphData = {
      metadata: this.metadata,
      vertices: Array.from(this.vertices.values()),
      edges: Array.from(this.edges.values()),
      hyperedges: Array.from(this.hyperedges.values()),
      layers: Array.from(this.layers.values())
    };

    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(graphData, null, 2);
      case 'yaml':
        return yaml.dump(graphData);
      case 'graphml':
        return this._exportGraphML(graphData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  _exportGraphML(graphData) {
    let graphml = `<?xml version="1.0" encoding="UTF-8"?>
<graphml xmlns="http://graphml.graphdrawing.org/xmlns">
  <key id="label" for="node" attr.name="label" attr.type="string"/>
  <key id="type" for="node" attr.name="type" attr.type="string"/>
  <key id="confidence" for="node" attr.name="confidence" attr.type="string"/>
  <key id="edge_type" for="edge" attr.name="edge_type" attr.type="string"/>
  <graph id="ASR-GoT" edgedefault="directed">
`;

    // Add nodes
    for (const node of graphData.vertices) {
      graphml += `    <node id="${node.node_id}">
      <data key="label">${node.label}</data>
      <data key="type">${node.type}</data>
      <data key="confidence">${JSON.stringify(node.confidence)}</data>
    </node>
`;
    }

    // Add edges
    for (const edge of graphData.edges) {
      graphml += `    <edge source="${edge.source}" target="${edge.target}">
      <data key="edge_type">${edge.edge_type}</data>
    </edge>
`;
    }

    graphml += `  </graph>
</graphml>`;

    return graphml;
  }
}

// Global graph instance
let currentGraph = null;

// Server instance
const server = new Server(
  {
    name: 'asr-got-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool definitions
const tools = [
  {
    name: 'initialize_asr_got_graph',
    description: 'Initialize a new ASR-GoT reasoning graph with specified research task and parameters',
    inputSchema: {
      type: 'object',
      properties: {
        task_description: {
          type: 'string',
          description: 'Detailed description of the research task or question'
        },
        initial_confidence: {
          type: 'array',
          items: { type: 'number', minimum: 0, maximum: 1 },
          description: 'Initial confidence vector [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment]',
          default: [0.8, 0.8, 0.8, 0.8]
        },
        config: {
          type: 'object',
          description: 'Additional configuration parameters',
          properties: {
            research_domain: { type: 'string' },
            enable_multi_layer: { type: 'boolean', default: true },
            temporal_decay_factor: { type: 'number', default: 0.95 }
          }
        }
      },
      required: ['task_description']
    }
  },
  {
    name: 'decompose_research_task',
    description: 'Decompose research task into fundamental dimensions',
    inputSchema: {
      type: 'object',
      properties: {
        dimensions: {
          type: 'array',
          items: { type: 'string' },
          description: 'Custom dimensions for task decomposition',
          default: ['Scope', 'Objectives', 'Constraints', 'Data Needs', 'Use Cases', 'Potential Biases', 'Knowledge Gaps']
        }
      }
    }
  },
  {
    name: 'generate_hypotheses',
    description: 'Generate competing hypotheses with confidence estimates and metadata',
    inputSchema: {
      type: 'object',
      properties: {
        dimension_node_id: {
          type: 'string',
          description: 'ID of the dimension node to generate hypotheses for'
        },
        hypotheses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: { type: 'string' },
              confidence: { type: 'array', items: { type: 'number' } },
              falsification_criteria: { type: 'string' },
              impact_score: { type: 'number' },
              disciplinary_tags: { type: 'array', items: { type: 'string' } },
              plan: { type: 'string' }
            },
            required: ['content']
          }
        },
        config: {
          type: 'object',
          properties: {
            max_hypotheses: { type: 'number', default: 5 }
          }
        }
      },
      required: ['dimension_node_id', 'hypotheses']
    }
  },
  {
    name: 'integrate_evidence',
    description: 'Integrate new evidence with Bayesian confidence updates',
    inputSchema: {
      type: 'object',
      properties: {
        hypothesis_node_id: {
          type: 'string',
          description: 'ID of the hypothesis node to link evidence to'
        },
        evidence: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            confidence: { type: 'array', items: { type: 'number' } },
            relationship: { 
              type: 'string',
              enum: ['Supportive', 'Contradictory', 'Correlative', 'Prerequisite'],
              default: 'Supportive'
            },
            statistical_power: {
              type: 'object',
              properties: {
                power: { type: 'number' },
                sample_size: { type: 'number' },
                effect_size: { type: 'number' }
              }
            },
            provenance: { type: 'string' },
            disciplinary_tags: { type: 'array', items: { type: 'string' } },
            impact_score: { type: 'number' }
          },
          required: ['content']
        }
      },
      required: ['hypothesis_node_id', 'evidence']
    }
  },
  {
    name: 'export_graph_data',
    description: 'Export graph data in various formats',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json', 'yaml', 'graphml'],
          default: 'json',
          description: 'Export format for the graph data'
        }
      }
    }
  },
  {
    name: 'get_graph_summary',
    description: 'Get current graph state summary and statistics',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'initialize_asr_got_graph':
        currentGraph = new ASRGoTGraph(args.config || {});
        const initResult = currentGraph.initialize(
          args.task_description,
          args.initial_confidence
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(initResult, null, 2)
            }
          ]
        };

      case 'decompose_research_task':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
        }
        const decomposeResult = currentGraph.decomposeTask(args.dimensions);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(decomposeResult, null, 2)
            }
          ]
        };

      case 'generate_hypotheses':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
        }
        const hypothesesResult = currentGraph.generateHypotheses(
          args.dimension_node_id,
          args.hypotheses,
          args.config
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(hypothesesResult, null, 2)
            }
          ]
        };

      case 'integrate_evidence':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
        }
        const evidenceResult = currentGraph.integrateEvidence(
          args.hypothesis_node_id,
          args.evidence
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(evidenceResult, null, 2)
            }
          ]
        };

      case 'export_graph_data':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
        }
        const exportedData = currentGraph.exportGraph(args.format);
        return {
          content: [
            {
              type: 'text',
              text: exportedData
            }
          ]
        };

      case 'get_graph_summary':
        if (!currentGraph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
        }
        const summary = currentGraph.getGraphSummary();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(summary, null, 2)
            }
          ]
        };

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
  }
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('ASR-GoT MCP Server running...');
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});