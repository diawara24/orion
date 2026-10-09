export interface Topic {
  id: string;
  name: string;
  description: string;
  subscribed: boolean;
}

/** Réponse réservée aux opérations d'administration des thèmes. */
export interface TopicAdmin extends Omit<Topic, 'subscribed'> {
  createdAt: string;
  updatedAt: string;
}
