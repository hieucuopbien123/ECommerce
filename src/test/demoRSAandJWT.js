const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// RSA
const keySize = 2048;
const seed = crypto.randomBytes(32);
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: keySize,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs1',
    format: 'pem',
  },
  seed
});
console.log("privateKey::", privateKey);
console.log("publicKey::", publicKey);
/*
modulusLength là độ dài keysize đơn vị bit của số modulus n = tích của 2 số nguyên tố cực lớn p và q. Càng lớn càng khó brute force, tối thiểu nên là 2048
spki là subject public key info chứa thông tin khóa công khai gồm thuật toán, độ dài, giá trị. pkcs8 là 1 dịnh dạng của khóa riêng tư. Nch chúng chỉ là kiểu định dạng thôi

generateKeyPairSync sinh cặp asymmetric key pair mới of the specified type. The currently supported key types are RSA, DSA, EC, Ed25519, Ed448, X25519, X448, and DH.
It is suggested to encode the public keys as ‘spki’ and private keys as ‘pkcs8’ with a strong passphrase
*/

// Sign
const dataToSign = { userId: 123 };
const token = jwt.sign(dataToSign, privateKey, { algorithm: 'RS256', expiresIn: "2 days" });
console.log('JWT Token::', token);

// Verify
try {
  const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  console.log('Decoded JWT Data:', decoded);
} catch (error) {
  console.error('JWT Verification Failed:', error.message);
}
