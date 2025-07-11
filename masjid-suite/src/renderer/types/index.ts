export interface Activity {
  id: number;
  action: string;
  timestamp: string;
  userId: number;
  userName: string;
  entityType: string;
  entityId: number;
  metadata?: Record<string, unknown>;
}
