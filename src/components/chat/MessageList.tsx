import React, { useMemo } from 'react';
import { FlashList } from '@shopify/flash-list';
import { MessageBubble } from './MessageBubble';
import { DateDivider } from './DateDivider';
import { buildRows, Row } from '../../utils/grouping';
import type { MemberInfo } from '../../hooks/useMembers';
import type { Message } from '../../api/types';

type Props = {
  messages: Message[];
  resolve: (id: string) => MemberInfo;
  onLoadOlder: () => void;
  onPressMessage?: (message: Message) => void;
  onLongPressMessage?: (message: Message) => void;
};

// Inverted FlashList: cache stays ascending, we reverse for newest-at-bottom.
export function MessageList({
  messages,
  resolve,
  onLoadOlder,
  onPressMessage,
  onLongPressMessage,
}: Props) {
  const rows = useMemo(() => buildRows(messages).reverse(), [messages]);

  return (
    <FlashList
      inverted
      data={rows}
      keyExtractor={(r) => r.id}
      onEndReached={onLoadOlder}
      onEndReachedThreshold={0.4}
      renderItem={({ item }: { item: Row }) => {
        if (item.type === 'divider') return <DateDivider label={item.label} />;
        const info = resolve(item.message.sender_id);
        return (
          <MessageBubble
            message={item.message}
            name={info.name}
            avatarUri={info.uri}
            showHeader={item.showHeader}
            onPress={onPressMessage ? () => onPressMessage(item.message) : undefined}
            onLongPress={
              onLongPressMessage ? () => onLongPressMessage(item.message) : undefined
            }
          />
        );
      }}
    />
  );
}
