export interface ServiceAccountCredentials {
  username: string;
  password: string;
}

export const encodeCredentials = (credentials: ServiceAccountCredentials) => {
  return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
};
