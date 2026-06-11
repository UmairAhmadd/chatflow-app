"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  MessagesSquare,
  Inbox,
  Users,
  FileEdit,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChatStore } from "@/lib/store";
import { Avatar } from "@/components/ui/Avatar";

export type SidebarView = "inbox" | "contacts" | "drafts";

export function Sidebar({
  view,
  onView,
  onContacts,
  className,
}: {
  view: SidebarView;
  onView: (v: SidebarView) => void;
  onContacts: () => void;
  className?: string;
}) {
  const router = useRouter();
  const currentUser = useChatStore((s) => s.currentUser);

  const NavBtn = ({
    icon: Icon,
    active,
    onClick,
    label,
  }: {
    icon: any;
    active?: boolean;
    onClick: () => void;
    label: string;
  }) => (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        // min 44px touch target on every viewport
        "flex h-11 w-11 items-center justify-center rounded-xl transition",
        active
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:text-zinc-500 dark:hover:bg-surfaceHover dark:hover:text-zinc-200"
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );

  return (
    <aside
      className={cn(
        // Mobile: fixed bottom bar, horizontal, full width.
        "fixed inset-x-0 bottom-0 z-30 flex h-16 w-full flex-row items-center justify-around border-t border-gray-200 bg-white px-2 dark:border-border dark:bg-surface",
        // Desktop: static vertical column on the left.
        "lg:static lg:h-full lg:w-[68px] lg:flex-col lg:justify-start lg:gap-1 lg:border-r lg:border-t-0 lg:px-0 lg:py-4",
        className
      )}
    >
      {/* Logo — desktop only */}
      <div className="mb-3 hidden h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 lg:flex">
        <MessagesSquare className="h-5 w-5 text-white" />
      </div>

      <NavBtn
        icon={Inbox}
        label="Inbox"
        active={view === "inbox"}
        onClick={() => onView("inbox")}
      />
      <NavBtn
        icon={Users}
        label="Contacts"
        active={view === "contacts"}
        onClick={onContacts}
      />
      <NavBtn
        icon={FileEdit}
        label="Drafts"
        active={view === "drafts"}
        onClick={() => onView("drafts")}
      />
      <NavBtn
        icon={Settings}
        label="Settings"
        onClick={() => router.push("/profile")}
      />

      {/* Profile + sign out. Inline on mobile, pinned to bottom on desktop. */}
      <div className="flex flex-row items-center gap-1 lg:mt-auto lg:flex-col lg:gap-2">
        <button
          onClick={() => router.push("/profile")}
          title="Profile"
          aria-label="Profile"
          className="flex h-11 w-11 items-center justify-center"
        >
          <Avatar
            src={currentUser?.avatar}
            name={currentUser?.name}
            size={34}
          />
        </button>
        <NavBtn
          icon={LogOut}
          label="Sign out"
          onClick={() => signOut({ callbackUrl: "/login" })}
        />
      </div>
    </aside>
  );
}
