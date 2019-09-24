export type CollectedResponses = { [assetName: string]: any };

export type Message = Partial<{
  message_id: string;
  message_type: string;
  next_message_ids: any[];
  payload: {
    quick_replies?: any[];
    buttons?: any[];
    selectedResult: any;
    image_url: string;
  };
}>;

export type Entity = any;

export type Intent = {
  id: string;
  name: string;
  utterances: { text: string; variables?: Variable[] }[];
  created_at: {};
  updated_at: {};
  is_global: boolean;
};

export interface Project {
  project: {
    id: string;
    name: string;
    type: string;
    platform: string;
    created_at: {
      date: string;
      timezone_type: number;
      timezone: string
    };
    updated_at: {
      date: string;
      timezone_type: number;
      timezone: string;
    }
  };
  board: {
    board: { root_messages: any[], messages: Message[] };
    slots: {};
    variables: {}[];
    created_at: {};
    updated_at: {};
  };
  intents: Intent[];
  entities: Entity[];
  variables: Variable[];
}

export type Variable = {
  id: string;
  name: string;
  type: string;
  entity: string;
  default_value: string;
  start_index: string;
};
