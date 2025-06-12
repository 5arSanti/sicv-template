import { globalStyles } from '@/constants/Styles';
import React from 'react';
import { Platform, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface JsonViewerProps {
    data: any;
    title?: string;
}

const JsonViewer = ({ data, title }: JsonViewerProps) => {
    const formattedJson = JSON.stringify(data, null, 2);

    return (
        <ThemedView style={globalStyles.stepContainer}>
            {title && <ThemedText type="subtitle">{title}</ThemedText>}
            <ThemedView style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <ThemedText style={styles.jsonText}>{formattedJson}</ThemedText>
                </ScrollView>
            </ThemedView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 15,
        borderRadius: 8,
        marginVertical: 5,
        backgroundColor: '#313131',
    },
    scrollView: {
        maxHeight: 200,
    },
    jsonText: {
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
        color: '#fff',
    }
});

export { JsonViewer };

