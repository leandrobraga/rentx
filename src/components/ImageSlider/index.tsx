import React, { useRef, useState } from 'react';
import { FlatList, ViewToken } from 'react-native';

import { Bullets } from '../Bullets';
import {
  Container,
  ImageIndexes,
  CarImageWrapper,
  CarImage
} from './styles'

interface Props {
  imagesUrl: {
    id: string;
    photo: string;
  }[];
}

interface ChangeImageProps {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

export function ImageSlider({ imagesUrl }: Props){
  const [imageIndex, setImageIndex] = useState(0);
  const indexChanged = useRef((info: ChangeImageProps) => {
    const index = info.viewableItems[0].index!;
    setImageIndex(index);
  })

  return(
    <Container>
      <ImageIndexes>
        {
          imagesUrl.map((item, index) => (
            <Bullets
              key={String(item.id)}
              active={imageIndex === index}
            />
          ))
        }
      </ImageIndexes>

      <FlatList
        data={imagesUrl}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <CarImageWrapper>
            <CarImage
              source={{ uri: item.photo }}
              resizeMode="contain"
            />
          </CarImageWrapper>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={indexChanged.current}
      />
    </Container>
  );
}
