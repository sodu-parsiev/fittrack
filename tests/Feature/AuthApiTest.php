<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_log_in_and_log_out(): void
    {
        $registerResponse = $this->postJson('/api/register', [
            'name' => 'Jane Lifter',
            'email' => 'jane@example.com',
            'password' => 'strong-password',
            'password_confirmation' => 'strong-password',
        ]);

        $registerResponse
            ->assertCreated()
            ->assertJsonPath('user.email', 'jane@example.com')
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email'],
            ]);

        $token = $registerResponse->json('token');

        $this->withToken($token)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('user.name', 'Jane Lifter');

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'jane@example.com',
            'password' => 'strong-password',
        ]);

        $loginResponse
            ->assertOk()
            ->assertJsonPath('user.email', 'jane@example.com');

        $this->withToken($loginResponse->json('token'))
            ->postJson('/api/logout')
            ->assertNoContent();
    }

    public function test_login_rejects_invalid_credentials(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'missing@example.com',
            'password' => 'wrong-password',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_spa_shell_is_served_for_client_side_routes(): void
    {
        $this->get('/app/history')
            ->assertOk()
            ->assertSee('id="app"', false);
    }
}
