export interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  seen: boolean;
  content: string;
  timestamp: Date;
}
