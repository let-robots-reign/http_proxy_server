import { readFileSync, writeFile } from "fs";
import tls from "tls";
import { spawn } from "child_process";

const certs = {};
const key = readFileSync('cert.key');

const createSecureContext = (cert) => {
    return tls.createSecureContext({
        key,
        cert
    });
}

const generateCert = (domain, callback) => {
    console.log(`gen cert ${domain}`);
    let gen_cert = spawn('./gen_cert.sh', [domain, Math.floor(Math.random() * 10**12)]);

    gen_cert.stdout.once('data', (data) => {
        certs[domain] = data;
        let ctx = createSecureContext(data);
        callback(null, ctx);
        writeFile(`certs/${domain}.crt`, data, (err) => {
            if (err) {
                console.log(err.message)
            }
        });
    });

    gen_cert.stderr.on('data', (data) => {
        console.log(`cert gen stderr: ${data}`);
    });
}

export const options = {
    key: readFileSync('./ca.key'),
    cert: readFileSync('./ca.crt'),
    SNICallback: function (domain, callback) {
        console.log(domain, callback);
        if (certs[domain]) {
            if (callback) {
                callback(null, certs[domain]);
            } else {
                return certs[domain];
            }
        } else {
            // TODO: generate cert
            throw new Error('No keys/certificates for domain requested');
        }
        // if ((domain in certs)) {
        //     generateCert(domain, callback);
        //     return;
        // }
        // console.log(`using existing cert ${domain}`);
        // let ctx = createSecureContext(certs[domain]);
        // callback(null, ctx);
    }
};
