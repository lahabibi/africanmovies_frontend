import banner2 from "../assets/images/img_banner2.png";
import banner3 from "../assets/images/img_banner3.png";
import banner4 from "../assets/images/img_banner4.webp";
import banner5 from "../assets/images/img_banner5.png";
import poster2 from "../assets/images/img_poster2.png";
import poster3 from "../assets/images/img_poster3.png";
import poster4 from "../assets/images/img_poster4.png";
import poster6 from "../assets/images/img_poster6.png";
import poster7 from "../assets/images/img_poster7.png";
import poster8 from "../assets/images/img_poster8.png";
import poster18 from "../assets/images/img_poster18.png";

export const libraryStats = {
  all: 11,
  active: 9,
  expiring: 3,
  expired: 2,
};

export const libraryTabs = [
  { id: "all", label: "All", count: libraryStats.all },
  { id: "active", label: "Active", count: libraryStats.active },
  { id: "expiring", label: "Expiring Soon", count: libraryStats.expiring },
  { id: "expired", label: "Expired", count: libraryStats.expired },
];

export const librarySections = [
  {
    id: "active",
    title: "Active Access",
    count: 6,
    description: "You have up to 48 hours to watch these titles.",
    items: [
      {
        id: "library-king-of-boys",
        slug: "king-of-boys",
        title: "King of Boys",
        status: "active",
        statusLabel: "Active",
        timeLabel: "23h 45m left",
        progress: 69,
        image: banner3,
        purchasedAt: "2026-06-01T08:30:00Z",
      },
      {
        id: "library-wedding-party-2",
        slug: "wedding-party-2",
        title: "The Wedding Party 2",
        status: "active",
        statusLabel: "Active",
        timeLabel: "31h 10m left",
        progress: 52,
        image: poster3,
        purchasedAt: "2026-05-31T20:10:00Z",
      },
      {
        id: "library-buka-street",
        slug: "battle-on-buka-street",
        title: "Battle on Buka Street",
        status: "active",
        statusLabel: "Active",
        timeLabel: "44h 02m left",
        progress: 47,
        image: poster4,
        purchasedAt: "2026-05-31T14:05:00Z",
      },
      {
        id: "library-tribe-judah",
        slug: "tribe-judah",
        title: "A Tribe Called Judah",
        status: "active",
        statusLabel: "Active",
        timeLabel: "15h 30m left",
        progress: 58,
        image: poster6,
        purchasedAt: "2026-05-30T18:25:00Z",
      },
      {
        id: "library-lisabi",
        slug: "lisabi-the-uprising",
        title: "Lisabi: The Uprising",
        status: "active",
        statusLabel: "Active",
        timeLabel: "10h 15m left",
        progress: 55,
        image: poster2,
        purchasedAt: "2026-05-30T10:45:00Z",
      },
      {
        id: "library-yellow-sun",
        slug: "half-of-a-yellow-sun",
        title: "Half of a Yellow Sun",
        status: "active",
        statusLabel: "Active",
        timeLabel: "6h 45m left",
        progress: 63,
        image: poster8,
        purchasedAt: "2026-05-29T22:15:00Z",
      },
    ],
  },
  {
    id: "expiring",
    title: "Expiring Soon",
    count: libraryStats.expiring,
    description: "These titles will expire within the next 48 hours.",
    items: [
      {
        id: "library-merry-men-2",
        slug: "merry-men-2",
        title: "Merry Men 2: Another Mission",
        status: "expiring",
        statusLabel: "Expiring Soon",
        timeLabel: "09h 28m left",
        progress: 92,
        image: poster7,
        purchasedAt: "2026-05-29T18:00:00Z",
      },
      {
        id: "library-black-book",
        slug: "the-black-book",
        title: "The Black Book",
        status: "expiring",
        statusLabel: "Expiring Soon",
        timeLabel: "20h 12m left",
        progress: 94,
        image: banner5,
        purchasedAt: "2026-05-29T12:20:00Z",
      },
      {
        id: "library-blood-sisters",
        slug: "blood-sisters",
        title: "Blood Sisters",
        status: "expiring",
        statusLabel: "Expiring Soon",
        timeLabel: "35h 50m left",
        progress: 78,
        image: poster18,
        purchasedAt: "2026-05-28T23:30:00Z",
      },
    ],
  },
  {
    id: "expired",
    title: "Expired",
    count: libraryStats.expired,
    description: "These titles are no longer available.",
    items: [
      {
        id: "library-gangs-lagos",
        slug: "gangs-of-lagos",
        title: "Gangs of Lagos",
        status: "expired",
        statusLabel: "Expired",
        timeLabel: "Expired 12 hours ago",
        progress: 0,
        image: banner4,
        purchasedAt: "2026-05-27T08:10:00Z",
      },
      {
        id: "library-therapist",
        slug: "the-therapist",
        title: "The Therapist",
        status: "expired",
        statusLabel: "Expired",
        timeLabel: "Expired 1 day ago",
        progress: 0,
        image: banner2,
        purchasedAt: "2026-05-26T16:05:00Z",
      },
    ],
  },
];

export const librarySearchIndex = librarySections.flatMap((section) =>
  section.items.map((item) => ({ ...item, sectionId: section.id })),
);

export const librarySortOptions = [
  { value: "recent", label: "Recently Purchased" },
  { value: "expiring", label: "Expiring First" },
  { value: "title", label: "Title A-Z" },
];
