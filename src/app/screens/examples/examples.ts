import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-examples',
  templateUrl: './examples.html',
  imports: [FormsModule]
})
export class Examples {
  p = 0n;
  q = 0n;
  n = 0n;
  r = 0n;
  e = 0n;
  d = 0n;
  datos = '';
  hash = '';
  signature = '';
  datos_2 = '';
  hash_2 = '';
  signature_2 = '';
  decrypted_signature = ''

  // Algoritmo para encontrar un numero probablemente primo grande.
  findLargePrime(bits: number): bigint {
    const randomBytes = (size: number): Uint8Array => {
      if (typeof window !== 'undefined' && window.crypto) {
        return window.crypto.getRandomValues(new Uint8Array(size));
      }
      throw new Error('Secure random number generator not available.');
    };
    const byteLength = Math.ceil(bits / 8);
    let attempts = 0;
    while (attempts < 100) {
      let num: bigint;
      const bytes = randomBytes(byteLength);
      if (bits % 8 !== 0) {
        bytes[0] = bytes[0] | (1 << (bits % 8) - 1);
      } else {
        bytes[0] = bytes[0] | 0x80;
      }
      num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
      if (num % 2n === 0n) {
        num += 1n;
      }
      if (this.isProbablyPrime(num)) {
        return num;
      }
      num += 2n;
      attempts++;
    }
    alert("No se pudieron encontrar primos, intentelo de nuevo")
    throw new Error("Could not find a prime number in allotted attempts.");
  }

  // Exponenciación modular (a^b mod n)
  power(base: bigint, exp: bigint, mod: bigint): bigint {
    let res = 1n;
    base %= mod;
    while (exp > 0n) {
      if (exp % 2n === 1n) {
        res = (res * base) % mod;
      }
      base = (base * base) % mod;
      exp /= 2n;
    }
    return res;
  }

  isProbablyPrime(n: bigint, k: number = 5): boolean {
    if (n <= 1n) return false;
    if (n === 2n || n === 3n) return true;
    if (n % 2n === 0n) return false;
    let d = n - 1n;
    let s = 0;
    while (d % 2n === 0n) {
      d /= 2n;
      s++;
    }
    for (let i = 0; i < k; i++) {
      const a = BigInt(Math.floor(Math.random() * Number(n - 3n))) + 2n;
      let x = this.power(a, d, n);
      if (x === 1n || x === n - 1n) {
        continue;
      }
      let isWitness = true;
      for (let r = 1; r < s; r++) {
        x = this.power(x, 2n, n);
        if (x === n - 1n) {
          isWitness = false;
          break;
        }
      }
      if (isWitness) {
        return false;
      }
    }
    return true;
  }

  gcd(a: bigint, b: bigint): bigint {
    while (b !== 0n) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  extendedGcd(a: bigint, m: bigint): bigint {
    let m0 = m;
    let t, q;
    let x0 = 0n, x1 = 1n;
    if (m === 1n) {
      return 1n;
    }
    while (a > 1n) {
      q = a / m;
      t = m;
      m = a % m;
      a = t;
      t = x0;
      x0 = x1 - q * x0;
      x1 = t;
    }
    if (x1 < 0n) {
      x1 += m0;
    }
    return x1;
  }

  calculateD(): bigint {
    if (this.gcd(this.e, this.r) !== 1n) {
      alert("r y e no son co-primos. Use otro e o otros primos y recalcule r.")
      throw new Error("Public exponent 'e' is not coprime to phi(n). Choose a different 'e' or different primes.");
    }
    return this.extendedGcd(this.e, this.r)
  }

  messageToBigInt(message: string): bigint {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    let m = 0n;
    for (const byte of data) {
        m = (m << 8n) | BigInt(byte);
    }
    return m;
  }

  bigIntToHex(c: bigint): string {
    return c.toString(16);
  }

  bigIntToMessage(m: bigint): string {
    let data: number[] = [];
    let tempM = m;
    while (tempM > 0n) {
        data.unshift(Number(tempM & 0xFFn));
        tempM >>= 8n;
    }
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(data));
  }

  hexToBigInt(hexString: string): bigint {
    return BigInt("0x" + hexString);
  }

  encryptMessage(message: string, n: bigint, e: bigint): string {
    const m = this.messageToBigInt(message);
    if (m >= n) {
        alert("Mensaje demasiado grande, usa otro.")
        throw new Error("Message is too large for the given modulus n. Implement proper padding.");
    }
    const c = this.power(m, e, n);
    console.log(c)
    return this.bigIntToHex(c);
  }

  decryptMessage(ciphertextHex: string, n: bigint, d: bigint): string {
    const c = this.hexToBigInt(ciphertextHex);
    const m = c ** d % n;
    return this.bigIntToMessage(m);
  }

  async calculateSha256Hash(inputString: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(inputString);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hexHash;
  }

  onGeneratePrimesClick() {
    this.p = this.findLargePrime(256)
    this.q = this.findLargePrime(256)
  }

  onCalculateRClick() {
    this.r = (this.p - 1n) * (this.q - 1n)
  }

  onGenerateEClick() {
    this.e = this.findLargePrime(32)
  }

  onStandardEClick() {
    this.e = 65537n
  }

  onCalculateDClick() {
    this.d = this.calculateD()
  }

  async onHashClick() {
    this.hash = await this.calculateSha256Hash(this.datos)
  }

  onSignClick() {
    this.signature = this.encryptMessage(this.hash, this.n, this.d)
  }

  onVerifyClick() {
    alert(this.hash_2 === this.decrypted_signature ? "La firma es válida" : "La firma es inválida")
  }

  async onHash2Click() {
    this.hash_2 = await this.calculateSha256Hash(this.datos_2)
  }

  onSignDecrypt2Click() {
    this.decrypted_signature = this.decryptMessage(this.signature_2, this.n, this.e)
  }
}
