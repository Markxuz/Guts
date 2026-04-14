import { useQuery } from "@tanstack/react-query";
import { resourceServices } from "../../../services/resources";

async function fetchSchedulePdcLaterEnrollments() {
  const enrollments = await resourceServices.enrollments.list();

  // Filter for promo enrollments with PDC intentionally scheduled later.
  // Current API marks promo enrollments using promo_package_id/promoPackage,
  // while older keys like enrollment_type and Schedule are no longer present.
  return (Array.isArray(enrollments) ? enrollments : []).filter((enrollment) => {
    const isPromo = Boolean(enrollment?.promo_package_id || enrollment?.promoPackage?.id);
    const hasPdcLater = enrollment?.pdc_start_mode === "later";
    const isPendingPdcSchedule = String(enrollment?.enrollment_state || "") === "pdc_pending_schedule";
    const isNotCompleted = String(enrollment?.status || "") !== "completed";
    const hasNoLinkedSchedule = !enrollment?.schedule_id;

    return isPromo
      && hasPdcLater
      && isNotCompleted
      && hasNoLinkedSchedule
      && (isPendingPdcSchedule || !enrollment?.pdc_eligibility_date);
  });
}

export function useSchedulePdcLaterEnrollments() {
  return useQuery({
    queryKey: ["enrollments", "schedule-pdc-later"],
    queryFn: fetchSchedulePdcLaterEnrollments,
    staleTime: 30000,
  });
}
