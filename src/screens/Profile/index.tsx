import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from 'react-native';
import { useTheme } from 'styled-components';
import { useNavigation } from '@react-navigation/core';
import { Feather } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import * as Yup from 'yup';


import { BackButton } from '../../components/BackButton';
import { Input } from '../../components/Input';
import { useAuth } from '../../hooks/auth';
import { Button } from '../../components/Button';


import {
  Container,
  Header,
  HeaderTop,
  HeaderTitle,
  LogoutButton,
  PhotoContainer,
  Photo,
  PhotoButton,
  Content,
  Options,
  Option,
  OptionTitle,
  Section
} from './styles'
import { useNetInfo } from '@react-native-community/netinfo';

export function Profile(){
  const { user, signOut, updateUser } = useAuth();
  const netInfo = useNetInfo();

  const [option, setOption] = useState<'dataEdit' | 'passwordEdit'>('dataEdit');
  const [avatar, setAvatar] = useState(user.avatar);
  const [name, setName] = useState(user.name);
  const [driverLicense, setDriverLicense] = useState(user.driver_license);

  const theme = useTheme();
  const navigation = useNavigation();

  function handleBack() {
    navigation.goBack();
  }

  function handleOptionChange(selected: 'dataEdit' | 'passwordEdit') {
    if(!netInfo.isConnected === true && selected === 'passwordEdit') {
      Alert.alert('Vc está off line','Para mudar a senha, conecte-se a internet');
    }else {
      setOption(selected);
    }
  }

  async function handleSelectAvatar() {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1
      });

      if(result.cancelled) {
        return;
      }

      if(result.uri) {
        setAvatar(result.uri);
      }
  }

  async function handleProfileUpdate() {
    try {
      const schema = Yup.object().shape({
        driverLicense: Yup.string().required('CNH é obrigatório'),
        name: Yup.string().required('Nome é obrigatório'),
      });

      const data = { driverLicense, name };
      schema.validate(data);

      await updateUser({
        id: user.id,
        user_id: user.user_id,
        email: user.email,
        name,
        driver_license: driverLicense,
        avatar,
        token: user.token
      });

      Alert.alert('Perfil atualizado');
    } catch(error) {
      if(error instanceof Yup.ValidationError) {
        Alert.alert('Opss', error.message);
      }else{
        Alert.alert('Não foi possível atualizar o perfil');
      }

    }
  }

  async function handleSignOut() {
    Alert.alert(
      'Tem certeza',
      'Se vc sair irá precisar de internet pra entrar novamente',
      [
        {
          text: "Cancelar",
          onPress: () => {},
          style:"cancel"
        },
        {
          text: "Sair",
          onPress: () => signOut()
        },
      ]
    );
  }
  return(
    <KeyboardAvoidingView behavior="position" enabled>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container>
          <Header>
            <HeaderTop>
              <BackButton
                color={theme.colors.shape}
                onPress={handleBack}
              />
              <HeaderTitle>Editar Perfil</HeaderTitle>
              <LogoutButton onPress={handleSignOut}>
                <Feather
                  name="power"
                  size={24}
                  color={theme.colors.shape}
                />
              </LogoutButton>
            </HeaderTop>
            <PhotoContainer>
              { !!avatar && <Photo source={{ uri: avatar }} />}
              <PhotoButton onPress={handleSelectAvatar}>
                <Feather
                  name="camera"
                  size={24}
                  color={theme.colors.shape}
                />
              </PhotoButton>
            </PhotoContainer>
          </Header>

          <Content style={{ marginBottom: useBottomTabBarHeight() }}>
            <Options>
              <Option
                active={option === 'dataEdit'}
                onPress={() => handleOptionChange('dataEdit')}
              >
                <OptionTitle active={option === 'dataEdit'}>
                  Dados
                </OptionTitle>
              </Option>
              <Option
                active={option === 'passwordEdit'}
                onPress={() => handleOptionChange('passwordEdit')}
              >
                <OptionTitle active={option === 'passwordEdit'}>
                  Trocar Senha
                </OptionTitle>
              </Option>
            </Options>
            {
              option === 'dataEdit' ?
              <Section>
              <Input
                iconName="user"
                placeholder="Nome"
                autoCorrect={false}
                defaultValue={user.name}
                onChangeText={setName}
              />
              <Input
                iconName="mail"
                editable={false}
                defaultValue={user.email}
              />
              <Input
                iconName="credit-card"
                placeholder="CNH"
                keyboardType="numeric"
                defaultValue={user.driver_license}
                onChangeText={setDriverLicense}
              />
            </Section>
              :
              <Section>
              <Input
                iconName="lock"
                placeholder="Senha Atual"
              />
              <Input
                iconName="lock"
                placeholder="Nova Senha"
              />
              <Input
                iconName="lock"
                placeholder="Repetir Senha"
              />
            </Section>
            }
            <Button
              title="Salvar Alterações"
              onPress={handleProfileUpdate}
            />
          </Content>
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
