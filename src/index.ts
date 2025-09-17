#!/usr/bin/env bun

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import {TRPCSvelteKitSearchDB} from "./TRPCSvelteKitSearchDB.js";
import { logConfigPaths } from "./utils/config.js";
import { loadJsonlFromDirectory } from "./utils/jsonl.js";

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load knowledge and examples content
const knowledgeDir = join(__dirname, 'data', 'knowledge');
const patternsDir = join(__dirname, 'data', 'patterns');
const knowledgeContent = loadJsonlFromDirectory(knowledgeDir);
const examplesContent = loadJsonlFromDirectory(patternsDir);

// Zod schemas for validation
const SearchQuerySchema = z.object({
  query: z.string().describe("Search query"),
  limit: z.number().optional().default(5).describe("Maximum number of results"),
});

const GenerateRouterSchema = z.object({
  description: z.string().describe("Description of the tRPC router to generate"),
  procedures: z.array(z.string()).optional().describe("Specific procedures to include"),
  complexity: z.enum(["simple", "moderate", "complex"]).optional().default("moderate"),
});

const AuditCodeSchema = z.object({
  code: z.string().describe("tRPC SvelteKit code to audit"),
  focus: z.enum(["performance", "type-safety", "best-practices", "all"]).optional().default("all"),
});

const ExplainConceptSchema = z.object({
  concept: z.string().describe("tRPC SvelteKit concept to explain"),
  detail_level: z.enum(["basic", "intermediate", "advanced"]).optional().default("intermediate"),
});

// Parse command line arguments
const args = process.argv.slice(2);
const forceResync = args.includes('--force');

class TRPCSvelteKitMCPServer {
  private server: Server;
  private searchDB?: TRPCSvelteKitSearchDB;

