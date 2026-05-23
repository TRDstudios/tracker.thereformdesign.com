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
      <UserCreatePanel
        userRole={userRole}
        onSuccess={() => setRefreshTrigger((t) => t + 1)}
      />
      <AgGridUsers
        isSuperAdmin={isSuperAdmin}
        currentUserId={currentUserId}
        refreshTrigger={refreshTrigger}
      />
    </>
  );
}
