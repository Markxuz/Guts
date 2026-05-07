const BASE_URL = "http://localhost:8080";
const ADMIN_EMAIL = "admin@guts.local";
const ADMIN_PASSWORD = "ChangeMe!Admin123";
const PRESET_QR_TOKEN = process.env.QR_TOKEN || "";

async function jsonRequest(url, options = {}) {
  const { headers: optionHeaders, ...restOptions } = options;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(optionHeaders || {}),
    },
    ...restOptions,
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(body)}`);
  }

  return body;
}

async function main() {
  const login = await jsonRequest(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });

  let qrCode = null;
  if (PRESET_QR_TOKEN) {
    qrCode = { token: PRESET_QR_TOKEN };
  } else {
    const existingQRCodes = await jsonRequest(`${BASE_URL}/api/admin/qrcodes`, {
      headers: {
        Authorization: `Bearer ${login.token}`,
      },
    });

    if (Array.isArray(existingQRCodes) && existingQRCodes.length > 0) {
      qrCode = existingQRCodes[0];
    } else {
      qrCode = await jsonRequest(`${BASE_URL}/api/admin/qrcodes`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${login.token}`,
        },
        body: JSON.stringify({
          name: `Playwright QR ${new Date().toISOString()}`,
          template: {
            enrollment_type: "PROMO",
          },
        }),
      });
    }
  }

  const submit = await jsonRequest(`${BASE_URL}/api/enroll/submit`, {
    method: "POST",
    body: JSON.stringify({
      token: qrCode.token,
      data: {
        enrollment_type: "PROMO",
        student: {
          first_name: "JOEFREY",
          middle_name: "BUBAN",
          last_name: "SACAY",
          email: "joefrey.sacay.playwright@example.com",
          phone: "09171234567",
        },
        profile: {
          gmail_account: "joefrey.sacay.playwright@gmail.com",
          house_number: "12",
          street: "Mabini St",
          barangay: "San Isidro",
          city: "Cebu City",
          province: "Cebu",
        },
        enrollment: {
          enrollment_channel: "qr_public",
          pdc_category: "beginner",
          fee_amount: 12000,
          discount_amount: 0,
          payment_terms: "cash",
          status: "pending",
          pdc_start_mode: "later",
          tdc_source: "guts",
        },
        promo_schedule: {
          enabled: true,
          tdc: {
            schedule_date: "2026-05-20",
            slot: "morning",
            instructor_id: null,
            care_of_instructor_id: null,
          },
          pdc: {
            enabled: true,
            schedule_date: "2026-06-01",
            slot: "morning",
            instructor_id: null,
            care_of_instructor_id: null,
          },
        },
      },
    }),
  });

  console.log(JSON.stringify({ qrCode, submit }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});