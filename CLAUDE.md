# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a specialized Model Context Protocol (MCP) server for tRPC SvelteKit development, adapted to use Bun instead of Node.js. It provides curated knowledge, code examples, and intelligent assistance for modern tRPC SvelteKit development with type-safe APIs, end-to-end type safety, and best practices.

## Common Commands

### Development
```bash
# Start development server with watch mode
bun run dev

# Start the MCP server
bun run start

# Install dependencies
bun install

# Inspect the MCP server (for debugging)
bunx @modelcontextprotocol/inspector bun src/index.ts
```

### Publishing
```bash
# Publish to npm (no build step required - Bun runs TypeScript directly)
npm publish

# Test the published package locally
bunx @binsarjr/trpc-sveltekit-mcp
```

### Testing
```bash
# Test the server manually
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | bun start

# Test via bunx
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | bunx @binsarjr/trpc-sveltekit-mcp
```

## Architecture Overview

### Core Components

- **`src/index.ts`**: Main MCP server implementation with tool and prompt handlers
- **`src/TRPCSvelteKitSearchDB.ts`**: SQLite-based search database with FTS5 full-text search capabilities
- **`src/data/knowledge/`**: Curated Q&A knowledge base for tRPC SvelteKit concepts
- **`src/data/patterns/`**: Code examples and implementation patterns

### MCP Server Features

The server provides 5 main tools:
1. `search_knowledge` - Search the tRPC SvelteKit knowledge base
2. `search_examples` - Search code patterns and examples
3. `generate_with_context` - Generate routers and procedures using curated patterns
4. `audit_with_rules` - Audit code against tRPC SvelteKit best practices
5. `explain_concept` - Get detailed concept explanations

Plus 4 smart prompts:
1. `generate-router` - Generate modern tRPC SvelteKit routers
2. `audit-trpc-code` - Audit code for optimization and best practices
3. `explain-concept` - Detailed concept explanations
4. `search-patterns` - Find specific implementation patterns

### Database Architecture

Uses SQLite with FTS5 (Full-Text Search) for advanced search capabilities:
- **Tables**: `knowledge`, `examples`, `synonyms`
- **Virtual Tables**: `knowledge_fts`, `examples_fts` for full-text search
- **Triggers**: Automatic sync between main tables and FTS tables
- **Synonyms**: tRPC SvelteKit-specific term expansion for better search results

### Key Technologies

- **Runtime**: Bun (requires >= 1.0.0) - runs TypeScript directly without compilation
- **Database**: SQLite with FTS5 via `bun:sqlite`
- **Validation**: Zod schemas for input validation
- **MCP SDK**: `@modelcontextprotocol/sdk` for protocol implementation

### Deployment Options

**Option 1: Direct bunx usage (Recommended)**
```json
{
  "mcpServers": {
    "trpc-sveltekit": {
      "command": "bunx",
      "args": ["@binsarjr/trpc-sveltekit-mcp"],
      "env": {}
    }
  }
}
```

**Option 2: Local installation**
```json
{
  "mcpServers": {
    "trpc-sveltekit": {
      "command": "bun",
      "args": ["/path/to/trpc-sveltekit-mcp/src/index.ts"],
      "env": {}
    }
  }
}
```

## Development Patterns

### tRPC SvelteKit Focus
This server is specifically designed for tRPC SvelteKit development patterns:
- Type-safe API development with end-to-end type safety
- Router and procedure patterns (queries, mutations, subscriptions)
- Authentication and authorization middleware
- Input validation with Zod schemas
- Error handling with TRPCError
- Context management and SvelteKit integration

### Search Implementation
- **Query Expansion**: Automatic synonym expansion for tRPC SvelteKit terms
- **Highlighted Results**: Search results include highlighted matches
- **Custom Scoring**: Advanced boosting for code-related terms
- **Relevance Ranking**: FTS5-based ranking for result ordering

### Data Management
- **Transactional Inserts**: Bulk data population using SQLite transactions
- **Automatic Indexing**: FTS triggers maintain search index consistency
- **JSON Validation**: Zod schemas ensure data integrity

## File Structure Guidelines

```
src/
├── index.ts                    # Main MCP server (tool handlers, prompt handlers)
├── TRPCSvelteKitSearchDB.ts   # Database layer with search functionality
└── data/
    ├── knowledge/             # Q&A knowledge base (JSONL files)
    └── patterns/              # Code examples and patterns (JSONL files)
```

## Configuration Notes

- Database is stored at `~/.config/binsarjr/trpc-sveltekit-mcp/database.db` following XDG standard
- Uses Bun's native SQLite implementation (`bun:sqlite`)
- TypeScript configuration targets ES2022 with ESNext modules
- JSON imports use `with { type: "json" }` syntax for modern module resolution
- Config directory is consistent across all platforms for simplicity

## Data Format Requirements

### Knowledge Entries
```json
{
  "question": "How do you create a tRPC router in SvelteKit?",
  "answer": "Create a tRPC router using t.router() and define procedures with t.procedure.query() for read operations..."
}
```

### Example Entries
```json
{
  "instruction": "Create a basic tRPC router with TypeScript",
  "input": "Set up a basic tRPC router with a simple greeting query",
  "output": "// lib/trpc/router.ts\nimport { initTRPC } from '@trpc/server';\n..."
}
```