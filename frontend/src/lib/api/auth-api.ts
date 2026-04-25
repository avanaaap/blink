/**
 * Auth API — now powered by World ID.
 *
 * Login/signup is handled through the World ID verification flow.
 * See worldid-api.ts and useWorldIdVerify hook.
 */

export { verifyAndAuthenticate as authenticate } from "./worldid-api";
