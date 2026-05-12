import { useEffect, useState } from "react";
import { staffMembers as fallbackStaffMembers, students as fallbackStudents } from "./adminData";
import { fetchAdminDirectoryData } from "./adminApi";

export function useAdminDirectoryData() {
  const [students, setStudents] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function loadDirectory() {
      try {
        setLoading(true);
        setError("");

        const data = await fetchAdminDirectoryData();

        if (isCancelled) return;

        setStudents(data.students);
        setStaffMembers(data.staffMembers);
      } catch (requestError) {
        if (isCancelled) return;
        setError(requestError instanceof Error ? requestError.message : "Unable to load admin data");
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadDirectory();

    return () => {
      isCancelled = true;
    };
  }, [reloadCount]);

  function refresh() {
    setReloadCount((value) => value + 1);
  }

  return {
    students: error ? fallbackStudents : students,
    staffMembers: error ? fallbackStaffMembers : staffMembers,
    loading,
    error,
    usingFallbackData: Boolean(error),
    refresh,
  };
}
