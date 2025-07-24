import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ImagePickerComponentProps {
    imageUri?: string | null;
    onImagePicked: (uri: string | null) => void;
    label?: string;
    style?: object;
    imageStyle?: object;
}

const FormImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
    imageUri: initialImageUri = null,
    onImagePicked,
    label = "Select Image",
    style,
    imageStyle,
}) => {

    const [imageUri, setImageUri] = useState<string | null>(initialImageUri);

    useEffect(() => {
        setImageUri(initialImageUri);
    }, [initialImageUri]);

    // Request permission for media library (gallery)
    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Permission to access media library is required!');
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: 'images',
                quality: 0.8,
                allowsEditing: true,
                aspect: [4, 3],
            });

            if (!result.canceled && result.assets.length > 0) {
                setImageUri(result.assets[0].uri);
                onImagePicked(result.assets[0].uri);
            }
        }
        catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'There was an error selecting the image.');
        }
    };

    const clearImage = () => {
        setImageUri(null);
        onImagePicked(null);
    }

    return (
        <View style={[styles.container, style]}>
            <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {imageUri ? (
                    <Image source={{ uri: imageUri }} style={[styles.imagePreview, imageStyle]} />
                ) : (
                    <View style={[styles.placeholder, imageStyle]}>
                        <Text style={styles.placeholderText}>{label}</Text>
                    </View>
                )}
            </TouchableOpacity>
            {imageUri && (
                <TouchableOpacity onPress={clearImage} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear Image</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    imageContainer: {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        overflow: 'hidden',
    },
    imagePreview: {
        width: 160,
        height: 120,
        resizeMode: 'cover',
    },
    placeholder: {
        width: 160,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
    },
    placeholderText: {
        color: '#666',
        fontSize: 16,
    },
    clearButton: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#cc4444',
        borderRadius: 4,
    },
    clearButtonText: {
        color: 'white',
        fontWeight: '600',
    },
});

export default FormImagePickerComponent;