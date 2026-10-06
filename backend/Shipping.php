<?php
// ============================================================
// Shipping.php — J&T Express rate table + shipping calculator.
// Used by Checkout.php (server) and sent to the browser so the
// checkout can show the same numbers instantly.
//
// ORIGIN: all merchants ship from Batangas → "from Luzon" rates.
// Source: J&T Express Philippines published rate table "Package
// Rates from Luzon" (0–6 kg), as listed by J&T PH and PH rate
// guides (2025–2026). J&T can change rates at any time —
// update the numbers below if they do. Nothing else needs to change.
// ============================================================

if (!defined('LF_APP')) { http_response_code(403); exit; }

// weight brackets (kg, upper limit of each column below)
const LF_JNT_BRACKETS = [0.5, 1, 3, 4, 5, 6];

// ₱ fee per bracket, by destination region (origin: Luzon)
const LF_JNT_RATES = [
    'luzon'    => [85, 155, 180, 270, 360, 455],
    'ncr'      => [95, 165, 190, 280, 370, 465],
    'visayas'  => [100, 180, 200, 300, 400, 500],
    'mindanao' => [105, 195, 220, 330, 440, 550],
    'island'   => [115, 205, 230, 340, 450, 560],
];

// Above 6 kg: each extra kg (or part of a kg) adds the same step as the 5→6 kg bracket.
// (J&T's table stops at 6 kg for Luzon; this keeps heavy parcels reasonable.)

// Shipping areas shown in the checkout dropdown (same keys your site already uses)
const LF_SHIP_ZONES = [
    'lipa'            => ['label' => 'Lipa City, Batangas',           'region' => 'luzon',    'days' => 2],
    'batangas_city'   => ['label' => 'Batangas City',                 'region' => 'luzon',    'days' => 2],
    'santo_tomas'     => ['label' => 'Santo Tomas, Batangas',         'region' => 'luzon',    'days' => 2],
    'tanauan'         => ['label' => 'Tanauan, Batangas',             'region' => 'luzon',    'days' => 2],
    'rosario'         => ['label' => 'Rosario, Batangas',             'region' => 'luzon',    'days' => 2],
    'bauan'           => ['label' => 'Bauan, Batangas',               'region' => 'luzon',    'days' => 2],
    'san_jose'        => ['label' => 'San Jose, Batangas',            'region' => 'luzon',    'days' => 2],
    'nasugbu'         => ['label' => 'Nasugbu, Batangas',             'region' => 'luzon',    'days' => 3],
    'other_batangas'  => ['label' => 'Other Batangas Towns',          'region' => 'luzon',    'days' => 3],
    'lucena'          => ['label' => 'Lucena City, Quezon',           'region' => 'luzon',    'days' => 3],
    'quezon_province' => ['label' => 'Quezon Province (other)',       'region' => 'luzon',    'days' => 3],
    'laguna'          => ['label' => 'Laguna',                        'region' => 'luzon',    'days' => 3],
    'cavite'          => ['label' => 'Cavite',                        'region' => 'luzon',    'days' => 3],
    'rizal'           => ['label' => 'Rizal',                         'region' => 'luzon',    'days' => 3],
    'metro_manila'    => ['label' => 'Metro Manila (NCR)',            'region' => 'ncr',      'days' => 3],
    'luzon_south'     => ['label' => 'Southern Luzon (Bicol, etc.)',  'region' => 'luzon',    'days' => 4],
    'luzon_north'     => ['label' => 'Northern Luzon',                'region' => 'luzon',    'days' => 4],
    'island'          => ['label' => 'Island provinces (Palawan, Mindoro, Masbate, Romblon, Catanduanes…)', 'region' => 'island', 'days' => 6],
    'visayas'         => ['label' => 'Visayas',                       'region' => 'visayas',  'days' => 5],
    'mindanao'        => ['label' => 'Mindanao',                      'region' => 'mindanao', 'days' => 7],
];

