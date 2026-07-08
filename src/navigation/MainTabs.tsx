import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConversationListScreen } from '../screens/conversations/ConversationListScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ActivityScreen } from '../screens/activity/ActivityScreen';
import { SearchScreen } from '../screens/placeholder/Placeholders';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { Icon, IconName } from '../components/common/Icon';
import { colors } from '../theme';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const icon = (name: IconName) => ({ color }: { color: string }) =>
  <Icon name={name} color={color} />;

// Slack-style bottom bar: Home · DMs · Activity · Search · More.
export function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          height: 54 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11 },
      }}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: icon('home') }} />
      <Tab.Screen
        name="DMs"
        component={ConversationListScreen}
        options={{ tabBarIcon: icon('dms') }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{ tabBarIcon: icon('activity') }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ tabBarIcon: icon('search') }}
      />
      <Tab.Screen name="More" component={ProfileScreen} options={{ tabBarIcon: icon('more') }} />
    </Tab.Navigator>
  );
}
