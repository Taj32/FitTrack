import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://gym-api-hwbqf0gpfwfnh4av.eastus-01.azurewebsites.net';

export function FriendRequestModal({ onRequestHandled }) {
  const [isVisible, setIsVisible] = useState(false);
  const [requests, setRequests] = useState([]);
  const [currentRequest, setCurrentRequest] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  useEffect(() => {
    if (requests.length > 0 && !currentRequest) {
      setCurrentRequest(requests[0]);
      setIsVisible(true);
    }
  }, [requests]);

  const fetchPendingRequests = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${API_URL}/friends/getPendingRequests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending requests');
      }

      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleAction = async (action) => {
    if (!currentRequest) return;

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const endpoint = action === 'accept' ? 'accept-request' : 'reject-request';
      const response = await fetch(`${API_URL}/friends/${endpoint}/${currentRequest.requesterId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} friend request`);
      }

      // Remove the current request from the list
      const updatedRequests = requests.filter(req => req.requesterId !== currentRequest.requesterId);
      setRequests(updatedRequests);

      // Move to the next request or close the modal if there are no more requests
      if (updatedRequests.length > 0) {
        setCurrentRequest(updatedRequests[0]);
      } else {
        setIsVisible(false);
        setCurrentRequest(null);
      }

      // Notify the parent component that a request has been handled
      if (onRequestHandled) {
        onRequestHandled();
      }
    } catch (error) {
      console.error(`Error ${action}ing friend request:`, error);
      // You might want to show an error message to the user here
    }
  };

  if (!currentRequest) {
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>{`${currentRequest.requesterName} requested to be your friend`}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => handleAction('accept')}>
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => handleAction('reject')}>
              <Text style={styles.buttonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => setIsVisible(false)}>
              <Text style={styles.buttonText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

//export default FriendRequestModal;