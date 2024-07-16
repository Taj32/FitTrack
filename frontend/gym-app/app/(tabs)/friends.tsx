import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, Text, ScrollView, Dimensions } from 'react-native';
import { SvgUri } from 'react-native-svg';

const screenHeight = Dimensions.get('window').height;
const topElementsHeight = 100;

export default function FriendScreen() {
    return (
        <SafeAreaView>
            <ThemedView style={styles.buttonContainer}>
                <ThemedText style={styles.editButton} onPress={() => alert('Edit pressed')}>
                    Edit
                </ThemedText>

                <View style={styles.spacer} />

                <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color='#007AFF'
                    style={{ marginRight: 16 }}
                    onPress={() => alert('plus pressed')}
                />
            </ThemedView>

            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title" >Friends</ThemedText>
            </ThemedView>

            <View style={styles.defaultContainer}>
                <Image
                    source={require('@/assets/images/training.png')}
                    style={styles.defaultImage}
                />
                <Text style={styles.defaultText}>Fitness is more fun with friends! Use the add button to cheer each other on and crush your goals together.</Text>
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f2f1f6',
        flex: 1,
        flexGrow: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
        marginBottom: 8,
        marginLeft: 16,
        backgroundColor: '#f2f1f6',
    },
    editButton: {
        fontSize: 17,
        color: '#007AFF',
    },
    spacer: {
        flex: 1,
    },
    titleContainer: {
        paddingTop: 20,
        paddingBottom: 10,
        paddingLeft: 15,
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        backgroundColor: '#f2f1f6',
    },
    defaultContainer: {
        marginTop: (screenHeight - topElementsHeight) / 2 - 250, // Adjust 150 as needed
        alignItems: 'center',
    },
    defaultImage: {
        //width: '100%',
        //height: '66%',
        width: "60%",
        height: "60%",
        bottom: 0,
        borderColor: 'red',
        marginBottom: 5,
        //borderWidth: 5,
        resizeMode: 'contain',
    },
    defaultText: {
        textAlign: 'center',
        color: 'gray',
        fontSize: 17,
        margin: 0,
        paddingHorizontal: 30,
    }
});