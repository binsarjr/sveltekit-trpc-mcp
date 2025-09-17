import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';

export interface ConfigPaths {
  configDir: string;
  databasePath: string;
}

/**
 * Get XDG config directory - using ~/.config for all platforms
 * Following XDG Base Directory specification for better organization
 */
function getXdgConfigHome(): string {
  const home = homedir();

  // Check for XDG_CONFIG_HOME environment variable first
  if (process.env.XDG_CONFIG_HOME) {
    return process.env.XDG_CONFIG_HOME;
  }

  // Use ~/.config for all platforms for consistency
  return join(home, '.config');
}

/**
 * Get application-specific configuration paths
 * Uses ~/.config/binsarjr/trpc-sveltekit-mcp/ on all platforms for consistency
 * Following XDG Base Directory specification
 */
export function getConfigPaths(): ConfigPaths {
  // Check for environment variable override
  const customConfigDir = process.env.TRPC_SVELTEKIT_MCP_CONFIG_DIR;
  const customDbPath = process.env.TRPC_SVELTEKIT_MCP_DB_PATH;

  let configDir: string;

  if (customConfigDir) {
    configDir = customConfigDir;
  } else {
    // Use XDG config directory with app-specific subdirectory
    const baseConfigDir = getXdgConfigHome();
    configDir = join(baseConfigDir, 'binsarjr', 'trpc-sveltekit-mcp');
  }

  // Ensure config directory exists
  if (!existsSync(configDir)) {
    try {
      mkdirSync(configDir, { recursive: true });
    } catch (error) {
      console.warn(`Warning: Could not create config directory ${configDir}:`, error);
      // Fallback to temp directory if we can't create config dir
      configDir = join(process.cwd(), '.trpc-sveltekit-mcp-cache');
      if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
      }
    }
  }

  const databasePath = customDbPath || join(configDir, 'database.db');

  return {
    configDir,
    databasePath,
  };
}

/**
 * Get database path with environment variable support
 */
export function getDatabasePath(): string {
  return getConfigPaths().databasePath;
}

/**
 * Get config directory with environment variable support
 */
export function getConfigDirectory(): string {
  return getConfigPaths().configDir;
}

/**
 * Log config paths for debugging purposes
 */
export function logConfigPaths(): void {
  const paths = getConfigPaths();
  console.log('tRPC SvelteKit MCP Configuration:');
  console.log(`  Config Directory: ${paths.configDir}`);
  console.log(`  Database Path: ${paths.databasePath}`);

  if (process.env.TRPC_SVELTEKIT_MCP_CONFIG_DIR) {
    console.log(`  Using custom config dir from TRPC_SVELTEKIT_MCP_CONFIG_DIR`);
  }

  if (process.env.TRPC_SVELTEKIT_MCP_DB_PATH) {
    console.log(`  Using custom database path from TRPC_SVELTEKIT_MCP_DB_PATH`);
  }
}