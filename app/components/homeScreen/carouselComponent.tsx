import { CardComponentProps, CreditAccount, SavingAccount } from '@/types/typeDefs';
import React from 'react';
import { FlatList, View } from 'react-native';
import CardComponent from './cardComponent';

interface Props {
    cardProp: CardComponentProps[];
    onAddCard?: () => void;
    onEditCard?: (card: SavingAccount | CreditAccount, type: "savings" | "credit") => void;
}

const CARD_WIDTH = 340;
const CARD_SPACING = 25;

const CardCarousel: React.FC<Props> = ({ cardProp, onAddCard, onEditCard }) => (
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
                    <CardComponent
                        account={item}
                        onAdd={item.type === 'add' ? onAddCard : undefined}
                        onEdit={item.type !== 'add' && onEditCard ? () => onEditCard(item, item.type) : undefined}
                    />

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