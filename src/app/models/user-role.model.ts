export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  auth_user: {
    id: string;
    email: string;
    raw_user_meta_data: {
      full_name?: string;
    };
  };
  role: {
    name: string;
  };
}

export interface RefereeUser {
  id: string;
  email: string;
  full_name: string;
}