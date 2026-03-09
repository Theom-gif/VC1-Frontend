export const USERS = [
  {
    id: 1,
    role: "Author",
    first_name: "Sarah",
    last_name: "Chen",
    email: "sarah@example.com",
    created_at: "2023-06-15",
  },
  {
    id: 2,
    role: "Author",
    first_name: "Alex",
    last_name: "Johnson",
    email: "alex@example.com",
    created_at: "2023-08-20",
  },
  {
    id: 3,
    role: "User",
    first_name: "Emma",
    last_name: "Wilson",
    email: "emma@example.com",
    created_at: "2024-01-10",
  },
  {
    id: 4,
    role: "Author",
    first_name: "Michael",
    last_name: "Brown",
    email: "michael@example.com",
    created_at: "2023-09-05",
  },
  {
    id: 5,
    role: "Admin",
    first_name: "Olivia",
    last_name: "Martinez",
    email: "olivia@example.com",
    created_at: "2023-07-12",
  },
];

export const BOOKS = [
  {
    id: "1",
    title: "The Future of AI",
    author: "Sarah Chen",
    category: "Technology",
    status: "Approved",
    downloads: 1243,
    cover: "https://picsum.photos/seed/ai/200/300",
    date: "2024-01-15",
  },
  {
    id: "2",
    title: "Digital Minimalism",
    author: "Sarah Chen",
    category: "Self-Help",
    status: "Pending",
    downloads: 0,
    cover: "https://picsum.photos/seed/minimal/200/300",
    date: "2024-02-10",
  },
  {
    id: "3",
    title: "Space Odyssey 2050",
    author: "Sarah Chen",
    category: "Science Fiction",
    status: "Approved",
    downloads: 3421,
    cover: "https://picsum.photos/seed/space/200/300",
    date: "2023-11-20",
  },
  {
    id: "4",
    title: "Mindful Coding",
    author: "Alex Johnson",
    category: "Technology",
    status: "Pending",
    downloads: 0,
    cover: "https://picsum.photos/seed/code/200/300",
    date: "2024-02-22",
  },
];

export const ACTIVITY_DATA = [
  { name: "Mon", users: 2100, books: 800, downloads: 12000 },
  { name: "Tue", users: 2400, books: 950, downloads: 15000 },
  { name: "Wed", users: 2200, books: 1100, downloads: 18000 },
  { name: "Thu", users: 2800, books: 1234, downloads: 22000 },
  { name: "Fri", users: 2600, books: 1150, downloads: 25000 },
  { name: "Sat", users: 3100, books: 1300, downloads: 32000 },
  { name: "Sun", users: 2847, books: 1234, downloads: 45892 },
];

export const CATEGORIES = [
  { id: 1, name: "Technology", count: 128, icon: "Tech" },
  { id: 2, name: "Novel", count: 156, icon: "Bookopen" },
  { id: 3, name: "Education", count: 89, icon: "GraduationCap" },
  { id: 4, name: "Business", count: 72, icon: "Briefcase" },
  { id: 5, name: "History", count: 78, icon: "Landmark" },
];

export const ACTIVITY_LOGS = [
  { time: "14:32:01", type: "INFO", msg: "User #1234 logged in from 192.168.1.1" },
  { time: "14:31:58", type: "BOOK", msg: 'Book "Space Odyssey 2050" approved by admin' },
  { time: "14:31:45", type: "WARN", msg: "High memory usage detected: 78%" },
  { time: "14:31:20", type: "INFO", msg: "New user registration: emma@example.com" },
  { time: "14:31:05", type: "ERROR", msg: "Failed API call to Gutenberg: Timeout" },
  { time: "14:30:52", type: "INFO", msg: "327 API requests served in last minute" },
  { time: "14:30:40", type: "INFO", msg: "Database backup completed successfully" },
];

export const DEMO_AUTH_USERS = [
  { id: "d_admin", name: "Demo Admin", email: "admin@bookhub.dev", password: "admin123", role: "Admin" },
  { id: "d_author", name: "Demo Author", email: "author@bookhub.dev", password: "author123", role: "Author" },
  { id: "d_reader", name: "Demo Reader", email: "reader@bookhub.dev", password: "reader123", role: "Reader" },
];
