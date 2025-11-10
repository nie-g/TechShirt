import { useUser, UserButton } from "@clerk/clerk-react";

export default function UsersNavbar() {
  const { user } = useUser();

  const fullName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.fullName || "Client";

  const role = (user?.unsafeMetadata?.userType as string) || "client";

  return (
    <nav className="sticky top-0 flex justify-between items-center bg-white shadow-md px-6 py-4 z-10">
      {/* Left filler to maintain layout */}
      <div className="w-6" />

      {/* Center: App Logo */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-xl font-bold text-gray-800">TechShirt</h1>
      </div>

      {/* Right: User Info */}
      <div className="flex items-center space-x-3">
        
        {/* Hide text on mobile */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-gray-700 font-medium">{fullName}</span>
          <span className="text-xs text-teal-600 font-semibold">
            {role.toUpperCase()}
          </span>
        </div>

        {/* Clerk Avatar */}
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
              userButtonPopoverCard: "max-w-xs",
              userButtonPopoverFooter: "hidden",
            },
          }}
        />
      </div>
    </nav>
  );
}
