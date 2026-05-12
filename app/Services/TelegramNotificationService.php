<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramNotificationService
{
    private string $botToken;
    private string $chatId;
    private string $apiUrl = 'https://api.telegram.org/bot';

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', '');
        $this->chatId = config('services.telegram.chat_id', '');
    }

    public function sendError(
        string $errorType,
        string $message,
        string $file = '',
        int $line = 0,
        ?array $context = null
    ): bool {
        if (! $this->isConfigured()) {
            Log::warning('Telegram notifications not configured');
            return false;
        }

        try {
            $formattedMessage = $this->formatErrorMessage($errorType, $message, $file, $line, $context);
            return $this->sendMessage($formattedMessage);
        } catch (\Exception $e) {
            Log::error('Failed to send Telegram notification: '.$e->getMessage());
            return false;
        }
    }

    private function formatErrorMessage(
        string $errorType,
        string $message,
        string $file = '',
        int $line = 0,
        ?array $context = null
    ): string {
        $user = auth()->user();
        $timestamp = now()->format('Y-m-d H:i:s');

        $text = "⚠️ <b>{$errorType}</b>\n";
        $text .= "{$message}\n\n";

        if ($file && $line) {
            $text .= "📍 {$file}:{$line}\n";
        }

        if ($user) {
            $text .= "👤 {$user->name}\n";
        }

        $text .= "🕐 {$timestamp}";

        if ($context && isset($context['request_url'])) {
            $text .= "\n🔗 {$context['request_url']}";
        }

        return $text;
    }

    public function sendMessage(string $message): bool
    {
        if (! $this->isConfigured()) {
            return false;
        }

        try {
            $url = "{$this->apiUrl}{$this->botToken}/sendMessage";

            $response = Http::timeout(5)
                ->post($url, [
                    'chat_id' => $this->chatId,
                    'text' => $message,
                    'parse_mode' => 'HTML',
                ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Telegram API error: '.$e->getMessage());
            return false;
        }
    }

    private function isConfigured(): bool
    {
        return ! empty($this->botToken) && ! empty($this->chatId);
    }
}
