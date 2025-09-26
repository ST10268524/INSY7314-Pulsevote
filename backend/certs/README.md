# SSL Certificates

This directory should contain SSL certificates for HTTPS support in production.

## Development
For development, you can generate self-signed certificates:

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate
openssl req -new -x509 -key server.key -out server.crt -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
```

## Production
For production, use certificates from a trusted Certificate Authority (CA) like Let's Encrypt, DigiCert, or Cloudflare.

## Security Note
Never commit real certificates to version control. Use environment variables or secure secret management.
