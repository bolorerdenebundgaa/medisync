<?php
/**
 * Application Configuration
 * Loads environment variables and sets up configuration
 */

class Config {
    private static $config = [];
    private static $envPath;

    public static function init($envPath = null) {
        self::$envPath = $envPath ?: __DIR__ . '/../.env';
        self::loadEnv();
        self::setupConfig();
    }

    private static function loadEnv() {
        if (!file_exists(self::$envPath)) {
            throw new Exception('.env file not found. Please copy .env.example to .env and configure your settings.');
        }

        $lines = file(self::$envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '#') === 0 || empty($line)) {
                continue;
            }

            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            // Remove quotes if present
            if (preg_match('/^"(.+)"$/', $value, $matches)) {
                $value = $matches[1];
            } elseif (preg_match("/^'(.+)'$/", $value, $matches)) {
                $value = $matches[1];
            }

            // Replace environment variables in the value
            $value = preg_replace_callback('/\${([^}]+)}/', function($matches) {
                return getenv($matches[1]) ?: '';
            }, $value);

            putenv("$name=$value");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }

    private static function setupConfig() {
        self::$config = [
            'app' => [
                'name' => getenv('APP_NAME') ?: 'MediSync',
                'env' => getenv('APP_ENV') ?: 'production',
                'debug' => getenv('APP_DEBUG') === 'true',
                'url' => getenv('APP_URL') ?: 'http://localhost:8000',
                'timezone' => getenv('APP_TIMEZONE') ?: 'UTC'
            ],
            'database' => [
                'host' => getenv('DB_HOST') ?: 'localhost',
                'port' => getenv('DB_PORT') ?: '3306',
                'name' => getenv('DB_DATABASE') ?: 'medisync',
                'username' => getenv('DB_USERNAME') ?: 'root',
                'password' => getenv('DB_PASSWORD') ?: '',
                'charset' => 'utf8mb4'
            ],
            'jwt' => [
                'secret' => getenv('JWT_SECRET'),
                'expiration' => (int)(getenv('JWT_EXPIRATION') ?: 3600),
                'refresh_expiration' => (int)(getenv('JWT_REFRESH_EXPIRATION') ?: 604800)
            ],
            'mail' => [
                'driver' => getenv('MAIL_DRIVER') ?: 'smtp',
                'host' => getenv('MAIL_HOST'),
                'port' => getenv('MAIL_PORT'),
                'username' => getenv('MAIL_USERNAME'),
                'password' => getenv('MAIL_PASSWORD'),
                'encryption' => getenv('MAIL_ENCRYPTION'),
                'from_address' => getenv('MAIL_FROM_ADDRESS'),
                'from_name' => getenv('MAIL_FROM_NAME')
            ],
            'upload' => [
                'max_size' => (int)(getenv('UPLOAD_MAX_SIZE') ?: 5242880),
                'allowed_types' => explode(',', getenv('ALLOWED_FILE_TYPES') ?: 'jpg,jpeg,png,gif,webp'),
                'path' => getenv('UPLOAD_PATH') ?: '/uploads'
            ],
            'payment' => [
                'stripe' => [
                    'public_key' => getenv('STRIPE_PUBLIC_KEY'),
                    'secret_key' => getenv('STRIPE_SECRET_KEY'),
                    'webhook_secret' => getenv('STRIPE_WEBHOOK_SECRET')
                ]
            ],
            'sms' => [
                'twilio' => [
                    'account_sid' => getenv('TWILIO_ACCOUNT_SID'),
                    'auth_token' => getenv('TWILIO_AUTH_TOKEN'),
                    'from_number' => getenv('TWILIO_FROM_NUMBER')
                ]
            ],
            'security' => [
                'cors_origins' => explode(',', getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:4200'),
                'session_lifetime' => (int)(getenv('SESSION_LIFETIME') ?: 120),
                'password' => [
                    'min_length' => (int)(getenv('PASSWORD_MIN_LENGTH') ?: 8),
                    'require_special' => getenv('PASSWORD_REQUIRE_SPECIAL') === 'true',
                    'require_numbers' => getenv('PASSWORD_REQUIRE_NUMBERS') === 'true',
                    'require_uppercase' => getenv('PASSWORD_REQUIRE_UPPERCASE') === 'true'
                ]
            ],
            'features' => [
                'registration' => getenv('ENABLE_REGISTRATION') === 'true',
                'password_reset' => getenv('ENABLE_PASSWORD_RESET') === 'true',
                'email_verification' => getenv('ENABLE_EMAIL_VERIFICATION') === 'true',
                'two_factor' => getenv('ENABLE_2FA') === 'true',
                'social_login' => getenv('ENABLE_SOCIAL_LOGIN') === 'true',
                'api_docs' => getenv('ENABLE_API_DOCUMENTATION') === 'true'
            ],
            'business' => [
                'vat_rate' => (float)(getenv('VAT_RATE') ?: 15),
                'commission_rate' => (float)(getenv('DEFAULT_COMMISSION_RATE') ?: 10),
                'min_order_amount' => (float)(getenv('MIN_ORDER_AMOUNT') ?: 0),
                'enable_prescriptions' => getenv('ENABLE_PRESCRIPTIONS') === 'true',
                'enable_referrals' => getenv('ENABLE_REFERRALS') === 'true'
            ]
        ];
    }

    public static function get($key = null, $default = null) {
        if ($key === null) {
            return self::$config;
        }

        $keys = explode('.', $key);
        $config = self::$config;

        foreach ($keys as $segment) {
            if (!isset($config[$segment])) {
                return $default;
            }
            $config = $config[$segment];
        }

        return $config;
    }

    public static function set($key, $value) {
        $keys = explode('.', $key);
        $config = &self::$config;

        while (count($keys) > 1) {
            $key = array_shift($keys);
            if (!isset($config[$key]) || !is_array($config[$key])) {
                $config[$key] = [];
            }
            $config = &$config[$key];
        }

        $config[array_shift($keys)] = $value;
    }
}

// Initialize configuration
Config::init();
