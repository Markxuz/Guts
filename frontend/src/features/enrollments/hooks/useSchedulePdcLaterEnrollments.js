import { useQuery } from "@tanstack/react-query";
import { resourceServices } from "../../../services/resources";

import { useAuth } from "../../auth/hooks/useAuth";

async function fetchSchedulePdcLaterEnrollments() {
  const enrollments = await resourceServices.enrollments.list();

  // Filter for promo enrollments with PDC intentionally scheduled later.
  // Include enrollments that are not still 'pending' (e.g. confirmed/active/completed)
  return (Array.isArray(enrollments) ? enrollments : []).filter((enrollment) => {
    const isPromo = Boolean(enrollment?.promo_package_id || enrollment?.promoPackage?.id);
    const hasPdcLater = enrollment?.pdc_start_mode === "later";
    const isPendingPdcSchedule = String(enrollment?.enrollment_state || "") === "pdc_pending_schedule";
    const hasBeenProcessed = String(enrollment?.status || "") !== "pending";

    return isPromo && hasPdcLater && hasBeenProcessed && (isPendingPdcSchedule || !enrollment?.pdc_eligibility_date);
  });
}

export function useSchedulePdcLaterEnrollments() {
  const { auth } = useAuth();
  const role = auth?.user?.role;

  return useQuery({
    queryKey: ["enrollments", "schedule-pdc-later"],
    queryFn: async () => {
      const list = await fetchSchedulePdcLaterEnrollments();
      // If user is staff, only show enrollments that have been confirmed by admin/sub_admin.
      if (role === "staff") {
        return list.filter((e) => String(e?.status || "") === "confirmed");
      }
      return list;
    },
    staleTime: 30000,
  });
}

