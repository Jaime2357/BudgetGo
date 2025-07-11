import { CardComponentProps } from '@/app/types';
import React from 'react';
import { FlatList, View } from 'react-native';
import CardComponent from './cardComponent';

interface Props {
    cardProp: CardComponentProps[];
}

const CARD_WIDTH = 250;
const CARD_SPACING = 16;

const CardCarousel: React.FC<Props> = ({ cardProp }) => (
    <View style={{ flex: 1, justifyContent: 'center' }}>
        <FlatList
            data={cardProp}
            keyExtractor={item => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_SPACING}
            snapToAlignment='center'
            decelerationRate='fast'
            contentContainerStyle={{ paddingLeft: 5, paddingRight: 0 }}
            renderItem={({ item }) => (
                <View style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}>
                    <CardComponent account={item} />
                </View>
            )}
            getItemLayout={(_, index) => ({
                length: CARD_WIDTH + CARD_SPACING,
                offset: (CARD_WIDTH + CARD_SPACING) * index,
                index,
            })}
        />
    </View>
)

export default CardCarousel;