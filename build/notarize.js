const { notarize } = require('@electron/notarize');

module.exports = async context => {
  if (process.platform !== 'darwin') return;

  // eslint-disable-next-line no-console
  console.log('aftersign hook triggered, start to notarize app.');

  if (!process.env.CI) {
    // eslint-disable-next-line no-console
    console.log(`skipping notarizing, not in CI.`);
    return;
  }

  const appleId = process.env.APPLE_ID;
  const appleIdPassword = process.env.APPLE_ID_PASS || process.env.APPLEIDPASS;

  if (!appleId || !appleIdPassword) {
    // eslint-disable-next-line no-console
    console.warn(
      'skipping notarizing, APPLE_ID and APPLE_ID_PASS (or APPLEIDPASS) env variables must be set.'
    );
    return;
  }

  const appId = context.packager?.appInfo?.appId || 'com.jrnodepi.nodepackageinjector';
  const { appOutDir } = context;
  const appName = context.packager.appInfo.productFilename;

  try {
    await notarize({
      appBundleId: appId,
      appPath: `${appOutDir}/${appName}.app`,
      appleId,
      appleIdPassword,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  // eslint-disable-next-line no-console
  console.log(`done notarizing ${appId}.`);
};
