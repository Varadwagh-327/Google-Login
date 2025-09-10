"use client";

import React, { JSX, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineShoppingCart,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineHome,
} from "react-icons/hi";
import { FiSearch } from "react-icons/fi";

/* -------------------------
   Mock data (replace with API responses)
------------------------- */
const METRICS = [
  { id: "users", title: "Active Users", value: "12.4k", delta: "+4.2%", icon: HiOutlineUsers },
  { id: "revenue", title: "Monthly Revenue", value: "$48.2k", delta: "+6.8%", icon: HiOutlineChartBar },
  { id: "orders", title: "Orders", value: "1.9k", delta: "-1.4%", icon: HiOutlineShoppingCart },
  { id: "conv", title: "Conversion", value: "3.8%", delta: "+0.5%", icon: HiOutlineChartBar },
];

const SPARK_DATA = [12, 18, 9, 24, 16, 28, 22, 30, 26, 32, 28];

const RECENT_ORDERS = [
  { id: "#A2301", customer: "Anita Sharma", amount: "$420", status: "Completed" },
  { id: "#A2300", customer: "Ravi Patel", amount: "$220", status: "Pending" },
  { id: "#A2299", customer: "Sneha K.", amount: "$86", status: "Cancelled" },
];

const ACTIVITY = [
  { id: 1, who: "Anita Sharma", action: "Created order #A2301", when: "2h ago" },
  { id: 2, who: "Ravi Patel", action: "Updated product SKU-223", when: "4h ago" },
  { id: 3, who: "Sneha K.", action: "Added new user account", when: "Yesterday" },
];

