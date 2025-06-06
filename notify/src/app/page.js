"use client";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { FaBell } from "react-icons/fa";
import {
  createPosts,
  createUsers,
  getPosts,
  getUserFollowers,
  followUser,
} from "../../services/postService";

export default function Home() {
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [follow, setFollow] = useState([]);

  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [userId, setUserId] = useState(null);
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(false);
  const [socket, setSocket] = useState(null);
  const bellRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    //iifi for async
    (async () => {
      let allposts = await getPosts(1);
      setPosts(allposts);
      let userid = localStorage.getItem("userId");
      setUserId(userid);
      if (userid) {
        const { allfollowers, allNonfollowers } = await getUserFollowers(
          userid
        );
        setFollowers(allfollowers);
        setFollow(allNonfollowers);
      }
    })();
  }, []);

  useEffect(() => {
    if (userId) {
      const newSocket = io(process.env.NEXT_PUBLIC_API_BASE_URL);
      setSocket(newSocket);
      //  Clean up the socket connection when the component unmounts
      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [userId]); //  Dependency on userId.  Reconnect if it changes.

  useEffect(() => {
    if (socket) {
      //  Listen for 'notification' events
      socket.on("new-post:" + userId, (notification) => {
        setUnreadNotifications((prevNotifications) => [
          notification,
          ...prevNotifications,
        ]);
      });
      //  Remove the event listener when the socket disconnects or the component unmounts
      return () => {
        socket.off(userId);
      };
    }
  }, [socket, userId]);

  const handlePost = async () => {
    if (!userId) {
      setModal(true);
    }
    if (title.trim() && description.trim()) {
      const newPost = {
        userId,
        title: title.trim(),
        description: description.trim(),
        created_at: new Date().toISOString(),
      };
      setPosts((prev) => [newPost, ...prev]);
      await createPosts(newPost);
      setTitle("");
      setDescription("");
    }
  };

  const handleFetchNotifications = () => {
    setNotifications((prevNotifications) => [
      unreadNotifications,
      ...prevNotifications,
    ]);
    setOpen(!open);
    setUnreadNotifications([]);
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleFollow = async (user) => {
    setFollow((prev) => prev.filter((follower) => follower.id !== user.id));
    await followUser({
      userId: user.id,
      followerId: userId,
      name: user.name || user.email.split("@")[0],
      email:user.email,
    });
  };

  const handleLogin = async () => {
    if (email.trim()) {
      let user = await createUsers({
        email: email.trim(),
      });
      if (user?.id) {
        const { allfollowers, allNonfollowers } = await getUserFollowers(
          user?.id
        );
        setFollowers(allfollowers);
        setFollow(allNonfollowers);
        setUserId(user.id);
        localStorage.setItem("userId", user?.id);
        setModal(false);
      }
    }
  };

  return (
    <>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-500 p-4 border-r border-gray-600">
          <div className="pb-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">
              Followers ({followers.length})
            </h2>
            <ul className="space-y-3">
              {followers.map((f) => (
                <li
                  key={f.id + f.name + f.email}
                  className="flex items-center space-x-2"
                >
                  <img
                    src={f.avatar || "/avatar1.png"}
                    alt={f.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{f.name || f.email.split("@")[0]}</span>
                </li>
              ))}
            </ul>
          </div>
          <hr />
          <div className="pt-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-200">
              People you may know
            </h2>
            <ul className="space-y-3">
              {follow.map((f) => (
                <li
                  key={f.id + f.name + f.email}
                  className="flex items-center space-x-2"
                >
                  <img
                    src={f.avatar || "/avatar1.png"}
                    alt={f.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span>{f.name || f.email.split("@")[0]}</span>
                  <button
                    onClick={() => handleFollow(f)}
                    className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
                  >
                    Follow
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-200">Notify Works</h1>
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => handleFetchNotifications()}
                className="relative text-gray-400 focus:outline-none cursor-pointer"
              >
                <FaBell size={24} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-0 right-0 text-xs bg-red-500 text-white rounded-full px-1">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg z-50">
                  <div className="p-4 font-semibold border-b text-gray-600">
                    Notifications
                  </div>
                  <ul className="divide-y max-h-72 overflow-y-auto">
                    {notifications.length === 0 && (
                      <li className="p-4 text-sm text-gray-500 text-center">
                        No new notifications
                      </li>
                    )}
                    {notifications.map((notif) => (
                      <li
                        key={JSON.stringify(notif)}
                        className="p-4 hover:bg-gray-100 cursor-pointer"
                      >
                        <p className="font-semibold">{notif.title}</p>
                        <span className="text-xs text-gray-400">
                          {new Date().toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full border border-gray-300 p-2 rounded"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full border border-gray-300 p-2 rounded h-24"
            />
            <button
              onClick={handlePost}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
            >
              Post
            </button>
          </div>

          {/* Notification Feed */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2 text-gray-400">
              Live Feed
            </h2>
            <ul className="space-y-2">
              {posts.map((n) => (
                <li
                  key={n.id + n.created_at}
                  className="border p-3 rounded shadow-sm text-gray-400"
                >
                  <strong>{n.title}</strong>
                  <p>{n.description}</p>
                  <span className="text-sm text-gray-500">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
      {modal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-gray-200 p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-gray-600">
              Subscribe
            </h2>
            <p className="mb-4 text-gray-600">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Please enter your email"
                className="w-full border border-gray-300 p-2 rounded"
              />
            </p>
            {!validateEmail(email) && email.length > 0 && (
              <p className="text-red-500 text-sm">Enter a valid email.</p>
            )}
            <button
              disabled={!validateEmail(email)}
              onClick={handleLogin}
              className={`text-white px-4 py-2 rounded cursor-pointer ${
                !validateEmail(email)
                  ? "bg-gray-400"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              Subscribe
            </button>
          </div>
        </div>
      )}
    </>
  );
}
