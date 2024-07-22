import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, Text, ScrollView, Dimensions, FlatList } from 'react-native';
import { SvgUri } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const API_URL = 'http://192.168.1.205:5000';

const screenHeight = Dimensions.get('window').height;
const topElementsHeight = 100;

export default function FriendScreen() {

    const [friends, setFriends] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);


    //Normal friends printing
    const fetchFriends = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/friends/get-friends`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch friends');
            }

            const data = await response.json();
            console.log('Fetched friends:', JSON.stringify(data, null, 2));
            setFriends(data.friends);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };


    const removeFriend = async (id) => {
        try {
            console.log("requestid: " + id);
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/friends/remove-friend/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to remove friend');
            }

            // Remove the friend from the local state
            setFriends(friends.filter(friend => friend.id !== id));
        } catch (error) {
            console.error('Error removing friend:', error);
            alert('Failed to remove friend. Please try again.');
        }
    };


    // Multiple fetchfriends
    // const fetchFriends = async () => {
    //     try {
    //         const userToken = await AsyncStorage.getItem('userToken');
    //         const response = await fetch(`${API_URL}/friends/get-friends`, {
    //             method: 'GET',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': `Bearer ${userToken}`
    //             }
    //         });

    //         if (!response.ok) {
    //             throw new Error('Failed to fetch friends');
    //         }

    //         const data = await response.json();
    //         console.log('Fetched friends:', JSON.stringify(data, null, 2));
    //         return data.friends;
    //     } catch (error) {
    //         console.error('Error fetching friends:', error);
    //         return [];
    //     }
    // };

    useEffect(() => {
        fetchFriends();  //prints friends list normally

        // for now we will print the single friend, 10 times for testing purposes
        // fetchFriends().then(fetchedFriends => {
        //     if (fetchedFriends.length > 0) {
        //         // Repeat the first friend 10 times
        //         const repeatedFriends = Array(10).fill(fetchedFriends[0]);
        //         setFriends(repeatedFriends);
        //     }
        // });
    }, []);


    const FriendItem = ({ friend, onRemove }) => (
        <ThemedView style={styles.friendItem}>
            {isEditMode && (
                <ThemedText
                    style={styles.removeButton}
                    onPress={() => onRemove(friend.id)}
                >
                    Remove
                </ThemedText>
            )}
            <Image
                source={require('@/assets/images/average-user-sample.png')}
                style={styles.profilePic}
            />
            <ThemedText style={styles.friendName}>{friend.name}</ThemedText>
        </ThemedView>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.buttonContainer}>
                <ThemedText
                    style={styles.editButton}
                    onPress={() => setIsEditMode(!isEditMode)}
                >
                    {isEditMode ? 'Done' : 'Edit'}
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
                <ThemedText type="title">Friends</ThemedText>
            </ThemedView>

            {friends.length > 0 ? (
                <FlatList
                    data={friends}
                    renderItem={({ item }) => (
                        <FriendItem friend={item} onRemove={removeFriend} />
                    )}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    contentContainerStyle={styles.friendList}
                />
            ) : (
                <View style={styles.defaultContainer}>
                    <Image
                        source={require('@/assets/images/training.png')}
                        style={styles.defaultImage}
                    />
                    <Text style={styles.defaultText}>Fitness is more fun with friends! Use the add button to cheer each other on and crush your goals together.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f2f1f6',
        flex: 1,
    },
    friendList: {
        //backgroundColor: '#f2f1f6',
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    friendItem: {
        backgroundColor: '#f2f1f6',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    profilePic: {
        backgroundColor: 'blue',
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    friendName: {
        fontSize: 17,
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
    },
    removeButton: {
        color: 'red',
        marginRight: 10,
    },

    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
});