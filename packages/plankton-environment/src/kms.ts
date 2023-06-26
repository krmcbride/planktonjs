import { TextDecoder } from 'util';
import { DecryptCommand, KMSClient } from '@aws-sdk/client-kms';

const decoder = new TextDecoder();
const kmsClient = new KMSClient({ region: 'us-west-2' });
const toString = (input: Uint8Array | undefined): string => decoder.decode(input);

export type Secret = {
  decrypt: () => Promise<string>;
};

export const wrap = (ciphertextBlob: string, passthrough = false): Secret => ({
  decrypt: async () =>
    passthrough
      ? ciphertextBlob
      : toString(
          (
            await kmsClient.send(
              new DecryptCommand({
                CiphertextBlob: Buffer.from(ciphertextBlob, 'base64'),
              }),
            )
          ).Plaintext,
        ),
});
