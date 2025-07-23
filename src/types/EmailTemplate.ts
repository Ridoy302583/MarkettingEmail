export interface EmailTemplate {
  id?: string;
  name: string;
  subject: string;
  category: string;
  thumbnail: string;
  html: string;
  createdDate: string;
  lastModified: string;
  usageCount: number;
}