/* -------------------------
   Small reusable components
------------------------- */
function Sparkline({ data, width = 220, height = 60 }: { data: number[]; width?: number; height?: number }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / (max - min || 1)) * height;
      return `${x},${y}`;
    })
    .join(" ");
  const last = data[data.length - 1];
  const trendPositive = last >= data[0];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={trendPositive ? "#4f46e5" : "#ef4444"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatCard({ title, value, delta, Icon }: { title: string; value: string; delta: string; Icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }) {
  return (
    <motion.div
      style={{ perspective: 1200 }}
      whileHover={{ rotateX: -6, rotateY: 8, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition transform-gpu"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-xs font-medium text-gray-500">{title}</h4>
          <div className="flex items-end gap-3 mt-2">
            <span className="text-2xl font-semibold text-gray-900">{value}</span>
            <span className={`text-sm font-medium ${delta.startsWith("-") ? "text-red-500" : "text-green-600"}`}>{delta}</span>
          </div>
        </div>
        <div className="bg-indigo-50 rounded-lg p-2">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
      </div>
      <div className="mt-3">
        <Sparkline data={SPARK_DATA} width={160} height={36} />
      </div>
    </motion.div>
  );
}

/* -------------------------
   Navbar & Sidebar
------------------------- */
function TopNavbar({ userName, onLogout }: { userName: string; onLogout: () => void }) {
  const [openProfile, setOpenProfile] = useState(false);
  return (
    <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">CS</div>
          <div>
            <div className="text-sm font-semibold text-indigo-700">Consociate</div>
            <div className="text-xs text-gray-500">Admin Dashboard</div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white border px-3 py-1 rounded-lg shadow-sm">
            <FiSearch className="w-4 h-4 text-gray-400" />
            <input placeholder="Search..." className="outline-none text-sm w-56" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-md hover:bg-gray-100">
            <HiOutlineBell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-red-500 rounded-full">3</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setOpenProfile((s) => !s)}
              className="flex items-center gap-3 bg-white border rounded-full px-3 py-1 hover:shadow-sm"
            >
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">V</div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium">{userName}</div>
                <div className="text-xs text-gray-400">Admin</div>
              </div>
            </button>

            <AnimatePresence>
              {openProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => setOpenProfile(false)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50"
                  >
                    Profile
                  </button>
                  <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2">
                    <HiOutlineLogout className="w-4 h-4" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const nav = [
    { id: "home", label: "Overview", Icon: HiOutlineHome },
    { id: "users", label: "Users", Icon: HiOutlineUsers },
    { id: "orders", label: "Orders", Icon: HiOutlineShoppingCart },
    { id: "reports", label: "Reports", Icon: HiOutlineChartBar },
    { id: "settings", label: "Settings", Icon: HiOutlineCog },
  ];
  return (
    <aside className="hidden lg:block lg:col-span-2">
      <nav className="sticky top-20 space-y-3">
        {nav.map((n) => (
          <button
            key={n.id}
            onClick={() => setActive(n.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition ${
              active === n.id ? "bg-indigo-50 border border-indigo-100 shadow-sm" : "hover:bg-gray-50"
            }`}
          >
            <n.Icon className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">{n.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

/* -------------------------
   Admin Dashboard Page
------------------------- */
export default function AdminDashboardPage(): JSX.Element {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<{ name: string; email?: string } | null>(null);
  const [active, setActive] = useState<string>("home");

  // Auth guard + fetch user
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const json = await res.json();
          setUser(json.user || { name: "Varad", email: "admin@company.com" });
        } else {
          setUser({ name: "Varad", email: "admin@company.com" });
        }
      } catch {
        setUser({ name: "Varad", email: "admin@company.com" });
      } finally {
        setChecking(false);
      }
    })();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const metrics = useMemo(() => METRICS, []);
  const recentOrders = useMemo(() => RECENT_ORDERS, []);
  const activity = useMemo(() => ACTIVITY, []);

  if (checking) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white">
        <div className="text-center">
          <div className="mb-4 animate-pulse text-indigo-600 font-semibold">Checking authentication...</div>
          <div className="text-sm text-gray-500">If you are logged in, this will take a second.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar userName={user?.name ?? "Admin"} onLogout={logout} />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Sidebar active={active} setActive={setActive} />

        <main className="lg:col-span-7 space-y-6">
          {/* Welcome */}
          <section className="bg-white rounded-2xl p-6 shadow-md flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name ?? "Admin"} 👋</h1>
              <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your store today.</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Today</div>
                <div className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</div>
              </div>
              <button
                onClick={() => alert("Create quick report")}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700"
              >
                Quick Report
              </button>
            </div>
          </section>

          {/* Metrics */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {metrics.map((m) => (
              <StatCard key={m.id} title={m.title} value={m.value} delta={m.delta} Icon={m.icon} />
            ))}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ rotateX: -4, rotateY: 6 }}
              style={{ perspective: 1200 }}
              className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm text-gray-500">Sales (last 30 days)</h3>
                  <div className="text-2xl font-semibold text-gray-900">$48,240</div>
                </div>
                <div className="text-sm text-green-600">+6.8%</div>
              </div>
              <div className="mt-4">
                <Sparkline data={SPARK_DATA} width={640} height={80} />
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-gray-600">
                <div className="px-3 py-2 bg-indigo-50 rounded-lg">Revenue</div>
                <div className="px-3 py-2 bg-green-50 rounded-lg">Conversion</div>
                <div className="px-3 py-2 bg-yellow-50 rounded-lg">Orders</div>
              </div>
            </motion.div>

            <motion.div whileHover={{ translateY: -6 }} className="bg-white p-5 rounded-2xl shadow-md">
              <h4 className="text-sm text-gray-500">Conversion</h4>
              <div className="mt-2 text-3xl font-semibold">3.8%</div>
              <div className="mt-3 text-xs text-gray-400">Improve product pages to increase conversions.</div>
              <div className="mt-5">
                <div className="text-xs text-gray-500 mb-2">Goal progress</div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "38%" }} />
                </div>
                <div className="text-xs text-gray-400 mt-2">38% of monthly target</div>
              </div>
            </motion.div>
          </section>

          {/* Recent orders */}
          <section className="bg-white p-5 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Orders</h3>
              <div className="text-sm text-indigo-600 cursor-pointer" onClick={() => alert("Go to orders")}>
                View all
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b">
                    <th className="py-3">Order</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Amount</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-gray-50">
                      <td className="py-3">{r.id}</td>
                      <td className="py-3">{r.customer}</td>
                      <td className="py-3">{r.amount}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            r.status === "Completed" ? "bg-green-50 text-green-600" : r.status === "Pending" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <button className="text-indigo-600 hover:underline" onClick={() => alert(`Open ${r.id}`)}>
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>

        <aside className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-2xl shadow-md text-center">
            <h4 className="text-sm text-gray-500">Account</h4>
            <Image src="/images/avatar-placeholder.png" alt="avatar" width={80} height={80} className="rounded-full mx-auto my-3" />
            <div className="font-semibold">{user?.name}</div>
            <div className="text-xs text-gray-400">{user?.email}</div>
            <button onClick={logout} className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg">
              Logout
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md">
            <h4 className="text-sm text-gray-500">Recent Activity</h4>
            <ul className="mt-3 space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{a.who}</div>
                    <div className="text-xs text-gray-500">{a.action}</div>
                  </div>
                  <div className="text-xs text-gray-400">{a.when}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-md">
            <h4 className="text-sm text-gray-500">Shortcuts</h4>
            <div className="mt-3 grid gap-2">
              <button className="px-3 py-2 rounded-lg bg-indigo-50 text-indigo-700">Create Order</button>
              <button className="px-3 py-2 rounded-lg bg-white border">New Product</button>
              <button className="px-3 py-2 rounded-lg bg-white border">Invite Team</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
