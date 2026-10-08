import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { getDb, saveDb } from './db';
import { User, UserRole } from '../src/types';

const JWT_SECRET = process.env.JWT_SECRET || 'kiosco-escolar-super-secret-key-2026';

export interface AuthRequest extends Request {
  user?: User;
}

// Inappropriate words filter for visible names
const BANNED_WORDS = [
  'puto', 'puta', 'mierda', 'concha', 'carajo', 'pelotudo', 'boludo', 'choto', 'forro',
  'tarado', 'idiota', 'estupido', 'imbecil', 'nazi', 'hitler', 'violador', 'asesino',
  'droga', 'tula', 'pija', 'verga', 'orto', 'culiao', 'culiado'
];

/**
 * Validates email format according to RFC 5322 standard and school security policies.
 */
export function validateEmail(email: string): { valid: boolean; error?: string; normalizedEmail?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'El correo electrónico es obligatorio.' };
  }

  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'El correo electrónico no puede estar en blanco.' };
  }

  if (trimmed.length > 254) {
    return { valid: false, error: 'El correo electrónico no puede superar los 254 caracteres.' };
  }

  // Strict email regex complying with RFC 5322 simplified pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailRegex.test(trimmed)) {
    return {
      valid: false,
      error: 'Formato de correo electrónico inválido. Ejemplo esperado: usuario@alumno.edu o similar.',
    };
  }

  // Split and validate domain details
  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { valid: false, error: 'El correo debe contener exactamente un símbolo "@".' };
  }

  const [localPart, domainPart] = parts;
  if (localPart.length > 64) {
    return { valid: false, error: 'El usuario del correo no puede superar los 64 caracteres.' };
  }

  if (!domainPart.includes('.')) {
    return { valid: false, error: 'El dominio del correo debe incluir una extensión (ej. .edu, .com).' };
  }

  const domainLabels = domainPart.split('.');
  const tld = domainLabels[domainLabels.length - 1];
  if (tld.length < 2) {
    return { valid: false, error: 'La extensión de dominio (TLD) debe tener al menos 2 caracteres.' };
  }

  return { valid: true, normalizedEmail: trimmed.toLowerCase() };
}

/**
 * Obfuscates email for public/student-facing interfaces to preserve privacy.
 * Example: matiasolis@gmail.com -> m***s@gmail.com
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '***@***';
  const trimmed = email.trim();
  const parts = trimmed.split('@');
  if (parts.length !== 2) return '***@***';

  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local.charAt(0)}***@${domain}`;
  }
  const first = local.charAt(0);
  const last = local.charAt(local.length - 1);
  return `${first}***${last}@${domain}`;
}

export function validateVisibleName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'El nombre visible es obligatorio.' };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { valid: false, error: 'El nombre visible debe tener al menos 2 caracteres.' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'El nombre visible no puede superar los 20 caracteres.' };
  }

  // Check no numbers allowed
  if (/\d/.test(trimmed)) {
    return { valid: false, error: 'El nombre visible no puede contener números.' };
  }

  // Check only letters, accents and spaces
  const lettersRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!lettersRegex.test(trimmed)) {
    return { valid: false, error: 'El nombre visible solo puede contener letras y espacios, sin símbolos extraños.' };
  }

  // Check banned offensive words
  const lower = trimmed.toLowerCase();
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) {
      return { valid: false, error: 'El nombre visible elegido contiene términos inapropiados.' };
    }
  }

  return { valid: true };
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      nombreVisible: user.nombreVisible,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autenticado. Inicie sesión.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: UserRole };
    const db = getDb();
    const user = db.users.find((u) => u.id === decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuario inexistente o sesión inválida.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: 'Tu cuenta ha sido suspendida por la administración.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de Administrador.' });
  }
  next();
}
