import api from './api';

export const walletService = {
  getWalletDetails: async () => {
    return api.get('/wallet');
  },

  deposit: async (amount, method) => {
    return api.post('/wallet/deposit', { amount, method });
  },

  withdraw: async (amount, bankAccountId) => {
    return api.post('/wallet/withdraw', { amount, bankAccountId });
  },

  linkBankAccount: async (bankData) => {
    return api.post('/wallet/bank-accounts', bankData);
  }
};
