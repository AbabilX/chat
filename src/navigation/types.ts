import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

// Bottom tab bar routes.
export type TabParamList = {
  Home: undefined;
  DMs: undefined;
  Activity: undefined;
  Search: undefined;
  More: undefined;
};

// Root stack: auth screens, the tab shell, and screens pushed above the tabs.
export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  NewMessage: undefined;
  NewGroup: undefined;
  EditProfile: undefined;
  Chat: { conversationId: string; title: string };
  Thread: { conversationId: string; parentId: string; title: string };
};

export type ScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Tab screens can also navigate to parent-stack routes (Chat, NewMessage).
export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;
