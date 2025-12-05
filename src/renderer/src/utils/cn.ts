/**
 * Class Name Utility
 * Merges Tailwind classes intelligently
 * Phase 2 Sprint 2.1 - Base Components
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines class names with tailwind-merge to handle conflicts
 * @param inputs - Class names to merge
 * @returns Merged class name string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
