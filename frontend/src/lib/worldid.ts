/**
 * World ID (IDKit) integration placeholder.
 *
 * Install the IDKit React SDK when ready:
 *   npm install @worldcoin/idkit
 *
 * Usage example (in a React component):
 *
 *   import { IDKitWidget, type ISuccessResult } from "@worldcoin/idkit";
 *
 *   const handleVerify = async (result: ISuccessResult) => {
 *     // Send proof to backend for off-chain verification
 *     await fetch("/api/verify", {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json" },
 *       body: JSON.stringify(result),
 *     });
 *   };
 *
 *   <IDKitWidget
 *     app_id={import.meta.env.VITE_WORLDID_APP_ID}
 *     action={import.meta.env.VITE_WORLDID_ACTION}
 *     onSuccess={handleVerify}
 *   >
 *     {({ open }) => <button onClick={open}>Verify with World ID</button>}
 *   </IDKitWidget>
 */

export const WORLDID_APP_ID = import.meta.env.VITE_WORLDID_APP_ID ?? "";
export const WORLDID_ACTION = import.meta.env.VITE_WORLDID_ACTION ?? "";
