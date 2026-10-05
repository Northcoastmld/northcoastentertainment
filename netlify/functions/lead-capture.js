import { getStore } from "@netlify/blobs";

const json = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  body: JSON.stringify(body)
});

export default async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  let data;
  try { data = JSON.parse(event.body || "{}"); }
  catch { return json(400, { error: "Invalid request" }); }

  if (String(data["bot-field"] || "").trim()) return json(400, { error: "Spam detected" });

  const name = String(data.name || "").trim().slice(0, 120);
  const phone = String(data.phone || "").trim().slice(0, 60);
  const email = String(data.email || "").trim().slice(0, 160);
  const service = String(data.service || "").trim().slice(0, 160);
  const message = String(data.message || "").trim().slice(0, 5000);

  if (!name || !phone || !message) return json(400, { error: "Name, phone and project details are required." });
  if (message.length < 8) return json(400, { error: "Please provide a little more project detail." });
  if (email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return json(400, { error: "Please enter a valid email address." });

  const id = "NC-" + Date.now().toString(36).toUpperCase();
  const lead = {
    id, source: "northcoast-web", status: "NEW",
    created_at: new Date().toISOString(),
    data: { name, phone, email, service, message }
  };

  const store = getStore("northcoast-leads");
  await store.setJSON(id, lead);

  return json(200, { ok: true, id, message: "Enquiry received" });
};