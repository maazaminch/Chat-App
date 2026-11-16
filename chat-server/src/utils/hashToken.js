import crypto from 'crypto';


const hashToken = (rawToken) => 
    crypto.createHash('sha256').update(rawToken).digest('hex');

export { hashToken };

