import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { useTheme } from 'styled-components';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, { Extrapolate, interpolate, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { Acessory } from '../../components/Acessory';
import { BackButton } from '../../components/BackButton';
import { ImageSlider } from '../../components/ImageSlider';
import { Button } from '../../components/Button';

import { getAccessoryIcons } from '../../utils/getAccessoryIcon';

import { Car as ModelCar } from '../../database/model/Car';
import { CarDTO } from '../../dtos/CarDTO';

import {
  Container,
  Header,
  CarImages,
  Details,
  Description,
  Brand,
  Name,
  Rent,
  Period,
  Price,
  About,
  Acessories,
  Footer,
  OfflineInfo
} from './styles'
import api from '../../services/api';

// Sem watermellon user CarDTO
// import { CarDTO } from '../../dtos/CarDTO';

interface Params {
  car: CarDTO;
}

export function CarDetails(){
  const [carUpdated, setCarUpdated] = useState<CarDTO>({} as CarDTO);

  const netInfo = useNetInfo();
  const navigation = useNavigation();
  const route = useRoute();
  const theme = useTheme();
  const { car } = route.params as Params;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 200],
        [200, 70],
        Extrapolate.CLAMP
      ),
    }
  });

  const sliderCarsStyleAnimation = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, 150],
        [1, 0],
        Extrapolate.CLAMP
      ),
    }
  });

  function handleSelectPeriodRental() {
    navigation.navigate('Scheduling', { car });
  }

  function handleBack() {
    navigation.goBack();
  }

  useEffect(() => {
    async function fetchCarUpdated() {
      const response = await api.get(`/cars/${car.id}`);
      setCarUpdated(response.data);
    }
    if (netInfo.isConnected === true) {
      fetchCarUpdated();
    }
  }, [netInfo.isConnected]);

  return(
    <Container>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <Animated.View
        style={[
          headerStyleAnimation,
          styles.header,
          { backgroundColor: theme.colors.background_secondary }
        ]}
      >
        <Header>
          <BackButton
            onPress={handleBack}
          />
        </Header>
        <Animated.View style={sliderCarsStyleAnimation}>
          <CarImages>
            {/* Se tiver conectado tem um carUpdate e mostra todas as fotos
              Senão estiver mostra só a thubnail ai cria um objeto pra mostrar
            */}
            <ImageSlider imagesUrl={
              !!carUpdated.photos ?
              carUpdated.photos: [{ id: car.thumbnail, photo: car.thumbnail }]
            }/>
          </CarImages>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{
          padding: 24,
          alignItems: 'center',
          paddingTop: getStatusBarHeight() + 160,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Details>
          <Description>
            <Brand>{car.brand}</Brand>
            <Name>{car.name}</Name>
          </Description>
          <Rent>
            <Period>{car.period}</Period>
            <Price>
              R$ {netInfo.isConnected === true ? car.price : '...'}
            </Price>
          </Rent>
        </Details>
        {
          carUpdated.accessories &&
          <Acessories>
            {
              carUpdated.accessories.map((accessory) => (
                <Acessory
                  key={accessory.id}
                  name={accessory.name}
                  icon={getAccessoryIcons(accessory.type)}
                />
              ))
            }
          </Acessories>
        }
        <About>
          {car.about}
        </About>
      </Animated.ScrollView>
      <Footer>
        <Button enabled={netInfo.isConnected === true} title="Escolher período do aluguel" onPress={handleSelectPeriodRental}/>
        {
          netInfo.isConnected === false &&
          <OfflineInfo>
            Conecte-se a internet para ver mais detalhes e agendar.
          </OfflineInfo>
        }
      </Footer>
    </Container>
  );
}

// Esse styles existe só depois que foi colocada a animação
// Sem animação era usado o Cantente o CarImage (ver comentarios no styles.ts)
const styles = StyleSheet.create({
  header: {
    position: "absolute",
    overflow: 'hidden',
    zIndex: 1,
  },
});
