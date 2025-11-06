import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';

export class AuditLogService {
  static async log(
    userId: string | null,
    action: string,
    details?: Record<string, any>
  ) {
    await db.insert(table.auditLog).values({
      userId,
      action,
      details: details ? JSON.stringify(details) : null,
    });
  }
}
