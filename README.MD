# tRPC SvelteKit MCP Server

A specialized Model Context Protocol (MCP) server for tRPC SvelteKit development, providing curated knowledge, code examples, and intelligent assistance for building type-safe APIs with end-to-end type safety in SvelteKit applications.

## Features

### 🔍 **Searchable Resources**
- **Knowledge Base**: Curated Q&A covering tRPC SvelteKit concepts, patterns, and best practices
- **Code Examples**: Searchable collection of tRPC SvelteKit implementation patterns

### 🛠️ **Intelligent Tools**
- `search_knowledge` - Find explanations and concepts
- `search_examples` - Discover code patterns and implementations
- `generate_with_context` - Create routers and procedures using curated patterns
- `audit_with_rules` - Review code against tRPC SvelteKit best practices
- `explain_concept` - Get detailed explanations with examples

### 📝 **Smart Prompts**
- `generate-router` - Generate modern tRPC SvelteKit routers
- `audit-trpc-code` - Audit code for optimization opportunities
- `explain-concept` - Detailed concept explanations
- `search-patterns` - Find specific implementation patterns

## Installation

### Option 1: Direct usage with bunx (Recommended)

Simply add to your Claude Desktop configuration - no installation required:

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

### Option 2: Manual installation

```bash
# Clone and setup
git clone https://github.com/binsarjr/trpc-sveltekit-mcp
cd trpc-sveltekit-mcp

# Install dependencies with Bun
bun install

# Start the server
bun start
```

## Project Structure

```
trpc-sveltekit-mcp/
├── src/
│   ├── index.ts                    # Main MCP server implementation
│   ├── TRPCSvelteKitSearchDB.ts   # SQLite database with FTS5 search
│   └── data/
│       ├── knowledge/             # Curated Q&A knowledge base (JSONL)
│       └── patterns/              # Code examples and patterns (JSONL)
├── package.json
├── bun.lockb                      # Bun lock file
├── tsconfig.json
└── README.md
```

## Usage with Claude Desktop

### Recommended: Using bunx (no installation required)

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

### Alternative: Local installation

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

## Usage Examples

### 🔍 Search Knowledge
```
Tool: search_knowledge
Query: "authentication middleware"
```

Returns detailed explanations about implementing authentication in tRPC SvelteKit.

### 📚 Find Code Examples
```
Tool: search_examples
Query: "router setup context"
```

Returns working tRPC SvelteKit router implementations with context setup.

### 🏗️ Generate Routers
```
Tool: generate_with_context
Description: "User management API with CRUD operations"
Procedures: ["list", "create", "update", "delete"]
```

Generates a complete tRPC router using modern patterns with relevant examples from the knowledge base.

### 🔍 Audit Code
```
Tool: audit_with_rules
Code: "const router = t.router({ hello: t.procedure.query(() => 'world') });"
Focus: "best-practices"
```

Analyzes code and suggests tRPC SvelteKit improvements like input validation and error handling.

## Key tRPC SvelteKit Concepts Covered

### 🎯 **Core tRPC Features**
- **Routers** - API organization and structure
- **Procedures** - Query, mutation, and subscription endpoints
- **Context** - Request-level data and services
- **Middleware** - Reusable logic for authentication, logging, etc.
- **Type Safety** - End-to-end TypeScript integration

### 🧩 **SvelteKit Integration**
- **Load Functions** - Server-side data fetching with tRPC
- **Client Usage** - Calling tRPC procedures from Svelte components
- **Error Handling** - TRPCError and client-side error management
- **Hooks Integration** - Setting up tRPC in SvelteKit hooks
- **Real-time Features** - WebSocket subscriptions

### 📈 **Advanced Patterns**
- **Authentication & Authorization** - JWT, sessions, and role-based access
- **Input Validation** - Zod schemas and type-safe inputs
- **File Uploads** - Handling files with SvelteKit and tRPC
- **Caching** - Request caching and optimization strategies
- **Testing** - Unit and integration testing patterns

## Data Format

### Knowledge Base (JSONL files in `data/knowledge/`)
```json
{
  "question": "How do you create a tRPC router in SvelteKit?",
  "answer": "Create a tRPC router using t.router() and define procedures with t.procedure.query() for read operations..."
}
```

