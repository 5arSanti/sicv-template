import { globalStyles } from "@/constants/Styles";
import { PermissionResponse } from "expo-camera";
import { Button, StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

interface PermissionCardProps {
    permission: PermissionResponse | null;
    requestPermission: () => Promise<PermissionResponse>;
    title: string;
    description?: string;
    onGranted?: () => void;
}

export const PermissionCard = ({ 
    permission, 
    requestPermission, 
    title, 
    description = "We need your permission to continue",
    onGranted 
}: PermissionCardProps) => {
    if (!permission) {
        return null;
    }

    if (!permission.granted) {
        return (
            <ThemedView style={[globalStyles.stepContainer, styles.container]}>
                <ThemedText type="subtitle">{title}</ThemedText>
                <ThemedText style={styles.description}>{description}</ThemedText>
                <Button 
                    onPress={async () => {
                        const result = await requestPermission();
                        if (result.granted && onGranted) {
                            onGranted();
                        }
                    }} 
                    title="Grant Permission" 
                />
            </ThemedView>
        );
    }

    return null;
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
    },
    description: {
        marginVertical: 10,
        textAlign: 'center',
    }
});