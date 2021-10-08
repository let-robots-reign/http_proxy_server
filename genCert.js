const shelljs = require("shelljs");
const path = require("path");
const fs = require("fs");
const tls = require("tls");

const certsPath = 'certs';

const getCertScript = ({country, city, organization, host}) => `
      cd ${certsPath};
      openssl genrsa -out ${host}.key 2048;
      openssl req -new -sha256 -key ${host}.key -subj '/C=${country}/ST=${city}/O=${organization}, Inc./CN=${host}' -out ${host}.csr;
      openssl req -in ${host}.csr -noout -text;
      openssl x509 -req -in ${host}.csr -CA ../ca.crt -CAkey ../ca.key -CAcreateserial -out ${host}.crt -days 500 -sha256;
      openssl x509 -in ${host}.crt -text -noout;
`;

const generate = (host) => {
    shelljs.exec(getCertScript({
        country: 'RU',
        city: 'Moscow',
        organization: 'Technopark',
        host
    }));
};

const generateCertificate = (host) => {
    const certPath = path.resolve(certsPath, `${host}.crt`);
    const keyPath = path.resolve(certsPath, `${host}.key`);

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
        generate(host);
    }

    return {
        cert: fs.readFileSync(certPath),
        key: fs.readFileSync(keyPath),
    };
};

const SNICallback = (host, callback) => {
    const secureOptions = generateCertificate(host);
    const context = tls.createSecureContext(secureOptions);

    callback(null, context);
};

module.exports = SNICallback;
