export type PokVc = {
  id: string;
  viewUrl?: string;
  state?: string;
  createdAt?: string;
  credential?: {
    emissionDate?: string;
    title?: string;
    emitter?: string;
  };
  receiver?: {
    email?: string;
    name?: string;
  };
};

export type PokVcResponse = {
  pagination: object;
  data: PokVc[];
};
