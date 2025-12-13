/**
 * AutoUpdaterService
 * Handles automatic application updates
 * Phase 6 Sprint 6.1 - Packaging & Distribution
 */

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { BrowserWindow, dialog } from 'electron';
import { logger } from '../../shared/utils/logger';

export class AutoUpdaterService {
  private mainWindow: BrowserWindow | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupAutoUpdater();
  }

  /**
   * Configure auto-updater settings
   */
  private setupAutoUpdater(): void {
    // Configure logger
    autoUpdater.logger = logger;

    // Auto-download updates (can be disabled if you want manual updates)
    autoUpdater.autoDownload = true;

    // Check for updates every 1 hour (3600000 ms)
    autoUpdater.autoInstallOnAppQuit = true;

    // Setup event listeners
    this.registerEventListeners();
  }

  /**
   * Register all auto-updater event listeners
   */
  private registerEventListeners(): void {
    // Checking for updates
    autoUpdater.on('checking-for-update', () => {
      logger.info('Checking for updates...');
      this.sendStatusToWindow('Checking for updates...');
    });

    // Update available
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      logger.info('Update available:', { version: info.version });
      this.sendStatusToWindow(`Update available: v${info.version}`);

      // Notify user
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-available', info);
      }
    });

    // No update available
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      logger.info('Update not available:', { version: info.version });
      this.sendStatusToWindow('App is up to date.');
    });

    // Update download progress
    autoUpdater.on('download-progress', (progressObj) => {
      const logMessage = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`;
      logger.info(logMessage);
      this.sendStatusToWindow(logMessage);

      // Send progress to renderer
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-download-progress', progressObj);
      }
    });

    // Update downloaded
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      logger.info('Update downloaded:', { version: info.version });
      this.sendStatusToWindow('Update downloaded');

      // Show dialog to user
      this.promptUserToUpdate(info);
    });

    // Error handler
    autoUpdater.on('error', (error) => {
      logger.error('Auto-updater error:', error);
      this.sendStatusToWindow('Error in auto-updater');

      // Send error to renderer
      if (this.mainWindow) {
        this.mainWindow.webContents.send('update-error', error.message);
      }
    });
  }

  /**
   * Check for updates manually
   */
  async checkForUpdates(): Promise<void> {
    try {
      logger.info('Manually checking for updates...');
      await autoUpdater.checkForUpdates();
    } catch (error) {
      logger.error('Failed to check for updates:', error);
      throw error;
    }
  }

  /**
   * Download update manually
   */
  async downloadUpdate(): Promise<void> {
    try {
      logger.info('Downloading update...');
      await autoUpdater.downloadUpdate();
    } catch (error) {
      logger.error('Failed to download update:', error);
      throw error;
    }
  }

  /**
   * Install update and restart application
   */
  quitAndInstall(): void {
    logger.info('Quitting and installing update...');
    autoUpdater.quitAndInstall(false, true);
  }

  /**
   * Send status message to renderer window
   */
  private sendStatusToWindow(message: string): void {
    if (this.mainWindow) {
      this.mainWindow.webContents.send('update-status', message);
    }
  }

  /**
   * Show dialog asking user to install update
   */
  private async promptUserToUpdate(info: UpdateInfo): Promise<void> {
    if (!this.mainWindow) return;

    const { response } = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (v${info.version}) is available!`,
      detail: 'Would you like to restart and install the update now?',
      buttons: ['Restart Now', 'Later'],
      defaultId: 0,
      cancelId: 1
    });

    if (response === 0) {
      // User chose to restart and install
      this.quitAndInstall();
    } else {
      // User chose to install later
      logger.info('User chose to install update later');
      this.sendStatusToWindow('Update will be installed on next restart');
    }
  }
}

/**
 * Factory function to create AutoUpdaterService
 */
export function createAutoUpdaterService(mainWindow: BrowserWindow): AutoUpdaterService {
  return new AutoUpdaterService(mainWindow);
}
