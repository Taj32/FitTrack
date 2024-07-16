import { StyleSheet, View, Text } from 'react-native';

export function DateWidget({day, dateDigit}) {
    return(
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <Text style={styles.day}>{day}</Text>
            </View>
            <View style={styles.lowerContainer}>
                <Text style={styles.dateDigit}>{dateDigit}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        flexDirection: 'column',
        borderRadius: 10,
        width: 45,  // Fixed width
        height: 45, // Fixed height
        aspectRatio: 1, // Ensure it's always square
    },
    topContainer: {
        flex: 1,
        backgroundColor: '#e1e4ec',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lowerContainer: {
        flex: 1.5, // Slightly larger than the top container
        backgroundColor: '#f1f2f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateDigit: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    day: {
        fontSize: 12,
        color: 'gray',
        fontWeight: 'bold',
    },
});