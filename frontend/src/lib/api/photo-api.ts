import { config } from "../config";
import { getAccessToken } from "./client";

export type Photo = {
  id: string;
  user_id: string;
  url: string;
  caption: string | null;
  sort_order: number;
};

export async function listMyPhotos(): Promise<Photo[]> {
  const token = getAccessToken();
  const res = await fetch(`${config.apiBaseUrl}/api/photos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to load photos");
  return res.json();
}

export async function uploadPhoto(
  file: File,
  sortOrder: number,
  caption: string = "",
): Promise<Photo> {
  const token = getAccessToken();
  const form = new FormData();
  form.append("file", file);
  form.append("sort_order", String(sortOrder));
  form.append("caption", caption);

  const res = await fetch(`${config.apiBaseUrl}/api/photos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to upload photo");
  }
  return res.json();
}

export async function deletePhoto(photoId: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${config.apiBaseUrl}/api/photos/${photoId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to delete photo");
}
