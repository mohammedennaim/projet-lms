<?php

namespace App\EventListener;

use App\Service\CrosHandler;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class CorsListener
{
    public function __construct(
        private CrosHandler $corsHandler
    ) {}

    public function onKernelRequest(RequestEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();
        
        if ($request->getRealMethod() === 'OPTIONS') {
            $response = $this->corsHandler->handlePreflightRequest($request);
            $event->setResponse($response);
        }
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $this->corsHandler->addCorsHeaders(
            $event->getResponse(),
            $event->getRequest()
        );
    }
}
