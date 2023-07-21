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

  if (!('APPLE_ID' in process.env && 'APPLE_ID_PASS' in process.env)) {
    // eslint-disable-next-line no-console
    console.warn(
      // eslint-disable-next-line no-console
      'skipping notarizing, APPLE_ID and APPLE_ID_PASS env variables must be set.'
    );
    return;
  }

  const appId = 'jorge.rojodiseno@gmail.com';

  const { appOutDir } = context;

  const appName = context.packager.appInfo.productFilename;

  try {
    await notarize({
      appBundleId: appId,
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLEIDPASS,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
  }

  // eslint-disable-next-line no-console
  console.log(`done notarizing ${appId}.`);
};
