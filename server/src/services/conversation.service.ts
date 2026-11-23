import mongoose from 'mongoose';
import { Conversation } from '../models/Conversation.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { toConversation, toMessage } from '../utils/dto.js';
import { isDuplicateKeyError } from '../utils/mongo.js';

import { Message } from '../models/Message.js';
import { toPage } from '../utils/pagination.js';
import type { PaginationQuery } from '../validators/common.schema.js';
import { emitToConversation, emitToUser } from '../socket/emitters.js';

export function makeConversationKey(userA: string, userB: string) {
  return [userA, userB].sort().join('_');
}

export async function getOrCreateConversation(userId: string, otherUserId: string) {
  if (userId === otherUserId) {
    throw new AppError(400, 'CANNOT_MESSAGE_SELF', 'You cannot message yourself');
  }

  const otherUser = await User.findById(otherUserId);
  if (!otherUser) {
    throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
  }

  const key = makeConversationKey(userId, otherUserId);
  let conversation = await Conversation.findOne({ key });

  if (!conversation) {
    try {
      conversation = await Conversation.create({ participants: [userId, otherUserId], key });
    } catch (err) {
      if (!isDuplicateKeyError(err)) throw err;
      conversation = await Conversation.findOne({ key });
    }
  }

  if (!conversation) {
    throw new AppError(500, 'CONVERSATION_ERROR', 'Could not create conversation');
  }

  return toConversation(conversation, otherUser);
}

export async function getConversations(userId: string) {
  const conversations = await Conversation.find({ participants: userId })
    .sort({ updatedAt: -1 })
    .limit(50)
    .populate<{ participants: InstanceType<typeof User>[] }>('participants');

  return conversations.flatMap((conversation) => {
    const otherUser = conversation.participants.find((user) => user.id !== userId);
    return otherUser ? [toConversation(conversation, otherUser)] : [];
  });
}

export async function assertParticipant(conversationId: string, userId: string) {
  const conversation = mongoose.isValidObjectId(conversationId)
    ? await Conversation.findOne({ _id: conversationId, participants: userId })
    : null;

  if (!conversation) {
    throw new AppError(404, 'CONVERSATION_NOT_FOUND', 'Conversation not found');
  }
  return conversation;
}

export async function getMessages(
  conversationId: string,
  userId: string,
  { cursor, limit }: PaginationQuery,
) {
  await assertParticipant(conversationId, userId);

  const filter = cursor
    ? { conversation: conversationId, _id: { $lt: cursor } }
    : { conversation: conversationId };
  const messages = await Message.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const page = toPage(messages, limit);
  return { messages: page.items.map(toMessage), nextCursor: page.nextCursor };
}

export async function sendMessage(conversationId: string, senderId: string, text: string) {
  const conversation = await assertParticipant(conversationId, senderId);

  const recipient = conversation.participants.find((id) => !id.equals(senderId));
  if (!recipient) {
    throw new AppError(400, 'INVALID_CONVERSATION', 'Conversation has no recipient');
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: senderId,
    recipient,
    text,
  });

  conversation.lastMessage = {
    text: message.text,
    sender: message.sender,
    createdAt: message.createdAt,
  };
  await conversation.save();

  const dto = toMessage(message);
  emitToConversation(conversation.id, 'chat:message', dto);

  const update = {
    conversationId: conversation.id,
    lastMessage: { text: dto.text, senderId: dto.senderId, createdAt: dto.createdAt },
  };
  emitToUser(recipient.toString(), 'conversation:update', update);
  emitToUser(senderId, 'conversation:update', update);

  return dto;
}
