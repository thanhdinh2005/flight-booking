<?php

namespace App\Application\UseCases;

use App\Application\Command\FlightInstance\CreateFlightInstanceCommand;
use Illuminate\Support\Carbon;

final class CreateManualFlightInstanceUseCase
{
    public function __construct(
        private CreateFlightInstanceCommand $command
    ) {}

        public function execute(
        int $routeId,
        int $aircraftId,
        string $flightNumber,
        string $departureTime
    ) {

        $departure = Carbon::parse($departureTime);

        return $this->command->execute(
            $routeId,
            $aircraftId,
            $flightNumber,
            $departure,
            null
        );
    }
}