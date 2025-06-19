/**
 * @format
 */
import 'react-native-get-random-values';
import { startNetworkLogging } from 'react-native-network-logger';

import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

startNetworkLogging();

AppRegistry.registerComponent(appName, () => App);
