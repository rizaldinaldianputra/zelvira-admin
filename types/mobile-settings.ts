export interface MobileAppSetting {
  id?: number;
  latestVersion: string;
  minVersion: string;
  title: string;
  message: string;
  downloadUrl: string;
  forceUpdate: boolean;
  createdAt?: string;
  updatedAt?: string;
}
