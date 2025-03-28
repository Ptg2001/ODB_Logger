import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.obdlogger.app',
  appName: 'OBDLogger',
  webDir: '.next',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
  },
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'OBDLogger',
      androidIsEncryption: false,
      androidDatabaseVersion: 1,
      androidDatabaseName: 'obdlogger.db',
    },
  },
};

export default config;
