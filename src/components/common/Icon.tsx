import React from 'react';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  BubbleChatIcon,
  Notification03Icon,
  Search01Icon,
  Menu01Icon,
  ArrowLeft01Icon,
  MoreVerticalIcon,
  PencilEdit02Icon,
  Logout01Icon,
  Camera01Icon,
  UserGroup03Icon,
  PlusSignIcon,
  Mail01Icon,
  Settings01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';

// Every icon in the app renders from Hugeicons through this one wrapper, so the
// rest of the code just says <Icon name="back" /> and never imports the library.
const ICONS = {
  home: Home01Icon,
  dms: BubbleChatIcon,
  activity: Notification03Icon,
  search: Search01Icon,
  more: Menu01Icon,
  back: ArrowLeft01Icon,
  menu: MoreVerticalIcon,
  edit: PencilEdit02Icon,
  logout: Logout01Icon,
  camera: Camera01Icon,
  group: UserGroup03Icon,
  add: PlusSignIcon,
  mail: Mail01Icon,
  settings: Settings01Icon,
  delete: Delete02Icon,
} as const;

export type IconName = keyof typeof ICONS;
type Props = { name: IconName; color: string; size?: number; strokeWidth?: number };

export function Icon({ name, color, size = 24, strokeWidth = 2 }: Props) {
  return <HugeiconsIcon icon={ICONS[name]} size={size} color={color} strokeWidth={strokeWidth} />;
}
