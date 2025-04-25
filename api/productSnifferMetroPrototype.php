<?php

$ch = curl_init();

// Correct URL
$url = "https://www.metro.ca/en/online-grocery/aisles/fruits-vegetables";
curl_setopt($ch, CURLOPT_URL, $url);

// Follow redirects
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

// Return the response instead of outputting it
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Simulate a real browser to bypass bot detection
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");

// Set referer
curl_setopt($ch, CURLOPT_REFERER, "https://www.metro.ca/");

// Handle cookies
curl_setopt($ch, CURLOPT_COOKIEJAR, "cookies.txt");
curl_setopt($ch, CURLOPT_COOKIEFILE, "cookies.txt");

// Execute request
$data = curl_exec($ch);

// Debugging: Check HTTP response code
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

curl_close($ch);

if ($http_code == 200) {
    echo $data;
} else {
    echo "HTTP Error: $http_code";
}





?>