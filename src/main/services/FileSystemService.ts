/**
 * Servicio de sistema de archivos
 */

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { app } from 'electron';
import { createLogger } from '@shared/utils';

const logger = createLogger('FileSystemService');

export class FileSystemService {
  private basePath: string;

  constructor() {
    this.basePath = path.join(app.getPath('userData'), 'data');
    this.ensureDirectories();
  }

  /**
   * Asegura que los directorios necesarios existan
   */
  private ensureDirectories(): void {
    const dirs = ['data', 'logs', 'backups'];
    const userDataPath = app.getPath('userData');

    dirs.forEach(dir => {
      const dirPath = path.join(userDataPath, dir);
      if (!fsSync.existsSync(dirPath)) {
        fsSync.mkdirSync(dirPath, { recursive: true });
        logger.debug(`Created directory: ${dirPath}`);
      }
    });
  }

  /**
   * Lee un archivo JSON
   */
  async readJSON<T>(fileName: string): Promise<T> {
    const filePath = path.join(this.basePath, fileName);
    logger.debug(`Reading JSON file: ${filePath}`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        logger.warn(`File not found: ${filePath}, returning empty object`);
        return {} as T;
      }
      logger.error(`Error reading JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Escribe un archivo JSON
   */
  async writeJSON(fileName: string, data: any): Promise<void> {
    const filePath = path.join(this.basePath, fileName);
    logger.debug(`Writing JSON file: ${filePath}`);

    try {
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, content, 'utf-8');
      logger.debug(`File written successfully: ${filePath}`);
    } catch (error) {
      logger.error(`Error writing JSON file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Verifica si un archivo existe
   */
  async exists(fileName: string): Promise<boolean> {
    const filePath = path.join(this.basePath, fileName);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Crea un directorio
   */
  async createDirectory(dirName: string): Promise<void> {
    const dirPath = path.join(this.basePath, dirName);
    await fs.mkdir(dirPath, { recursive: true });
    logger.debug(`Directory created: ${dirPath}`);
  }

  /**
   * Elimina un archivo
   */
  async deleteFile(fileName: string): Promise<void> {
    const filePath = path.join(this.basePath, fileName);
    try {
      await fs.unlink(filePath);
      logger.debug(`File deleted: ${filePath}`);
    } catch (error) {
      logger.error(`Error deleting file: ${filePath}`, error);
      throw error;
    }
  }

  /**
   * Copia un archivo
   */
  async copyFile(source: string, destination: string): Promise<void> {
    const srcPath = path.join(this.basePath, source);
    const destPath = path.join(this.basePath, destination);
    await fs.copyFile(srcPath, destPath);
    logger.debug(`File copied from ${srcPath} to ${destPath}`);
  }

  /**
   * Obtiene el path completo
   */
  getFullPath(fileName: string): string {
    return path.join(this.basePath, fileName);
  }

  /**
   * Obtiene el path base
   */
  getBasePath(): string {
    return this.basePath;
  }
}

// Singleton instance
let instance: FileSystemService | null = null;

export function getFileSystemService(): FileSystemService {
  if (!instance) {
    instance = new FileSystemService();
  }
  return instance;
}
