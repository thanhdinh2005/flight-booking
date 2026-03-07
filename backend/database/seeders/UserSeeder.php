<?php

namespace Database\Seeders;

use App\Application\Command\Register\AssignRoleUserCommand;
use App\Application\Command\Register\CreateKeycloakUserCommand;
use App\Application\Command\Register\CreateLocalUserCommand;
use App\Application\Command\Register\DeleteKeycloakUserCommand;
use App\Application\UseCases\RegisterUserUseCase;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(RegisterUserUseCase::class) -> execute(
            'customer@gmail.com',
            '1234567',
            'Van A',
            'Nguyen',
            '0987654321'
        );

        try {
            DB::beginTransaction();
            $keycloakId = app(CreateKeycloakUserCommand::class) -> execute(
                'admin@gmail.com',
                '1234567',
                'Van B',
                'Nguyen'
            );

            app(CreateLocalUserCommand::class) -> execute(
                'admin@gmail.com',
                'Van B',
                'Nguyen',
                '0987654321',
                $keycloakId,
                'admin'
            );

            app(AssignRoleUserCommand::class)->execute($keycloakId, 'ADMIN');

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            if (isset($keycloakId)) {
                app(DeleteKeycloakUserCommand::class) -> execute($keycloakId);
            }
            throw $e;
        }

    }
}
