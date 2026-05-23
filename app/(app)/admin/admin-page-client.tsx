"use client";

import { useState } from "react";
import { AgGridUsers } from "./ag-grid-users";
import { UserCreatePanel } from "./user-create-panel";

export function AdminPageClient({
  isSuperAdmin,
  currentUserId,
  userRole,
}: {
  isSuperAdmin: boolean;
  currentUserId: string;
  userRole: string;
}) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <>
      <div className="flex justify-end mb-4">
        <UserCreatePanel
          userRole={userRole}
          onSuccess={() => setRefreshTrigger((t) => t + 1)}
        />
      </div>
      <AgGridUsers
        isSuperAdmin={isSuperAdmin}
        currentUserId={currentUserId}
        refreshTrigger={refreshTrigger}
      />
    </>
  );
}
