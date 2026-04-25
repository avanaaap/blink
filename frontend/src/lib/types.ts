export type ApiResult<T> = {
  data: T;
  source: "api" | "mock";
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type Message = {
  id: string;
  text: string;
  sender: "me" | "them";
  timestamp: string;
};
