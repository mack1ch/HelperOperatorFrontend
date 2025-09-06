import { IIssue } from "@/shared/interface/issue";
import { IMessage } from "@/shared/interface/message";
import { toDateOptional, toDateStrict } from "@/shared/lib/parce/date";

// сообщения — строго Date, тикет — опционально
export const normalizeIssue = (i: IIssue): IIssue => {
  const createdAt = toDateOptional(i.createdAt);
  const updatedAt = toDateOptional(i.updatedAt) ?? createdAt ?? new Date();

  const messages: IMessage[] = (i.messages ?? []).map((m) => ({
    ...m,
    createdAt: toDateStrict(m.createdAt),
  }));

  return {
    ...i,
    createdAt,
    updatedAt,
    messages,
  };
};

// последний элемент — самый свежий
export const sortByUpdatedAsc = (a: IIssue, b: IIssue) => {
  const ad = a.updatedAt ? +a.updatedAt : 0;
  const bd = b.updatedAt ? +b.updatedAt : 0;
  return ad - bd;
};
