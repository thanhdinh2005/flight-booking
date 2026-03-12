<?php

namespace App\Http\Response;

final class PaginationResponse
{
    public function __construct(
        public array $data,
        public array $meta
    ) {}

    public static function fromPaginator($paginator, callable $mapper): self
    {
        return new self(
            data: collect($paginator->items())
                ->map($mapper)
                ->toArray(),

            meta: [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
            ]
        );
    }
}