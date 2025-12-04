import { Component, OnInit, signal } from '@angular/core';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';

  interface GeneratedKeys {
    private_key: number[],
    public_key: number[]
  }

@Component({
  selector: 'app-examples',
  templateUrl: './examples.html',
})
export class Examples implements OnInit{
  balance: number = this.getBalance();
  wallets: any[] = this.getWallets();
  keypair: CryptoKeyPair | undefined = undefined
  pubkey: string | undefined = undefined
  prikey: string | undefined = undefined

  ngOnInit(): void {
    EdgeToEdge.enable();
    this.setKeys();
  }

  getBalance(): number {
    return 0;
  }

  getWallets(): any[] {
    return []
  }

  async setKeys(): Promise<void> {
    this.keypair = await this.generateKeys()
    this.prikey = JSON.stringify(await window.crypto.subtle.exportKey('jwk', this.keypair!.privateKey))
    this.pubkey = JSON.stringify(await window.crypto.subtle.exportKey('jwk', this.keypair!.publicKey))
    console.log("Private key: ", this.prikey)
    console.log("Public key: ", this.pubkey)
  }

  async generateKeys(): Promise<CryptoKeyPair|undefined> {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: "RSA-OAEP",
          modulusLength: 4096,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
      );
      return keyPair
    } catch(e) {
      console.error(e)
      return undefined
    }
  }

  generateKeysManual(): GeneratedKeys {
    const p = 7323;
    const q = 1137;
    const n = p * q;
    const r = (p - 1) * (q - 1)
    const [e, d] = this.getCoprimeFactors(r)
    console.log({privateKey: [n, d], publicKey:[n, e]})
    return {private_key: [n, d], public_key:[n, e]}
  }

  getCoprimeFactors(r: number): number[] {
    let i = 0;
    let factors: number[] = []
    while (factors.length < 2) {
      i++;
      factors = this.getFactors((r * i) + 1)
    }
    return [factors[0], ((r * i) + 1)/factors[0]]
  }

  getFactors(num: number): number[] {
    const factors: number[] = []
    let i = 2
    while (i < num) {
      if (num % i == 0) factors.push(i)
      i++
    }
    console.log("Factors of ", num, ": ", factors)
    return factors
  }


}
