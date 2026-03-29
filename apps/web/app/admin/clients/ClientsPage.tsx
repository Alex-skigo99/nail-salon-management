"use client";

import { useState, useCallback } from "react";
import { Contact, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useUsers } from "@/hooks/useUsers";
import type { UseUsersParams } from "@/hooks/useUsers";
import { useMasters } from "@/hooks/useMasters";
import type { UserListItem } from "@/types/userTypes";
import GeneralTable from "@/components/tables/GeneralTable";
import { usersColumns } from "./_components/usersColumns";
import { UsersSearchFilterSection } from "./_components/UsersSearchFilterSection";
import { UserDataModal } from "@/components/modals/userDataModal/UserDataModal";
import { UserCreateUpdateDialog } from "@/components/modals/userCreateUpdateDialog/UserCreateUpdateDialog";
import { HistoryUserApptsModal } from "@/components/modals/historyUserApptsModal/HistoryUserApptsModal";
import type { Row, PaginationState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ClientsPage() {
  const [filterParams, setFilterParams] = useState<UseUsersParams>({ sort: "name" });
  const { data: session } = useSession();
  const isMobile = useIsMobile();

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleFilterChange = useCallback((params: UseUsersParams) => {
    setFilterParams(params);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const { data, isLoading, error } = useUsers(
    { ...filterParams, page: pagination.pageIndex + 1, perPage: pagination.pageSize },
    !!session?.user?.id
  );
  const { data: masters = [] } = useMasters(!!session?.user?.id);

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyUserId, setHistoryUserId] = useState<string | null>(null);
  const [historyUserName, setHistoryUserName] = useState<string>("");

  const handleRowClick = useCallback((row: Row<UserListItem>) => {
    setSelectedUserId(row.original.id);
    setViewModalOpen(true);
  }, []);

  const handleAddUser = useCallback(() => {
    setEditUserId(null);
    setFormDialogOpen(true);
  }, []);

  const handleEditFromModal = useCallback(() => {
    setViewModalOpen(false);
    setEditUserId(selectedUserId);
    setFormDialogOpen(true);
  }, [selectedUserId]);

  const handleApptsClick = useCallback((userId: string, userName: string) => {
    setHistoryUserId(userId);
    setHistoryUserName(userName);
    setHistoryModalOpen(true);
  }, []);

  const handleApptsFromModal = useCallback(() => {
    if (!selectedUserId) return;
    const user = data?.data?.find((u) => u.id === selectedUserId);
    setHistoryUserId(selectedUserId);
    setHistoryUserName(user?.name ?? "");
    setHistoryModalOpen(true);
  }, [selectedUserId, data?.data]);

  const columns = usersColumns(masters, handleApptsClick);

  return (
    <div className={cn("flex flex-1 flex-col", { "overflow-hidden": !isMobile })}>
      <div className={cn("border-b px-6 py-5", { "border-b-0 py-2": isMobile })}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Contact className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Clients</h1>
              {!isMobile && <p className="text-muted-foreground text-sm">Manage users and their accounts</p>}
            </div>
          </div>
          <Button onClick={handleAddUser} size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className={cn("flex-1 p-6", { "px-0 py-2": isMobile })}>
        <UsersSearchFilterSection params={filterParams} onChange={handleFilterChange} masters={masters} />

        {error ? (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
            <p className="text-destructive font-medium">Failed to load users</p>
            <p className="text-muted-foreground text-sm">Please try refreshing the page</p>
          </div>
        ) : (
          <GeneralTable<UserListItem, UserListItem, unknown>
            columns={columns}
            data={data?.data ?? []}
            isPending={isLoading}
            handleRowClick={handleRowClick}
            customNoResultsMessage="No users found"
            isPaginationNeeded
            pagination={pagination}
            setPagination={setPagination}
            totalRows={data?.pagination?.total ?? 0}
          />
        )}
      </div>

      <UserDataModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        userId={selectedUserId}
        onEdit={handleEditFromModal}
        onApptsClick={handleApptsFromModal}
      />

      <UserCreateUpdateDialog open={formDialogOpen} onOpenChange={setFormDialogOpen} userId={editUserId} />

      <HistoryUserApptsModal
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
        userId={historyUserId}
        userName={historyUserName}
      />
    </div>
  );
}
