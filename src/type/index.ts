export interface Video {
  id: string;
  title: string;
  image: string;
  duration: string;
  views: string;
  [key: string]: any;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  loginAttempts: number;
}

export interface VideoDetailParams {
  videoId: string;
}
