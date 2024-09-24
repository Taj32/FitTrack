import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, Text, ScrollView, Dimensions, FlatList, Alert, Modal, ActivityIndicator, TextInput } from 'react-native';
import { SvgUri } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TouchableOpacity, Animated, LayoutAnimation } from 'react-native';
import React from 'react';

//const API_URL = 'http://192.168.1.205:5000';
const API_URL = 'https://gym-api-hwbqf0gpfwfnh4av.eastus-01.azurewebsites.net';
const defaultImage = '@/public/images/average-user-sample.png';


const screenHeight = Dimensions.get('window').height;
const topElementsHeight = 100;


const fetchImageWithAuth = async (profileImageUrl) => {
    if (!profileImageUrl) return require('@/public/images/average-user-sample.png');

    try {
        const userToken = await AsyncStorage.getItem('userToken');
        const fullImageUrl = `${API_URL}/${profileImageUrl}`;

        const response = await fetch(fullImageUrl, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${userToken}`,
            }
        });

        if (!response.ok) {
            throw new Error('Error fetching image');
        }

        // Return the full URL to be used as the image source
        console.log("it worked!");
        return { uri: fullImageUrl, headers: { Authorization: `Bearer ${userToken}` } };
    } catch (error) {
        console.error('Error fetching image:', error);
        return require('@/public/images/average-user-sample.png');
    }
};

const FriendItem = React.memo(({ friend, onRemove, isEditMode, onPress }) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = useState(0);

    const [imageSource, setImageSource] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalLoading, setIsModalLoading] = useState(false);

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: isEditMode ? 1 : 0,
            friction: 8,
            tension: 50,
            useNativeDriver: true,
        }).start();
    }, [isEditMode]);

    useEffect(() => {
        const loadImage = async () => {
            console.log(friend.name);
            console.log(friend.id);
            console.log(friend.email);
            console.log('**** - ', friend.profile_image_url);
            setIsLoading(true);
            if (friend.profile_image_url) {
                try {
                    console.log("trying to get friend image...");
                    const source = await fetchImageWithAuth(friend.profile_image_url);
                    setImageSource(source);
                } catch (error) {
                    console.error('Error loading image:', error);
                    setImageSource(require('@/public/images/average-user-sample.png'));
                }
            } else {
                setImageSource(require('@/public/images/average-user-sample.png'));
            }
            setIsLoading(false);
        };
        loadImage();
    }, [friend.profile_image_url]);

    const buttonTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0],
    });

    const contentTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 50],
    });

    return (
        <TouchableOpacity onPress={() => onPress(friend.id)}>
            <View
                style={styles.friendItemContainer}
                onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    setContainerWidth(width);
                }}
            >
                <Animated.View style={[
                    styles.deleteButtonContainer,
                    {
                        transform: [{ translateX: buttonTranslateX }],
                    }
                ]}>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onRemove(friend.id)}
                    >
                        <Ionicons name="remove-circle" size={24} color="red" />
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View style={[
                    styles.friendItem,
                    {
                        width: containerWidth,
                        transform: [{ translateX: contentTranslateX }],
                    }
                ]}>
                    <Image
                        source={imageSource}
                        style={styles.profilePic}
                    />
                    <ThemedText style={styles.friendName}>{friend.name}</ThemedText>
                </Animated.View>
            </View>
        </TouchableOpacity>

    );
});

const UserItem = React.memo(({ user, onSendRequest }) => {
    const [imageSource, setImageSource] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalLoading, setIsModalLoading] = useState(false);


    useEffect(() => {
        const loadImage = async () => {
            setIsLoading(true);
            if (user.profileImageUrl) {
                try {
                    const source = await fetchImageWithAuth(user.profileImageUrl);
                    setImageSource(source);
                } catch (error) {
                    console.error('Error loading image:', error);
                    setImageSource(require('@/public/images/average-user-sample.png'));
                }
            } else {
                setImageSource(require('@/public/images/average-user-sample.png'));
            }
            setIsLoading(false);
        };
        loadImage();
    }, [user.profileImageUrl]);

    return (
        <View style={styles.userItem}>
            <View style={styles.imageContainer}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#0000ff" />
                ) : (
                    <Image
                        source={imageSource}
                        style={styles.userProfilePic}
                    />
                )}
            </View>
            <ThemedText style={styles.userName}>{user.name}</ThemedText>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => onSendRequest(user.id)}
            >
                <ThemedText style={styles.addButtonText}>Add</ThemedText>
            </TouchableOpacity>
        </View>
    );
});

export default function FriendScreen() {
    const [friends, setFriends] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);

    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');

    const [isWorkoutModalVisible, setIsWorkoutModalVisible] = useState(false);
    const [selectedFriendWorkouts, setSelectedFriendWorkouts] = useState([]);
    const [allFriendWorkouts, setAllFriendWorkouts] = useState([]);
    //const [isFriendsLoading, setIsFriendsLoading] = useState(true);
    const [isModalLoading, setIsModalLoading] = useState(false);





    useEffect(() => {
        fetchFriends();
        fetchRecentFriendWorkouts();
    }, []);

    useEffect(() => {
        console.log('Users state updated:', users);
    }, [users]);



    const fetchRecentFriendWorkouts = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/friends/recent-friend-workouts`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch recent friend workouts');
            }

            const data = await response.json();
            setAllFriendWorkouts(data.workouts);
        } catch (error) {
            console.error('Error fetching recent friend workouts:', error);
            alert('Failed to fetch recent workouts. Please try again.');
        }
    };

    const sendFriendRequest = async (friendId) => {
        try {
            console.log('Sending friend request to friendId:', friendId);
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                throw new Error('User token not found');
            }

            const response = await fetch(`${API_URL}/friends/send-request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ friendId })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Server returned an error:', response.status, data);
                throw new Error(data.message || 'Failed to send friend request');
            }

            console.log('Friend request sent successfully:', data);
            Alert.alert('Success', 'Friend request sent successfully!');
        } catch (error) {
            console.error('Error sending friend request:', error);
            Alert.alert('Error', error.message || 'Failed to send friend request. Please try again.');
        }
    };

    const fetchFriends = async () => {
        setIsLoading(true);
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
            setFriends(data.friends);
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = useCallback(async () => {
        setIsModalLoading(true);
        setSearchKeyword('');

        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/auth/getUsers`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Failed to fetch users. Please try again.');
        } finally {
            setIsModalLoading(false);
        }
    }, []);

    const removeFriend = useCallback(async (id) => {
        Alert.alert(
            "Confirm Deletion",
            "Are you sure you want to remove this friend?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Remove",
                    onPress: async () => {
                        try {
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

                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            setFriends(prevFriends => prevFriends.filter(friend => friend.id !== id));
                        } catch (error) {
                            console.error('Error removing friend:', error);
                            alert('Failed to remove friend. Please try again.');
                        }
                    },
                    style: "destructive"
                }
            ],
            { cancelable: false }
        );
    }, []);

    const handleSearch = useCallback(async (keyword) => {
        setIsModalLoading(true);
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            const response = await fetch(`${API_URL}/auth/getusers?keyword=${encodeURIComponent(keyword)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error('Error searching users:', error);
            alert('Failed to search users. Please try again.');
        } finally {
            setIsModalLoading(false);
        }
    }, []);



    const toggleEditMode = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsEditMode(prev => !prev);
    }, []);

    const renderFriendItem = useCallback(({ item }) => (
        <FriendItem
            friend={item}
            onRemove={removeFriend}
            isEditMode={isEditMode}
            onPress={(friendId) => {
                const friendWorkouts = allFriendWorkouts.filter(workout => workout.user_id === friendId);
                setSelectedFriendWorkouts(friendWorkouts);
                setIsWorkoutModalVisible(true);
            }}
        />
    ), [isEditMode, removeFriend, allFriendWorkouts]);

    return (
        <SafeAreaView style={styles.container}>
            <ThemedView style={styles.buttonContainer}>
                <ThemedText
                    style={styles.editButton}
                    onPress={toggleEditMode}
                >
                    {isEditMode ? 'Done' : 'Edit'}
                </ThemedText>

                <View style={styles.spacer} />

                <Ionicons
                    name="add-circle-outline"
                    size={24}
                    color='#007AFF'
                    style={{ marginRight: 16 }}
                    onPress={() => {
                        setIsAddModalVisible(true);
                        fetchUsers();
                    }}
                />
            </ThemedView>

            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Friends</ThemedText>
            </ThemedView>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : friends.length > 0 ? (
                <FlatList
                    data={friends}
                    renderItem={renderFriendItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.friendList}
                    extraData={isEditMode}
                />
            ) : (
                <View style={styles.defaultContainer}>
                    <Image
                        source={require('@/public/images/training.png')}
                        style={styles.defaultImage}
                    />
                    <Text style={styles.defaultText}>Fitness is more fun with friends! Use the add button to cheer each other on and crush your goals together.</Text>
                </View>
            )}

            <Modal
                visible={isAddModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAddModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Add Friend</ThemedText>
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search users..."
                                value={searchKeyword}
                                onChangeText={(text) => {
                                    setSearchKeyword(text);
                                    if (text.length > 0) {
                                        handleSearch(text);
                                    } else if (text.length === 0) {
                                        fetchUsers();
                                    }
                                }}
                            />
                        </View>
                        {isModalLoading ? (
                            <View style={styles.loaderContainer}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </View>
                        ) : (
                            <FlatList
                                data={users}
                                renderItem={({ item }) => (
                                    <UserItem
                                        user={item}
                                        onSendRequest={(userId) => {
                                            sendFriendRequest(userId);
                                        }}
                                    />
                                )}
                                keyExtractor={(item) => item.id.toString()}
                                ListEmptyComponent={<ThemedText>No users found</ThemedText>}
                            />
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setIsAddModalVisible(false);
                                setSearchKeyword('');
                            }}
                        >
                            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isWorkoutModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsWorkoutModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Recent Workouts</ThemedText>
                        <FlatList
                            data={selectedFriendWorkouts}
                            renderItem={({ item }) => (
                                <ThemedText style={styles.workoutItem}>
                                    {item.name} - {item.date_created}
                                </ThemedText>
                            )}
                            keyExtractor={(item) => item.id.toString()}
                            ListEmptyComponent={<ThemedText>No recent workouts found</ThemedText>}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setIsWorkoutModalVisible(false)}
                        >
                            <ThemedText style={styles.closeButtonText}>Close</ThemedText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    friendItemContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
        overflow: 'hidden',
    },
    deleteButtonContainer: {
        position: 'absolute',
        left: 0,
        height: '100%',
        justifyContent: 'center',
        width: 50,
        zIndex: 1,
    },
    deleteButton: {
        padding: 10,
        alignItems: 'center',
    },
    friendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 30,
        paddingVertical: 8,
        paddingHorizontal: 16,
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
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        marginLeft: 10, // Add some space between the name and the button
    },
    addButtonText: {
        color: 'white',
        fontSize: 14,
    },


    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
    },
    closeButtonText: {
        color: '#007AFF',
        fontSize: 16,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    userProfilePic: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
    },

    searchContainer: {
        width: '100%',
        marginBottom: 15,
    },
    searchInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: 200, // Adjust this value as needed
    },

    // friendItem: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     paddingVertical: 8,
    // },
});