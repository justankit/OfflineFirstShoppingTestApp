/**
 * @format
 */

import 'react-native';
import React from 'react';

// Mock problematic dependencies
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
}));

jest.mock('react-redux', () => ({
  Provider: ({ children }: any) => children,
}));

jest.mock('../src/store', () => ({
  store: {},
}));

jest.mock('../src/navigation/RootNavigator', () => {
  return function RootNavigator() {
    return null;
  };
});

import App from '../src/App';
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  renderer.create(<App />);
});
