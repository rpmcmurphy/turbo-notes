const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const error = await res
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "API Error");
  }

  return res.json();
}

export async function uploadFile(file: File) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/attachments/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}
