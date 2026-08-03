<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, bool $success, string $message): never
{
    http_response_code($status);
    echo json_encode([
        'success' => $success,
        'message' => $message,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function textLength(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Method not allowed.');
}

$contentLength = (int) ($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength > 16384) {
    respond(413, false, 'The request is too large.');
}

$origin = trim((string) ($_SERVER['HTTP_ORIGIN'] ?? ''));
$requestHost = strtolower(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')) ?? '');
if ($origin !== '') {
    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    if ($originHost === '' || $requestHost === '' || $originHost !== $requestHost) {
        respond(403, false, 'The request origin is not allowed.');
    }
}

$configPath = __DIR__ . '/config/config.js';
$configSource = is_file($configPath) ? file_get_contents($configPath) : false;

if (
    $configSource === false
    || preg_match(
        '/\/\* CONFIG_START:.*?\*\/\s*window\.SITE_CONFIG\s*=\s*Object\.freeze\(\s*(\{.*?\})\s*\);\s*\/\* CONFIG_END \*\//s',
        $configSource,
        $configMatch
    ) !== 1
) {
    respond(500, false, 'The contact form configuration could not be loaded.');
}

try {
    $config = json_decode($configMatch[1], true, 512, JSON_THROW_ON_ERROR);
} catch (JsonException) {
    respond(500, false, 'The contact form configuration is invalid.');
}

$recipient = filter_var(strtolower((string) ($config['corporateEmail'] ?? '')), FILTER_VALIDATE_EMAIL);
$sender = filter_var((string) ($config['senderEmail'] ?? ''), FILTER_VALIDATE_EMAIL);
$siteName = trim((string) ($config['companyName'] ?? $config['brandName'] ?? 'Website'));

if ($recipient === false || $sender === false) {
    respond(500, false, 'The contact form is not configured correctly.');
}

$honeypot = trim((string) ($_POST['website'] ?? ''));
if ($honeypot !== '') {
    respond(200, true, 'Request received.');
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$company = trim((string) ($_POST['company'] ?? ''));
$interest = trim((string) ($_POST['interest'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if (textLength($name) < 2 || textLength($name) > 120) {
    respond(422, false, 'Please enter your name.');
}

if (filter_var($email, FILTER_VALIDATE_EMAIL) === false || textLength($email) > 180) {
    respond(422, false, 'Please enter a valid email address.');
}

if (textLength($company) > 180) {
    respond(422, false, 'The company name is too long.');
}

$allowedInterests = is_array($config['formInterestValues'] ?? null)
    ? $config['formInterestValues']
    : [];

if (!array_key_exists($interest, $allowedInterests)) {
    respond(422, false, 'Please select what you are interested in.');
}

if (textLength($message) < 20 || textLength($message) > 4000) {
    respond(422, false, 'Please tell us a little more about your goals.');
}

$cleanHeader = static function (string $value): string {
    return str_replace(["\r", "\n", "\0"], ' ', strip_tags($value));
};

$name = $cleanHeader($name);
$company = $cleanHeader($company);
$message = str_replace(["\r\n", "\r", "\0"], ["\n", "\n", ''], strip_tags($message));
$interestLabel = $allowedInterests[$interest];
$submittedAt = gmdate('Y-m-d H:i:s') . ' UTC';

$subject = sprintf('%s enquiry from %s', $siteName, $name);
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$body = implode("\n", [
    'New website enquiry',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
    'Company / website: ' . ($company !== '' ? $company : 'Not provided'),
    'Interest: ' . $interestLabel,
    'Submitted: ' . $submittedAt,
    '',
    'Message:',
    $message,
]);

$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    sprintf('From: %s website <%s>', $siteName, $sender),
    sprintf('Reply-To: %s <%s>', $name, $email),
    'X-Mailer: PHP/' . phpversion(),
]);

if (!@mail($recipient, $encodedSubject, $body, $headers)) {
    respond(500, false, 'The message could not be delivered. Please try again later.');
}

respond(200, true, (string) ($config['contactFormSuccess'] ?? 'Thank you! We have successfully received your request. Our team will review your information and get back to you shortly.'));
