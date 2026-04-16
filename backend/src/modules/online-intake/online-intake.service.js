const { sequelize } = require("../../../models");
const repository = require("./online-intake.repository");
const enrollmentsService = require("../enrollments/enrollments.service");

function normalizeStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (!normalized) return null;
  return normalized;
}

function ensureMappedPayload(mappedPayload) {
  if (!mappedPayload || typeof mappedPayload !== "object") {
    const error = new Error("mapped_payload is required for create approval");
    error.status = 400;
    throw error;
  }

  if (!mappedPayload.enrollment_type || !mappedPayload.student) {
    const error = new Error("mapped_payload must include enrollment_type and student");
    error.status = 400;
    throw error;
  }
}

function markSourceFields(studentPayload = {}, source, externalRef) {
  return {
    ...studentPayload,
    source_channel: source,
    external_source: source,
    external_student_ref: externalRef,
  };
}

async function listQueue(params = {}) {
  const limit = Math.min(200, Math.max(1, Number(params.limit || 100)));
  return repository.listQueue({
    source: params.source || null,
    status: normalizeStatus(params.status),
    limit,
  });
}

async function manualIngest(payload, user) {
  const transaction = await sequelize.transaction();

  try {
    const results = [];

    for (const item of payload.applications) {
      const existing = await repository.findQueueBySourceAndRef(payload.source, item.external_ref, transaction);

      if (existing) {
        const updated = await repository.updateQueue(
          existing,
          {
            raw_payload: item.raw_payload || existing.raw_payload,
            mapped_payload: item.mapped_payload || existing.mapped_payload,
            import_status: existing.import_status === "created_new" || existing.import_status === "matched_existing"
              ? existing.import_status
              : "for_review",
            error_message: null,
          },
          transaction
        );
        results.push({ id: updated.id, external_ref: item.external_ref, action: "updated" });
      } else {
        const created = await repository.createQueue(
          {
            source: payload.source,
            external_ref: item.external_ref,
            raw_payload: item.raw_payload || {},
            mapped_payload: item.mapped_payload || null,
            import_status: "for_review",
            reviewed_by_user_id: null,
            reviewed_at: null,
            error_message: null,
          },
          transaction
        );
        results.push({ id: created.id, external_ref: item.external_ref, action: "created" });
      }
    }

    await transaction.commit();
    return {
      source: payload.source,
      total: results.length,
      items: results,
      ingestedBy: user?.id || null,
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function approveMatch(id, payload, user) {
  const transaction = await sequelize.transaction();

  try {
    const queueItem = await repository.findQueueById(id, transaction);
    if (!queueItem) {
      const error = new Error("Online intake queue item not found");
      error.status = 404;
      throw error;
    }

    const student = await repository.findStudentById(payload.student_id, transaction);
    if (!student) {
      const error = new Error("Student not found");
      error.status = 404;
      throw error;
    }

    await repository.updateStudent(
      student,
      {
        source_channel: queueItem.source,
        external_source: queueItem.source,
        external_student_ref: queueItem.external_ref,
      },
      transaction
    );

    const reviewMeta = {
      ...(queueItem.mapped_payload || {}),
      review: {
        action: "matched_existing",
        student_id: student.id,
        reviewer_note: payload.reviewer_note || null,
      },
    };

    const updatedQueue = await repository.updateQueue(
      queueItem,
      {
        import_status: "matched_existing",
        mapped_payload: reviewMeta,
        reviewed_by_user_id: user?.id || null,
        reviewed_at: new Date(),
        error_message: null,
      },
      transaction
    );

    await transaction.commit();
    return { item: updatedQueue, studentId: student.id };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function approveCreate(id, payload, user) {
  const queueItem = await repository.findQueueById(id);
  if (!queueItem) {
    const error = new Error("Online intake queue item not found");
    error.status = 404;
    throw error;
  }

  const mappedPayload = payload.override_mapped_payload || queueItem.mapped_payload;
  ensureMappedPayload(mappedPayload);

  const enrollmentPayload = {
    ...mappedPayload,
    student: markSourceFields(mappedPayload.student || {}, queueItem.source, queueItem.external_ref),
    enrollment: {
      ...(mappedPayload.enrollment || {}),
      enrollment_channel: queueItem.source,
      external_application_ref: queueItem.external_ref,
    },
  };

  let createdEnrollment;
  try {
    createdEnrollment = await enrollmentsService.addEnrollment(enrollmentPayload);
  } catch (error) {
    await repository.updateQueue(
      queueItem,
      {
        import_status: "error",
        reviewed_by_user_id: user?.id || null,
        reviewed_at: new Date(),
        error_message: error.message || "Failed to create enrollment from mapped payload",
      }
    );
    throw error;
  }

  const reviewMeta = {
    ...(queueItem.mapped_payload || {}),
    review: {
      action: "created_new",
      enrollment_id: createdEnrollment?.id || null,
      reviewer_note: payload.reviewer_note || null,
    },
  };

  const updatedQueue = await repository.updateQueue(
    queueItem,
    {
      import_status: "created_new",
      mapped_payload: reviewMeta,
      reviewed_by_user_id: user?.id || null,
      reviewed_at: new Date(),
      error_message: null,
    }
  );

  return {
    item: updatedQueue,
    enrollmentId: createdEnrollment?.id || null,
  };
}

module.exports = {
  listQueue,
  manualIngest,
  approveMatch,
  approveCreate,
};
