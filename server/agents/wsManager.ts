import { WebSocket, WebSocketServer } from 'ws';
import { AgentState } from './newsletterAgent';

/**
 * WebSocket connection manager for real-time agent state updates
 */
export class AgentWebSocketManager {
  private wss: WebSocketServer | null = null;
  private connections: Map<string, Set<WebSocket>> = new Map();

  /**
   * Initialize WebSocket server on given port
   */
  initializeServer(port: number) {
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket) => {
      let executionId: string | null = null;

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data);

          if (message.type === 'subscribe') {
            executionId = message.executionId as string;

            if (!this.connections.has(executionId)) {
              this.connections.set(executionId, new Set());
            }

            this.connections.get(executionId)!.add(ws);
            ws.send(JSON.stringify({ type: 'subscribed', executionId }));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        if (executionId && this.connections.has(executionId)) {
          this.connections.get(executionId)!.delete(ws);
        }
      });

      ws.on('error', (error: Error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log(`Agent WebSocket server listening on port ${port}`);
  }

  /**
   * Broadcast agent state update to all subscribers
   */
  broadcastStateUpdate(executionId: string, state: AgentState) {
    if (!this.connections.has(executionId)) {
      return;
    }

    const subscribers = this.connections.get(executionId)!;
    const message = JSON.stringify({
      type: 'state_update',
      executionId,
      state,
      timestamp: new Date().toISOString(),
    });

    subscribers.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  }

  /**
   * Get active connection count for an execution
   */
  getConnectionCount(executionId: string): number {
    return this.connections.get(executionId)?.size ?? 0;
  }

  /**
   * Close all connections for an execution
   */
  closeExecution(executionId: string) {
    if (this.connections.has(executionId)) {
      const subscribers = this.connections.get(executionId)!;
      subscribers.forEach((ws) => {
        ws.close();
      });
      this.connections.delete(executionId);
    }
  }

  /**
   * Close the WebSocket server
   */
  close() {
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const agentWSManager = new AgentWebSocketManager();
