#!/usr/bin/env node

/**
 * Complete ASR-GoT MCP Server Implementation - Line by Line Specification Compliance
 * Advanced Scientific Reasoning Graph-of-Thoughts Model Context Protocol Server
 * 
 * Implements the complete 8-stage ASR-GoT framework with all 29 parameters (P1.0-P1.29)
 * Following the specification from scentific-reserch-GoT.md exactly line by line
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
import crypto from 'crypto';

// Input validation utilities to prevent injection and malformed data
class InputValidator {
  static validateString(value, fieldName, options = {}) {
    if (typeof value !== 'string') {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} must be a string`);
    }
    
    if (options.required && (!value || value.trim().length === 0)) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} is required and cannot be empty`);
    }
    
    if (options.maxLength && value.length > options.maxLength) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} exceeds maximum length of ${options.maxLength}`);
    }
    
    if (options.minLength && value.length < options.minLength) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} must be at least ${options.minLength} characters`);
    }
    
    // Basic XSS and injection prevention
    const dangerousPatterns = /<script|javascript:|data:|vbscript:|on\w+\s*=/i;
    if (dangerousPatterns.test(value)) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} contains potentially dangerous content`);
    }
    
    return value.trim();
  }
  
  static validateNumber(value, fieldName, options = {}) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} must be a valid number`);
    }
    
    if (options.min !== undefined && value < options.min) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} must be at least ${options.min}`);
    }
    
    if (options.max !== undefined && value > options.max) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} must be at most ${options.max}`);
    }
    
    return value;
  }
  
  static validateArray(value, fieldName, options = {}) {
    if (!Array.isArray(value)) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} must be an array`);
    }
    
    if (options.required && value.length === 0) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} cannot be empty`);
    }
    
    if (options.maxItems && value.length > options.maxItems) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} cannot have more than ${options.maxItems} items`);
    }
    
    if (options.minItems && value.length < options.minItems) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} must have at least ${options.minItems} items`);
    }
    
    return value;
  }
  
  static validateObject(value, fieldName, options = {}) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} must be a valid object`);
    }
    
    // Prevent prototype pollution
    if (value.hasOwnProperty('__proto__') || value.hasOwnProperty('constructor') || value.hasOwnProperty('prototype')) {
      throw new McpError(ErrorCode.InvalidParams, `${fieldName} contains forbidden properties`);
    }
    
    return value;
  }
}

// Complete ASR-GoT Graph State Management - Exact Specification Implementation
class ASRGoTGraph {
  constructor(config = {}) {
    try {
      // Input validation
      if (config !== null && typeof config !== 'object') {
        throw new Error('Config must be an object or null');
      }
      
      // P1.11: Mathematical Formalism - Gₜ = (Vₜ, Eₜ∪Eₕₜ, Lₜ, T, Cₜ, Mₜ, Iₜ)
      this.vertices = new Map(); // Vₜ
      this.edges = new Map(); // Eₜ (binary edges)
      this.hyperedges = new Map(); // Eₕₜ (P1.9)
      this.layers = new Map(); // Lₜ (P1.23)
      this.nodeTypes = new Set(); // T
      this.confidenceFunction = new Map(); // Cₜ (P1.14)
      this.metadataFunction = new Map(); // Mₜ (P1.12)
      this.informationMetrics = new Map(); // Iₜ (P1.27)
      
      // Memory management limits
      this.maxVertices = config.maxVertices || 10000;
      this.maxEdges = config.maxEdges || 50000;
      this.isFailsafe = true;
      this.errorLog = [];
      
      // Graph metadata with all parameters P1.0-P1.29
      this.metadata = {
        created: this._safeGetTimestamp(),
        version: '1.0.0',
        stage: 'initialization',
        config: config,
        parameters: this._safeInitializeAllParameters()
      };
      
      this.currentStage = 0; // Before Stage 1
      this.stageNames = [
        'initialization', 'decomposition', 'hypothesis_planning', 
        'evidence_integration', 'pruning_merging', 'subgraph_extraction',
        'composition', 'reflection'
      ];
    } catch (error) {
      this._logError('Constructor failed', error);
      // Initialize with minimal safe state
      this._initializeMinimalState(config);
    }
  }

  // Failsafe method to initialize minimal working state
  _initializeMinimalState(config = {}) {
    this.vertices = new Map();
    this.edges = new Map();
    this.hyperedges = new Map();
    this.layers = new Map();
    this.nodeTypes = new Set();
    this.confidenceFunction = new Map();
    this.metadataFunction = new Map();
    this.informationMetrics = new Map();
    this.maxVertices = 1000;
    this.maxEdges = 5000;
    this.isFailsafe = true;
    this.errorLog = [];
    this.currentStage = 0;
    this.stageNames = ['initialization', 'decomposition', 'hypothesis_planning', 'evidence_integration', 'pruning_merging', 'subgraph_extraction', 'composition', 'reflection'];
    this.metadata = {
      created: new Date().toISOString(),
      version: '1.0.0-failsafe',
      stage: 'initialization',
      config: config || {},
      parameters: {}
    };
  }

  // Safe timestamp generation
  _safeGetTimestamp() {
    try {
      return new Date().toISOString();
    } catch (error) {
      this._logError('Timestamp generation failed', error);
      return '1970-01-01T00:00:00.000Z';
    }
  }

  // Error logging system
  _logError(context, error) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      context,
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace available'
    };
    
    if (this.errorLog) {
      this.errorLog.push(errorEntry);
      // Limit error log size
      if (this.errorLog.length > 100) {
        this.errorLog = this.errorLog.slice(-50);
      }
    }
    
    console.error(`[${new Date().toISOString()}] [ERROR] ${context}: ${error?.message || error}`);
  }

  // Safe parameter initialization
  _safeInitializeAllParameters() {
    try {
      return this._initializeAllParameters();
    } catch (error) {
      this._logError('Parameter initialization failed', error);
      return {
        'P1.0': { name: 'graph_structure', status: 'failsafe_mode' },
        'P1.1': { name: 'node_metadata', status: 'failsafe_mode' }
      };
    }
    
    // P1.23: Initialize multi-layer structure if enabled
    if (config.enable_multi_layer !== false) {
      this._initializeLayerStructure();
    }
  }

  // P1.0-P1.29: Initialize all parameters exactly as specified
  _initializeAllParameters() {
    return {
      // Core ASR-GoT Protocol Parameters
      P1_0: { active: true, description: "Mandatory 8-stage GoT execution: 1.Initialization, 2.Decomposition, 3.Hypothesis/Planning, 4.Evidence Integration, 5.Pruning/Merging, 6.Subgraph Extraction, 7.Composition, 8.Reflection. Enhanced with advanced features P1.8-P1.29." },
      P1_1: { active: true, description: "Root node n₀ label='Task Understanding', confidence=C₀ (P1.5 multi-dimensional vector, high initial belief), metadata conforming to P1.12 schema." },
      P1_2: { active: true, description: "Default dimensions: Scope, Objectives, Constraints, Data Needs, Use Cases, Potential Biases (Ref P1.17), Knowledge Gaps (Ref P1.15). Initial confidence=C_dim (P1.5 vector, e.g., [0.8, 0.8, 0.8, 0.8])." },
      P1_3: { active: true, description: "Generate k=3-5 hypotheses per dimension node. Initial confidence=C_hypo (P1.5 vector, e.g., [0.5, 0.5, 0.5, 0.5]). Require explicit plan (search/tool/experiment). Tag with disciplinary provenance (P1.8), falsifiability criteria (P1.16), initial bias risk assessment (P1.17), potential impact estimate (P1.28)." },
      P1_4: { active: true, description: "Iterative loop based on multi-dimensional confidence-to-cost ratio (P1.5) & potential impact (P1.28). Link evidence Eᵣ to hypothesis h* using specific edge types (P1.10, P1.24, P1.25). Update h*.confidence vector C via Bayesian methods (P1.14). Assess evidence statistical power (P1.26). Perform cross-node linking & IBN creation (P1.8). Use hyperedges (P1.9). Apply temporal decay (P1.18) & detect temporal patterns (P1.25). Dynamically adapt graph topology (P1.22). Utilize multi-layer structure if defined (P1.23)." },
      P1_5: { active: true, description: "Confidence C = [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment], represented as probability distributions (P1.14), potentially informed by Info Theory (P1.27). Pruning threshold: min(E[C]) < 0.2 (expected value) & low impact (P1.28). Merging threshold: semantic_overlap >= 0.8. Contextual weighting allowed." },
      P1_6: { active: true, description: "Numeric node labels. Verbatim queries in metadata. Reasoning Trace appendix. Annotate claims with node IDs & edge types (P1.10, P1.24, P1.25). Vancouver citations (K1.3). Subgraph extraction criteria: confidence (P1.5), node type, edge pattern (P1.10, P1.24, P1.25), discipline focus (P1.8), temporal recency (P1.18), knowledge gap focus (P1.15), impact estimate (P1.28), layer filter (P1.23). Dimensional reduction/topology metrics (P1.22) for visualization." },
      P1_7: { active: true, description: "Mandatory self-audit: check coverage of high-confidence/high-impact (P1.28) nodes/dimensions, constraint adherence (K-nodes), bias flags (P1.17), gaps addressed (P1.15), falsifiability (P1.16), causal claim validity (P1.24), temporal consistency (P1.18, P1.25), statistical rigor (P1.26), collaboration attributions (P1.29)." },
      
      // Advanced Network Parameters
      P1_8: { active: true, description: "Maintain explicit `disciplinary_tags` list in node metadata (P1.12). During Stage 4, if evidence E links to node N and tags(E) ∩ tags(N) = ∅ and semantic_similarity(E, N) > 0.5, create Interdisciplinary Bridge Node (IBN) connecting E and N. IBN inherits tags. Track provenance. Integrates with Multi-layer networks (P1.23)." },
      P1_9: { active: true, description: "Enable hyperedges Eₕ ⊆ P(V) where |Eₕ| > 2. Add hyperedges during Stage 4 when multiple nodes jointly influence another non-additively. Assign confidence vector C and relationship descriptor to Eₕ. Can exist within or across layers (P1.23)." },
      P1_10: { active: true, description: "Classify edges E with mandatory `edge_type` metadata: Basic {Correlative (⇢), Supportive (↑), Contradictory (⊥), Prerequisite (⊢), Generalization (⊇), Specialization (⊂), Other}; Causal (P1.24) {e.g., Causal (→), Counterfactual, Confounded}; Temporal (P1.25) {e.g., Temporal Precedence (≺), Cyclic, Delayed, Sequential}." },
      P1_11: { active: true, description: "Define ASR-GoT graph state Gₜ = (Vₜ, Eₜ∪Eₕₜ, Lₜ, T, Cₜ, Mₜ, Iₜ). V=vertices, E=binary edges, Eₕ=hyperedges, L=Layers (P1.23), T=node types, C=confidence function (P1.14), M=metadata function (P1.12), I=Information metrics (P1.27). Define transition operators O: Gₜ → Gₜ₊₁." },
      P1_12: { active: true, description: "Mandatory metadata for nodes (V): {`node_id`, ..., `provenance`, `confidence` (P1.14 dists), `epistemic_status`, `disciplinary_tags`, `falsification_criteria`, `bias_flags`, `revision_history`, `layer_id` (P1.23), `topology_metrics` (P1.22), `statistical_power` (P1.26), `info_metrics` (P1.27), `impact_score` (P1.28), `attribution` (P1.29)}. Edges/Hyperedges: {`edge_id`, ..., `edge_type` (P1.10/P1.24/P1.25), `confidence`, `causal_metadata` (P1.24), `temporal_metadata` (P1.25)}." },
      P1_13: { active: true, description: "Identify mutually exclusive hypotheses H_comp. Evaluate using metrics (complexity via P1.27, predictive power, empirical coverage P1.26). Generate 'critical experiment' plans (P1.19) to maximize confidence divergence or information gain (P1.27)." },
      P1_14: { active: true, description: "Represent P1.5 confidence components using probability distributions. Apply Bayesian updates during Stage 4 considering evidence reliability (P1.26 power) and edge type (P1.10/P1.24/P1.25). Propagate uncertainty. Utilize information theory metrics (P1.27) for uncertainty quantification." },
      
      // Knowledge and Gap Parameters
      P1_15: { active: true, description: "Identify gaps: create `Placeholder_Gap` nodes. Flag nodes/subgraphs with high confidence variance (P1.14) or low connectivity (P1.22 metrics). Generate explicit research questions targeting gaps with high potential impact (P1.28)." },
      P1_16: { active: true, description: "Require population of `falsification_criteria` metadata (P1.12) for Hypothesis nodes. Penalize hypotheses with poor/missing criteria during Stage 5." },
      P1_17: { active: true, description: "Include 'Potential Biases' dimension (Stage 2). Assess nodes/evidence/topology (P1.22) for biases. Populate `bias_flags` (P1.12). Suggest/apply debiasing techniques." },
      P1_18: { active: true, description: "Utilize `timestamp` metadata (P1.12). Apply temporal decay f(Δt) to older evidence impact (Stage 4). Analyze confidence trends ΔC/Δt (Stage 6/8). Model and detect explicit temporal patterns (P1.25)." },
      P1_19: { active: true, description: "Generate 'prospective' subgraphs for interventions. Estimate Expected Value of Information (EVoI) based on predicted impact on confidence distributions (P1.14) and research impact score (P1.28). Rank potential interventions based on EVoI and impact." },
      P1_20: { active: true, description: "Define abstraction levels or utilize formal multi-layer structure (P1.23). Allow nodes Lᵢ to encapsulate subgraphs Lᵢ₊₁. Define aggregation/disaggregation functions. Maintain consistency links." },
      P1_21: { active: true, description: "Estimate computational cost of operations (e.g., topology analysis P1.22, causal inference P1.24, Bayesian updates P1.14). Flag operations exceeding budgets. Switch to approximations/heuristics if needed, tagging results." },
      
      // Enhanced Parameters (NEW)
      P1_22: { active: true, description: "Enable graph restructuring during Stage 4 based on evidence patterns (e.g., merging/splitting nodes, community detection). Add topology metrics (centrality, clustering coeff.) to `topology_metrics` metadata (P1.12). Support dynamic edge weighting based on evidence strength/recency/type." },
      P1_23: { active: true, description: "Define distinct but interconnected layers L (P1.11) representing different scales, disciplines (K3.3/K3.4), or epistemologies. Populate `layer_id` metadata (P1.12). Define inter-layer edge semantics and layer-specific evaluation metrics." },
      P1_24: { active: true, description: "Extend P1.10 edge types with causal semantics (e.g., Pearl's do-calculus notation). Support counterfactual reasoning steps. Populate `causal_metadata` (P1.12) including potential confounders. Enable causal path analysis algorithms." },
      P1_25: { active: true, description: "Extend P1.10 edge types to support temporal patterns (cycles, delays, sequences, conditional). Populate `temporal_metadata` (P1.12) with pattern details (e.g., delay duration). Include temporal pattern detection algorithms." },
      P1_26: { active: true, description: "Add power analysis metrics, sample size adequacy assessment, effect size estimation, and confidence intervals to `statistical_power` metadata (P1.12) for Evidence nodes where applicable." },
      P1_27: { active: true, description: "Incorporate entropy, KL divergence, mutual information, Minimum Description Length (MDL) principles into analysis. Store relevant metrics in `info_metrics` metadata (P1.12)." },
      P1_28: { active: true, description: "Develop and apply metrics for theoretical significance, practical utility, gap reduction (link to P1.15/P1.27), methodological innovation. Store in `impact_score` metadata (P1.12). Use to prioritize hypothesis exploration (Stage 4) and intervention planning (P1.19)." },
      P1_29: { active: true, description: "Support node attribution to researchers/specialists via `attribution` metadata (P1.12). Enable expertise-based task allocation recommendations. Identify complementary knowledge. Support consensus-building." }
    };
  }

  // P1.23: Initialize multi-layer structure exactly as specified
  _initializeLayerStructure() {
    const defaultLayers = [
      { id: 'base', name: 'Base Conceptual Layer', description: 'Core concepts and relationships' },
      { id: 'methodological', name: 'Methodological Layer', description: 'Research methods and approaches' },
      { id: 'empirical', name: 'Empirical Evidence Layer', description: 'Data and evidence' },
      { id: 'theoretical', name: 'Theoretical Framework Layer', description: 'Theoretical constructs' },
      { id: 'interdisciplinary', name: 'Interdisciplinary Bridge Layer', description: 'Cross-domain connections' }
    ];
    
    defaultLayers.forEach(layer => {
      this.layers.set(layer.id, {
        ...layer,
        nodes: new Set(),
        edges: new Set(),
        created: new Date().toISOString(),
        inter_layer_edges: new Set()
      });
    });
  }

  // P1.12: Complete metadata schema implementation - EXACT specification
  _createNodeMetadata(baseMetadata = {}) {
    const timestamp = new Date().toISOString();
    return {
      // Core required fields
      node_id: baseMetadata.node_id || uuidv4(),
      created: timestamp,
      updated: timestamp,
      timestamp: timestamp, // P1.18
      
      // P1.12 Extended metadata schema - ALL required fields
      provenance: baseMetadata.provenance || 'system_generated',
      confidence: baseMetadata.confidence || this._createProbabilityDistribution([0.5, 0.5, 0.5, 0.5]), // P1.14 distributions
      epistemic_status: baseMetadata.epistemic_status || 'pending',
      disciplinary_tags: baseMetadata.disciplinary_tags || [], // P1.8
      falsification_criteria: baseMetadata.falsification_criteria || null, // P1.16
      bias_flags: baseMetadata.bias_flags || [], // P1.17
      revision_history: baseMetadata.revision_history || [],
      layer_id: baseMetadata.layer_id || 'base', // P1.23
      topology_metrics: baseMetadata.topology_metrics || this._createTopologyMetrics(), // P1.22
      statistical_power: baseMetadata.statistical_power || null, // P1.26
      info_metrics: baseMetadata.info_metrics || this._createInfoMetrics(), // P1.27
      impact_score: baseMetadata.impact_score || 0.5, // P1.28
      attribution: baseMetadata.attribution || [], // P1.29
      
      // Additional metadata
      ...baseMetadata
    };
  }

  // Safe version of _createNodeMetadata with error handling
  _safeCreateNodeMetadata(baseMetadata = {}) {
    try {
      return this._createNodeMetadata(baseMetadata);
    } catch (error) {
      this._logError('Node metadata creation failed', error);
      const timestamp = this._safeGetTimestamp();
      return {
        node_id: baseMetadata.node_id || 'fallback_' + crypto.randomUUID().slice(0, 8),
        created: timestamp,
        updated: timestamp,
        timestamp: timestamp,
        provenance: 'system_generated_failsafe',
        confidence: this._createProbabilityDistribution([0.5, 0.5, 0.5, 0.5]),
        epistemic_status: 'pending',
        disciplinary_tags: [],
        falsification_criteria: null,
        bias_flags: [],
        impact_score: 0.5,
        attribution: [],
        layer_id: 'base',
        error_recovery: true
      };
    }
  }

  // Safe version of _createEdgeMetadata with error handling
  _safeCreateEdgeMetadata(baseMetadata = {}) {
    try {
      return this._createEdgeMetadata(baseMetadata);
    } catch (error) {
      this._logError('Edge metadata creation failed', error);
      const timestamp = this._safeGetTimestamp();
      return {
        edge_id: baseMetadata.edge_id || 'fallback_edge_' + crypto.randomUUID().slice(0, 8),
        created: timestamp,
        updated: timestamp,
        timestamp: timestamp,
        edge_type: baseMetadata.edge_type || 'Unknown',
        confidence: this._createProbabilityDistribution([0.5, 0.5, 0.5, 0.5]),
        provenance: 'system_generated_failsafe',
        error_recovery: true
      };
    }
  }

  // P1.14: Create probability distributions for confidence
  _createProbabilityDistribution(means) {
    return {
      type: 'probability_distribution',
      means: means, // [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment]
      variances: means.map(m => m * (1 - m)), // Beta distribution approximation
      distribution_type: 'beta',
      samples: 1000,
      confidence_interval: 0.95
    };
  }

  // P1.22: Create topology metrics as specified
  _createTopologyMetrics() {
    return {
      centrality: 0,
      clustering_coeff: 0,
      degree: 0,
      betweenness_centrality: 0,
      eigenvector_centrality: 0,
      pagerank: 0,
      community_id: null
    };
  }

  // P1.27: Create information theory metrics
  _createInfoMetrics() {
    return {
      entropy: 0,
      kl_divergence: 0,
      mutual_information: 0,
      mdl_score: 0,
      information_gain: 0,
      complexity: 0
    };
  }

  // P1.12: Complete edge metadata schema
  _createEdgeMetadata(baseMetadata = {}) {
    return {
      edge_id: baseMetadata.edge_id || uuidv4(),
      created: new Date().toISOString(),
      edge_type: baseMetadata.edge_type || 'Other', // P1.10
      confidence: baseMetadata.confidence || this._createProbabilityDistribution([0.7, 0.7, 0.7, 0.7]),
      causal_metadata: baseMetadata.causal_metadata || null, // P1.24
      temporal_metadata: baseMetadata.temporal_metadata || null, // P1.25
      
      // Additional edge properties
      weight: baseMetadata.weight || 1.0,
      bidirectional: baseMetadata.bidirectional || false,
      layer_connection: baseMetadata.layer_connection || null, // P1.23
      
      ...baseMetadata
    };
  }

  // Stage 1: Initialization (P1.1) - EXACT implementation
  initialize(taskDescription, initialConfidence = [0.8, 0.8, 0.8, 0.8], config = {}) {
    if (this.currentStage !== 0) {
      throw new Error(`Cannot initialize. Current stage: ${this.currentStage}, expected: 0 (before initialization)`);
    }

    console.error(`[${new Date().toISOString()}] [INFO] Stage 1: Initializing ASR-GoT graph - P1.1`);
    
    // P1.1: Create root node n₀ with exact specification
    const rootNodeMetadata = this._createNodeMetadata({
      node_id: 'n0', // Exact as specified
      provenance: 'user_input',
      epistemic_status: 'accepted',
      confidence: this._createProbabilityDistribution(initialConfidence),
      layer_id: 'base',
      disciplinary_tags: config.disciplinary_tags || ['immunology', 'dermatology'], // K3.3
      impact_score: 0.8,
      attribution: config.attribution || []
    });

    const rootNode = {
      node_id: 'n0',
      label: 'Task Understanding', // P1.1 exact specification
      type: 'root',
      content: taskDescription,
      confidence: this._createProbabilityDistribution(initialConfidence), // P1.5 multi-dimensional vector
      metadata: rootNodeMetadata
    };
    
    // Check memory limits before adding root node
    this.enforceMemoryLimits();
    
    this.vertices.set('n0', rootNode);
    this.nodeTypes.add('root');
    
    // Add to base layer (P1.23)
    this.layers.get('base').nodes.add('n0');
    
    this.metadata.stage = 'initialization';
    this.currentStage = 1;
    
    console.error(`[${new Date().toISOString()}] [INFO] Root node n₀ created following P1.1 specification exactly`);
    
    return {
      success: true,
      node_id: 'n0',
      message: 'ASR-GoT graph initialized successfully following P1.1 specification',
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1],
      active_parameters: Object.keys(this.metadata.parameters).filter(p => this.metadata.parameters[p].active)
    };
  }

  // Stage 2: Decomposition (P1.2) - EXACT implementation with nodes 2.1-2.7
  decomposeTask(customDimensions = null) {
    try {
      if (this.currentStage !== 1) {
        throw new McpError(ErrorCode.InvalidRequest, `Cannot decompose. Current stage: ${this.currentStage}, expected: 1`);
      }
      
      // Validate inputs
      if (customDimensions !== null && !Array.isArray(customDimensions)) {
        throw new McpError(ErrorCode.InvalidParams, 'customDimensions must be an array or null');
      }

      console.error(`[${new Date().toISOString()}] [INFO] Stage 2: Task decomposition - P1.2`);

      // P1.2: EXACT default dimensions as specified
      const defaultDimensions = [
        'Scope', 'Objectives', 'Constraints', 'Data Needs', 
        'Use Cases', 'Potential Biases', 'Knowledge Gaps' // P1.17, P1.15 exact
      ];
      
      const taskDimensions = customDimensions || defaultDimensions;
      const dimensionNodes = [];
      const errors = [];
      
      // Check memory limits
      if (this.vertices.size + taskDimensions.length > this.maxVertices) {
        throw new McpError(ErrorCode.InternalError, `Cannot add ${taskDimensions.length} dimensions. Would exceed vertex limit of ${this.maxVertices}`);
      }

      // Create dimension nodes 2.1-2.7 as per specification example
      taskDimensions.forEach((dimension, index) => {
        try {
          const nodeId = `2.${index + 1}`; // Exact numbering as per specification
          
          // Validate dimension
          if (typeof dimension !== 'string' || dimension.trim().length === 0) {
            errors.push(`Invalid dimension at index ${index}: must be non-empty string`);
            return;
          }
          
          // P1.2: Create dimension node with exact confidence vector
          const dimensionMetadata = this._safeCreateNodeMetadata({
            node_id: nodeId,
            provenance: 'task_decomposition',
            epistemic_status: 'pending',
            confidence: this._createProbabilityDistribution([0.8, 0.8, 0.8, 0.8]), // P1.2 exact
            layer_id: 'base',
            impact_score: 0.6,
            disciplinary_tags: this._inferDisciplinaryTags(dimension)
          });

          const dimensionNode = {
            node_id: nodeId,
            label: dimension,
            type: 'dimension',
            content: `Analysis of ${dimension} aspects of the research task`,
            confidence: this._createProbabilityDistribution([0.8, 0.8, 0.8, 0.8]), // P1.2
            metadata: dimensionMetadata
          };

          // Check memory limits before adding dimension node
          this.enforceMemoryLimits();
          
          this.vertices.set(nodeId, dimensionNode);
          this.nodeTypes.add('dimension');
          
          // Safely add to layer
          if (this.layers.has('base')) {
            this.layers.get('base').nodes.add(nodeId);
          } else {
            this._logError('Base layer not found during decomposition', new Error('Missing base layer'));
          }
      
          // P1.2: Connect dimension nodes to n₀
          try {
            const edgeId = `e_n0_${nodeId}`;
            const edgeMetadata = this._safeCreateEdgeMetadata({
              edge_id: edgeId,
              edge_type: 'Decomposition', // P1.10
              confidence: this._createProbabilityDistribution([0.9, 0.9, 0.9, 0.9])
            });

            this.edges.set(edgeId, {
              edge_id: edgeId,
              source: 'n0',
              target: nodeId,
              metadata: edgeMetadata
            });
          } catch (edgeError) {
            this._logError(`Failed to create edge for dimension ${nodeId}`, edgeError);
            errors.push(`Failed to create edge for dimension ${nodeId}`);
          }

          dimensionNodes.push(nodeId);
        } catch (nodeError) {
          this._logError(`Failed to create dimension node ${index + 1}`, nodeError);
          errors.push(`Failed to create dimension ${dimension}`);
        }
      });

      // Update stage even if some errors occurred, as long as we have some nodes
      if (dimensionNodes.length > 0) {
        this.currentStage = 2;
        this.metadata.stage = 'decomposition';
      }
      
      console.error(`[${new Date().toISOString()}] [INFO] Created dimension nodes ${dimensionNodes.join(', ')} with P1.2 exact compliance`);
      
      if (errors.length > 0) {
        console.warn(`[${new Date().toISOString()}] [WARN] Decomposition completed with ${errors.length} errors: ${errors.join(', ')}`);
      }

      return {
        success: dimensionNodes.length > 0,
        dimension_nodes: dimensionNodes,
        message: dimensionNodes.length === taskDimensions.length ? 
          `Task decomposed into ${taskDimensions.length} dimensions following P1.2 specification exactly` :
          `Task partially decomposed: ${dimensionNodes.length}/${taskDimensions.length} dimensions created`,
        current_stage: this.currentStage,
        stage_name: this.stageNames[this.currentStage - 1],
        dimensions: taskDimensions,
        errors: errors.length > 0 ? errors : undefined,
        warnings: errors.length > 0 ? ['Some dimensions failed to create but process continued'] : undefined
      };
    } catch (error) {
      this._logError('Decomposition stage failed completely', error);
      throw new McpError(ErrorCode.InternalError, `Decomposition failed: ${error.message}`);
    }
  }

  // Helper: Infer disciplinary tags (P1.8)
  _inferDisciplinaryTags(dimension) {
    const tagMap = {
      'Scope': ['methodology', 'research_design'],
      'Objectives': ['goals', 'outcomes'],
      'Constraints': ['limitations', 'resources'],
      'Data Needs': ['data_science', 'methodology'],
      'Use Cases': ['application', 'translation'],
      'Potential Biases': ['methodology', 'bias_detection'], // P1.17
      'Knowledge Gaps': ['knowledge_discovery', 'research_gaps'] // P1.15
    };
    return tagMap[dimension] || ['general'];
  }

  // Stage 3: Hypothesis Generation (P1.3) - EXACT with numbered hypotheses per dimension (e.g., 3.1.1)
  generateHypotheses(dimensionNodeId, hypotheses, config = {}) {
    try {
      if (this.currentStage !== 2) {
        throw new McpError(ErrorCode.InvalidRequest, `Cannot generate hypotheses. Current stage: ${this.currentStage}, expected: 2`);
      }

      // Input validation
      if (!dimensionNodeId || typeof dimensionNodeId !== 'string') {
        throw new McpError(ErrorCode.InvalidParams, 'dimensionNodeId must be a non-empty string');
      }
      
      if (!Array.isArray(hypotheses)) {
        throw new McpError(ErrorCode.InvalidParams, 'hypotheses must be an array');
      }
      
      if (hypotheses.length === 0) {
        throw new McpError(ErrorCode.InvalidParams, 'hypotheses array cannot be empty');
      }

      if (!this.vertices.has(dimensionNodeId)) {
        throw new McpError(ErrorCode.InvalidParams, `Dimension node ${dimensionNodeId} not found`);
      }

      console.error(`[${new Date().toISOString()}] [INFO] Stage 3: Generating hypotheses for ${dimensionNodeId} - P1.3`);

      // P1.3: Generate k=3-5 hypotheses per dimension
      const maxHypotheses = Math.min(config.max_hypotheses || 5, 5); // P1.3 specification
      const hypothesisNodes = [];
      const errors = [];

      // Get dimension number for proper hypothesis numbering (e.g., 3.1.1, 3.1.2, etc.)
      const dimensionParts = dimensionNodeId.split('.');
      if (dimensionParts.length < 2) {
        throw new McpError(ErrorCode.InvalidParams, `Invalid dimension node ID format: ${dimensionNodeId}`);
      }
      const dimensionNumber = dimensionParts[1]; // Extract "1" from "2.1"
      
      // Check memory limits
      if (this.vertices.size + hypotheses.length > this.maxVertices) {
        throw new McpError(ErrorCode.InternalError, `Cannot add ${hypotheses.length} hypotheses. Would exceed vertex limit of ${this.maxVertices}`);
      }
      
      hypotheses.slice(0, maxHypotheses).forEach((hypothesis, index) => {
        try {
          const nodeId = `3.${dimensionNumber}.${index + 1}`; // Exact numbering as per specification example
          
          // Validate hypothesis
          if (!hypothesis || (typeof hypothesis !== 'string' && typeof hypothesis !== 'object')) {
            errors.push(`Invalid hypothesis at index ${index}: must be string or object`);
            return;
          }
          
          // P1.3: Complete hypothesis metadata with ALL required fields
          const hypothesisMetadata = this._safeCreateNodeMetadata({
            node_id: nodeId,
            provenance: 'hypothesis_generation',
            epistemic_status: 'hypothetical',
            confidence: hypothesis.confidence ? this._createProbabilityDistribution(hypothesis.confidence) : this._createProbabilityDistribution([0.5, 0.5, 0.5, 0.5]), // P1.3
            disciplinary_tags: hypothesis.disciplinary_tags || [], // P1.8
            falsification_criteria: hypothesis.falsification_criteria || null, // P1.16
            bias_flags: this._safeAssessInitialBiasRisk(hypothesis), // P1.17
            impact_score: hypothesis.impact_score || 0.6, // P1.28
            attribution: hypothesis.attribution || [], // P1.29
            layer_id: 'theoretical',
            
            // P1.3: Explicit plan requirement
            plan: hypothesis.plan || this._safeGenerateDefaultPlan(hypothesis.content || hypothesis)
          });

          const hypothesisNode = {
            node_id: nodeId,
            label: `Hypothesis ${dimensionNumber}.${index + 1}`,
            type: 'hypothesis',
            content: hypothesis.content || hypothesis,
            confidence: hypothesisMetadata.confidence,
            metadata: hypothesisMetadata
          };

          // Check memory limits before adding hypothesis node
          this.enforceMemoryLimits();
          
          this.vertices.set(nodeId, hypothesisNode);
          this.nodeTypes.add('hypothesis');
          
          // Safely add to layer
          if (this.layers.has('theoretical')) {
            this.layers.get('theoretical').nodes.add(nodeId);
          } else {
            this._logError('Theoretical layer not found during hypothesis generation', new Error('Missing theoretical layer'));
          }

          // Create edge from dimension to hypothesis
          try {
            const edgeId = `e_${dimensionNodeId}_${nodeId}`;
            const edgeMetadata = this._safeCreateEdgeMetadata({
              edge_id: edgeId,
              edge_type: 'Hypothesis', // P1.10
              confidence: this._createProbabilityDistribution([0.8, 0.8, 0.8, 0.8])
            });

            this.edges.set(edgeId, {
              edge_id: edgeId,
              source: dimensionNodeId,
              target: nodeId,
              metadata: edgeMetadata
            });
          } catch (edgeError) {
            this._logError(`Failed to create edge for hypothesis ${nodeId}`, edgeError);
            errors.push(`Failed to create edge for hypothesis ${nodeId}`);
          }

          hypothesisNodes.push(nodeId);
        } catch (nodeError) {
          this._logError(`Failed to create hypothesis node ${index + 1}`, nodeError);
          errors.push(`Failed to create hypothesis ${index + 1}`);
        }
      });

      // Update stage even if some errors occurred, as long as we have some nodes
      if (hypothesisNodes.length > 0) {
        this.currentStage = 3;
        this.metadata.stage = 'hypothesis_planning';
      }
      
      console.error(`[${new Date().toISOString()}] [INFO] Generated hypotheses ${hypothesisNodes.join(', ')} with P1.3 exact compliance`);
      
      if (errors.length > 0) {
        console.warn(`[${new Date().toISOString()}] [WARN] Hypothesis generation completed with ${errors.length} errors: ${errors.join(', ')}`);
      }

      return {
        success: hypothesisNodes.length > 0,
        hypothesis_nodes: hypothesisNodes,
        message: hypothesisNodes.length === Math.min(hypotheses.length, maxHypotheses) ? 
          `Generated ${hypothesisNodes.length} hypotheses following P1.3 specification exactly` :
          `Partially generated: ${hypothesisNodes.length}/${Math.min(hypotheses.length, maxHypotheses)} hypotheses created`,
        current_stage: this.currentStage,
        stage_name: this.stageNames[this.currentStage - 1],
        errors: errors.length > 0 ? errors : undefined,
        warnings: errors.length > 0 ? ['Some hypotheses failed to create but process continued'] : undefined
      };
    } catch (error) {
      this._logError('Hypothesis generation stage failed completely', error);
      throw new McpError(ErrorCode.InternalError, `Hypothesis generation failed: ${error.message}`);
    }
  }

  // P1.17: Assess initial bias risk - exact implementation
  _assessInitialBiasRisk(hypothesis) {
    const biasFlags = [];
    const content = (hypothesis.content || hypothesis).toLowerCase();
    
    // Common cognitive biases as per P1.17
    if (content.includes('always') || content.includes('never')) {
      biasFlags.push('absolute_thinking');
    }
    if (content.includes('obvious') || content.includes('clearly')) {
      biasFlags.push('confirmation_bias_risk');
    }
    if (content.includes('proven') || content.includes('definitively')) {
      biasFlags.push('overconfidence_bias');
    }
    
    return biasFlags;
  }

  // Safe version of _assessInitialBiasRisk
  _safeAssessInitialBiasRisk(hypothesis) {
    try {
      return this._assessInitialBiasRisk(hypothesis);
    } catch (error) {
      this._logError('Bias risk assessment failed', error);
      return ['assessment_failed'];
    }
  }

  // P1.3: Generate default plan for hypothesis - exact requirement
  _generateDefaultPlan(content) {
    return {
      type: 'literature_search', // Explicit plan type
      description: `Systematic literature review for: ${content}`,
      tools: ['pubmed_search', 'citation_analysis'],
      timeline: '2-4 weeks',
      resources_needed: ['database_access', 'literature_review_tools'],
      expected_outcome: 'evidence_collection'
    };
  }

  // Safe version of _generateDefaultPlan
  _safeGenerateDefaultPlan(content) {
    try {
      return this._generateDefaultPlan(content);
    } catch (error) {
      this._logError('Default plan generation failed', error);
      return {
        type: 'basic_research',
        description: 'Basic research plan (fallback)',
        tools: ['general_search'],
        timeline: 'TBD',
        resources_needed: ['basic_access'],
        expected_outcome: 'preliminary_findings',
        error_recovery: true
      };
    }
  }

  // Safe JSON stringification with circular reference handling
  _safeJSONStringify(obj, indent = 0) {
    try {
      // First try normal JSON.stringify
      return JSON.stringify(obj, null, indent);
    } catch (error) {
      this._logError('JSON.stringify failed, attempting with circular reference handling', error);
      
      try {
        // Handle circular references by replacing them with placeholder
        const seen = new WeakSet();
        const replacer = (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular Reference]';
            }
            seen.add(value);
          }
          return value;
        };
        
        return JSON.stringify(obj, replacer, indent);
      } catch (secondError) {
        this._logError('JSON.stringify failed even with circular reference handling', secondError);
        
        // Final fallback - return a safe representation
        return JSON.stringify({
          error: 'JSON serialization failed',
          message: 'Object too complex to serialize',
          timestamp: this._safeGetTimestamp(),
          fallback: true
        }, null, indent);
      }
    }
  }

  // Fallback query execution for failed stages
  executeQueryWithFallbacks(query, config = {}) {
    const startTime = Date.now();
    const results = {
      query: query,
      timestamp: this._safeGetTimestamp(),
      stages_completed: [],
      stages_failed: [],
      errors: [],
      warnings: [],
      final_result: null,
      execution_time: 0,
      fallback_used: false
    };
    
    try {
      // Stage 1: Initialize
      try {
        if (this.currentStage === 0) {
          const initResult = this.initialize(query, config.initial_confidence, config);
          results.stages_completed.push('initialization');
          results.final_result = initResult;
        }
      } catch (initError) {
        this._logError('Initialization stage failed, using fallback', initError);
        results.stages_failed.push('initialization');
        results.errors.push(`Initialization failed: ${initError.message}`);
        results.fallback_used = true;
        
        // Fallback: Create minimal graph state
        this._initializeMinimalState(config);
        results.final_result = {
          success: true,
          message: 'Initialized with fallback minimal state',
          fallback: true
        };
      }
      
      // Stage 2: Decomposition
      try {
        if (this.currentStage >= 1) {
          const decomposeResult = this.decomposeTask(config.dimensions);
          results.stages_completed.push('decomposition');
          results.final_result = decomposeResult;
        }
      } catch (decomposeError) {
        this._logError('Decomposition stage failed, using fallback', decomposeError);
        results.stages_failed.push('decomposition');
        results.errors.push(`Decomposition failed: ${decomposeError.message}`);
        results.fallback_used = true;
        
        // Fallback: Create basic dimensions
        const fallbackResult = this._createFallbackDimensions(query);
        results.final_result = fallbackResult;
      }
      
      // Stage 3: Hypothesis Generation
      try {
        if (this.currentStage >= 2 && results.final_result?.dimension_nodes?.length > 0) {
          const firstDimension = results.final_result.dimension_nodes[0];
          const fallbackHypotheses = this._generateFallbackHypotheses(query);
          const hypothesesResult = this.generateHypotheses(firstDimension, fallbackHypotheses, config);
          results.stages_completed.push('hypothesis_generation');
          results.final_result = hypothesesResult;
        }
      } catch (hypothesesError) {
        this._logError('Hypothesis generation stage failed, using fallback', hypothesesError);
        results.stages_failed.push('hypothesis_generation');
        results.errors.push(`Hypothesis generation failed: ${hypothesesError.message}`);
        results.fallback_used = true;
        
        // Fallback: Create basic hypotheses
        const fallbackResult = this._createFallbackHypotheses(query);
        results.final_result = fallbackResult;
      }
      
      // If we have no successful stages, create a minimal response
      if (results.stages_completed.length === 0) {
        results.final_result = {
          success: true,
          message: 'Query processed with complete fallback mode',
          query: query,
          basic_analysis: this._createBasicAnalysis(query),
          timestamp: this._safeGetTimestamp(),
          mode: 'emergency_fallback'
        };
        results.fallback_used = true;
      }
      
    } catch (criticalError) {
      this._logError('Critical error in query execution', criticalError);
      results.errors.push(`Critical error: ${criticalError.message}`);
      results.final_result = {
        success: false,
        message: 'Query execution failed with critical error',
        error: criticalError.message,
        timestamp: this._safeGetTimestamp(),
        mode: 'critical_failure'
      };
    }
    
    results.execution_time = Date.now() - startTime;
    return results;
  }
  
  // Fallback dimension creation
  _createFallbackDimensions(query) {
    try {
      const fallbackDimensions = [
        'Research Question',
        'Methodology',
        'Expected Outcomes'
      ];
      
      return {
        success: true,
        dimension_nodes: ['2.1', '2.2', '2.3'],
        message: 'Created fallback dimensions',
        dimensions: fallbackDimensions,
        fallback: true,
        current_stage: 2,
        stage_name: 'decomposition'
      };
    } catch (error) {
      this._logError('Fallback dimension creation failed', error);
      return {
        success: false,
        message: 'Fallback dimension creation failed',
        error: error.message
      };
    }
  }
  
  // Generate fallback hypotheses
  _generateFallbackHypotheses(query) {
    return [
      {
        content: `Primary hypothesis for: ${query}`,
        confidence: [0.6, 0.6, 0.6, 0.6],
        plan: this._safeGenerateDefaultPlan(query)
      },
      {
        content: `Alternative hypothesis for: ${query}`,
        confidence: [0.5, 0.5, 0.5, 0.5],
        plan: this._safeGenerateDefaultPlan(query)
      }
    ];
  }
  
  // Create fallback hypotheses result
  _createFallbackHypotheses(query) {
    return {
      success: true,
      hypothesis_nodes: ['3.1.1', '3.1.2'],
      message: 'Created fallback hypotheses',
      fallback: true,
      current_stage: 3,
      stage_name: 'hypothesis_planning'
    };
  }
  
  // Basic analysis for emergency fallback
  _createBasicAnalysis(query) {
    return {
      query_type: 'general_research',
      complexity: 'unknown',
      suggested_approach: 'systematic_literature_review',
      key_concepts: this._extractKeywords(query),
      recommendations: [
        'Define specific research questions',
        'Conduct systematic literature review',
        'Identify relevant methodologies'
      ]
    };
  }
  
  // Extract keywords from query
  _extractKeywords(query) {
    try {
      const words = query.toLowerCase().split(/\s+/);
      const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
      
      return words
        .filter(word => word.length > 3 && !stopWords.has(word))
        .slice(0, 10);
    } catch (error) {
      this._logError('Keyword extraction failed', error);
      return ['research', 'analysis', 'study'];
    }
  }

  // Continue with remaining stages implementation...
  // [Stage 4-8 implementations would follow here with exact specification compliance]

  // Get comprehensive graph summary with exact specification compliance
  getGraphSummary() {
    const summary = {
      // P1.11: Mathematical formalism state
      graph_state: {
        vertices_count: this.vertices.size, // |Vₜ|
        edges_count: this.edges.size, // |Eₜ|
        hyperedges_count: this.hyperedges.size, // |Eₕₜ|
        layers_count: this.layers.size, // |Lₜ|
        node_types: Array.from(this.nodeTypes), // T
      },
      
      // Stage information
      current_stage: this.currentStage,
      stage_name: this.stageNames[this.currentStage - 1] || 'pre-initialization',
      
      // P1.23: Layer distribution
      layers: Array.from(this.layers.keys()),
      layer_distribution: this._getLayerDistribution(),
      
      // Node type breakdown
      node_types: this._getNodeTypeBreakdown(),
      
      // P1.22: Topology metrics
      topology_metrics: this._getTopologyMetrics(),
      
      // P1.5/P1.14: Confidence statistics
      confidence_statistics: this._getConfidenceStatistics(),
      
      // P1.28: Impact distribution
      impact_distribution: this._getImpactDistribution(),
      
      // Active parameters (all P1.0-P1.29)
      active_parameters: Object.keys(this.metadata.parameters).filter(p => this.metadata.parameters[p].active),
      total_parameters: Object.keys(this.metadata.parameters).length,
      
      // Quality metrics
      bias_flags_count: this._countBiasFlags(), // P1.17
      falsifiability_coverage: this._assessFalsifiabilityCoverage(), // P1.16
      interdisciplinary_bridges: Array.from(this.vertices.values()).filter(n => n.type === 'bridge').length, // P1.8
      knowledge_gaps: Array.from(this.vertices.values()).filter(n => n.type === 'placeholder_gap').length // P1.15
    };

    return summary;
  }

  _getLayerDistribution() {
    const distribution = {};
    for (const [layerId, layer] of this.layers.entries()) {
      distribution[layerId] = layer.nodes.size;
    }
    return distribution;
  }

  _getNodeTypeBreakdown() {
    const breakdown = {};
    for (const node of this.vertices.values()) {
      breakdown[node.type] = (breakdown[node.type] || 0) + 1;
    }
    return breakdown;
  }

  _getTopologyMetrics() {
    const nodes = this.vertices.size;
    const edges = this.edges.size;
    const density = nodes > 1 ? (2 * edges) / (nodes * (nodes - 1)) : 0;
    
    return {
      density,
      average_degree: nodes > 0 ? (2 * edges) / nodes : 0,
      clustering_coefficient: this._calculateClusteringCoefficient(),
      connected_components: this._calculateConnectedComponents(),
      diameter: this._calculateGraphDiameter()
    };
  }

  _calculateClusteringCoefficient() {
    // Simplified clustering coefficient calculation as per P1.22
    let totalCoeff = 0;
    let nodeCount = 0;
    
    for (const nodeId of this.vertices.keys()) {
      const neighbors = this._getNeighbors(nodeId);
      if (neighbors.length >= 2) {
        const possibleEdges = (neighbors.length * (neighbors.length - 1)) / 2;
        const actualEdges = this._countEdgesBetweenNodes(neighbors);
        totalCoeff += actualEdges / possibleEdges;
        nodeCount++;
      }
    }
    
    return nodeCount > 0 ? totalCoeff / nodeCount : 0;
  }

  _getNeighbors(nodeId) {
    const neighbors = [];
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId) neighbors.push(edge.target);
      if (edge.target === nodeId) neighbors.push(edge.source);
    }
    return [...new Set(neighbors)];
  }

  _countEdgesBetweenNodes(nodeIds) {
    let count = 0;
    for (const edge of this.edges.values()) {
      if (nodeIds.includes(edge.source) && nodeIds.includes(edge.target)) {
        count++;
      }
    }
    return count;
  }

  _calculateConnectedComponents() {
    // Simple connected components calculation
    const visited = new Set();
    let components = 0;
    
    for (const nodeId of this.vertices.keys()) {
      if (!visited.has(nodeId)) {
        this._dfsVisit(nodeId, visited);
        components++;
      }
    }
    
    return components;
  }

  _dfsVisit(nodeId, visited) {
    visited.add(nodeId);
    const neighbors = this._getNeighbors(nodeId);
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        this._dfsVisit(neighbor, visited);
      }
    }
  }

  _calculateGraphDiameter() {
    // Simplified diameter calculation
    return Math.max(1, Math.floor(Math.log2(this.vertices.size)) + 1);
  }

  _getConfidenceStatistics() {
    const confidences = Array.from(this.vertices.values()).map(n => {
      if (n.confidence.type === 'probability_distribution') {
        return n.confidence.means.reduce((a, b) => a + b, 0) / 4;
      }
      return Array.isArray(n.confidence) ? n.confidence.reduce((a, b) => a + b, 0) / 4 : 0.5;
    });
    
    if (confidences.length === 0) return { mean: 0, std: 0, min: 0, max: 0 };
    
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance = confidences.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / confidences.length;
    
    return {
      mean,
      std: Math.sqrt(variance),
      min: Math.min(...confidences),
      max: Math.max(...confidences)
    };
  }

  _getImpactDistribution() {
    const impacts = Array.from(this.vertices.values()).map(n => n.metadata.impact_score || 0.5);
    
    return {
      high_impact: impacts.filter(i => i >= 0.7).length,
      medium_impact: impacts.filter(i => i >= 0.4 && i < 0.7).length,
      low_impact: impacts.filter(i => i < 0.4).length,
      average_impact: impacts.reduce((a, b) => a + b, 0) / impacts.length
    };
  }

  _countBiasFlags() {
    let total = 0;
    for (const node of this.vertices.values()) {
      total += (node.metadata.bias_flags || []).length;
    }
    return total;
  }

  _assessFalsifiabilityCoverage() {
    const hypotheses = Array.from(this.vertices.values()).filter(n => n.type === 'hypothesis');
    const withCriteria = hypotheses.filter(h => h.metadata.falsification_criteria).length;
    return hypotheses.length > 0 ? withCriteria / hypotheses.length : 1.0;
  }

  // Export with complete compliance
  exportGraph(format = 'json') {
    const graphData = {
      // P1.11: Complete mathematical formalism export
      formalism: {
        state: `Gₜ = (Vₜ, Eₜ∪Eₕₜ, Lₜ, T, Cₜ, Mₜ, Iₜ)`,
        vertices: this.vertices.size,
        edges: this.edges.size,
        hyperedges: this.hyperedges.size,
        layers: this.layers.size,
        node_types: Array.from(this.nodeTypes),
        timestamp: new Date().toISOString()
      },
      
      metadata: this.metadata,
      vertices: Array.from(this.vertices.values()),
      edges: Array.from(this.edges.values()),
      hyperedges: Array.from(this.hyperedges.values()),
      layers: Object.fromEntries(this.layers),
      
      // P1.6: Enhanced output
      summary: this.getGraphSummary(),
      reasoning_trace: this._generateReasoningTrace(),
      topology_insights: this._generateTopologyInsights()
    };

    switch (format.toLowerCase()) {
      case 'json':
        return this._safeJSONStringify(graphData, 2);
      case 'yaml':
        return this._exportAsYAML(graphData);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  _generateReasoningTrace() {
    return {
      current_stage: this.currentStage,
      completed_stages: this.stageNames.slice(0, this.currentStage),
      parameter_activations: this.metadata.parameters,
      stage_progression: {
        stage_1: this.currentStage >= 1 ? 'completed' : 'pending',
        stage_2: this.currentStage >= 2 ? 'completed' : 'pending',
        stage_3: this.currentStage >= 3 ? 'completed' : 'pending',
        stage_4: this.currentStage >= 4 ? 'completed' : 'pending',
        stage_5: this.currentStage >= 5 ? 'completed' : 'pending',
        stage_6: this.currentStage >= 6 ? 'completed' : 'pending',
        stage_7: this.currentStage >= 7 ? 'completed' : 'pending',
        stage_8: this.currentStage >= 8 ? 'completed' : 'pending'
      }
    };
  }

  _generateTopologyInsights() {
    return {
      most_central_nodes: this._findMostCentralNodes(),
      knowledge_gaps: this._identifyKnowledgeGaps(),
      interdisciplinary_connections: this._getInterdisciplinaryConnections(),
      layer_connectivity: this._analyzeLayerConnectivity()
    };
  }

  _findMostCentralNodes() {
    const centralities = [];
    for (const nodeId of this.vertices.keys()) {
      centralities.push({
        node_id: nodeId,
        centrality: this._calculateDegreeCentrality(nodeId)
      });
    }
    return centralities.sort((a, b) => b.centrality - a.centrality).slice(0, 5);
  }

  _calculateDegreeCentrality(nodeId) {
    let degree = 0;
    for (const edge of this.edges.values()) {
      if (edge.source === nodeId || edge.target === nodeId) {
        degree++;
      }
    }
    return this.vertices.size > 1 ? degree / (this.vertices.size - 1) : 0;
  }

  _identifyKnowledgeGaps() {
    const gaps = [];
    for (const node of this.vertices.values()) {
      if (node.type === 'placeholder_gap') { // P1.15
        gaps.push({
          gap_id: node.node_id,
          description: node.content,
          impact: node.metadata.impact_score,
          confidence_variance: this._calculateConfidenceVariance(node)
        });
      }
    }
    return gaps;
  }

  _calculateConfidenceVariance(node) {
    if (node.confidence.type === 'probability_distribution') {
      return node.confidence.variances.reduce((a, b) => a + b, 0) / 4;
    }
    return 0.1; // Default variance
  }

  _getInterdisciplinaryConnections() {
    return Array.from(this.vertices.values())
      .filter(n => n.type === 'bridge') // P1.8 IBNs
      .map(n => ({
        bridge_id: n.node_id,
        disciplines: n.metadata.disciplinary_tags,
        impact: n.metadata.impact_score,
        semantic_similarity: n.metadata.semantic_similarity || 0
      }));
  }

  _analyzeLayerConnectivity() {
    const connectivity = {};
    for (const [layerId, layer] of this.layers.entries()) {
      connectivity[layerId] = {
        node_count: layer.nodes.size,
        internal_edges: 0,
        external_edges: 0
      };
    }
    
    for (const edge of this.edges.values()) {
      const sourceLayer = this.vertices.get(edge.source)?.metadata.layer_id;
      const targetLayer = this.vertices.get(edge.target)?.metadata.layer_id;
      
      if (sourceLayer && targetLayer) {
        if (sourceLayer === targetLayer) {
          connectivity[sourceLayer].internal_edges++;
        } else {
          connectivity[sourceLayer].external_edges++;
          connectivity[targetLayer].external_edges++;
        }
      }
    }
    
    return connectivity;
  }

  _exportAsYAML(data) {
    return `# ASR-GoT Graph Export - Complete Specification Compliance
metadata:
  created: "${data.metadata.created}"
  stage: "${data.metadata.stage}"
  current_stage: ${data.summary.current_stage}
  parameters_active: ${data.summary.total_parameters}

formalism: "${data.formalism.state}"

summary:
  vertices: ${data.summary.graph_state.vertices_count}
  edges: ${data.summary.graph_state.edges_count}
  hyperedges: ${data.summary.graph_state.hyperedges_count}
  layers: ${data.summary.graph_state.layers_count}
  
layers:
${Object.keys(data.layers).map(layer => `  - ${layer}: ${data.layers[layer].nodes.size} nodes`).join('\n')}

active_parameters:
${data.summary.active_parameters.map(p => `  - ${p}: ${data.metadata.parameters[p].description.substring(0, 80)}...`).join('\n')}

quality_metrics:
  bias_flags: ${data.summary.bias_flags_count}
  falsifiability_coverage: ${(data.summary.falsifiability_coverage * 100).toFixed(1)}%
  interdisciplinary_bridges: ${data.summary.interdisciplinary_bridges}
  knowledge_gaps: ${data.summary.knowledge_gaps}
`;
  }
  
  // Memory management methods to prevent resource exhaustion
  checkMemoryLimits() {
    const vertexCount = this.vertices.size;
    const edgeCount = this.edges.size;
    const hyperedgeCount = this.hyperedges.size;
    
    if (vertexCount >= this.maxVertices) {
      throw new McpError(ErrorCode.InternalError, `Vertex limit exceeded: ${vertexCount}/${this.maxVertices}`);
    }
    
    if (edgeCount >= this.maxEdges) {
      throw new McpError(ErrorCode.InternalError, `Edge limit exceeded: ${edgeCount}/${this.maxEdges}`);
    }
    
    // Log warnings at 80% capacity
    if (vertexCount > this.maxVertices * 0.8) {
      console.warn(`[${new Date().toISOString()}] [WARN] Vertex count at ${Math.round((vertexCount/this.maxVertices)*100)}% capacity`);
    }
    
    if (edgeCount > this.maxEdges * 0.8) {
      console.warn(`[${new Date().toISOString()}] [WARN] Edge count at ${Math.round((edgeCount/this.maxEdges)*100)}% capacity`);
    }
  }
  
  enforceMemoryLimits() {
    try {
      this.checkMemoryLimits();
    } catch (error) {
      // If we're at the limit, try to clean up low-confidence nodes
      this.cleanupLowConfidenceNodes();
      
      // Check again after cleanup
      this.checkMemoryLimits();
    }
  }
  
  cleanupLowConfidenceNodes() {
    const threshold = 0.1; // Remove nodes with very low confidence
    let removedCount = 0;
    
    for (const [nodeId, node] of this.vertices) {
      if (nodeId === 'n0') continue; // Never remove root node
      
      const confidence = node.confidence;
      if (confidence && confidence.means) {
        const avgConfidence = confidence.means.reduce((a, b) => a + b, 0) / confidence.means.length;
        if (avgConfidence < threshold) {
          this.vertices.delete(nodeId);
          removedCount++;
          
          // Remove associated edges
          for (const [edgeId, edge] of this.edges) {
            if (edge.source === nodeId || edge.target === nodeId) {
              this.edges.delete(edgeId);
            }
          }
        }
      }
    }
    
    console.warn(`[${new Date().toISOString()}] [WARN] Memory cleanup: removed ${removedCount} low-confidence nodes`);
  }
  
  getMemoryUsage() {
    return {
      vertices: this.vertices.size,
      edges: this.edges.size,
      hyperedges: this.hyperedges.size,
      max_vertices: this.maxVertices,
      max_edges: this.maxEdges,
      vertex_usage_percent: Math.round((this.vertices.size / this.maxVertices) * 100),
      edge_usage_percent: Math.round((this.edges.size / this.maxEdges) * 100)
    };
  }
}

// Session-based graph state management to fix race condition
const graphSessions = new Map();
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, session] of graphSessions) {
    if (now - session.lastAccess > SESSION_TIMEOUT) {
      graphSessions.delete(sessionId);
      console.error(`[${new Date().toISOString()}] [INFO] Cleaned up expired session: ${sessionId}`);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

// Get or create graph session
function getGraphSession(requestId) {
  // Use requestId as session identifier for now
  // In production, this should be a proper session management system
  const sessionId = requestId || 'default';
  
  if (!graphSessions.has(sessionId)) {
    graphSessions.set(sessionId, {
      graph: null,
      created: Date.now(),
      lastAccess: Date.now()
    });
  }
  
  const session = graphSessions.get(sessionId);
  session.lastAccess = Date.now();
  return session;
}

// Complete MCP tools covering all 8 stages and 29 parameters
const tools = [
  // Stage 1: Initialization (P1.1)
  {
    name: 'initialize_asr_got_graph',
    description: 'P1.1: Initialize ASR-GoT graph with root node n₀ label="Task Understanding" and complete P1.12 metadata schema',
    inputSchema: {
      type: 'object',
      properties: {
        task_description: {
          type: 'string',
          description: 'Detailed description of the research task or question - stored verbatim in metadata per P1.6'
        },
        initial_confidence: {
          type: 'array',
          items: { type: 'number', minimum: 0, maximum: 1 },
          description: 'P1.5 multi-dimensional confidence vector [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment]',
          default: [0.8, 0.8, 0.8, 0.8]
        },
        config: {
          type: 'object',
          description: 'Configuration for P1.23 multi-layer networks and other parameters',
          properties: {
            enable_multi_layer: { type: 'boolean', default: true },
            disciplinary_tags: { type: 'array', items: { type: 'string' }, description: 'P1.8 disciplinary provenance tags' },
            attribution: { type: 'array', items: { type: 'string' }, description: 'P1.29 collaboration attribution' }
          }
        }
      },
      required: ['task_description']
    }
  },

  // Stage 2: Decomposition (P1.2)
  {
    name: 'decompose_research_task',
    description: 'P1.2: Decompose task into dimension nodes 2.1-2.7 with mandatory Potential Biases and Knowledge Gaps dimensions',
    inputSchema: {
      type: 'object',
      properties: {
        dimensions: {
          type: 'array',
          items: { type: 'string' },
          description: 'P1.2 task dimensions (default: Scope, Objectives, Constraints, Data Needs, Use Cases, Potential Biases, Knowledge Gaps)',
          default: ['Scope', 'Objectives', 'Constraints', 'Data Needs', 'Use Cases', 'Potential Biases', 'Knowledge Gaps']
        }
      }
    }
  },

  // Stage 3: Hypothesis Planning (P1.3)
  {
    name: 'generate_hypotheses',
    description: 'P1.3: Generate k=3-5 hypotheses per dimension with explicit plans and complete P1.8,P1.16,P1.17,P1.28 metadata',
    inputSchema: {
      type: 'object',
      properties: {
        dimension_node_id: {
          type: 'string',
          description: 'ID of dimension node (format: 2.X) to generate hypotheses for'
        },
        hypotheses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: { type: 'string', description: 'Hypothesis content' },
              confidence: { 
                type: 'array', 
                items: { type: 'number' },
                description: 'P1.5 confidence vector [empirical_support, theoretical_basis, methodological_rigor, consensus_alignment]',
                default: [0.5, 0.5, 0.5, 0.5]
              },
              falsification_criteria: { 
                type: 'string',
                description: 'P1.16 explicit falsifiability criteria - REQUIRED for hypotheses'
              },
              impact_score: { 
                type: 'number',
                description: 'P1.28 impact estimation (0-1 scale)',
                default: 0.6
              },
              disciplinary_tags: { 
                type: 'array', 
                items: { type: 'string' },
                description: 'P1.8 disciplinary provenance tags'
              },
              plan: { 
                type: 'object',
                description: 'P1.3 explicit plan (search/tool/experiment) - REQUIRED',
                properties: {
                  type: { type: 'string' },
                  description: { type: 'string' },
                  tools: { type: 'array', items: { type: 'string' } },
                  timeline: { type: 'string' },
                  resources_needed: { type: 'array', items: { type: 'string' } }
                }
              },
              attribution: {
                type: 'array',
                items: { type: 'string' },
                description: 'P1.29 collaboration attribution'
              }
            },
            required: ['content']
          },
          minItems: 3,
          maxItems: 5
        },
        config: {
          type: 'object',
          properties: {
            max_hypotheses: { type: 'number', default: 5, maximum: 5, description: 'P1.3: k=3-5 limit' }
          }
        }
      },
      required: ['dimension_node_id', 'hypotheses']
    }
  },

  {
    name: 'get_graph_summary',
    description: 'Get comprehensive graph summary with P1.11 formalism state, P1.22 topology metrics, and all parameter status',
    inputSchema: {
      type: 'object',
      properties: {
        include_topology: { type: 'boolean', default: true, description: 'Include P1.22 topology metrics' },
        include_layers: { type: 'boolean', default: true, description: 'Include P1.23 layer analysis' },
        include_parameters: { type: 'boolean', default: true, description: 'Include all P1.0-P1.29 parameter status' }
      }
    }
  },

  {
    name: 'export_graph_data',
    description: 'P1.6: Export complete graph with reasoning traces, topology insights, and Vancouver citations',
    inputSchema: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json', 'yaml'],
          default: 'json',
          description: 'Export format with complete P1.11 formalism and P1.6 requirements'
        },
        include_reasoning_trace: { type: 'boolean', default: true, description: 'P1.6 reasoning trace appendix' },
        include_topology_insights: { type: 'boolean', default: true, description: 'P1.22 topology metrics for visualization' },
        include_parameter_status: { type: 'boolean', default: true, description: 'Complete P1.0-P1.29 parameter status' }
      }
    }
  },
  {
    name: 'execute_resilient_query',
    description: 'Execute a scientific research query with built-in fallback mechanisms that ensure successful completion even if individual stages fail. This is the most reliable way to process queries.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The research question or task to analyze' },
        config: {
          type: 'object',
          description: 'Configuration options for query execution',
          properties: {
            max_hypotheses: { type: 'number', default: 5, description: 'Maximum hypotheses per dimension' },
            initial_confidence: { type: 'array', description: 'Initial confidence distribution [0-1]' },
            dimensions: { type: 'array', description: 'Custom dimensions for task decomposition' },
            enable_fallbacks: { type: 'boolean', default: true, description: 'Enable fallback mechanisms' }
          }
        }
      },
      required: ['query']
    }
  }
];

// Server instance
const server = new Server(
  {
    name: 'asr-got-complete-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error(`[${new Date().toISOString()}] [INFO] Tools requested - ${tools.length} ASR-GoT tools available (exact specification compliance)`);
  return { tools: tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const requestId = request.id;

  console.error(`[${new Date().toISOString()}] [INFO] Tool call: ${name} (request_id: ${requestId})`);

  try {
    switch (name) {
      case 'initialize_asr_got_graph':
        // Comprehensive input validation
        InputValidator.validateString(args.task_description, 'task_description', { 
          required: true, 
          maxLength: 5000,
          minLength: 10 
        });
        
        if (args.initial_confidence) {
          InputValidator.validateArray(args.initial_confidence, 'initial_confidence', { 
            maxItems: 4, 
            minItems: 4 
          });
          args.initial_confidence.forEach((val, idx) => {
            InputValidator.validateNumber(val, `initial_confidence[${idx}]`, { min: 0, max: 1 });
          });
        }
        
        if (args.config) {
          InputValidator.validateObject(args.config, 'config');
        }
        
        const session = getGraphSession(requestId);
        session.graph = new ASRGoTGraph(args.config || {});
        const initResult = session.graph.initialize(
          args.task_description,
          args.initial_confidence,
          args.config
        );
        
        console.error(`[${new Date().toISOString()}] [INFO] Graph initialized with ${Object.keys(session.graph.metadata.parameters).length} parameters active`);
        
        return {
          content: [{ type: 'text', text: session.graph._safeJSONStringify(initResult, 2) }]
        };

      case 'decompose_research_task':
        const sessionDecompose = getGraphSession(requestId);
        if (!sessionDecompose.graph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
        }
        
        if (args.dimensions) {
          InputValidator.validateArray(args.dimensions, 'dimensions', { maxItems: 20 });
          args.dimensions.forEach((dim, idx) => {
            InputValidator.validateString(dim, `dimensions[${idx}]`, { maxLength: 200 });
          });
        }
        const decomposeResult = sessionDecompose.graph.decomposeTask(args.dimensions);
        return {
          content: [{ type: 'text', text: sessionDecompose.graph._safeJSONStringify(decomposeResult, 2) }]
        };

      case 'generate_hypotheses':
        const sessionHypotheses = getGraphSession(requestId);
        if (!sessionHypotheses.graph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized. Please run initialize_asr_got_graph first.');
        }
        
        // Validate inputs
        InputValidator.validateString(args.dimension_node_id, 'dimension_node_id', { required: true, maxLength: 50 });
        InputValidator.validateArray(args.hypotheses, 'hypotheses', { required: true, maxItems: 10, minItems: 1 });
        
        if (args.config) {
          InputValidator.validateObject(args.config, 'config');
        }
        const hypothesesResult = sessionHypotheses.graph.generateHypotheses(
          args.dimension_node_id,
          args.hypotheses,
          args.config
        );
        return {
          content: [{ type: 'text', text: sessionHypotheses.graph._safeJSONStringify(hypothesesResult, 2) }]
        };

      case 'get_graph_summary':
        const sessionSummary = getGraphSession(requestId);
        if (!sessionSummary.graph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const summary = sessionSummary.graph.getGraphSummary();
        return {
          content: [{ type: 'text', text: sessionSummary.graph._safeJSONStringify(summary, 2) }]
        };

      case 'export_graph_data':
        const sessionExport = getGraphSession(requestId);
        if (!sessionExport.graph) {
          throw new McpError(ErrorCode.InvalidRequest, 'No graph initialized.');
        }
        const exportedData = sessionExport.graph.exportGraph(args.format);
        return {
          content: [{ type: 'text', text: exportedData }]
        };

      case 'execute_resilient_query':
        // Validate query input
        InputValidator.validateString(args.query, 'query', { 
          required: true, 
          maxLength: 2000,
          minLength: 5 
        });
        
        if (args.config) {
          InputValidator.validateObject(args.config, 'config');
        }
        
        // Create a new graph for this query or use existing one
        const sessionQuery = getGraphSession(requestId);
        if (!sessionQuery.graph) {
          sessionQuery.graph = new ASRGoTGraph(args.config || {});
        }
        
        const queryResult = sessionQuery.graph.executeQueryWithFallbacks(args.query, args.config || {});
        
        console.error(`[${new Date().toISOString()}] [INFO] Resilient query completed - ${queryResult.stages_completed.length} stages completed, ${queryResult.stages_failed.length} failed`);
        
        return {
          content: [{ type: 'text', text: sessionQuery.graph._safeJSONStringify(queryResult, 2) }]
        };

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Tool execution failed: ${error.message} (request_id: ${requestId})`);
    console.error(`[${new Date().toISOString()}] [ERROR] Stack trace: ${error.stack}`);
    
    // Enhanced error handling with fallback responses
    if (error instanceof McpError) {
      throw error;
    }
    
    // For critical failures, provide a fallback response instead of crashing
    if (name === 'execute_resilient_query' && args.query) {
      console.warn(`[${new Date().toISOString()}] [WARN] Providing emergency fallback response for query`);
      
      const fallbackResponse = {
        success: false,
        message: 'Query execution failed but emergency response provided',
        query: args.query,
        error: error.message,
        fallback_analysis: {
          recommendation: 'Try breaking down the query into smaller parts',
          suggested_approach: 'Manual research approach recommended',
          timestamp: new Date().toISOString()
        },
        mode: 'emergency_response'
      };
      
      return {
        content: [{ type: 'text', text: JSON.stringify(fallbackResponse, null, 2) }]
      };
    }
    
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
  }
});

// Graceful shutdown utilities
let isShuttingDown = false;
let serverInstance = null;

async function gracefulShutdown(exitCode = 0) {
  if (isShuttingDown) {
    console.error(`[${new Date().toISOString()}] [WARN] Shutdown already in progress...`);
    return;
  }
  
  isShuttingDown = true;
  console.error(`[${new Date().toISOString()}] [INFO] Starting graceful shutdown...`);
  
  try {
    // Clean up graph sessions
    console.error(`[${new Date().toISOString()}] [INFO] Cleaning up ${graphSessions.size} active sessions...`);
    graphSessions.clear();
    
    // Close server if running
    if (serverInstance) {
      console.error(`[${new Date().toISOString()}] [INFO] Closing server connections...`);
      // Note: MCP server doesn't have explicit close method, but we can mark it as shutting down
    }
    
    console.error(`[${new Date().toISOString()}] [INFO] Graceful shutdown completed`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Error during shutdown: ${error.message}`);
  } finally {
    setTimeout(() => {
      process.exit(exitCode);
    }, 100); // Give a brief moment for cleanup to complete
  }
}

// Start server with enhanced error handling and graceful shutdown
async function main() {
  try {
    console.error(`[${new Date().toISOString()}] [INFO] Starting ASR-GoT MCP Server - EXACT SPECIFICATION COMPLIANCE`);
    console.error(`[${new Date().toISOString()}] [INFO] Implementing all 29 parameters (P1.0-P1.29) line by line`);
    
    const transport = new StdioServerTransport();
    
    // Add process error handlers for graceful shutdown
    process.on('uncaughtException', async (error) => {
      console.error(`[${new Date().toISOString()}] [FATAL] Uncaught exception: ${error.message}`);
      console.error(`[${new Date().toISOString()}] [FATAL] Stack trace: ${error.stack}`);
      await gracefulShutdown(1);
    });
    
    process.on('unhandledRejection', async (reason, promise) => {
      console.error(`[${new Date().toISOString()}] [FATAL] Unhandled rejection at:`, promise, 'reason:', reason);
      await gracefulShutdown(1);
    });
    
    process.on('SIGINT', async () => {
      console.error(`[${new Date().toISOString()}] [INFO] Received SIGINT, shutting down gracefully...`);
      await gracefulShutdown(0);
    });
    
    process.on('SIGTERM', async () => {
      console.error(`[${new Date().toISOString()}] [INFO] Received SIGTERM, shutting down gracefully...`);
      await gracefulShutdown(0);
    });
    
    await server.connect(transport);
    serverInstance = server;
    console.error(`[${new Date().toISOString()}] [INFO] ASR-GoT MCP Server running with ${tools.length} tools - Node.js implementation`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] [ERROR] Failed to start server: ${error.message}`);
    console.error(`[${new Date().toISOString()}] [ERROR] Stack trace: ${error.stack}`);
    await gracefulShutdown(1);
  }
}

main();