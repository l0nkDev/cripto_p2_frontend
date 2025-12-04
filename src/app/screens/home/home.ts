import { Component, OnInit, signal } from '@angular/core';
import { EdgeToEdge } from '@capawesome/capacitor-android-edge-to-edge-support';

interface Wallet {
  name: string;
  keys: CryptoKeyPair;
  transactions: SignedTransaction[];
  amountSent: number;
  creatingTransaction: boolean;
}

interface SignedTransaction {
  signature: ArrayBuffer;
  transaction: Transaction;
  alteringTransaction: boolean;
}

interface Transaction {
  senderName: string;
  senderPublicKey: CryptoKey;
  amount: number;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home implements OnInit {
  protected readonly title = signal('cripto_p2_frontend');
  wallets: Wallet[] = [];
  creatingWallet = false;
  processing = false;

  ngOnInit(): void {
    EdgeToEdge.enable();
  }

  getWallet(name: string): Wallet | undefined {
    let selWallet: Wallet | undefined = undefined;
    this.wallets.forEach((wallet) => {
      if (wallet.name === name) {
        selWallet = wallet;
      }
    });
    return selWallet;
  }

  getAmount(wallet: Wallet): number {
    let amount = -wallet.amountSent;
    wallet.transactions.forEach((transaction) => {
      amount += transaction.transaction.amount;
    });
    return amount;
  }

  async createWallet(name: string): Promise<void> {
    const keypair: CryptoKeyPair | undefined = await this.generateKeys();
    if (keypair) {
      this.wallets.push({
        name: name,
        keys: keypair,
        transactions: [],
        amountSent: 0,
        creatingTransaction: false,
      });
      this.creatingWallet = false;
    } else {
      alert('No se pudo crear la wallet. Inténtelo de nuevo.');
    }
    this.processing = false;
  }

  async doTransaction(senderName: string, receiverName: string, amount: number): Promise<void> {
    console.log(senderName);
    const sender: Wallet | undefined = this.getWallet(senderName);
    const receiver: Wallet | undefined = this.getWallet(receiverName);
    if (!sender || !receiver) return;
    const transaction: Transaction = { senderName, senderPublicKey: sender.keys.publicKey, amount };
    const stringTransaction = JSON.stringify(transaction);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(stringTransaction);
    const signature: ArrayBuffer = await crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
        saltLength: 32,
      },
      sender.keys.privateKey,
      dataBuffer
    );
    receiver.transactions.push({ signature, transaction, alteringTransaction: false });
    sender.amountSent += amount;
    sender.creatingTransaction = false;
    this.processing = false;
  }

  async verifyTransaction(signedTransaction: SignedTransaction): Promise<boolean> {
    const stringTransaction = JSON.stringify(signedTransaction.transaction);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(stringTransaction);
    const isVerified = await crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        hash: 'SHA-256',
        saltLength: 32,
      },
      signedTransaction.transaction.senderPublicKey,
      signedTransaction.signature,
      dataBuffer
    );
    alert(isVerified ? 'La transacción es correcta' : 'La transacción fue alterada');
    return isVerified;
  }

  alterTransaction(transaction: SignedTransaction, newAmount: number): void {
    transaction.transaction.amount = newAmount;
    this.processing = false;
    transaction.alteringTransaction = false;
  }

  async generateKeys(): Promise<CryptoKeyPair | undefined> {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['sign', 'verify']
      );
      return keyPair;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  }

  abs(num: number): number {
    return Math.abs(num)
  }
}
