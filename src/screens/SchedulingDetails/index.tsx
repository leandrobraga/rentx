import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';
import { useNavigation, useRoute } from '@react-navigation/native';
import { format } from 'date-fns';

import { CarDTO } from '../../dtos/CarDTO';
import { getPlatformDate } from '../../utils/getPlatformDate';
import api from '../../services/api';
import { getAccessoryIcons } from '../../utils/getAccessoryIcon';

import { Acessory } from '../../components/Acessory';
import { BackButton } from '../../components/BackButton';
import { ImageSlider } from '../../components/ImageSlider';
import { Button } from '../../components/Button';

import {
  Container,
  Header,
  CarImages,
  Content,
  Details,
  Description,
  Brand,
  Name,
  Rent,
  Period,
  Price,
  Acessories,
  Footer,
  RentalPeriod,
  CalendarIcon,
  DateInfo,
  DateTitle,
  DateValue,
  RentalPrice,
  RentalPriceLabel,
  RentalPriceDetail,
  RentalPriceQuota,
  RentalPriceTotal
} from './styles';
import { useNetInfo } from '@react-native-community/netinfo';

interface Params {
  car: CarDTO;
  dates: string[];
}

interface RentalPeriod {
  start: string;
  end: string;
}

export function SchedulingDetails(){
  const [carUpdated, setCarUpdated] = useState<CarDTO>({} as CarDTO);
  const [loading, setLoading] = useState(false);
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>({} as RentalPeriod);

  const netInfo = useNetInfo();
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const { car, dates } = route.params as Params;

  const rentTotal = Number(dates.length * car.price);
  function handleBack() {
    navigation.goBack();
  }

  async function handleConfirmRental() {
    setLoading(true);

    // Isso era antes do wtermellon e da mudança da api do json-sever pra api em nodejs
    // const scheduleByCar = await api.get(`/schedules_bycars/${car.id}`);

    // const unavailable_dates = [
    //   ...scheduleByCar.data.unavailable_dates,
    //   ...dates,
    // ];
    console.log(new Date(dates[0]));
    await api.post('/rentals', {
      user_id: 1,
      car_id: car.id,
      start_date: new Date(dates[0]),
      end_date: new Date(dates[dates.length - 1]),
      total: rentTotal
    })
    .then(() => {
      navigation.navigate('Confirmation', {
        title: 'Carro Alugado',
        message:`Agora você só precisa ir \n
        até a concessionária da RENTX \n
        pegar o seu automóvel.`,
        nextScreenRoute: 'Home',
      });
    })
    .catch((error) => {
      console.log(error);
      Alert.alert('Não foi possível fazer o agendamento.')
      setLoading(false);
    });

  }

  useEffect(() => {
    setRentalPeriod({
      start: format(getPlatformDate(new Date(dates[0])), 'dd/MM/yyyy'),
      end: format(getPlatformDate(new Date(dates[dates.length - 1])), 'dd/MM/yyyy'),
    });
  }, []);

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
      <Header>
        <BackButton
          onPress={handleBack}
        />
      </Header>
      <CarImages>
        {/* Se tiver conectado tem um carUpdate e mostra todas as fotos
              Senão estiver mostra só a thubnail ai cria um objeto pra mostrar
            */}
          <ImageSlider imagesUrl={
            !!carUpdated.photos ?
            carUpdated.photos: [{ id: car.thumbnail, photo: car.thumbnail }]
        }/>
      </CarImages>
      <Content>
        <Details>
          <Description>
            <Brand>{car.brand}</Brand>
            <Name>{car.name}</Name>
          </Description>
          <Rent>
            <Period>{car.period}</Period>
            <Price>R$ {car.price}</Price>
          </Rent>
        </Details>
        {
          carUpdated.accessories &&
          <Acessories>
            {
              carUpdated.accessories.map((accessory) => (
                <Acessory
                  key={accessory.type}
                  name={accessory.name}
                  icon={getAccessoryIcons(accessory.type)}
                />
              ))
            }
          </Acessories>
        }
        <RentalPeriod>
          <CalendarIcon>
            <Feather
              name="calendar"
              size={RFValue(24)}
              color={theme.colors.shape}
            />
          </CalendarIcon>

          <DateInfo>
            <DateTitle>DE</DateTitle>
            <DateValue>{rentalPeriod.start}</DateValue>
          </DateInfo>

          <Feather
            name="chevron-right"
            size={RFValue(10)}
            color={theme.colors.text}
          />

          <DateInfo>
            <DateTitle>ATÉ</DateTitle>
            <DateValue>{rentalPeriod.end}</DateValue>
          </DateInfo>
        </RentalPeriod>

        <RentalPrice>
          <RentalPriceLabel>TOTAl</RentalPriceLabel>
          <RentalPriceDetail>
            <RentalPriceQuota>R$ {car.price} x{dates.length} diárias</RentalPriceQuota>
            <RentalPriceTotal>R$ {rentTotal}</RentalPriceTotal>
          </RentalPriceDetail>
        </RentalPrice>
      </Content>
      <Footer>
        <Button
          title="Alugar Agora"
          color="green"
          onPress={handleConfirmRental}
          loading={loading}
          enabled={!loading}
        />
      </Footer>
    </Container>
  );
}
