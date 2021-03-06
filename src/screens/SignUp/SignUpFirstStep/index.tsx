import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/core';
import { KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import * as Yup from 'yup';

import { BackButton } from '../../../components/BackButton';
import { Bullets } from '../../../components/Bullets';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import {
  Container,
  Header,
  Steps,
  Title,
  SubTitle,
  Form,
  FormTitle
} from './styles'


export function SignUpFirstStep(){
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [driverLicense, setDriverLicense] = useState('');
  const navigation = useNavigation();

  function handleBack() {
    navigation.goBack();
  }

  async function handleNextStep(){
    try{
      const schema = Yup.object().shape({
        driverLicense: Yup.string().required('CNH é obrigatório'),
        email: Yup.string().email('E-mail inválido').required('E-mail é obrigatório'),
        name: Yup.string().required('Nome é obrigatório')
      });

      const data = {name, email, driverLicense};
      await schema.validate(data);

      navigation.navigate('SignUpSecondStep', { user: data });
    }catch(error) {
      if(error instanceof Yup.ValidationError) {
        Alert.alert('Opss', error.message);
      }
    }
  }

  return(
    <KeyboardAvoidingView behavior="position" enabled>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container>
          <Header>
            <BackButton onPress={handleBack}/>
            <Steps>
              <Bullets active />
              <Bullets />
            </Steps>
          </Header>

          <Title>
            Crie sua{'\n'}conta 
          </Title>
          <SubTitle>
            Faça seu cadastro de{'\n'}
            forma rápida e fácil.
          </SubTitle>

          <Form>
            <FormTitle>1. Dados</FormTitle>
            <Input 
              iconName="user"
              placeholder="Nome"
              onChangeText={setName}
              value={name}
              autoCorrect={false}
            />
            <Input 
              iconName="mail"
              placeholder="E-mail"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input 
              iconName="credit-card"
              placeholder="CNH"
              keyboardType="numeric"
              onChangeText={setDriverLicense}
              value={driverLicense}
            />
          </Form>
          <Button 
            title="Próximo"
            onPress={handleNextStep}
          />
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}