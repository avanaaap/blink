import { useState, useCallback } from "react";
import { IDKit, orbLegacy } from "@worldcoin/idkit-core";
import { getRpSignature, verifyAndAuthenticate } from "../api/worldid-api";

const APP_ID = import.meta.env.VITE_WORLDID_APP_ID ?? "";
const RP_ID = import.meta.env.VITE_WORLDID_RP_ID ?? "";
const ACTION = "verify-blink-user";

type VerifyState = {
  status: "idle" | "signing" | "waiting" | "verifying" | "success" | "error";
  error: string | null;
  isNewUser: boolean | null;
  userId: string | null;
  connectUrl: string | null;
};

export function useWorldIdVerify() {
  const [state, setState] = useState<VerifyState>({
    status: "idle",
    error: null,
    isNewUser: null,
    userId: null,
    connectUrl: null,
  });

  const verify = useCallback(async () => {
    try {
      setState({ status: "signing", error: null, isNewUser: null, userId: null, connectUrl: null });

      // 1. Get RP signature from our backend
      const rpSig = await getRpSignature(ACTION);

      // 2. Create IDKit request — this gives us a QR code URL
      const request = await IDKit.request({
        app_id: APP_ID,
        action: ACTION,
        rp_context: {
          rp_id: RP_ID,
          nonce: rpSig.nonce,
          created_at: rpSig.created_at,
          expires_at: rpSig.expires_at,
          signature: rpSig.sig,
        },
        allow_legacy_proofs: true,
        environment: "production",
        return_to: "blink://verify-done",
      }).preset(orbLegacy());

      // Show the QR code to the user
      setState((prev) => ({
        ...prev,
        status: "waiting",
        connectUrl: request.connectorURI,
      }));

      // 3. Wait for user to scan QR and complete verification
      const idkitResponse = await request.pollUntilCompletion();

      setState((prev) => ({ ...prev, status: "verifying", connectUrl: null }));

      // 4. Send proof to our backend — it verifies, creates/finds user, returns JWT
      const authResult = await verifyAndAuthenticate(idkitResponse);

      setState({
        status: "success",
        error: null,
        isNewUser: authResult.is_new_user,
        userId: authResult.user_id,
        connectUrl: null,
      });

      return authResult;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Verification failed";
      setState({ status: "error", error: message, isNewUser: null, userId: null, connectUrl: null });
      return null;
    }
  }, []);

  return { ...state, verify };
}
