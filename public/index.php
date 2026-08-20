<?php

// --- Allow the app to also be reached with a leading /public/ in the URL ---
// (Apache already resolves file lookups for /public/* to the same files as
// the root path; this patch makes CodeIgniter's own router see the same
// URI too, since it reads $_SERVER['REQUEST_URI'] directly and is not
// aware of Apache's internal rewrite.)
if (isset($_SERVER['REQUEST_URI']) && preg_match('#^/public(/.*|)(\?.*)?$#', $_SERVER['REQUEST_URI'], $m)) {
    $rest = $m[1] !== '' ? $m[1] : '/';
    $qs = $m[2] ?? '';
    $_SERVER['REQUEST_URI'] = $rest . $qs;
}
// --- end patch ---

// ... rest of the original file continues unchanged from here ...