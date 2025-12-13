/**
 * macOS Notarization Script
 * Phase 6 Sprint 6.1 - Packaging & Distribution
 *
 * This script handles code signing and notarization for macOS builds.
 * Requires environment variables:
 * - APPLE_ID: Apple Developer ID email
 * - APPLE_ID_PASSWORD: App-specific password
 * - APPLE_TEAM_ID: Team ID from Apple Developer account
 */

const { notarize } = require('@electron/notarize');

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;

  // Skip notarization if not building for macOS
  if (electronPlatformName !== 'darwin') {
    console.log('Skipping notarization - not building for macOS');
    return;
  }

  // Check for required environment variables
  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_ID_PASSWORD;
  const appleTeamId = process.env.APPLE_TEAM_ID;

  if (!appleId || !appleIdPassword || !appleTeamId) {
    console.warn(
      'Skipping notarization - missing required environment variables:\n' +
      '  APPLE_ID, APPLE_ID_PASSWORD, APPLE_TEAM_ID'
    );
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = `${appOutDir}/${appName}.app`;

  console.log(`Notarizing ${appPath}...`);

  try {
    await notarize({
      appBundleId: 'com.spacemanager.app',
      appPath: appPath,
      appleId: appleId,
      appleIdPassword: appleIdPassword,
      teamId: appleTeamId
    });

    console.log('Notarization complete!');
  } catch (error) {
    console.error('Notarization failed:', error);
    throw error;
  }
};
