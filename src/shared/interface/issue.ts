import { IMessage } from "./message";

export interface IIssue {
  issueId: string;
  authorId: string;
  isClosed: boolean;
  messages: IMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}
