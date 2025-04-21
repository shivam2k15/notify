export const getNotifications = async () => {
  const res = await fetch("/notifications");
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

export const getPosts = async (page) => {
  const res = await fetch("/post/" + page);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
};

export const getUserFollowers = async (userId) => {
  const res = await fetch("/user/" + userId);
  if (!res.ok) throw new Error("Failed to fetch user followers");
  return res.json();
};

export const createUsers = async (payload) => {
  const res = await fetch("/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
};

export const createPosts = async (payload) => {
  const res = await fetch("/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
};

export const updateNotification = async (notificationId) => {
  const res = await fetch("/notifications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationId }),
  });
  if (!res.ok) throw new Error("Failed to update notification");
  return res.json();
};
