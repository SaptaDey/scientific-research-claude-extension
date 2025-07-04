# 🚀 Server Configuration Guide

## Two Server Options Available

This repository provides **two different MCP servers** for different use cases:

### 1. 🧠 **Advanced ASR-GoT Framework Server** (Recommended for Research)
- **File**: `server/index.js`
- **Manifest**: `manifest.json`
- **Use Case**: Complex scientific reasoning, hypothesis generation, advanced research workflows
- **Security Status**: ✅ **FULLY SECURED** (All critical vulnerabilities fixed)
- **Features**:
  - 8-stage ASR-GoT methodology
  - Session-based state management (no race conditions)
  - Comprehensive input validation and sanitization
  - Memory leak prevention with automatic cleanup
  - Graceful shutdown procedures
  - Multi-dimensional confidence tracking
  - Bias detection and knowledge gap analysis

**Tools Available**:
- `initialize_asr_got_graph` - Start new reasoning graph
- `decompose_research_task` - Break down complex research questions
- `generate_hypotheses` - Generate and evaluate competing hypotheses
- `get_graph_summary` - Get comprehensive graph analysis
- `export_graph_data` - Export results in multiple formats
- `execute_resilient_query` - Run queries with built-in fallbacks

### 2. 📚 **Simple Research Tools Server** (For Basic Paper Search)
- **File**: `server/scientific-research-server.js`  
- **Manifest**: `manifest-research.json`
- **Use Case**: Basic paper search, citation generation, literature review
- **Features**:
  - Paper search across databases
  - ArXiv integration
  - Citation formatting (APA, MLA, Chicago, Vancouver, BibTeX)
  - Paper analysis and details

**Tools Available**:
- `search_papers` - Search academic papers
- `get_paper_details` - Get detailed paper information
- `search_arxiv` - Search ArXiv preprints
- `analyze_paper` - Analyze paper content
- `get_citations` - Generate formatted citations

## 🔧 Installation & Setup

### For Advanced Research (ASR-GoT Framework):
```bash
# Use the main manifest (points to security-fixed server)
cp manifest.json your_manifest.json
```

### For Simple Paper Search:
```bash
# Use the research tools manifest
cp manifest-research.json your_manifest.json
```

## ✅ Security Status

**CRITICAL FIXES APPLIED** (2024-12-28):
- ✅ Memory leak prevention
- ✅ Race condition elimination
- ✅ Input validation & XSS protection
- ✅ Graceful shutdown procedures
- ✅ Secure random ID generation

## 🧪 Testing

**ASR-GoT Server (index.js)**:
```bash
cd server
node --check index.js  # Syntax validation
node test-basic.js     # Basic functionality
```

**Research Tools Server (scientific-research-server.js)**:
```bash
cd server  
node test-direct.js    # Full functionality test (100% pass rate)
```

## 🎯 Recommendation

- **For Researchers**: Use `manifest.json` → ASR-GoT Framework (advanced capabilities)
- **For Simple Queries**: Use `manifest-research.json` → Research Tools (basic search)
- **For Production**: Both servers are now production-ready with security fixes applied

Choose based on your complexity needs - both are fully functional and secure!