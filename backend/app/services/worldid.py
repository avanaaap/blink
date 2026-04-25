"""
World ID RP request signing — Python port of @worldcoin/idkit-core/signing.

Reproduces the exact same byte-level output as the JS `signRequest()`:
  1. Generate random 32 bytes → keccak256 → shift right 8 bits → 32-byte nonce
  2. Build message: [version(1)][nonce(32)][createdAt(8)][expiresAt(8)][action_hash(32)?]
  3. EIP-191 personal-sign hash of the message
  4. secp256k1 sign → 65-byte compact + recovery id
"""

import os
import struct
import time

from eth_account import Account
from eth_account.messages import encode_defunct
from Crypto.Hash import keccak as keccak_module


def _keccak256(data: bytes) -> bytes:
    h = keccak_module.new(digest_bits=256)
    h.update(data)
    return h.digest()


def _hash_to_field(data: bytes) -> bytes:
    digest = _keccak256(data)
    value = int.from_bytes(digest, "big") >> 8
    return value.to_bytes(32, "big")


RP_SIGNATURE_MSG_VERSION = 1
DEFAULT_TTL_SEC = 300


def sign_rp_request(
    signing_key_hex: str,
    action: str | None = None,
    ttl: int = DEFAULT_TTL_SEC,
) -> dict:
    key_hex = signing_key_hex.removeprefix("0x")

    random_bytes = os.urandom(32)
    nonce_bytes = _hash_to_field(random_bytes)

    created_at = int(time.time())
    expires_at = created_at + ttl

    action_bytes = (
        _hash_to_field(action.encode()) if action is not None else None
    )

    msg_len = 49 + (len(action_bytes) if action_bytes else 0)
    message = bytearray(msg_len)
    message[0] = RP_SIGNATURE_MSG_VERSION
    message[1:33] = nonce_bytes
    struct.pack_into(">Q", message, 33, created_at)
    struct.pack_into(">Q", message, 41, expires_at)
    if action_bytes:
        message[49:] = action_bytes

    # EIP-191 personal sign
    signable = encode_defunct(primitive=bytes(message))
    signed = Account.sign_message(signable, private_key=bytes.fromhex(key_hex))

    sig_bytes = signed.signature
    return {
        "sig": "0x" + sig_bytes.hex(),
        "nonce": "0x" + nonce_bytes.hex(),
        "created_at": created_at,
        "expires_at": expires_at,
    }
