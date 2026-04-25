import { apiRequest } from "./client";

type RpSignatureResponse = {
  sig: string;
  nonce: string;
  created_at: number;
  expires_at: number;
};

export async function getRpSignature(
  action: string = "verify-blink-user",
): Promise<RpSignatureResponse> {
  return apiRequest<RpSignatureResponse>("/api/worldid/rp-signature", {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export async function verifyProof(
  idkitResponse: unknown,
): Promise<{ success: boolean }> {
  return apiRequest<{ success: boolean }>("/api/worldid/verify-proof", {
    method: "POST",
    body: JSON.stringify({ idkit_response: idkitResponse }),
  });
}
