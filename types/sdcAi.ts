export interface SdcAiRequest {
  text: string;
  kb_ids: string[];
  chat_id: string;
  stream: boolean;
}

export interface DocumentReference {
  file_link: string;
  file_name: string;
}

export interface SdcAiResponse {
  code: number;
  msg: string;
  data: {
    answer: string;
    reference?: DocumentReference[];
  }
} 