  constructor() {
    this.server = new Server(
      {
        name: "trpc-sveltekit-mcp-server",
        version: "1.0.0",
        description: "MCP server for tRPC SvelteKit development with curated knowledge and examples",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );
    this.setupHandlers();

    // Log configuration paths for debugging
    logConfigPaths();

    // Initialize database with config-based path
    this.searchDB = new TRPCSvelteKitSearchDB();

    // Load data from modular JSONL folders
    const dataDir = join(__dirname, 'data');

    // Force resync if --force argument is provided
    if (forceResync) {
      console.log('🔄 Force resync enabled - reloading knowledge base...');
    }

    this.searchDB.populateFromFolders(dataDir, forceResync);
  }



  private setupHandlers() {

    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
      resources: [
        {
          uri: "trpc-sveltekit://knowledge",
          mimeType: "application/json",
          name: "tRPC SvelteKit Knowledge Base",
          description: "Curated Q&A knowledge base for tRPC SvelteKit concepts, patterns, and best practices",
        },
        {
          uri: "trpc-sveltekit://examples",
          mimeType: "application/json",
          name: "tRPC SvelteKit Code Examples",
          description: "Searchable collection of tRPC SvelteKit code patterns and implementation examples",
        },
      ],
    }));

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case "trpc-sveltekit://knowledge":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(knowledgeContent, null, 2),
              },
            ],
          };

        case "trpc-sveltekit://examples":
          return {
            contents: [
              {
                uri,
                mimeType: "application/json",
                text: JSON.stringify(examplesContent, null, 2),
              },
            ],
          };

        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "search_knowledge",
          description: "Search the tRPC SvelteKit knowledge base for concepts, explanations, and Q&A",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query"
              },
              limit: {
                type: "number",
                default: 5,
                description: "Maximum number of results"
              }
            },
            required: ["query"]
          },
        },
        {
          name: "search_examples",
          description: "Search tRPC SvelteKit code examples and patterns",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query"
              },
              limit: {
                type: "number",
                default: 5,
                description: "Maximum number of results"
              }
            },
            required: ["query"]
          },
        },
        {
          name: "generate_with_context",
          description: "Generate tRPC SvelteKit routers and procedures using knowledge context",
          inputSchema: {
            type: "object",
            properties: {
              description: {
                type: "string",
                description: "Description of the tRPC router to generate"
              },
              procedures: {
                type: "array",
                items: { type: "string" },
                description: "Specific procedures to include"
              },
              complexity: {
                type: "string",
                enum: ["simple", "moderate", "complex"],
                default: "moderate",
                description: "Complexity level"
              }
            },
            required: ["description"]
          },
        },
        {
          name: "audit_with_rules",
          description: "Audit tRPC SvelteKit code against best practices and patterns",
          inputSchema: {
            type: "object",
            properties: {
              code: {
                type: "string",
                description: "tRPC SvelteKit code to audit"
              },
              focus: {
                type: "string",
                enum: ["performance", "type-safety", "best-practices", "all"],
                default: "all",
                description: "Focus area"
              }
            },
            required: ["code"]
          },
        },
        {
          name: "explain_concept",
          description: "Get detailed explanations of tRPC SvelteKit concepts with examples",
          inputSchema: {
            type: "object",
            properties: {
              concept: {
                type: "string",
                description: "tRPC SvelteKit concept to explain"
              },
              detail_level: {
                type: "string",
                enum: ["basic", "intermediate", "advanced"],
                default: "intermediate",
                description: "Detail level"
              }
            },
            required: ["concept"]
          },
        }
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "search_knowledge":
          return this.searchKnowledge(args);
        case "search_examples":
          return this.searchExamples(args);
        case "generate_with_context":
          return this.generateWithContext(args);
        case "audit_with_rules":
          return this.auditWithRules(args);
        case "explain_concept":
          return this.explainConcept(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({
      prompts: [
        {
          name: "generate-router",
          description: "Generate a tRPC SvelteKit router with modern patterns",
          arguments: [
            {
              name: "description",
              description: "Description of the router to create",
              required: true,
            },
            {
              name: "procedures",
              description: "Comma-separated list of procedures to include",
              required: false,
            },
          ]
        },
        {
          name: "audit-trpc-code",
          description: "Audit tRPC SvelteKit code for best practices and optimization opportunities",
          arguments: [
            {
              name: "code",
              description: "tRPC SvelteKit code to audit",
              required: true,
            },
            {
              name: "focus",
              description: "Focus area: performance, type-safety, best-practices, or all",
              required: false,
            },
          ]
        },
        {
          name: "explain-concept",
          description: "Explain tRPC SvelteKit concepts with detailed examples and comparisons",
          arguments: [
            {
              name: "concept",
              description: "tRPC SvelteKit concept to explain (e.g., 'router', 'procedures', 'context')",
              required: true,
            },
            {
              name: "level",
              description: "Detail level: basic, intermediate, or advanced",
              required: false,
            },
          ]
        },
        {
          name: "search-patterns",
          description: "Search for specific tRPC SvelteKit patterns and implementations",
          arguments: [
            {
              name: "pattern",
              description: "Pattern or feature to search for",
              required: true,
            },
            {
              name: "context",
              description: "Additional context or requirements",
              required: false,
            },
          ]
        },
      ],
    }));

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "generate-router":
          return this.getGenerateRouterPrompt(args);
        case "audit-trpc-code":
          return this.getAuditCodePrompt(args);
        case "explain-concept":
          return this.getExplainConceptPrompt(args);
        case "search-patterns":
          return this.getSearchPatternsPrompt(args);
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  private async searchKnowledge(args: any) {
    const { query, limit } = SearchQuerySchema.parse(args);
    const results = this.searchDB?.searchKnowledge(query, limit);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2),
      }],
    };
  }

  private async searchExamples(args: any) {
    const { query, limit } = SearchQuerySchema.parse(args);
    const results = this.searchDB?.searchExamples(query, limit);
    
    return {
      content: [{
        type: "text",
        text: JSON.stringify(results, null, 2),
      }],
    };
  }

    private async generateWithContext(args: any) {
    const { description, procedures, complexity } = GenerateRouterSchema.parse(args);
    
    // Search for relevant patterns
    const patternResults = this.searchDB?.searchExamples(description, 3);
    const knowledgeResults = this.searchDB?.searchKnowledge(description, 2);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            request: { description, procedures, complexity },
            relevant_patterns: patternResults?.results?.map(r => ({
              instruction: r.instruction,
              output: r.output,
              relevance: r.relevance_score,
            })),
            relevant_knowledge: knowledgeResults?.results?.map(r => ({
              question: r.question,
              answer: r.answer,
              relevance: r.relevance_score,
            })),
            generation_guidance: {
              use_typescript: true,
              include_zod_validation: true,
              implement_error_handling: true,
              ensure_type_safety: true,
              follow_trpc_patterns: true,
            },
          }, null, 2),
        },
      ],
    };
  }

  private async auditWithRules(args: any) {
    const { code, focus } = AuditCodeSchema.parse(args);
    
    // Find relevant best practices
    const focusQueries = {
      performance: "performance optimization caching middleware",
      "type-safety": "typescript type inference zod validation",
      "best-practices": "best practices router structure error handling",
      all: "best practices performance type safety patterns",
    };

    const relevantKnowledge = this.searchDB?.searchKnowledge(focusQueries[focus], 4);;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            code_audit: {
              focus_area: focus,
              code_length: code.length,
              relevant_guidelines: relevantKnowledge?.results.map(r => ({
                guideline: r.question,
                explanation: r.answer,
                relevance: r.relevance_score,
              })),
              audit_checklist: {
                uses_typescript: code.includes(": ") || code.includes("interface ") || code.includes("type "),
                has_router_definition: code.includes("t.router") || code.includes("createTRPCRouter"),
                uses_procedures: code.includes("t.procedure") || code.includes("query") || code.includes("mutation"),
                has_input_validation: code.includes("z.") || code.includes("zod") || code.includes("input:"),
                implements_error_handling: code.includes("TRPCError") || code.includes("throw") || code.includes("try"),
                uses_context: code.includes("ctx") || code.includes("context"),
              },
            },
          }, null, 2),
        },
      ],
    };
  }

  private async explainConcept(args: any) {
    const { concept, detail_level } = ExplainConceptSchema.parse(args);
    
    const conceptResults = this.searchDB?.searchKnowledge(concept, 3);
    const exampleResults = this.searchDB?.searchExamples(concept, 2);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            concept_explanation: {
              concept,
              detail_level,
              explanations: conceptResults?.results?.map(item => ({
                question: item.question,
                answer: item.answer,
                relevance: item.relevance_score,
              })),
              code_examples: exampleResults?.results?.map(item => ({
                scenario: item.input,
                implementation: item.output,
                relevance: item.relevance_score,
              })),
            },
          }, null, 2),
        },
      ],
    };
  }

  private async getGenerateRouterPrompt(args: any) {
    const description = args?.description || "[router description]";
    const procedures = args?.procedures || "";

    return {
      description: "Generate a modern tRPC SvelteKit router with best practices",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a tRPC SvelteKit router: ${description}

${procedures ? `Procedures to include: ${procedures}` : ""}

Requirements:
- Use TypeScript with proper type definitions
- Include input validation with Zod schemas
- Implement proper error handling with TRPCError
- Use context for authentication and request data
- Follow tRPC naming conventions
- Include proper middleware where appropriate
- Add meaningful comments explaining tRPC patterns used

Provide a complete, working router with explanation of the tRPC SvelteKit patterns used.`,
          },
        },
      ],
    };
  }

  private async getAuditCodePrompt(args: any) {
    const code = args?.code || "[paste your tRPC SvelteKit code here]";
    const focus = args?.focus || "all";

    return {
      description: "Audit tRPC SvelteKit code for best practices and optimization opportunities",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please audit this tRPC SvelteKit code with focus on: ${focus}

\`\`\`typescript
${code}
\`\`\`

Audit checklist:
- ✅ TypeScript usage and type safety
- ✅ Router structure and organization
- ✅ Procedure definitions (query, mutation, subscription)
- ✅ Input validation with Zod schemas
- ✅ Error handling with TRPCError
- ✅ Context usage and middleware implementation
- ✅ Performance and caching considerations
- ✅ Code organization and readability

Provide:
1. Issues found with severity (high/medium/low)
2. Specific code improvements with examples
3. Best practice recommendations for tRPC SvelteKit
4. Performance optimization opportunities`,
          },
        },
      ],
    };
  }

  private async getExplainConceptPrompt(args: any) {
    const concept = args?.concept || "[tRPC SvelteKit concept]";
    const level = args?.level || "intermediate";

    return {
      description: "Explain tRPC SvelteKit concepts with detailed examples and comparisons",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Explain the tRPC SvelteKit concept: "${concept}" at ${level} level

Please provide:
1. Clear definition and purpose
2. Syntax and usage examples
3. Integration with SvelteKit patterns
4. When and why to use this feature
5. Common patterns and best practices
6. Potential gotchas or edge cases
7. Code examples showing practical implementation

Focus on practical understanding with working code examples that demonstrate the concept clearly in a tRPC SvelteKit context.`,
          },
        },
      ],
    };
  }

  private async getSearchPatternsPrompt(args: any) {
    const pattern = args?.pattern || "[pattern or feature]";
    const context = args?.context || "";

    return {
      description: "Search for specific tRPC SvelteKit patterns and implementations",
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Find tRPC SvelteKit patterns for: "${pattern}"

${context ? `Additional context: ${context}` : ""}

Please search the knowledge base and provide:
1. Relevant patterns and implementations
2. Code examples using tRPC SvelteKit features
3. Best practices for this specific use case
4. Alternative approaches and trade-offs
5. Common mistakes to avoid

Focus on modern tRPC SvelteKit approaches using type-safe procedures, proper error handling, and efficient data fetching patterns.`,
          },
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new TRPCSvelteKitMCPServer();
server.run().catch(console.error);