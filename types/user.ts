export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  createdAt: string;
  conversationCount: number;
  dailyRequests: number;
  lastRequestDate: string;
  /** "solo" = working alone, "team" = working with a team. Set at signup. */
  usageMode?: "solo" | "team";
  /** What the user mainly wants to do. Set at signup. */
  purpose?: "convert" | "create";
}
