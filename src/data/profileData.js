export const profileInfo = {
  fullName: "John Doe",
  email: "john.doe@email.com",
  phoneNumber: "+234 801 234 5678",
  preferredLanguage: "English",
};

export const profileSidebarSections = [
  {
    id: "account",
    title: "Account",
    links: [
      { id: "profile", label: "Profile", to: "/profile", icon: "user" },
      {
        id: "account-settings",
        label: "Account Settings",
        to: "/account-settings",
        icon: "settings",
      },
      {
        id: "payment-details",
        label: "Payment Details",
        to: "/payment-details",
        icon: "credit-card",
      },
      {
        id: "purchase-history",
        label: "Purchase History",
        to: "/purchase-history",
        icon: "history",
      },
      {
        id: "parental-controls",
        label: "Parental Controls",
        to: "/parental-controls",
        icon: "lock",
      },
    ],
  },
  {
    id: "preferences",
    title: "Preferences",
    links: [
      { id: "playback", label: "Playback", to: "/playback", icon: "play" },
      {
        id: "subtitles-audio",
        label: "Subtitles & Audio",
        to: "/subtitles-audio",
        icon: "captions",
      },
      {
        id: "notifications",
        label: "Notifications",
        to: "/notifications",
        icon: "bell",
      },
    ],
  },
  {
    id: "support",
    title: "Support",
    links: [
      { id: "help-center", label: "Help Center", to: "/support", icon: "help" },
      {
        id: "contact-us",
        label: "Contact Us",
        to: "/contact-us",
        icon: "message",
      },
    ],
  },
];

export const activeDevices = [
  {
    id: "iphone-14-pro",
    name: "iPhone 14 Pro",
    location: "Lagos, Nigeria",
    platform: "iOS 17.4",
    status: "Active now",
    isCurrent: true,
    type: "phone",
  },
  {
    id: "smart-tv-samsung",
    name: "Smart TV - Samsung QLED",
    location: "Lagos, Nigeria",
    platform: "Tizen OS",
    status: "Last active: Today, 2:30 PM",
    type: "tv",
  },
  {
    id: "macbook-air",
    name: "MacBook Air",
    location: "Lagos, Nigeria",
    platform: "macOS 14.3",
    status: "Last active: Yesterday, 10:15 PM",
    type: "laptop",
  },
  {
    id: "android-phone",
    name: "Android Phone",
    location: "Abuja, Nigeria",
    platform: "Android 14",
    status: "Last active: May 12, 2024",
    type: "phone",
  },
];
