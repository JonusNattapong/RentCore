import { Request, Response, NextFunction } from 'express';
import { AuditRepository } from '../repositories/auditRepository';

const auditRepository = new AuditRepository();

/**
 * Middleware to log actions.
 * Usage: router.post('/', auditLog('CREATE', 'BRANCH'), controller.createBranch);
 */
export const auditLog = (action: any, entityType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We wrap the original send/json method to capture the response for 'after_json'
    const originalJson = res.json;
    
    res.json = function (this: Response, body: any) {
      // Only log successful actions (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = (req as any).user?.id; // Assuming user is added to req by auth middleware
        const branchId = req.body.branch_id || (req as any).user?.branch_id;
        
        auditRepository.create({
          user_id: userId,
          branch_id: branchId,
          action: action,
          entity_type: entityType,
          entity_id: body.id,
          after_json: body,
          ip_address: req.ip,
          user_agent: req.get('user-agent')
        }).catch(err => console.error('Failed to save audit log:', err));
      }
      return originalJson.call(this, body);
    } as any;

    next();
  };
};
