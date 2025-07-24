import { styles } from '@/styles/global';
import React from 'react';
import { Text, View } from 'react-native';
import actions from '../actions';

export default function Header({ message }: { message: string }) {
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>
                Good {actions.getTimeOfDay()} Jaime
            </Text>
            <Text style={styles.headerSubtitle}> {message} </Text>
        </View>
    );
}