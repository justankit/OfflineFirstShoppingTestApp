import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProductListScreen from '@/screens/ProductListScreen';
import OrderScreen from '@/screens/OrderScreen/index';

import { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProductList"
      screenOptions={{
        headerShown: true,
        headerLargeTitle: false,
      }}
    >
      <Stack.Screen
        name="ProductList"
        component={ProductListScreen}
        options={{
          title: 'Products',
        }}
      />
      <Stack.Screen
        name="OrderScreen"
        component={OrderScreen}
        options={{
          title: 'My Orders',
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