### Examples (JSONL files in `data/patterns/`)
```json
{
  "instruction": "Create a basic tRPC router with TypeScript",
  "input": "Set up a basic tRPC router with a simple greeting query",
  "output": "// lib/trpc/router.ts\nimport { initTRPC } from '@trpc/server';\n..."
}
```

## Configuration

### Database Location

The server stores its SQLite database following the XDG Base Directory specification:

- **All platforms**: `~/.config/binsarjr/trpc-sveltekit-mcp/database.db`

This provides a consistent, organized location across all operating systems.

### Environment Variables

You can customize the database location using environment variables:

```json
{
  "mcpServers": {
    "trpc-sveltekit": {
      "command": "bunx",
      "args": ["@binsarjr/trpc-sveltekit-mcp"],
      "env": {
        "TRPC_SVELTEKIT_MCP_CONFIG_DIR": "/custom/config/path",
        "TRPC_SVELTEKIT_MCP_DB_PATH": "/custom/database.db"
      }
    }
  }
}
```

### Search Features

The server uses SQLite with FTS5 for advanced search capabilities:

- **Full-Text Search**: Utilizes SQLite's FTS5 extension for powerful and efficient searching across the knowledge base and code examples.
- **Tokenization**: Employs the `unicode61` tokenizer with a comprehensive set of separators for robust indexing of terms.
- **Synonym Expansion**: Enhances search recall by automatically expanding query terms with predefined tRPC SvelteKit-specific synonyms (e.g., 'router' also matches 'api router').
- **Result Highlighting**: Search results include highlighted matches within relevant fields using FTS5's `highlight()` function.
- **Relevance Ranking**: Results are ordered by relevance based on FTS5's internal ranking algorithm.
- **Advanced Boosting**: Offers capabilities for custom scoring and boosting to fine-tune search results.

## Development

### Testing
The server provides comprehensive logging and error handling:

```bash
# Test the server
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | bun start
```

## Contributing

### Adding Knowledge
1. Add entries to JSONL files in `src/data/knowledge/`
2. Format: `{"question": "...", "answer": "..."}`
3. Focus on tRPC SvelteKit specific features and best practices

### Adding Examples
1. Add entries to JSONL files in `src/data/patterns/`
2. Format: `{"instruction": "...", "input": "...", "output": "..."}`
3. Include complete, working tRPC SvelteKit code examples

### Search Optimization
- Use descriptive, searchable keywords in questions and instructions
- Include alternative phrasings for common concepts
- Tag examples with relevant feature names (`router`, `procedures`, `context`, etc.)

## Advanced Usage

### Custom Search Queries
The search tools support sophisticated queries:

```typescript
// Search for authentication patterns
search_examples("authentication middleware jwt")

// Find type safety guidance
search_knowledge("typescript type inference zod")

// Discover integration patterns
search_examples("sveltekit load function trpc")
```

### Prompt Chaining
Use prompts in sequence for complex workflows:

1. `search-patterns` - Find relevant patterns
2. `generate-router` - Create based on patterns
3. `audit-trpc-code` - Review and optimize

### Integration Tips
- **Claude Desktop**: Best for interactive development
- **API Integration**: Use programmatically for code generation
- **CI/CD**: Audit code in automated workflows
- **Documentation**: Generate examples for API documentation

## Troubleshooting

### Common Issues

**"No results found"**
- Check search terms are relevant to tRPC SvelteKit
- Try broader queries first, then narrow down
- Ensure data files are properly formatted JSONL

**"Tool not found"**
- Check MCP client configuration
- Review server logs for startup errors

**"Invalid data format"**
- Validate JSONL files (one JSON object per line)
- Check for syntax errors in JSON objects

**Database/Config Issues**
- Check if config directory is writable
- Verify database permissions in the config folder
- Use `TRPC_SVELTEKIT_MCP_DB_PATH` environment variable for custom locations
- Check logs for database initialization messages

### Debugging
```bash
# Enable debug logging
DEBUG=* bun start

# Test database location
bunx @binsarjr/trpc-sveltekit-mcp  # Watch for config path logs

# Check config directory (all platforms)
ls -la ~/.config/binsarjr/trpc-sveltekit-mcp/
```

## License

MIT License - see LICENSE file for details.

## Acknowledgments

- Built with [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- Validation with [Zod](https://zod.dev/)
- Curated tRPC SvelteKit knowledge from official documentation and community best practices
- Powered by [tRPC](https://trpc.io/) and [SvelteKit](https://kit.svelte.dev/)