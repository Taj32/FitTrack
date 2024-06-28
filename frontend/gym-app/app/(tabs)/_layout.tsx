import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      {/* <Tabs.Screen
        name="login"
        options={{
          title: 'log on',
          //tabBarIcon: ({ color, focused }) => (
          //<TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
          //),
        }}
      /> */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'exercises',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'heart' : 'heart-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'journal',
          tabBarIcon: ({ color, focused }) => (
          <TabBarIcon name={focused ? 'journal' : 'journal-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout" //File name
        options={{
          title: 'workouts',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'add' : 'add-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends" //File name
        options={{
          title: 'social',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
