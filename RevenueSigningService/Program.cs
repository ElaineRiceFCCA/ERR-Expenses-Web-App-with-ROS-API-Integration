using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Text;

/*
    Revenue Signing Microservice
    ----------------------------------------
    Purpose:
    This service loads a Revenue ROS PIT3 certificate
    and exposes endpoints for:

    1. Health check
    2. Certificate inspection
    3. RSA-SHA512 signing (Revenue required algorithm)

    This microservice isolates cryptographic logic
    from the Node.js backend for reliability and
    compatibility with PKCS#12 certificates.
*/

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

var app = builder.Build();
app.UseCors("AllowFrontend");


// =======================================================
// SECTION 1 — Certificate Configuration
// =======================================================

// Path to Revenue PIT3 certificate (PKCS#12 format)
string certPath = Path.Combine(
    Directory.GetCurrentDirectory(),
    "certs",
    "999966377.p12"
);

// Revenue specification states:
// For web service usage, password must be:
// Base64( MD5( plainPassword ) )

string plainPassword = "d301b398";
string hashedPassword;

// Generate Base64(MD5(password))
using (var md5 = MD5.Create())
{
    byte[] hashBytes = md5.ComputeHash(
        Encoding.ASCII.GetBytes(plainPassword)
    );

    hashedPassword = Convert.ToBase64String(hashBytes);
}


// =======================================================
// SECTION 2 — Load Certificate
// =======================================================

X509Certificate2? certificate = null;
string? certBase64 = null;

try
{
    /*
        X509Certificate2 loads the PKCS#12 certificate.

        MachineKeySet:
            Allows private key to be accessible by the process.

        Exportable:
            Required to allow access to RSA private key for signing.
    */
    certificate = new X509Certificate2(
        certPath,
        hashedPassword,
        X509KeyStorageFlags.MachineKeySet |
        X509KeyStorageFlags.Exportable
    );

    byte[] certBytes = certificate.Export(X509ContentType.Cert);
    certBase64 = Convert.ToBase64String(certBytes);

    Console.WriteLine("Certificate loaded successfully.");
}
catch (Exception ex)
{
    Console.WriteLine($"Certificate failed to load: {ex.Message}");
}


// =======================================================
// SECTION 3 — Health Endpoint
// =======================================================

/*
    GET /health

    Used to verify service availability.
*/
app.MapGet("/health", () =>
{
    return Results.Ok(new
    {
        service = "Revenue Signing Service",
        status = "Running",
        timestamp = DateTime.UtcNow
    });
});


// =======================================================
// SECTION 4 — Certificate Info Endpoint
// =======================================================

/*
    GET /cert-info

    Returns certificate metadata.
    Useful for debugging and audit logging.
*/
app.MapGet("/cert-info", () =>
{
    if (certificate == null)
        return Results.Problem("Certificate not loaded");

    return Results.Json(new
    {
        subject = certificate.Subject,
        issuer = certificate.Issuer,
        notBefore = certificate.NotBefore,
        notAfter = certificate.NotAfter,
        thumbprint = certificate.Thumbprint,
        base64 = certBase64
    });
});


// =======================================================
// SECTION 5 — Signing Endpoint
// =======================================================

/*
    POST /sign

    Body: raw string

    Purpose:
    Signs the incoming string using:
        RSA-SHA512
        PKCS#1 padding

    This matches Revenue specification:
        algorithm="rsa-sha512"

    Returns:
        Base64 signature
*/
app.MapPost("/sign", async (HttpContext context) =>
{
    if (certificate == null)
        return Results.Problem("Certificate not loaded");

    // Read raw body text
    using var reader = new StreamReader(context.Request.Body);
    string dataToSign = await reader.ReadToEndAsync();

    if (string.IsNullOrWhiteSpace(dataToSign))
        return Results.BadRequest("No data provided");

    /*
        Extract RSA private key from certificate.
        This is required for cryptographic signing.
    */
    using RSA rsa = certificate.GetRSAPrivateKey()!;

    // Convert string to byte array
    byte[] dataBytes = Encoding.UTF8.GetBytes(dataToSign);

    /*
        Sign using:
        - SHA512 hashing
        - PKCS#1 v1.5 padding
    */
    byte[] signatureBytes = rsa.SignData(
        dataBytes,
        HashAlgorithmName.SHA512,
        RSASignaturePadding.Pkcs1
    );

    // Convert signature to Base64 (Revenue requirement)
    string signatureBase64 = Convert.ToBase64String(signatureBytes);

    return Results.Ok(new
    {
        signature = signatureBase64
    });
});

app.Run();