// Estimated weight (kg) per item, matched against the product's category/tag and name.
// First matching rule wins. Edit freely.
const LF_ITEM_WEIGHTS = [
    ['match' => 'shoe|sneaker|boot|slipper|sandal|heels',                     'kg' => 1.0],
    ['match' => 'outerwear|jacket|hoodie|sweater|coat|varsity|windbreaker',   'kg' => 0.8],
    ['match' => 'bag|backpack|tote|sling|purse|wallet',                       'kg' => 0.6],
    ['match' => 'bouquet|flower',                                             'kg' => 0.5],
    ['match' => 'bottom|pants|jeans|denim|trouser|shorts|skirt|cargo',        'kg' => 0.5],
    ['match' => 'perfume|edp|edt|fragrance|scent|cologne|parfum',             'kg' => 0.4],
    ['match' => 'toy|figure|plush',                                           'kg' => 0.3],
    ['match' => 'top|tee|t-shirt|shirt|polo|blouse|jersey|dress|tank',        'kg' => 0.3],
    ['match' => 'hat|cap|bucket|beanie|visor',                                'kg' => 0.25],
    ['match' => '3d print|print',                                             'kg' => 0.2],
    ['match' => 'anik|keychain|key chain|bead|bracelet|necklace|ring|earring|jewel|accessor|charm|pin', 'kg' => 0.1],
];
const LF_DEFAULT_ITEM_KG = 0.4;
const LF_PACKAGING_KG    = 0.1;   // pouch / box per parcel

function lf_item_weight(string $tag, string $name): float {
    $hay = strtolower($tag . ' ' . $name);
    foreach (LF_ITEM_WEIGHTS as $rule) {
        if (preg_match('/' . $rule['match'] . '/', $hay)) return (float)$rule['kg'];
    }
    return LF_DEFAULT_ITEM_KG;
}

/** J&T fee for one parcel of $kg to $region. */
function lf_jnt_fee(string $region, float $kg): int {
    $rates = LF_JNT_RATES[$region] ?? LF_JNT_RATES['luzon'];
    foreach (LF_JNT_BRACKETS as $i => $max) {
        if ($kg <= $max + 1e-9) return (int)$rates[$i];
    }
    $last  = count($rates) - 1;
    $step  = $rates[$last] - $rates[$last - 1];
    $extra = (int)ceil($kg - LF_JNT_BRACKETS[$last] - 1e-9);
    return (int)($rates[$last] + $extra * $step);
}

/**
 * $lines = [ ['brand_id','brand_name','name','tag','qty'], ... ]
 * Each brand ships its own parcel (merchants ship from their own stall).
 */
function lf_calc_shipping(string $zone, array $lines): array {
    if (!isset(LF_SHIP_ZONES[$zone])) return ['ok' => false, 'error' => 'Please select a shipping area.'];
    $z = LF_SHIP_ZONES[$zone];
    $parcels = [];
    foreach ($lines as $l) {
        $bid = (string)$l['brand_id'];
        if (!isset($parcels[$bid])) $parcels[$bid] = ['brandId' => $bid, 'brandName' => (string)($l['brand_name'] ?? $bid), 'items' => 0, 'weightKg' => LF_PACKAGING_KG];
        $parcels[$bid]['items']    += (int)$l['qty'];
        $parcels[$bid]['weightKg'] += lf_item_weight((string)$l['tag'], (string)$l['name']) * (int)$l['qty'];
    }
    $total = 0;
    foreach ($parcels as &$p) {
        $p['weightKg'] = round($p['weightKg'], 2);
        $p['fee'] = lf_jnt_fee($z['region'], $p['weightKg']);
        $total += $p['fee'];
    }
    unset($p);
    return ['ok' => true, 'zone' => $zone, 'zoneLabel' => $z['label'], 'region' => $z['region'],
            'days' => $z['days'], 'parcels' => array_values($parcels), 'shippingTotal' => $total];
}

/** Everything the browser needs to calculate the same numbers. */
function lf_shipping_public_config(): array {
    $weights = [];
    foreach (LF_ITEM_WEIGHTS as $r) $weights[] = ['match' => $r['match'], 'kg' => $r['kg']];
    return [
        'courier' => 'J&T Express', 'origin' => 'Batangas (Luzon)',
        'brackets' => LF_JNT_BRACKETS, 'rates' => LF_JNT_RATES, 'zones' => LF_SHIP_ZONES,
        'weights' => $weights, 'defaultItemKg' => LF_DEFAULT_ITEM_KG, 'packagingKg' => LF_PACKAGING_KG,
    ];
}
