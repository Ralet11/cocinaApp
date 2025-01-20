import { StyleSheet } from 'react-native';

const toastConfig = {
    success: ({ text1, text2 }) => (
        <View style={styles.toastContainer}>
            <Text style={styles.toastTitle}>{text1}</Text>
            <Text style={styles.toastMessage}>{text2}</Text>
        </View>
    ),
};

const styles = StyleSheet.create({
    toastContainer: {
        backgroundColor: '#6200EE',
        borderRadius: 8,
        marginBottom: 20,
    },
    toastTitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    toastMessage: {
        color: '#FFFFFF',
        fontSize: 14,
    },
});

export default toastConfig;