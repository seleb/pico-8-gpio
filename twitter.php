<?php
header("Access-Control-Allow-Origin: *");

// convert key/secret to credentials
$credentials = base64_encode(rawurlencode($key).":".rawurlencode($secret));

// use credentials to get token
$authContext = stream_context_create(array(
    "http" => array(
        "method"  => "POST",
        "header"  => "Authorization: Basic ".$credentials."\r\n".
                "Content-type: application/x-www-form-urlencoded;charset=UTF-8\r\n",
        "content" => "grant_type=client_credentials"
    )
));
$authResponse = file_get_contents("https://api.twitter.com/oauth2/token", false, $authContext);
$decodedAuth = json_decode($authResponse, true);
$bearerToken = $decodedAuth["access_token"];


// use token to get data
$context = stream_context_create(array(
    "http" => array(
        "method"  => "GET",
        "header"  => "Authorization: Bearer " . $bearerToken . "\r\n"
    )
));

$encodedData = file_get_contents("https://api.twitter.com/1.1/search/tweets.json?".$_SERVER['QUERY_STRING'], false, $context);

echo $encodedData;

?>
