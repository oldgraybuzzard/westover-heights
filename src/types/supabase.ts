export type Profile = {
  id: string;
  display_name: string;
  role: 'USER' | 'EXPERT' | 'ADMIN';
  email_visible: boolean;
  created_at: string;
  updated_at: string;
};

export type Topic = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  status: 'OPEN' | 'ANSWERED' | 'CLOSED';
  category: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type Reply = {
  id: string;
  content: string;
  author_id: string;
  topic_id: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string | null;
          role: 'USER' | 'EXPERT' | 'ADMIN';
          can_post: boolean;
          last_payment_id: string | null;
          payment_valid_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string;
          display_name?: string | null;
          role?: 'USER' | 'EXPERT' | 'ADMIN';
          can_post?: boolean;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string | null;
          role?: 'USER' | 'EXPERT' | 'ADMIN';
          can_post?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      };
      topics: {
        Row: {
          id: string;
          title: string;
          content: string;
          author_id: string;
          status: 'OPEN' | 'ANSWERED' | 'CLOSED';
          category: string;
          created_at: string;
          updated_at: string;
        };
      };
      // Add other tables as needed
    };
  };
}; 