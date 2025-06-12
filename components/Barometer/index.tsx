import { globalStyles } from '@/constants/Styles';
import { BarometerData } from '@/interfaces/barometer.interface';
import { EventSubscription } from 'expo-modules-core';
import { Barometer } from 'expo-sensors';
import { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';


const BarometerCard = () => {
    const [barometerData, setBarometerData] = useState<BarometerData>({
        available: false,
        pressure: 0,
        relativeAltitude: undefined
    });
    const [subscription, setSubscription] = useState<EventSubscription | null>(null);

    const toggleListener = () => {
        if (subscription) {
            unsubscribe();
        } else {
            subscribe();
        }
    };

    const subscribe = () => {
        Barometer.isAvailableAsync().then((isAvailable) => {
            console.log('isAvailable', isAvailable);
            if (isAvailable) {
                setSubscription(Barometer.addListener((data) => {
                    console.log('data', data);

                    setBarometerData({
                        available: isAvailable,
                        pressure: data.pressure,
                        relativeAltitude: data.relativeAltitude
                    });
                }));
            }
        });
    };

    const unsubscribe = () => {
        subscription && subscription.remove();
        setSubscription(null);
    };

    return (
        <ThemedView style={globalStyles.stepContainer}>
            <ThemedText type="subtitle">Barometro</ThemedText>
            <Text>Barometer: Listener {subscription ? 'ACTIVE' : 'INACTIVE'}</Text>
            <Text>Available: {barometerData.available ? 'Si' : 'No'}</Text>
            <Text>Pressure: {barometerData.pressure} hPa</Text>
            <Text>
                Relative Altitude:{' '}
                {Platform.OS === 'ios' ? `${barometerData.relativeAltitude} m` : `Only available on iOS`}
            </Text>
            <TouchableOpacity onPress={toggleListener} style={styles.button}>
                <Text>Toggle listener</Text>
            </TouchableOpacity>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        padding: 10,
        marginTop: 15,
    },
    wrapper: {
        flex: 1,
        alignItems: 'stretch',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
});

export { BarometerCard };

