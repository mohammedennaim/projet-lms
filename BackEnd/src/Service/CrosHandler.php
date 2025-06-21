<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class CrosHandler
{
    private array $allowedOrigins = [
        '*', // Allow all origins
    ];

    private array $allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    private array $allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'];

    public function handlePreflightRequest(Request $request): Response
    {
        $response = new Response('', 200);
        $this->addCorsHeaders($response, $request);
        $response->headers->set('Access-Control-Max-Age', '86400');
        
        return $response;
    }    public function addCorsHeaders(Response $response, Request $request): void
    {
        $origin = $request->headers->get('Origin');
        
        if ($this->isOriginAllowed($origin)) {
            $response->headers->set('Access-Control-Allow-Origin', $origin ?: '*');
        } else {
            // Allow all origins for development
            $response->headers->set('Access-Control-Allow-Origin', '*');
        }
        
        $response->headers->set('Access-Control-Allow-Methods', implode(', ', $this->allowedMethods));
        $response->headers->set('Access-Control-Allow-Headers', implode(', ', $this->allowedHeaders));
        $response->headers->set('Access-Control-Allow-Credentials', 'false'); // Can't use credentials with *
    }

    private function isOriginAllowed(?string $origin): bool
    {
        if (in_array('*', $this->allowedOrigins)) {
            return true;
        }
        return $origin && in_array($origin, $this->allowedOrigins);
    }
}
