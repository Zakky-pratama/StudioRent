<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'email' => 'admin@studiorent.id',
                'name' => 'Bambang Sutrisno',
                'role' => 'admin',
            ],
            [
                'email' => 'petugas1@studiorent.id',
                'name' => 'Rina Kartika',
                'role' => 'petugas',
            ],
            [
                'email' => 'petugas2@studiorent.id',
                'name' => 'Dimas Pratama',
                'role' => 'petugas',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make('password'),
                    'role' => $user['role'],
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}
