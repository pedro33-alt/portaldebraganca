import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export type UserRole = 'morador' | 'sindico' | 'porteiro' | 'admin_condo' | 'admin_ding' | 'anunciante';

export const JWT_SECRET = process.env.JWT_SECRET || 'portal-braganca-jwt-secret-key-2026-portal-braganca';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  condominium_id?: string;
  unit_id?: string;
  avatar_url?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  condominiumId?: string;
}

/**
 * Middleware de Autenticação Estrita via Token JWT Bearer.
 * Backdoor de headers mock foi removido para segurança de produção.
 */
export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acesso não autorizado. Token de autenticação obrigatório.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    req.condominiumId = decoded.condominium_id || (req.headers['x-condominium-id'] as string) || undefined;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token de autenticação inválido ou expirado. Faça login novamente.' });
  }
};

/**
 * Middleware Opcional de Autenticação (para leitura de catálogos públicos com contexto de usuário se logado)
 */
export const optionalAuthMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
      req.condominiumId = decoded.condominium_id;
    } catch (e) {
      // Token inválido, prossegue como anônimo sem req.user
    }
  }
  next();
};

/**
 * Middleware de RBAC (Role-Based Access Control)
 * Valida se a role do usuário autenticado pertence à lista de roles permitidas.
 * Admin DING possui privilégio global.
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    // Admin DING tem acesso a todas as operações
    if (req.user.role === 'admin_ding') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Acesso negado. O perfil '${req.user.role}' não possui permissão para executar esta ação.`
      });
    }

    next();
  };
};
