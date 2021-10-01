import React, { useEffect, useState } from 'react';
import { Alert, BackHandler, StatusBar, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from 'styled-components';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedGestureHandler, withSpring } from 'react-native-reanimated';
import { RectButton, PanGestureHandler } from 'react-native-gesture-handler';
import { useNetInfo } from '@react-native-community/netinfo';
import { synchronize } from '@nozbe/watermelondb/sync';

const ButtonAnimated = Animated.createAnimatedComponent(RectButton);

import { database } from '../../database';
import api from '../../services/api';
import { CarDTO } from '../../dtos/CarDTO';
import { Car as ModelCar } from '../../database/model/Car';
import Logo from '../../assets/logo.svg';

import { Car } from '../../components/Car';
import { LoadAnimated } from '../../components/LoadAnimated';
import {
  Container,
  Header,
  TotalCars,
  HeaderContent,
  CarList,
} from './styles'

export function Home(){
  //Antes do watermellon
  // const [cars, setCars] = useState<CarDTO[]>([]);
  const [cars, setCars] = useState<ModelCar[]>([]);
  const [loading, setLoading] = useState(true);

  const positinY = useSharedValue(0);
  const positinX = useSharedValue(0);

  const netInfo = useNetInfo();

  const myCarsButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: positinX.value },
        { translateY: positinY.value },
      ],
    }
  });

  const onGestureEvent = useAnimatedGestureHandler({
    onStart(_, ctx: any){
      ctx.positionX = positinX.value;
      ctx.positionY = positinY.value;
    },
    onActive(event, ctx: any){
      positinX.value = ctx.positionX + event.translationX;
      positinY.value = ctx.positionY + event.translationY;
    },
    onEnd(){
      positinX.value = withSpring(0);
      positinY.value = withSpring(0);
    }
  })

  const navigation = useNavigation();
  const theme = useTheme();

  // Antes do watermellon era um CarDTO
  function handleCarDetails(car: ModelCar) {
    navigation.navigate('CarDetails', { car })
  }

  function handleOpenMyCars() {
    navigation.navigate('MyCars')
  }

  async function offlineSynchronize() {
    await synchronize({
      database,
      pullChanges: async ({ lastPulledAt }) => {
        const response = await api.get(`cars/sync/pull?lastPulledVersion=${lastPulledAt || 0}`);
        const { changes, latestVersion } = response.data;
        return { changes, timestamp: latestVersion };
      },
      pushChanges: async ({ changes }) => {
        const user = changes.user;
        await api.post('/users/sync', user).catch(console.log);
      }
    });
  }

  useEffect(() => {
    let isMounted = true;
    async function fetchCars() {
      try{
        //const response = await api.get('/cars');
        const carCollection = database.get<ModelCar>('cars');
        const cars = await carCollection.query().fetch();
        if (isMounted) {
          // ANtes do watermellon
          // setCars(response.data);
          console.log('mama', isMounted);
          setCars(cars);
        }
      } catch(error) {
        console.log(error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    fetchCars();
    // Toda vez que faz uma chamada a uma Promise (api)
    // eu tenho que garantir que o estado da aplicação só vai ser alterado
    // quando o componente estiver montado. Pq a promisse tem que ser resolvida
    // com o isMounted false ele não seta e não renderiza novamente.
    // isMounted garante isso.
    // Qualquer coisa ver video do Chapter IV - Memory Leak
    return () => {
      isMounted = false;
    }

  }, [])

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', ()=> {
      return true;
    });
  }, []);

  useEffect(() => {
    console.log(netInfo.isConnected);
    if(netInfo.isConnected === true) {
      console.log('oioii');
      offlineSynchronize();
    }
  }, [netInfo.isConnected]);

  return(
    <Container>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <Header>
        <HeaderContent>
          <Logo
            width={RFValue(108)}
            height={RFValue(12)}
          />
          {
            !loading &&
            <TotalCars>
              Total de {cars.length} carros
            </TotalCars>
          }
        </HeaderContent>
      </Header>
      { loading ? <LoadAnimated /> :
        <CarList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          <Car data={item} onPress={() => handleCarDetails(item)}/>
        }
      />
      }
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
      >
        <Animated.View
          style={[
            myCarsButtonStyle,
            {
              position: 'absolute',
              bottom: 13,
              right: 22
            }
          ]}
        >
          <ButtonAnimated
            onPress={handleOpenMyCars}
            style={[styles.button, { backgroundColor: theme.colors.main}]}
          >
            <Ionicons
              name="ios-car-sport"
              size={32}
              color={theme.colors.shape}

            />
          </ButtonAnimated>
        </Animated.View>
      </PanGestureHandler>
    </Container>
  );
}

// Este styles só é usado quando tem o botão animado.
// Sem animação usa o MyCarsButton do styles.ts
const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  }

});
