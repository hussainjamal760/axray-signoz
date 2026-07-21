// @ts-ignore
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
// @ts-ignore
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

export class SigNozService {
  private getHeaders() {
    const apiKey = process.env.SIGNOZ_MCP_API_KEY || process.env.SIGNOZ_API_KEY;
    if (!apiKey) {
      throw new Error("SigNoz API key is not configured in .env");
    }
    return {
      "Content-Type": "application/json",
      "SIGNOZ-API-KEY": apiKey,
    };
  }

  private getBaseUrl() {
    let baseUrl = process.env.SIGNOZ_INSTANCE_URL || "https://mcp.us2.signoz.cloud";
    // Ensure no trailing slash
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }
    return baseUrl;
  }

  /**
   * Fetches data from SigNoz using the Query Builder API
   */
  async executeQuery(dataSource: "logs" | "traces" | "metrics") {
    const mcpUrl = this.getBaseUrl();
    const apiKey = process.env.SIGNOZ_MCP_API_KEY || process.env.SIGNOZ_API_KEY;

    if (!apiKey) {
      throw new Error("SigNoz API key is not configured in .env");
    }

    const mcpOrigin = new URL(mcpUrl).origin;

    const transport = new StreamableHTTPClientTransport(new URL(mcpUrl), {
      requestInit: {
        headers: {
          "SIGNOZ-API-KEY": apiKey,
          "X-SigNoz-URL": mcpOrigin,
        },
      },
    });

    const client = new Client({ name: "axray-server", version: "1.0.0" });

    try {
      await client.connect(transport);

      const result = await client.callTool({
        name: "signoz_execute_builder_query",
        arguments: {
          query: {
            dataSource: dataSource,
            aggregateOperator: dataSource === "metrics" ? "rate" : "count",
            filters: [],
            limit: 10,
          },
          start: Date.now() - 15 * 60 * 1000,
          end: Date.now(),
        },
      });

      return result;
    } catch (error) {
      console.error("[SigNozService] Error fetching data via MCP:", error);
      throw error;
    } finally {
      await client.close();
    }
  }
}

export const signozService = new SigNozService();
