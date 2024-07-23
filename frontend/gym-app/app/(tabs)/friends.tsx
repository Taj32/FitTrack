import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Image, Platform, SafeAreaView, View, Text, ScrollView, Dimensions, FlatList } from 'react-native';
import { SvgUri } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

import { TouchableOpacity, Animated, LayoutAnimation } from 'react-native';
import React from 'react';

const API_URL = 'http://192.168.1.205:5000';

const screenHeight = Dimensions.get('window').height;
const topElementsHeight = 100;


const FriendItem = React.memo(({ friend, onRemove, isEditMode }) => {
    const slideAnim = useRef(new Animated.Value(0)).current;
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: isEditMode ? 1 : 0,
            friction: 8,
            tension: 50,
            useNativeDriver: true,
        }).start();
    }, [isEditMode]);

    const buttonTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0],
    });

    const contentTranslateX = slideAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 50],
    });

    return (
        <View 
            style={styles.friendItemContainer}
            onLayout={(event) => {
                const {width} = event.nativeEvent.layout;
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
                    source={require('@/assets/images/average-user-sample.png')}
                    style={styles.profilePic}
                />
                <ThemedText style={styles.friendName}>{friend.name}</ThemedText>
            </Animated.View>
        </View>
    );
});

export default function FriendScreen() {
    const [friends, setFriends] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        fetchFriends();
    }, []);

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
            setFriends(data.friends);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const removeFriend = useCallback(async (id) => {
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
        />
    ), [isEditMode, removeFriend]);

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
                    onPress={() => alert('plus pressed')}
                />
            </ThemedView>

            <ThemedView style={styles.titleContainer}>
                <ThemedText type="title">Friends</ThemedText>
            </ThemedView>

            {friends.length > 0 ? (
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

    // friendItem: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     paddingVertical: 8,
    // },
});