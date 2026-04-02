<?php

return [

    'tmn_code' => env('VNP_TMNCODE'),

    'hash_secret' => env('VNP_HASH_SECRET'),

    'url' => env('VNP_URL'),

    'return_url' => env('VNP_RETURN_URL'),
    'refund_url'  => env('VNP_REFUND_URL', 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'),
    'return_url'  => env('VNP_RETURN_URL'),
];