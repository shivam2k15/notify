let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const followUser = async (payload) => {
  const res = await fetch(baseUrl + "/user/follow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create follower");
  return res.json();
};

export const getNotifications = async () => {
  const res = await fetch(baseUrl + "/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

export const getPosts = async (page) => {
  const res = await fetch(baseUrl + "/post/" + page);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export const getUserFollowers = async (userId) => {
  const res = await fetch(baseUrl + "/user/" + userId);
  if (!res.ok) throw new Error("Failed to fetch user followers");
  return res.json();
};

export const createUsers = async (payload) => {
  const res = await fetch(baseUrl + "/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
};

export const createPosts = async (payload) => {
  const res = await fetch(baseUrl + "/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
};

export const updateNotification = async (notificationId) => {
  const res = await fetch(baseUrl + "/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationId }),
  });
  if (!res.ok) throw new Error("Failed to update notification");
  return res.json();
};
