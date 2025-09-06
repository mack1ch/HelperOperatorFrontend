import { instance } from "@/shared/api";
import { IIssue } from "@/shared/interface/issue";

export const changeIssueClosingByID = async (
  issueID: string,
  isClosed: boolean
): Promise<IIssue | Error> => {
  try {
    const { data }: { data: IIssue } = await instance.patch(
      `/issues/${issueID}`,
      {
        isClosed: isClosed,
      }
    );

    return data;
  } catch (error) {
    return error as Error;
  }
};

import { normalizeIssue } from "../model";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.rltorg.ru";

export async function getIssuesByAuthorID(
  authorId: string
): Promise<IIssue[] | Error> {
  try {
    const res = await fetch(
      `${API_URL}/issues?authorId=${encodeURIComponent(authorId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = (await res.json()) as IIssue[];
    return (data ?? []).map(normalizeIssue).sort((a, b) => {
      const ad = a.updatedAt ? +new Date(a.updatedAt) : 0;
      const bd = b.updatedAt ? +new Date(b.updatedAt) : 0;
      return ad - bd; // последний — самый новый (как у тебя в Messenger)
    });
  } catch (e) {
    return e instanceof Error ? e : new Error("Unknown error");
  }
}

export async function getIssue(issueId: string): Promise<IIssue | Error> {
  try {
    const res = await fetch(
      `${API_URL}/issues/${encodeURIComponent(issueId)}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = (await res.json()) as IIssue;
    return normalizeIssue(data);
  } catch (e) {
    return e instanceof Error ? e : new Error("Unknown error");
  }
}

export async function getChatHistory(params: {
  authorId: string;
  issueId: string;
}): Promise<IIssue> {
  const { data } = await instance.get<IIssue>("/chat_history", {
    params,
    withCredentials: true,
  });
  return data;
}
