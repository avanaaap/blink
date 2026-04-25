export type MatchProfile = {
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  compatibilityScore: number;
  photos: Array<{ url: string; caption: string }>;
};

export const matchProfile: MatchProfile = {
  name: "Alex",
  age: 28,
  location: "San Francisco, CA",
  bio: "Coffee enthusiast, amateur photographer, and weekend hiker. Always up for trying new restaurants or exploring hidden trails.",
  interests: ["Travel", "Music", "Cooking", "Photography", "Hiking"],
  compatibilityScore: 85,
  photos: [
    {
      url: "https://images.unsplash.com/photo-1613394242132-1268854bde44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdHRyYWN0aXZlJTIwMjglMjB5ZWFyJTIwb2xkJTIwcGVyc29uJTIwc21pbGluZ3xlbnwxfHx8fDE3NzcxMzY2MTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Enjoying a sunny day out in the city!",
    },
    {
      url: "https://images.unsplash.com/photo-1662601058426-df396092a2ac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwyOCUyMHllYXIlMjBvbGQlMjBwZXJzb24lMjBoaWtpbmd8ZW58MXx8fHwxNzc3MTM2NjE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Hiking up my favorite trail this past weekend.",
    },
    {
      url: "https://images.unsplash.com/photo-1776409147655-1f84f6977969?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwyOCUyMHllYXIlMjBvbGQlMjBwZXJzb24lMjBkcmlua2luZyUyMGNvZmZlZXxlbnwxfHx8fDE3NzcxMzY2MTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Morning brew at the local cafe.",
    },
    {
      url: "https://images.unsplash.com/photo-1738265039671-65110cf2eb77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwyOCUyMHllYXIlMjBvbGQlMjBwZXJzb24lMjB3aXRoJTIwZG9nfGVufDF8fHx8MTc3NzEzNjYxN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Just hanging out with my best friend.",
    },
    {
      url: "https://images.unsplash.com/photo-1664106320237-85d9f04938db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHwyOCUyMHllYXIlMjBvbGQlMjBwZXJzb24lMjBsYXVnaGluZ3xlbnwxfHx8fDE3NzcxMzY2MTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      caption: "Caught mid-laugh by a good friend.",
    },
  ],
};

export const starterQuestions = [
  "I saw we both love reading - what's a book that fundamentally changed your perspective?",
  "Since you enjoy hiking too, what's the most memorable trail you've ever explored?",
  "We both value creativity. What project are you most proud of working on recently?",
];
