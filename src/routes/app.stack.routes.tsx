import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import { Home } from '../screens/Home';
import { CarDetails } from '../screens/CarDetails';
import { Scheduling } from '../screens/Scheduling';
import { SchedulingDetails } from '../screens/SchedulingDetails';
import { Confirmation } from '../screens/Confirmation';
import { MyCars } from '../screens/MyCars';
import { Splash } from '../screens/Splash';

const { Navigator, Screen } = createStackNavigator();

export function AppStackRoutes() {
    return(
      <Navigator headerMode="none" initialRouteName="Home">
        {/* <Screen
          name="Splash"
          component={Splash}
        /> */}
        <Screen
          name="Home"
          component={Home}
          options={{
            // Desabilita que na home o usuario use o botão de voltar do aparelho (ios)
            gestureEnabled:false,
          }}
        />
        <Screen
          name="CarDetails"
          component={CarDetails}
        />
        <Screen
          name="Scheduling"
          component={Scheduling}
        />
        <Screen
          name="SchedulingDetails"
          component={SchedulingDetails}
        />
        <Screen
          name="Confirmation"
          component={Confirmation}
        />
        <Screen
          name="MyCars"
          component={MyCars}
        />
      </Navigator>
    );
}
