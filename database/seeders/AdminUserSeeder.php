<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@simaset-dishubclp.com'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('AdminSimaset12&3!'),
                'role' => 'admin',
                'is_active' => true,
            ]
        );

        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }
    }
}
