import { apiRequest, setAccessToken } from "./client";

type RpSignatureResponse = {
  sig: string;
  nonce: string;
  created_at: number;
  expires_at: number;
};

type WorldIdAuthResponse = {
  user_id: string;
  access_token: string;
  is_new_user: boolean;
};

export async function getRpSignature(
  action: string = "verify-blink-user",
): Promise<RpSignatureResponse> {
  return apiRequest<RpSignatureResponse>("/api/worldid/rp-signature", {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}

export async function verifyAndAuthenticate(
  idkitResponse: unknown,
): Promise<WorldIdAuthResponse> {
  const result = await apiRequest<WorldIdAuthResponse>("/api/worldid/verify", {
    method: "POST",
    body: JSON.stringify({ idkit_response: idkitResponse }),
  });
  setAccessToken(result.access_token);
  return result;
}
